# API contract proposal for NeuroAge

## 1. Scope

This document captures the proposed backend contract to support the current frontend implementation and the expected ML pipeline. It is intentionally framed as a proposed agreement, not a claim that the backend already exists.

The current repository does not contain a Python backend, and the frontend is operating in demo-safe mode by default when no API base URL is configured. Because of that, this contract is a design specification to be implemented and verified before production deployment.

---

## 2. Core conventions

### Base URL

- Suggested base path: `/api/v1`

### Content types

- `multipart/form-data` for MRI uploads and validation
- `application/json` for metadata and status payloads
- `application/pdf` for report downloads

### Standard response envelope

For JSON error responses, use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The MRI file is invalid.",
    "details": {
      "field": "file",
      "reason": "Only .nii and .nii.gz are supported."
    },
    "request_id": "req_12345"
  }
}
```

### Processing states

Use explicit status values across the API surface:

- `queued`
- `validating`
- `preprocessing`
- `processing`
- `completed`
- `failed`
- `rejected`
- `unavailable`

The frontend currently normalizes accepted aliases and example states such as `accepted`, `success`, and `processing` into a smaller set. The backend should be explicit and consistent.

---

## 3. Proposed endpoints

### 3.1 Health check

#### `GET /health`

Purpose: verify backend and dependency health.

Successful response:

```json
{
  "status": "ok",
  "service": "neuroage-api",
  "version": "0.1.0",
  "timestamp": "2026-10-18T12:00:00Z"
}
```

Potential error response:

```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Backend is temporarily unavailable.",
    "request_id": "req_67890"
  }
}
```

---

### 3.2 MRI validation

#### `POST /api/v1/mri/validate`

Purpose: validate an uploaded MRI file before assessment submission.

Request: `multipart/form-data`

```text
file: <binary>
```

Successful response:

```json
{
  "valid": true,
  "filename": "subject_001.nii.gz",
  "file_size_bytes": 183204568,
  "format": "NIfTI",
  "dimensions": [182, 218, 182],
  "voxel_sizes": [1.0, 1.0, 1.0],
  "warnings": [],
  "errors": []
}
```

Validation failure response:

```json
{
  "valid": false,
  "filename": "bad_file.txt",
  "file_size_bytes": 124,
  "format": "Unknown",
  "warnings": [],
  "errors": [
    "Unsupported format: only .nii and .nii.gz are supported.",
    "File exceeds maximum supported size."
  ]
}
```

Notes:

- The frontend currently restricts accepted input to `.nii` and `.nii.gz` and a 250 MB cap.
- This should remain enforced by the backend as the source of truth.

---

### 3.3 Create assessment

#### `POST /api/v1/assessments`

Purpose: accept a valid MRI upload and create an assessment job.

Request: `multipart/form-data`

```text
file: <binary>
chronological_age: 62
subject_id: "SUBJ_IXI_0442"
```

Successful response:

```json
{
  "assessment_id": "a1b2c3d4-e5f6-7890-abcd-1234567890ef",
  "status": "queued",
  "message": "Assessment accepted and queued for processing.",
  "created_at": "2026-10-18T12:00:00Z"
}
```

Error response:

```json
{
  "error": {
    "code": "INVALID_FILE",
    "message": "The MRI file failed validation.",
    "details": {
      "field": "file",
      "reason": "Only .nii and .nii.gz are accepted."
    }
  }
}
```

Notes:

- This matches the frontend’s current contract expectation in `assessment.ts`.
- The frontend expects the server to return an identifier and status without inventing a synchronous success model.

---

### 3.4 Retrieve assessment details

#### `GET /api/v1/assessments/{assessment_id}`

Purpose: fetch assessment metadata, job state, and optional result payload.

Successful response (in progress):

```json
{
  "assessment_id": "a1b2c3d4-e5f6-7890-abcd-1234567890ef",
  "status": "processing",
  "message": "MRI preprocessing and inference are in progress.",
  "created_at": "2026-10-18T12:00:00Z",
  "updated_at": "2026-10-18T12:01:05Z"
}
```

Successful response (completed):

```json
{
  "assessment_id": "a1b2c3d4-e5f6-7890-abcd-1234567890ef",
  "status": "completed",
  "chronological_age": 62,
  "predicted_brain_age": 67.2,
  "brain_age_difference": 5.2,
  "uncertainty_interval": [64.1, 69.8],
  "model_name": "ResNet3D-Regression v1",
  "assessment_date": "2026-10-18T12:03:12Z",
  "processing_status": "Completed",
  "model_limitations": [
    "This estimate is exploratory and not a medical diagnosis."
  ],
  "disclaimer": "This output is intended for research use only."
}
```

Notes:

- This endpoint intentionally supports both status-only and result-bearing responses.
- The frontend currently expects a status result and may merge it with UI-specific rendering logic.

---

### 3.5 List assessments

#### `GET /api/v1/assessments`

Purpose: list assessment history for a user or workspace context.

Query parameters:

- `limit` (optional, default `20`)
- `offset` (optional, default `0`)
- `status` (optional)

Successful response:

```json
{
  "items": [
    {
      "assessment_id": "a1b2c3d4-e5f6-7890-abcd-1234567890ef",
      "assessment_date": "2026-10-18T12:00:00Z",
      "status": "Completed",
      "predicted_brain_age": 67.2,
      "brain_age_difference": 5.2,
      "subject_id": "SUBJ_IXI_0442"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

Notes:

- The frontend’s history service expects a list of assessment records and a safe empty-state handling path.

---

### 3.6 Model metrics

#### `GET /api/v1/model/metrics`

Purpose: expose the current model evaluation metrics.

Successful response:

```json
{
  "model_name": "ResNet3D-Regression v1",
  "architecture": "3D CNN regression",
  "mae": 4.18,
  "rmse": 5.32,
  "pearson_r": 0.91,
  "dataset_evaluated": "IXI + OASIS-1/OASIS-3",
  "n_test_samples": 184,
  "bias_corrected": true,
  "last_evaluated": "2026-10-18T00:00:00Z"
}
```

Notes:

- This contract matches the frontend’s `ModelEvaluationMetrics` shape.
- It should be populated from a real evaluation record or model registry, not inferred in the frontend.

---

### 3.7 Report metadata

#### `GET /api/v1/reports/{assessment_id}`

Purpose: fetch report metadata for a completed assessment.

Successful response:

```json
{
  "id": "rep_001",
  "assessment_id": "a1b2c3d4-e5f6-7890-abcd-1234567890ef",
  "title": "Brain aging summary report",
  "generated_at": "2026-10-18T12:05:00Z",
  "status": "completed",
  "summary": "Final research summary for the assessment.",
  "file_url": "/api/v1/reports/a1b2c3d4-e5f6-7890-abcd-1234567890ef/download",
  "format": "pdf"
}
```

Possible statuses:

- `completed`
- `processing`
- `failed`
- `unavailable`

---

### 3.8 Download PDF report

#### `GET /api/v1/reports/{assessment_id}/download`

Purpose: serve the generated PDF report as a binary file.

Response headers:

```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="a1b2c3d4-e5f6-7890-abcd-1234567890ef-brain-age-report.pdf"
```

Notes:

- This matches the frontend’s expectation for a backend-served PDF file.
- The client must not synthesize a PDF from browser-side data.

---

## 4. Common error formats

### HTTP status mapping

- `200 OK` - successful request
- `201 Created` - assessment created
- `202 Accepted` - queued / accepted and processing asynchronously
- `400 Bad Request` - validation or malformed request
- `401 Unauthorized` - authentication required
- `403 Forbidden` - insufficient permission
- `404 Not Found` - resource missing
- `409 Conflict` - duplicate or invalid state transition
- `413 Payload Too Large` - file too large
- `422 Unprocessable Entity` - file content or domain validation failed
- `500 Internal Server Error` - unexpected server issue
- `503 Service Unavailable` - ML service or dependency unavailable

### Error object contract

```json
{
  "error": {
    "code": "HTTP_ERROR",
    "message": "The MRI file failed validation.",
    "details": {
      "field": "file",
      "reason": "Only .nii and .nii.gz are accepted."
    },
    "request_id": "req_abc123"
  }
}
```

---

## 5. Data schemas

### MRI validation result

```json
{
  "valid": true,
  "filename": "string",
  "file_size_bytes": 0,
  "format": "NIfTI",
  "dimensions": [0, 0, 0],
  "voxel_sizes": [0.0, 0.0, 0.0],
  "warnings": ["string"],
  "errors": ["string"]
}
```

### Assessment creation response

```json
{
  "assessment_id": "string",
  "status": "queued",
  "message": "string",
  "created_at": "ISO_8601_datetime"
}
```

### Assessment result payload

```json
{
  "assessment_id": "string",
  "status": "completed",
  "chronological_age": 62.0,
  "predicted_brain_age": 67.2,
  "brain_age_difference": 5.2,
  "uncertainty_interval": [64.1, 69.8],
  "model_name": "string",
  "assessment_date": "ISO_8601_datetime",
  "processing_status": "Completed",
  "model_limitations": ["string"],
  "disclaimer": "string"
}
```

### Model metrics payload

```json
{
  "model_name": "string",
  "architecture": "string",
  "mae": 4.18,
  "rmse": 5.32,
  "pearson_r": 0.91,
  "dataset_evaluated": "string",
  "n_test_samples": 184,
  "bias_corrected": true,
  "last_evaluated": "ISO_8601_datetime"
}
```

---

## 6. Frontend-to-backend alignment notes

This proposal aligns with the current frontend service contracts from:

- `frontend/src/services/assessment.ts`
- `frontend/src/services/mri.ts`
- `frontend/src/services/model.ts`
- `frontend/src/services/reports.ts`
- `frontend/src/services/apiClient.ts`

The frontend is currently written to operate safely in demo mode and to call the backend only when it is configured. That is the correct boundary and should remain in place until the backend and ML contracts are confirmed.

---

## 7. Unresolved decisions

The following must be agreed before implementation:

- Authentication scheme for the backend (if any)
- Whether `/api/v1/assessments` is a multipart file route or a route that accepts a pre-uploaded file reference
- Exact status names and whether any aliases should remain supported for backward compatibility
- Whether result values are always returned in the same resource payload or via a separate result endpoint
- How the ML service handles unavailable or untrained model artifacts
- Whether PDF generation is synchronous or asynchronous and how it is retried
- Which storage provider is used for MRI inputs and PDFs

This contract is deliberately conservative, and it avoids claiming clinical validity or fabricated model performance metrics.
