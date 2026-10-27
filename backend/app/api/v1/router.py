from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, Response, UploadFile, status
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, ConfigDict, Field, ValidationError

from app.core.config import settings
from app.core.security import (
    check_rate_limit,
    ensure_owned_assessment,
    get_assessment_token,
    log_security_event,
    optional_user_context,
    require_user_context,
)
from app.schemas.common import HealthCheckResponse
from app.services.ml_inference import BrainAgeInferenceService
from app.services.mri_ingestion import save_valid_mri_upload, validate_mri_file
from app.services.report_service import generate_assessment_report_pdf

router = APIRouter(prefix='/api/v1', tags=['v1'])

_ASSESSMENTS: dict[str, dict[str, Any]] = {}
_REPORTS: dict[str, dict[str, Any]] = {}


def _generate_access_token() -> str:
    return f'assessment_{uuid.uuid4().hex}'


class MRIValidationRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')

    file_name: str = Field(..., min_length=1)
    file_size_bytes: int = Field(..., gt=0)
    format: str = Field(default='NIfTI')


class MRIValidationResponse(BaseModel):
    model_config = ConfigDict(extra='forbid')

    valid: bool
    filename: str
    file_size_bytes: int
    format: str
    dimensions: list[int] | None = None
    voxel_sizes: list[float] | None = None
    warnings: list[str] = []
    errors: list[str] = []


def _build_error_payload(code: str, message: str, *, details: Any | None = None) -> dict[str, Any]:
    return {
        'error': {
            'code': code,
            'message': message,
            'details': details,
            'request_id': str(uuid.uuid4()),
        }
    }


@router.get('/health', response_model=HealthCheckResponse)
def health() -> HealthCheckResponse:
    return HealthCheckResponse(
        status='degraded',
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
        checks={
            'database': 'not_configured',
            'ml_service': 'not_configured',
            'storage': 'not_configured',
        },
    )


@router.post('/mri/validate', response_model=MRIValidationResponse)
async def validate_mri(
    request: Request,
    file: UploadFile | None = File(default=None),
) -> MRIValidationResponse:
    if file is not None:
        result = validate_mri_file(file)
        return MRIValidationResponse(
            valid=result['valid'],
            filename=result['filename'],
            file_size_bytes=result['file_size_bytes'],
            format=result['format'],
            dimensions=result['dimensions'],
            voxel_sizes=result['voxel_sizes'],
            warnings=result['warnings'],
            errors=result['errors'],
        )

    content_type = request.headers.get('content-type', '')
    if not content_type.startswith('application/json'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='No MRI file was provided.')

    try:
        payload = await request.json()
    except Exception as exc:  # pragma: no cover - defensive path
        raise RequestValidationError([
            {'type': 'json_invalid', 'loc': ('body',), 'msg': 'JSON body is invalid.', 'input': None},
        ]) from exc

    try:
        body = MRIValidationRequest.model_validate(payload)
    except ValidationError as exc:
        raise RequestValidationError(exc.errors()) from exc

    acceptable = {'.nii', '.nii.gz'}
    lower_name = body.file_name.lower()
    valid = any(lower_name.endswith(ext) for ext in acceptable)
    errors: list[str] = []
    if not valid:
        errors.append('Unsupported format: only .nii and .nii.gz are supported.')
    if body.file_size_bytes > settings.max_upload_size_bytes:
        errors.append(
            f'The MRI file is oversized and exceeds the maximum supported size of {settings.max_upload_size_bytes / (1024 * 1024):.0f} MB.'
        )

    return MRIValidationResponse(
        valid=not errors,
        filename=body.file_name,
        file_size_bytes=body.file_size_bytes,
        format=body.format,
        warnings=[],
        errors=errors,
    )


@router.post('/mri/upload')
async def upload_mri(
    request: Request,
    file: UploadFile = File(...),
    chronological_age: float | None = Form(default=None),
    subject_id: str | None = Form(default=None),
    user_id: str | None = Depends(optional_user_context),
) -> dict[str, object]:
    check_rate_limit(request, endpoint='mri_upload', limit_per_minute=settings.rate_limit_per_minute)
    result = validate_mri_file(file)
    if not result['valid']:
        message = result['errors'][0] if result['errors'] else 'The MRI file failed validation.'
        status_code = status.HTTP_413_REQUEST_ENTITY_TOO_LARGE if 'oversized' in message.lower() or 'exceeds the maximum supported size' in message.lower() else status.HTTP_400_BAD_REQUEST
        exc = HTTPException(status_code=status_code, detail=message)
        exc.code = 'file_too_large' if status_code == status.HTTP_413_REQUEST_ENTITY_TOO_LARGE else 'invalid_file'
        raise exc

    stored = save_valid_mri_upload(file, subject_id=subject_id)
    assessment_id = str(stored['id'])
    created_at = stored['created_at']
    access_token = _generate_access_token()
    preview = stored.get('preview') or {
        'available': False,
        'fileType': 'nii',
        'url': None,
        'message': 'Preview generation is unavailable for this upload.',
        'availableViews': ['axial'],
    }
    created = {
        'id': assessment_id,
        'assessment_id': assessment_id,
        'assessmentId': assessment_id,
        'status': 'queued',
        'message': stored['message'],
        'created_at': created_at,
        'createdAt': created_at,
        'access_token': access_token,
        'accessToken': access_token,
        'preview': preview,
    }
    if chronological_age is not None:
        created['chronological_age'] = chronological_age

    _ASSESSMENTS[assessment_id] = {
        'assessment_id': assessment_id,
        'assessmentId': assessment_id,
        'status': 'queued',
        'message': stored['message'],
        'created_at': created_at,
        'updated_at': created_at,
        'chronological_age': chronological_age,
        'subject_id': subject_id,
        'owner_id': user_id or 'anonymous',
        'access_token': access_token,
        'preview': preview,
        'output_payload': {'preview': preview},
    }
    log_security_event(action='assessment_created', user_id=user_id, assessment_id=assessment_id, allowed=True)
    return created


@router.post('/assessments')
async def create_assessment(
    request: Request,
    file: UploadFile = File(...),
    chronological_age: float | None = Form(default=None),
    subject_id: str | None = Form(default=None),
    user_id: str | None = Depends(optional_user_context),
) -> dict[str, object]:
    check_rate_limit(request, endpoint='assessment_create', limit_per_minute=settings.rate_limit_per_minute)
    response = await upload_mri(request=request, file=file, chronological_age=chronological_age, subject_id=subject_id, user_id=user_id)
    assessment_id = str(response['assessment_id'])
    created_at = datetime.now(timezone.utc).isoformat()
    access_token = str(response.get('access_token') or response.get('accessToken') or '')
    entry = _ASSESSMENTS.get(assessment_id)
    if entry is not None:
        entry['created_at'] = created_at
        entry['updated_at'] = created_at
    return {
        'assessment_id': assessment_id,
        'status': 'queued',
        'message': 'Assessment accepted and queued for processing.',
        'created_at': created_at,
        'access_token': access_token,
        'accessToken': access_token,
    }


@router.get('/assessments/{assessment_id}')
def get_assessment(
    request: Request,
    assessment_id: str,
    user_id: str | None = Depends(optional_user_context),
) -> dict[str, Any]:
    check_rate_limit(request, endpoint='assessment_read', limit_per_minute=settings.rate_limit_per_minute)
    entry = _ASSESSMENTS.get(assessment_id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Assessment not found.')
    ensure_owned_assessment(entry, user_id, action='assessment_read', access_token=get_assessment_token(request))

    payload = {
        'assessment_id': entry['assessment_id'],
        'status': entry.get('status', 'queued'),
        'message': entry.get('message', 'Assessment record is queued for processing.'),
        'created_at': entry.get('created_at'),
        'updated_at': entry.get('updated_at'),
    }

    output = entry.get('output_payload') or {}
    preview = output.get('preview') or entry.get('preview') or {
        'available': False,
        'fileType': 'nii',
        'url': None,
        'message': 'Preview unavailable for this MRI dataset.',
        'availableViews': ['axial'],
    }
    payload['preview'] = preview
    if output:
        payload.update(
            {
                'chronological_age': output.get('chronological_age', entry.get('chronological_age')),
                'predicted_brain_age': output.get('predicted_brain_age'),
                'brain_age_difference': output.get('brain_age_difference'),
                'uncertainty_interval': output.get('uncertainty_interval'),
                'model_name': output.get('model_name', 'ResNet3D-Regression'),
                'assessment_date': output.get('assessment_date', entry.get('created_at')),
                'processing_status': output.get('processing_status', 'Completed' if entry.get('status') == 'completed' else 'Queued'),
                'model_limitations': output.get('model_limitations', ['This estimate is exploratory and not a medical diagnosis.']),
                'disclaimer': output.get('disclaimer', 'This output is intended for research use only.'),
            }
        )

    return payload


@router.get('/assessments')
def list_assessments(
    request: Request,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status: str | None = Query(default=None),
    user_id: str | None = Depends(optional_user_context),
) -> dict[str, Any]:
    check_rate_limit(request, endpoint='assessment_list', limit_per_minute=settings.rate_limit_per_minute)
    if user_id is None:
        return {'items': [], 'total': 0, 'limit': limit, 'offset': offset, 'status': status}
    items = [item for item in _ASSESSMENTS.values() if item.get('owner_id') == user_id]
    if status is not None:
        items = [item for item in items if str(item.get('status', 'queued')).lower() == str(status).lower()]

    paginated = items[offset: offset + limit]
    history = []
    for item in paginated:
        payload = item.get('output_payload') or {}
        history.append(
            {
                'assessment_id': item['assessment_id'],
                'assessment_date': item.get('created_at') or item.get('updated_at'),
                'status': (payload.get('processing_status') or item.get('status') or 'Queued').title(),
                'predicted_brain_age': payload.get('predicted_brain_age'),
                'brain_age_difference': payload.get('brain_age_difference'),
                'subject_id': item.get('subject_id'),
            }
        )

    return {'items': history, 'total': len(items), 'limit': limit, 'offset': offset, 'status': status}


@router.get('/reports/{assessment_id}')
def get_report_metadata(
    request: Request,
    assessment_id: str,
    user_id: str | None = Depends(optional_user_context),
) -> dict[str, Any]:
    check_rate_limit(request, endpoint='report_read', limit_per_minute=settings.rate_limit_per_minute)
    assessment = _ASSESSMENTS.get(assessment_id)
    if assessment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Assessment not found.')
    ensure_owned_assessment(assessment, user_id, action='report_read', access_token=get_assessment_token(request))

    report_id = f'report_{assessment_id}'
    entry = _REPORTS.get(report_id)
    if entry is None:
        status_value = assessment.get('status', 'queued')
        report = {
            'id': report_id,
            'assessment_id': assessment_id,
            'title': 'Brain aging summary report',
            'generated_at': datetime.now(timezone.utc).isoformat() if status_value == 'completed' else None,
            'status': 'completed' if status_value == 'completed' else 'processing',
            'summary': 'Final research summary for the assessment.' if status_value == 'completed' else 'Report generation is in progress.',
            'file_url': f'/api/v1/reports/{assessment_id}/download',
            'format': 'pdf',
            'owner_id': user_id or assessment.get('owner_id'),
        }
        _REPORTS[report_id] = report
        return report

    if user_id is not None:
        if entry.get('owner_id') not in (None, user_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='You are not authorized to access this report.')
    elif entry.get('owner_id') not in (None, assessment.get('owner_id')):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='You are not authorized to access this report.')

    access_token = get_assessment_token(request)
    if access_token and assessment.get('access_token') != access_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='You are not authorized to access this report.')
    return entry


@router.get('/reports/{assessment_id}/download')
def download_report(
    request: Request,
    assessment_id: str,
    user_id: str | None = Depends(optional_user_context),
) -> Response:
    check_rate_limit(request, endpoint='report_download', limit_per_minute=max(1, settings.rate_limit_per_minute // 2))
    assessment = _ASSESSMENTS.get(assessment_id)
    if assessment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Assessment not found.')
    ensure_owned_assessment(assessment, user_id, action='report_download', access_token=get_assessment_token(request))

    if assessment.get('status') != 'completed':
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='The report is not ready for download yet.')

    try:
        pdf_bytes = generate_assessment_report_pdf(assessment)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f'Report generation failed: {exc}') from exc
    except Exception as exc:  # pragma: no cover - defensive path
        log_security_event(action='report_generation_failed', user_id=user_id, assessment_id=assessment_id, allowed=False, reason=str(exc))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='The report could not be generated.') from exc

    report_id = f'report_{assessment_id}'
    _REPORTS[report_id] = {
        'id': report_id,
        'assessment_id': assessment_id,
        'title': 'Brain aging summary report',
        'generated_at': datetime.now(timezone.utc).isoformat(),
        'status': 'completed',
        'summary': 'Final research summary for the assessment.',
        'file_url': f'/api/v1/reports/{assessment_id}/download',
        'format': 'pdf',
        'owner_id': user_id,
    }

    headers = {
        'Content-Type': 'application/pdf',
        'Content-Disposition': f'attachment; filename="{assessment_id}-brain-age-report.pdf"',
        'Cache-Control': 'no-store',
    }
    return Response(content=pdf_bytes, headers=headers, media_type='application/pdf')


@router.get('/reports')
def list_reports(
    request: Request,
    user_id: str | None = Depends(optional_user_context),
) -> list[dict[str, Any]]:
    check_rate_limit(request, endpoint='report_list', limit_per_minute=settings.rate_limit_per_minute)
    if user_id is None:
        return []
    return [report for report in _REPORTS.values() if report.get('owner_id') in (None, user_id)]


@router.get('/model/metrics')
def get_model_metrics() -> dict[str, Any]:
    service = BrainAgeInferenceService()
    metrics = service.get_metrics()
    if metrics.get('status') == 'unavailable':
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=metrics.get('message', 'Model metrics are not available because the model dependency is unavailable.'),
        )

    normalized = {
        'model_name': metrics.get('model_name'),
        'architecture': metrics.get('architecture'),
        'mae': metrics.get('mae'),
        'rmse': metrics.get('rmse'),
        'pearson_r': metrics.get('pearson_r'),
        'dataset_evaluated': metrics.get('dataset_name') or metrics.get('evaluation_dataset') or 'Not yet evaluated',
        'n_test_samples': metrics.get('n_test_samples'),
        'bias_corrected': metrics.get('bias_corrected', False),
        'last_evaluated': metrics.get('last_evaluated'),
    }
    return normalized
