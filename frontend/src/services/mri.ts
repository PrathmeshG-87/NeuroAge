import { appConfig } from '@/config/env'
import { apiRequest } from '@/services/apiClient'

export interface MRIValidationRequest {
  fileName: string
  fileSizeBytes: number
  format?: 'NIfTI' | 'DICOM' | 'Unknown'
}

export interface MRIValidationResult {
  valid: boolean
  filename: string
  file_size_bytes: number
  format: 'NIfTI' | 'DICOM' | 'Unknown'
  dimensions?: [number, number, number]
  voxel_sizes?: [number, number, number]
  warnings: string[]
  errors: string[]
}

export const mriService = {
  async validateFile(file: File): Promise<MRIValidationResult> {
    if (appConfig.isDemoMode) {
      return {
        valid: true,
        filename: file.name,
        file_size_bytes: file.size,
        format:
          file.name.toLowerCase().endsWith('.nii.gz') ||
          file.name.toLowerCase().endsWith('.nii')
            ? 'NIfTI'
            : 'Unknown',
        warnings: [],
        errors: [],
      }
    }

    const formData = new FormData()
    formData.append('file', file)

    const response = await apiRequest<MRIValidationResult>(
      '/api/v1/mri/validate',
      {
        method: 'POST',
        body: formData,
      },
    )

    if (
      !response ||
      typeof response !== 'object' ||
      typeof response.valid !== 'boolean'
    ) {
      throw new Error('The MRI validation response was invalid.')
    }

    return response
  },

  async uploadFile(
    file: File,
    chronologicalAge?: number,
  ): Promise<{ id: string; status: string; message: string }> {
    if (appConfig.isDemoMode) {
      return {
        id: 'demo-as-0001',
        status: 'queued',
        message: 'Demo mode enabled: no live backend is connected yet.',
      }
    }

    const formData = new FormData()
    formData.append('file', file)
    if (
      typeof chronologicalAge === 'number' &&
      Number.isFinite(chronologicalAge)
    ) {
      formData.append('chronological_age', String(chronologicalAge))
    }

    const response = await apiRequest<{
      id?: string
      assessmentId?: string
      status?: string
      message?: string
    }>('/api/v1/mri/upload', { method: 'POST', body: formData })

    return {
      id: response.assessmentId ?? response.id ?? 'unknown',
      status: response.status ?? 'queued',
      message: response.message ?? 'Upload accepted.',
    }
  },
}
