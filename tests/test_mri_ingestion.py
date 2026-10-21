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


def test_mri_validate_accepts_supported_nifti_upload() -> None:
    response = client.post(
        '/api/v1/mri/validate',
        files={'file': ('subject_001.nii.gz', io.BytesIO(_valid_nifti_bytes()), 'application/octet-stream')},
        headers={'X-User-Id': 'user-mri-validator'},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload['valid'] is True
    assert payload['filename'] == 'subject_001.nii.gz'
    assert payload['format'] == 'NIfTI'
    assert payload['errors'] == []


def test_mri_upload_rejects_invalid_or_oversized_files() -> None:
    invalid = client.post(
        '/api/v1/mri/upload',
        files={'file': ('bad.txt', io.BytesIO(b'not a nifti file'), 'text/plain')},
        headers={'X-User-Id': 'user-upload-invalid'},
    )
    assert invalid.status_code == 400
    assert invalid.json()['error']['code'] == 'invalid_file'

    oversized = client.post(
        '/api/v1/mri/upload',
        files={'file': ('too_large.nii.gz', io.BytesIO(b'A' * 300_000_000), 'application/octet-stream')},
        headers={'X-User-Id': 'user-upload-oversized'},
    )
    assert oversized.status_code == 413
    assert 'oversized' in oversized.json()['error']['message'].lower()


def test_mri_upload_accepts_and_stores_valid_file() -> None:
    response = client.post(
        '/api/v1/mri/upload',
        files={'file': ('scan_002.nii', io.BytesIO(_valid_nifti_bytes('scan_002.nii')), 'application/octet-stream')},
        headers={'X-User-Id': 'user-upload-valid'},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload['status'] == 'queued'
    assert payload['id']
    assert 'message' in payload
