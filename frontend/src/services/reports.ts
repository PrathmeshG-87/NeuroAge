import { appConfig } from '@/config/env'
import { apiRequest } from '@/services/apiClient'

export type ReportStatus = 'completed' | 'processing' | 'failed' | 'unavailable'

export interface ReportRecord {
  id: string
  assessmentId: string
  title: string
  generatedAt: string
  status: ReportStatus
  summary?: string
  fileUrl?: string | null
  format?: 'pdf'
}

export interface AssessmentHistoryEntry {
  assessmentId: string
  assessmentDate: string
  status: 'Completed' | 'Processing' | 'Failed' | 'Unavailable'
  predictedBrainAge: number | null
  brainAgeDifference: number | null
  subjectId?: string | null
}

export const REPORT_BACKEND_CONTRACT = {
  listEndpoint: '/api/v1/reports',
  downloadEndpoint: '/api/v1/reports/:assessmentId/download',
  auth: 'Authorization header required by backend; never store secrets in frontend environment variables.',
  response: {
    id: 'string',
    assessmentId: 'string',
    title: 'string',
    generatedAt: 'ISO timestamp',
    status: 'completed | processing | failed | unavailable',
    summary: 'string | undefined',
    fileUrl: 'string | null | undefined',
    format: 'pdf',
  },
  notes:
    'The backend team should confirm the actual authorization and report-generation route before production deployment. This client keeps the contract typed and deliberately separated from demo data.',
} as const

export const MOCK_REPORTS: ReportRecord[] = [
  {
    id: 'rep-2026-001',
    assessmentId: 'AS-2408-014',
    title: 'Brain aging summary report',
    generatedAt: '2026-10-18T09:35:00.000Z',
    status: 'completed',
    summary: 'Final research summary for AS-2408-014.',
    fileUrl: 'https://example.invalid/report/AS-2408-014.pdf',
    format: 'pdf',
  },
  {
    id: 'rep-2026-002',
    assessmentId: 'AS-2408-013',
    title: 'Brain aging summary report',
    generatedAt: '2026-10-11T14:20:00.000Z',
    status: 'processing',
    summary: 'Report generation is in progress.',
    fileUrl: null,
    format: 'pdf',
  },
  {
    id: 'rep-2026-003',
    assessmentId: 'AS-2408-012',
    title: 'Brain aging summary report',
    generatedAt: '2026-10-08T08:11:00.000Z',
    status: 'failed',
    summary: 'Generation failed because the source volume was incomplete.',
    fileUrl: null,
    format: 'pdf',
  },
]

export const MOCK_HISTORY: AssessmentHistoryEntry[] = [
  {
    assessmentId: 'AS-2408-014',
    assessmentDate: '2026-10-18T09:35:00.000Z',
    status: 'Completed',
    predictedBrainAge: 67.2,
    brainAgeDifference: 5.2,
    subjectId: 'SUBJ_IXI_0442',
  },
  {
    assessmentId: 'AS-2408-013',
    assessmentDate: '2026-10-11T14:20:00.000Z',
    status: 'Processing',
    predictedBrainAge: null,
    brainAgeDifference: null,
    subjectId: 'SUBJ_OASIS_018',
  },
  {
    assessmentId: 'AS-2408-012',
    assessmentDate: '2026-10-08T08:11:00.000Z',
    status: 'Failed',
    predictedBrainAge: null,
    brainAgeDifference: null,
    subjectId: 'SUBJ_OASIS_109',
  },
  {
    assessmentId: 'AS-2408-005',
    assessmentDate: '2026-09-26T10:45:00.000Z',
    status: 'Unavailable',
    predictedBrainAge: null,
    brainAgeDifference: null,
    subjectId: 'SUBJ_IXI_0117',
  },
]

const normalizeReport = (report: any): ReportRecord => ({
  id: String(report.id ?? report.assessmentId ?? 'report-unknown'),
  assessmentId: String(
    report.assessmentId ?? report.id ?? 'unknown-assessment',
  ),
  title: String(report.title ?? 'Brain aging summary report'),
  generatedAt:
    typeof report.generatedAt === 'string'
      ? report.generatedAt
      : new Date().toISOString(),
  status: (report.status ?? 'unavailable') as ReportStatus,
  summary: typeof report.summary === 'string' ? report.summary : undefined,
  fileUrl: typeof report.fileUrl === 'string' ? report.fileUrl : null,
  format: report.format === 'pdf' ? 'pdf' : 'pdf',
})

const normalizeHistory = (entry: any): AssessmentHistoryEntry => ({
  assessmentId: String(entry.assessmentId ?? entry.id ?? 'unknown-assessment'),
  assessmentDate:
    typeof entry.assessmentDate === 'string'
      ? entry.assessmentDate
      : new Date().toISOString(),
  status: (entry.status ?? 'Unavailable') as AssessmentHistoryEntry['status'],
  predictedBrainAge:
    typeof entry.predictedBrainAge === 'number'
      ? entry.predictedBrainAge
      : null,
  brainAgeDifference:
    typeof entry.brainAgeDifference === 'number'
      ? entry.brainAgeDifference
      : null,
  subjectId: typeof entry.subjectId === 'string' ? entry.subjectId : null,
})

export const reportService = {
  async listReports(): Promise<ReportRecord[]> {
    if (appConfig.isDemoMode) {
      await new Promise((resolve) => window.setTimeout(resolve, 350))
      return MOCK_REPORTS
    }

    const response = await apiRequest<any>('/api/v1/reports', { method: 'GET' })
    const items = Array.isArray(response)
      ? response
      : Array.isArray(response.items)
        ? response.items
        : []
    return items.map(normalizeReport)
  },

  async downloadReport(
    assessmentId: string,
  ): Promise<{ ok: true; url: string; fileName: string }> {
    if (appConfig.isDemoMode) {
      const report = MOCK_REPORTS.find(
        (item) => item.assessmentId === assessmentId,
      )
      if (!report || report.status !== 'completed' || !report.fileUrl) {
        throw new Error(
          'This report is not available for download yet. Please check the report status and try again later.',
        )
      }

      return {
        ok: true,
        url: report.fileUrl,
        fileName: `${report.assessmentId}-brain-age-report.pdf`,
      }
    }

    const blob = await apiRequest<Blob>(
      `/api/v1/reports/${assessmentId}/download`,
      {
        method: 'GET',
        expectsBlob: true,
        headers: {
          Accept: 'application/pdf',
        },
      },
    )

    if (!(blob instanceof Blob)) {
      throw new Error('The report endpoint returned an invalid file payload.')
    }

    return {
      ok: true,
      url: window.URL.createObjectURL(blob),
      fileName: `${assessmentId}-brain-age-report.pdf`,
    }
  },
}

export const historyService = {
  async listHistory(): Promise<AssessmentHistoryEntry[]> {
    if (appConfig.isDemoMode) {
      await new Promise((resolve) => window.setTimeout(resolve, 300))
      return MOCK_HISTORY
    }

    const response = await apiRequest<any>('/api/v1/assessments', {
      method: 'GET',
    })
    const items = Array.isArray(response)
      ? response
      : Array.isArray(response.items)
        ? response.items
        : []
    return items.map(normalizeHistory)
  },
}
