import { appConfig } from '@/config/env'
import { apiRequest, rememberAssessmentToken } from '@/services/apiClient'
import { mriService } from '@/services/mri'

export type AssessmentWorkflowState =
  | 'idle'
  | 'selected'
  | 'validating'
  | 'uploading'
  | 'processing'
  | 'success'
  | 'failure'

export type AssessmentProgressPhase = 'uploading' | 'processing'
export type AssessmentStatus =
  'queued' | 'processing' | 'completed' | 'failed' | 'rejected'

export interface AssessmentSubmissionRequest {
  file: File
  chronologicalAge?: number
  subjectId?: string
}

export interface AssessmentSubmissionResponse {
  assessmentId: string
  status: AssessmentStatus
  message: string
  createdAt: string
  accessToken?: string
}

export interface AssessmentServiceProgress {
  phase: AssessmentProgressPhase
  progress: number
}

export interface AssessmentServiceError extends Error {
  retryable: boolean
}

export interface AssessmentResult {
  assessmentId: string
  status: AssessmentStatus
  chronologicalAge: number | null
  predictedBrainAge: number | null
  brainAgeDifference: number | null
  uncertaintyInterval?: [number, number] | null
  modelName: string
  assessmentDate: string
  processingStatus:
    'Queued' | 'Processing' | 'Completed' | 'Failed' | 'Rejected'
  preview?: {
    url?: string | null
    fileType?: 'image' | 'nii' | 'unknown'
    available: boolean
    message?: string
    availableViews?: Array<'axial' | 'coronal' | 'sagittal'>
  }
  modelLimitations: string[]
  disclaimer: string
}

export interface AssessmentService {
  createAssessment: (
    request: AssessmentSubmissionRequest,
    onProgress?: (progress: AssessmentServiceProgress) => void,
  ) => Promise<AssessmentSubmissionResponse>
  fetchAssessmentResult: (assessmentId: string) => Promise<AssessmentResult>
  fetchAssessmentStatus: (
    assessmentId: string,
  ) => Promise<{ assessmentId: string; status: string; message?: string }>
  waitForCompletion: (
    assessmentId: string,
    options?: { intervalMs?: number; maxAttempts?: number },
  ) => Promise<AssessmentResult>
}

export const ASSESSMENT_BACKEND_CONTRACT = {
  method: 'POST',
  path: '/api/v1/assessments',
  supportedFormats: ['.nii', '.nii.gz'],
  maxFileSizeBytes: 250 * 1024 * 1024,
  requestFields: {
    file: 'MRI volume (.nii or .nii.gz)',
    chronologicalAge: 'number | undefined',
    subjectId: 'string | undefined',
  },
  response: {
    assessmentId: 'string',
    status: 'accepted | queued | processing | failed',
    message: 'string',
    createdAt: 'ISO datetime string',
  },
  notes:
    'The backend team should confirm the exact status and result routes before production deployment. This frontend keeps the service boundary typed and sealed until then.',
} as const

const createDemoPreviewDataUrl = () => {
  const size = 240
  const box = Array.from({ length: size }, (_, y) => {
    const cells: string[] = []
    for (let x = 0; x < size; x += 1) {
      const centerX = x - size / 2
      const centerY = y - size / 2
      const radius = Math.sqrt(centerX * centerX + centerY * centerY)
      const wave = Math.sin((x + y) / 12) * 0.5 + 0.5
      const ring = Math.sin(radius / 7) * 0.5 + 0.5
      const intensity = Math.min(255, Math.max(0, Math.round((wave * 0.5 + ring * 0.5) * 255)))
      cells.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="rgb(${intensity},${intensity},${intensity})" />`)
    }
    return cells.join('')
  }).join('')

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
      <rect width="240" height="240" fill="#07080b"/>
      ${box}
    </svg>
  `

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const DEMO_ASSESSMENT_RESULT: AssessmentResult = {
  assessmentId: 'AS-2408-014',
  status: 'completed',
  chronologicalAge: 62,
  predictedBrainAge: 67.2,
  brainAgeDifference: 5.2,
  uncertaintyInterval: [64.1, 69.8],
  modelName: 'ResNet3D-Regression v1',
  assessmentDate: '2026-10-18T09:35:00.000Z',
  processingStatus: 'Completed',
  preview: {
    url: createDemoPreviewDataUrl(),
    fileType: 'image',
    available: true,
    message: 'Generated MRI preview from the central slice of the uploaded volume.',
    availableViews: ['axial'],
  },
  modelLimitations: [
    'This estimate is exploratory and should not be treated as a medical diagnosis.',
    'Performance depends on image quality, preprocessing, and scan acquisition settings.',
    'Brain age estimates can vary across scanners and study populations.',
  ],
  disclaimer:
    'The reported value reflects a research-oriented estimate from a structural MRI model and should be interpreted alongside clinical context and additional review.',
}

const resultCache = new Map<string, Promise<AssessmentResult>>()
const statusCache = new Map<
  string,
  Promise<{ assessmentId: string; status: string; message?: string }>
>()

const normalizeStatus = (value: string | undefined): AssessmentStatus => {
  const normalized = (value ?? '').toLowerCase()
  if (normalized === 'queued' || normalized === 'accepted') return 'queued'
  if (normalized === 'processing') return 'processing'
  if (normalized === 'completed' || normalized === 'success') return 'completed'
  if (normalized === 'failed' || normalized === 'error') return 'failed'
  if (normalized === 'rejected') return 'rejected'
  return 'queued'
}

const normalizeResult = (payload: any): AssessmentResult => ({
  assessmentId: String(
    payload.assessmentId ?? payload.id ?? 'unknown-assessment',
  ),
  status: normalizeStatus(payload.status ?? payload.processingStatus),
  chronologicalAge:
    typeof payload.chronologicalAge === 'number'
      ? payload.chronologicalAge
      : null,
  predictedBrainAge:
    typeof payload.predictedBrainAge === 'number'
      ? payload.predictedBrainAge
      : null,
  brainAgeDifference:
    typeof payload.brainAgeDifference === 'number'
      ? payload.brainAgeDifference
      : null,
  uncertaintyInterval: Array.isArray(payload.uncertaintyInterval)
    ? [
        Number(payload.uncertaintyInterval[0]),
        Number(payload.uncertaintyInterval[1]),
      ]
    : null,
  modelName: String(payload.modelName ?? 'Unknown model'),
  assessmentDate:
    typeof payload.assessmentDate === 'string'
      ? payload.assessmentDate
      : new Date().toISOString(),
  processingStatus: (payload.processingStatus ??
    String(payload.status ?? 'Queued')) as AssessmentResult['processingStatus'],
  preview: payload.preview ?? {
    available: false,
    message: 'No preview is available for this assessment yet.',
    availableViews: ['axial'],
  },
  modelLimitations: Array.isArray(payload.modelLimitations)
    ? payload.modelLimitations.map(String)
    : [],
  disclaimer: String(
    payload.disclaimer ?? 'This output is intended for research use only.',
  ),
})

export const assessmentService: AssessmentService = {
  async createAssessment(request, onProgress) {
    onProgress?.({ phase: 'uploading', progress: 15 })

    const validationResult = await mriService.validateFile(request.file)
    if (!validationResult.valid) {
      throw new Error(
        validationResult.errors.join('. ') ||
          'The MRI file failed validation and cannot be submitted.',
      )
    }

    const formData = new FormData()
    formData.append('file', request.file)
    if (
      typeof request.chronologicalAge === 'number' &&
      Number.isFinite(request.chronologicalAge)
    ) {
      formData.append('chronological_age', String(request.chronologicalAge))
    }
    if (request.subjectId) {
      formData.append('subject_id', request.subjectId)
    }

    if (appConfig.isDemoMode) {
      onProgress?.({ phase: 'uploading', progress: 72 })
      await new Promise((resolve) => window.setTimeout(resolve, 400))
      onProgress?.({ phase: 'processing', progress: 94 })
      await new Promise((resolve) => window.setTimeout(resolve, 400))

      return {
        assessmentId: 'DEMO-AS-0001',
        status: 'queued',
        message: 'Demo mode is enabled. No live backend is connected yet.',
        createdAt: new Date().toISOString(),
      }
    }

    onProgress?.({ phase: 'uploading', progress: 65 })
    const response = await apiRequest<{
      assessmentId?: string
      id?: string
      status?: string
      message?: string
      createdAt?: string
      accessToken?: string
      access_token?: string
    }>('/api/v1/assessments', { method: 'POST', body: formData })

    const accessToken = response.accessToken ?? response.access_token
    const normalizedResponse: AssessmentSubmissionResponse = {
      assessmentId: String(response.assessmentId ?? response.id ?? 'unknown'),
      status: normalizeStatus(response.status),
      message: String(response.message ?? 'Assessment accepted.'),
      createdAt: response.createdAt ?? new Date().toISOString(),
      accessToken,
    }

    if (normalizedResponse.assessmentId && accessToken) {
      rememberAssessmentToken(normalizedResponse.assessmentId, accessToken)
    }

    onProgress?.({ phase: 'processing', progress: 100 })
    return normalizedResponse
  },

  async fetchAssessmentStatus(assessmentId) {
    if (!assessmentId) {
      throw new Error('Assessment id is required to fetch status.')
    }

    const cached = statusCache.get(assessmentId)
    if (cached) {
      return cached
    }

    const pending = (async () => {
      if (appConfig.isDemoMode) {
        return {
          assessmentId,
          status: 'completed',
          message: 'Demo mode status only.',
        }
      }

      const response = await apiRequest<{
        assessmentId?: string
        id?: string
        status?: string
        message?: string
      }>(`/api/v1/assessments/${assessmentId}/status`, { method: 'GET' })

      return {
        assessmentId: String(
          response.assessmentId ?? response.id ?? assessmentId,
        ),
        status: String(response.status ?? 'queued'),
        message: response.message ?? 'Assessment status retrieved.',
      }
    })()

    statusCache.set(assessmentId, pending)
    return pending
  },

  async fetchAssessmentResult(assessmentId) {
    if (!assessmentId) {
      throw new Error('Assessment id is required to fetch a result.')
    }

    const cached = resultCache.get(assessmentId)
    if (cached) {
      return cached
    }

    const pending = (async () => {
      if (appConfig.isDemoMode) {
        return DEMO_ASSESSMENT_RESULT
      }

      const payload = await apiRequest<any>(
        `/api/v1/assessments/${assessmentId}`,
        { method: 'GET' },
      )
      return normalizeResult(payload)
    })()

    resultCache.set(assessmentId, pending)
    return pending
  },

  async waitForCompletion(assessmentId, options = {}) {
    const { intervalMs = 2000, maxAttempts = 12 } = options

    let attempts = 0
    while (attempts < maxAttempts) {
      const status = await assessmentService.fetchAssessmentStatus(assessmentId)
      const normalizedStatus = status.status.toLowerCase()

      if (normalizedStatus === 'completed' || normalizedStatus === 'success') {
        return assessmentService.fetchAssessmentResult(assessmentId)
      }

      if (
        normalizedStatus === 'failed' ||
        normalizedStatus === 'rejected' ||
        normalizedStatus === 'error'
      ) {
        throw new Error(
          status.message ??
            'The assessment failed and no valid result is available.',
        )
      }

      attempts += 1
      if (attempts >= maxAttempts) {
        throw new Error(
          'The assessment is still processing and did not complete within the expected time window.',
        )
      }

      await new Promise((resolve) => window.setTimeout(resolve, intervalMs))
    }

    throw new Error('The requested assessment did not finish in time.')
  },
}
