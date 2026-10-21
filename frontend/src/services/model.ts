import { appConfig } from '@/config/env'
import { apiRequest } from '@/services/apiClient'

export interface ModelEvaluationMetrics {
  modelName: string
  architecture: string
  mae: number | null
  rmse: number | null
  pearsonR: number | null
  datasetEvaluated: string
  nTestSamples: number | null
  biasCorrected: boolean
  lastEvaluated: string | null
}

const DEMO_METRICS: ModelEvaluationMetrics = {
  modelName: 'ResNet3D-Regression v1',
  architecture: '3D CNN regression',
  mae: 4.18,
  rmse: 5.32,
  pearsonR: 0.91,
  datasetEvaluated: 'IXI + OASIS-1/OASIS-3 (public research cohorts)',
  nTestSamples: 184,
  biasCorrected: true,
  lastEvaluated: '2026-10-18T00:00:00.000Z',
}

export const modelMetricsService = {
  async getMetrics(): Promise<ModelEvaluationMetrics> {
    if (appConfig.isDemoMode) {
      return DEMO_METRICS
    }

    const response = await apiRequest<{
      data?: Partial<ModelEvaluationMetrics>
      metrics?: Partial<ModelEvaluationMetrics>
      model?: Partial<ModelEvaluationMetrics>
    }>('/api/v1/model/metrics', { method: 'GET' })

    const payload = (response.data ??
      response.metrics ??
      response.model ??
      response) as Partial<ModelEvaluationMetrics> & Record<string, unknown>
    if (!payload || typeof payload !== 'object') {
      throw new Error('The model metrics response was empty or malformed.')
    }

    return {
      modelName: String(payload.modelName ?? 'Unknown model'),
      architecture: String(payload.architecture ?? 'Unknown architecture'),
      mae: payload.mae == null ? null : Number(payload.mae),
      rmse: payload.rmse == null ? null : Number(payload.rmse),
      pearsonR: payload.pearsonR == null ? null : Number(payload.pearsonR),
      datasetEvaluated: String(payload.datasetEvaluated ?? 'Not yet evaluated'),
      nTestSamples:
        payload.nTestSamples == null ? null : Number(payload.nTestSamples),
      biasCorrected: Boolean(payload.biasCorrected),
      lastEvaluated:
        typeof payload.lastEvaluated === 'string'
          ? payload.lastEvaluated
          : null,
    }
  },
}
