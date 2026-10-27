from __future__ import annotations

import io
import tempfile
from pathlib import Path

import nibabel as nib
import numpy as np
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _valid_nifti_bytes(filename: str = 'subject_001.nii.gz') -> bytes:
    array = np.zeros((6, 7, 8), dtype=np.float32)
    image = nib.Nifti1Image(array, np.eye(4))
    suffix = '.nii.gz' if filename.lower().endswith('.nii.gz') else '.nii'
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        temp_path = Path(tmp.name)
    nib.save(image, str(temp_path))
    try:
        return temp_path.read_bytes()
    finally:
        temp_path.unlink(missing_ok=True)


def test_public_assessment_flow_allows_anonymous_creation_and_token_access() -> None:
    response = client.post(
        '/api/v1/assessments',
        files={'file': ('scan_public.nii.gz', io.BytesIO(_valid_nifti_bytes('scan_public.nii.gz')), 'application/octet-stream')},
    )
    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload['assessment_id']
    assert payload['access_token']

    allowed = client.get(
        f"/api/v1/assessments/{payload['assessment_id']}",
        headers={'X-Assessment-Token': payload['access_token']},
    )
    assert allowed.status_code == 200
    assert allowed.json()['assessment_id'] == payload['assessment_id']


def test_users_cannot_access_other_users_assessments() -> None:
    created = client.post(
        '/api/v1/assessments',
        files={'file': ('scan_003.nii.gz', io.BytesIO(_valid_nifti_bytes('scan_003.nii.gz')), 'application/octet-stream')},
        headers={'X-User-Id': 'user-alpha'},
    )
    assert created.status_code == 200, created.text
    assessment_id = created.json()['assessment_id']

    denied = client.get(
        f'/api/v1/assessments/{assessment_id}',
        headers={'X-User-Id': 'user-beta'},
    )
    assert denied.status_code == 403
    assert 'not authorized' in denied.json()['error']['message'].lower()

    allowed = client.get(
        f'/api/v1/assessments/{assessment_id}',
        headers={'X-User-Id': 'user-alpha'},
    )
    assert allowed.status_code == 200
    assert allowed.json()['assessment_id'] == assessment_id


def test_report_download_requires_matching_owner_or_token() -> None:
    created = client.post(
        '/api/v1/assessments',
        files={'file': ('scan_004.nii', io.BytesIO(_valid_nifti_bytes('scan_004.nii')), 'application/octet-stream')},
        headers={'X-User-Id': 'user-gamma'},
    )
    assessment_id = created.json()['assessment_id']
    report = client.get(f'/api/v1/reports/{assessment_id}', headers={'X-User-Id': 'user-gamma'})
    assert report.status_code == 200

    denied = client.get(f'/api/v1/reports/{assessment_id}/download', headers={'X-User-Id': 'user-delta'})
    assert denied.status_code == 403

    token_report = client.get(f'/api/v1/reports/{assessment_id}', headers={'X-Assessment-Token': created.json()['access_token']})
    assert token_report.status_code == 200
