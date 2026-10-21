# ML model contract for brain-age inference

This contract defines the backend integration boundary for the MRI brain-age prediction pipeline. It is intentionally strict: the API layer does not implement model logic, and the backend only accepts a real artifact or explicit dependency status from the ML stack.

## 1. Model loading contract

- The trained model is loaded from the configured artifact path in `MODEL_ARTIFACT_PATH`.
- Supported artifact types are `pickle` (`.pkl`, `.pickle`), `joblib` (`.joblib`), and PyTorch weights (`.pt`, `.pth`) when the corresponding runtime is available.
- The artifact must expose a callable `predict` interface, either directly or through a wrapped model object.
- If the artifact is missing, unreadable, or does not provide a valid prediction entry point, inference is marked unavailable and no placeholder prediction is returned.
- Model identity is tracked using `MODEL_NAME` and `MODEL_VERSION`, which must match the actual artifact and evaluation record.

## 2. MRI input and preprocessing contract

- Supported MRI files are `.nii` and `.nii.gz` and must pass the backend file validation pipeline before inference.
- The input must be a finite 3D or 4D numeric array after NIfTI decoding and before model preprocessing.
- The preprocessing pipeline is responsible for the scientific steps that are specific to the model: spatial resampling, intensity normalization, voxel scaling, and any required target-shape conversion.
- The backend validates only the contract inputs and numerical safety conditions before calling the model. It does not assume a clinical-grade preprocessing pipeline beyond the documented model requirements.
- The backend must reject empty arrays, non-finite values, unsupported file formats, and malformed NIfTI payloads before inference.

## 3. Model version identification

- Every inference output records `model_name` and `model_version` from the actual loaded artifact or explicit model metadata.
- Model evaluation metadata must be loaded from `MODEL_EVALUATION_METRICS_PATH` when available.
- The API exposes only those metrics that are documented in the evaluation pipeline and should not invent additional values.

## 4. Prediction output schema

The inference service returns a normalized structure like:

```json
{
  "predicted_brain_age": 67.2,
  "brain_age_difference": 5.2,
  "uncertainty_interval": [64.1, 69.8],
  "model_name": "ResNet3D-Regression",
  "model_version": "v1.0.0",
  "prediction_timestamp": "2026-10-19T10:00:00+00:00",
  "subject_id": "subject_001",
  "status": "completed"
}
```

Notes:
- `brain_age_difference` is computed only when both predicted and chronological age are valid numeric values.
- `uncertainty_interval` is included only when the model truly provides a defined uncertainty estimate.
- The backend must not describe the output as a diagnosis, or as a healthy/abnormal label, without a separate validated clinical method.

## 5. Uncertainty and confidence contract

- Uncertainty is only reported when the model explicitly produces it and the definition is known.
- The backend must not label this as `confidence` unless the model defines and emits a genuine confidence metric.
- If a model does not produce calibrated uncertainty, the field is `null` and the API does not claim it as a confidence score.

## 6. Error handling contract

The service must fail explicitly for the following conditions:

- model artifact is absent or unreadable
- MRI input is empty, non-finite, or structurally invalid
- model prediction output is NaN, non-numeric, or empty
- model inference raises an execution error
- evaluation metrics are missing or invalid

In these cases, the backend must raise explicit processing failures, not placeholder predictions.

## 7. Readiness and evaluation metadata

Model readiness is determined by the existence and successful loading of the artifact. The backend reports status as one of:

- `ready`
- `unavailable`

Evaluation metrics are exposed only from the actual model evaluation file, for example:

- `mae`
- `rmse`
- `pearson_r`
- `n_test_samples`
- `bias_corrected`
- `last_evaluated`

No fabricated values may be added to the metrics payload.

## 8. CPU/GPU and memory requirements

- CPU inference is the default safe mode for local development and CI validation.
- GPU inference is optional when the model artifact and runtime are configured for CUDA-enabled execution.
- Memory requirements depend on the model and input volume size; a conservative expectation is that the backend should be run on a machine with enough RAM for the model and preprocessed MRI array.
- If resource availability is insufficient, the backend must return an explicit unavailable or failed status instead of silently returning invalid results.

## 9. Long-running job guidance

- The application should prefer a durable queue/job backend for large or slow inference tasks.
- The state lifecycle should remain explicit: `queued`, `processing`, `completed`, `failed`.
- In-memory background tasks are acceptable only for local experiments; they must not be the primary mechanism for workloads expected to survive restarts.

## 10. Scientific guardrails

- No fabricated inference outputs.
- No clinical diagnosis claim.
- No health/abnormality labeling without a validated clinical method.
- No confidence statement unless the model genuinely estimates one and defines it.
- Output is treated as an exploratory research estimate, not medical advice.
