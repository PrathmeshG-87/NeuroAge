from __future__ import annotations

import io
from datetime import datetime, timezone

from fastapi.testclient import TestClient
from pypdf import PdfReader

from app.api.v1 import router as router_module
from app.main import app
from app.services.report_service import generate_assessment_report_pdf

client = TestClient(app)


def _extract_pdf_text(pdf_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    pages = [page.extract_text() or '' for page in reader.pages]
    return '\n'.join(pages)


def test_generate_assessment_report_pdf_uses_saved_assessment_values() -> None:
    assessment_id = 'assessment-report-001'
    assessment = {
        'assessment_id': assessment_id,
        'owner_id': 'report-user',
        'status': 'completed',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'updated_at': datetime.now(timezone.utc).isoformat(),
        'chronological_age': 62.0,
        'output_payload': {
            'predicted_brain_age': 68.5,
            'brain_age_difference': 6.5,
            'uncertainty_interval': [4.2, 8.9],
            'model_name': 'ResNet3D-Regression',
            'model_version': 'v1.2.3-qa',
            'evaluation_dataset': 'ADNI subset',
            'last_evaluated': '2026-01-15T00:00:00Z',
            'model_limitations': ['This estimate is exploratory and not a medical diagnosis.'],
        },
    }

    pdf_bytes = generate_assessment_report_pdf(assessment)

    extracted_text = _extract_pdf_text(pdf_bytes)

    assert pdf_bytes.startswith(b'%PDF-')
    assert 'Chronological age' in extracted_text
    assert '62.0 years' in extracted_text
    assert '68.5 years' in extracted_text
    assert '6.5 years' in extracted_text
    assert 'ResNet3D-Regression' in extracted_text
    assert 'v1.2.3-qa' in extracted_text


def test_report_download_requires_matching_owner_for_completed_assessment() -> None:
    assessment_id = 'assessment-report-002'
    router_module._ASSESSMENTS[assessment_id] = {
        'assessment_id': assessment_id,
        'owner_id': 'report-user-2',
        'status': 'completed',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'updated_at': datetime.now(timezone.utc).isoformat(),
        'chronological_age': 58.0,
        'output_payload': {
            'predicted_brain_age': 61.0,
            'brain_age_difference': 3.0,
            'model_name': 'ResNet3D-Regression',
            'model_version': 'v2.0.0',
        },
    }

    denied = client.get(f'/api/v1/reports/{assessment_id}/download', headers={'X-User-Id': 'another-user'})
    assert denied.status_code == 403

    response = client.get(f'/api/v1/reports/{assessment_id}/download', headers={'X-User-Id': 'report-user-2'})
    assert response.status_code == 200
    assert response.headers['content-type'].startswith('application/pdf')
    assert response.content.startswith(b'%PDF-')
