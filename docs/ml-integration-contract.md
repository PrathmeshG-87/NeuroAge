# ML integration contract

## 1. Ownership boundaries

The ML package owns:

- model artifact loading
- MRI validation and preprocessing
- numerical prediction computation
- validation of model outputs
- explicit unavailable/error states for invalid or missing artifacts

The backend owns:

- authentication and authorization
- persistent assessment records
- file storage and upload policy enforcement
- report download and PDF delivery
- API error translation and access checks

The separation is intentional: the frontend and API cannot be trusted as the only enforcement layer for protected health-related records.

## 2. Input contract

The inference layer accepts a validated MRI input as:

- a file path to a valid .nii or .nii.gz file, or
- a finite 3D/4D NumPy-like array, or
- a NIfTI object that exposes `get_fdata()`

The ML layer must reject:

- empty volumes
- NaN or infinite values
- unsupported array dimensions
- corrupted image files
- non-numeric model output
- model artifacts that do not load, do not match the expected contract, or do not contain valid coefficients

## 3. Response contract

The backend-facing ML response is a dictionary with the following fields:

```json
{
  "predicted_brain_age": 67.2,
  "brain_age_difference": 5.2,
  "uncertainty_interval": [64.1, 69.8],
  "model_name": "ResNet3D-Regression",
  "model_version": "v1.0.0",
  "prediction_timestamp": "2026-10-19T00:00:00+00:00",
  "subject_id": "subject_123",
  "status": "completed"
}
```

Required rules:

- `predicted_brain_age` is always a finite float when the prediction completes successfully
- `brain_age_difference` is computed as `predicted_brain_age - chronological_age` when a valid chronological_age is supplied
- `uncertainty_interval` is included only when the model genuinely produces it and it is finite
- `model_version` must match the artifact or runtime configuration, not a placeholder string
- `status` must be `completed` for successful output and explicit error conditions must raise exceptions before serialization

## 4. Error contract

The ML layer raises explicit exceptions rather than returning fake values:

- `InferenceUnavailableError` when the model is not configured or not loadable
- `ModelLoadError` when the artifact is invalid or incompatible
- `InvalidPredictionError` when the output is empty, non-numeric, or malformed
- `RuntimeError` for model execution failures
- `FileNotFoundError` or `InputValidationError` for invalid MRI files or missing inputs

The backend must convert these into HTTP/API responses without leaking raw filesystem paths or model internals to end users.

## 5. Long-running inference and resource management

The current repository does not implement asynchronous background workers or a dedicated model server. The contract therefore assumes the following:

- short inference jobs run synchronously in-process
- long tasks should be isolated behind a queue or worker boundary before deployment
- inference must respect a timeout policy and fail fast when a runtime cannot produce a valid response
- CPU/GPU requirements should be documented in the deployment configuration and artifact metadata
- model loading should happen once per process where practical and should not re-read the artifact on every request unless required by deployment constraints

## 6. Readiness checks and deployment dependencies

The backend should not consider the model ready until:

- a valid artifact exists at the configured path
- the artifact matches the expected interface
- inference can run against an authorized MRI fixture
- output validation passes
- model metadata includes a valid version identifier
- evaluation metrics are available where required by deployment policy

A real deployment also requires:

- approved dataset access for model training and validation
- a secure file path and permissions model
- a documented model artifact checksum and release tracking process
- a stable versioning scheme for both model and preprocessing config

## 7. Frontend contract expectations

The frontend may rely on the following output fields for display:

- chronological age supplied by the application
- predicted brain age
- brain age difference
- uncertainty interval if supported and valid
- processing status
- model limitations and evaluation information, when present

The frontend must not require private model weights, local file paths, or raw MRI arrays.

## 8. Research limitations and status

The project currently demonstrates a reproducible engineering baseline and a valid contract boundary, but it does not yet include a clinically validated model or a fully approved real-world dataset. All research claims must be clearly distinguished from observed synthetic results and must remain explicitly limited to the documented evidence.
