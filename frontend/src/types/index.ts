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

export interface PredictionResult {
  assessment_id: string
  chronological_age: number
  predicted_brain_age: number
  brain_age_difference: number // Brain-PAD
  confidence_interval_95: [number, number]
  model_name: string
  features_importance?: Array<{ feature: string; importance: number }>
  scan_metadata?: {
    filename: string
    slices_count: number
    modality: string
  }
  exploratory_status: 'resilient' | 'typical' | 'accelerated'
  disclaimer: string
  created_at: string
}

export interface ModelMetrics {
  model_name: string
  architecture: string
  mae: number
  rmse: number
  pearson_r: number
  dataset_evaluated: string
  n_test_samples: number
  bias_corrected: boolean
  last_evaluated: string
}
