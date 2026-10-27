from __future__ import annotations

import io
import re
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import quote

import nibabel as nib
import numpy as np
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

SUPPORTED_MRI_EXTENSIONS = ('.nii', '.nii.gz')
UNSAFE_FILENAME_RE = re.compile(r'[^A-Za-z0-9._-]')


def _safe_original_name(filename: str | None) -> str:
    raw_name = (filename or 'upload').replace('\\', '/').split('/')[-1]
    cleaned = raw_name.strip().strip('.')
    safe = UNSAFE_FILENAME_RE.sub('_', cleaned)[:120]
    return safe or 'upload'


def _normalized_extension(filename: str | None) -> str:
    name = (filename or '').lower()
    if name.endswith('.nii.gz'):
        return '.nii.gz'
    if name.endswith('.nii'):
        return '.nii'
    return Path(name).suffix.lower()


def _storage_root() -> Path:
    root = Path(settings.upload_directory).expanduser().resolve()
    root.mkdir(parents=True, exist_ok=True)
    return root


def _read_file_bytes(file: UploadFile) -> bytes:
    data = file.file.read()
    try:
        file.file.seek(0)
    except (AttributeError, OSError):
        pass
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='The upload is empty. Please provide a valid MRI file.',
        )
    return data


def _load_nifti_from_bytes(file_bytes: bytes, filename_hint: str | None) -> nib.spatialimages.SpatialImage:
    extension = _normalized_extension(filename_hint)
    suffix = '.nii.gz' if extension == '.nii.gz' else '.nii'
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(file_bytes)
        temp_path = Path(tmp.name)
    try:
        return nib.load(str(temp_path))
    finally:
        temp_path.unlink(missing_ok=True)


def analyse_mri_upload(file_name: str | None, file_bytes: bytes) -> dict[str, Any]:
    extension = _normalized_extension(file_name)
    safe_name = _safe_original_name(file_name)
    errors: list[str] = []
    dimensions: list[int] | None = None
    voxel_sizes: list[float] | None = None

    if extension not in SUPPORTED_MRI_EXTENSIONS:
        errors.append('Unsupported format: only .nii and .nii.gz are supported.')

    if len(file_bytes) == 0:
        errors.append('The uploaded file is empty.')

    if len(file_bytes) > settings.max_upload_size_bytes:
        errors.append(
            f'The MRI file is oversized and exceeds the maximum supported size of {settings.max_upload_size_bytes / (1024 * 1024):.0f} MB.'
        )

    if not errors:
        try:
            image = _load_nifti_from_bytes(file_bytes, file_name)
            header = image.header
            shape = list(header.get_data_shape())
            if not shape or any(int(dim) <= 0 for dim in shape):
                errors.append('The MRI header is invalid or has non-positive image dimensions.')
            else:
                dimensions = [int(dim) for dim in shape[:3]]
                voxel_data = header.get_zooms()[:3]
                voxel_sizes = [float(value) for value in voxel_data]
        except Exception:
            errors.append('The MRI file appears to be corrupted or unreadable.')

    return {
        'filename': safe_name,
        'file_size_bytes': len(file_bytes),
        'format': 'NIfTI' if extension in SUPPORTED_MRI_EXTENSIONS else 'Unknown',
        'dimensions': dimensions,
        'voxel_sizes': voxel_sizes,
        'warnings': [],
        'errors': errors,
        'valid': not errors,
    }


def validate_mri_file(file: UploadFile | None, *, fallback_name: str | None = None) -> dict[str, Any]:
    if file is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='No MRI file was provided.',
            )
    original_name = file.filename or fallback_name or 'upload'
    file_bytes = _read_file_bytes(file)
    return analyse_mri_upload(original_name, file_bytes)


def _generate_preview_from_nifti(file_bytes: bytes) -> dict[str, Any]:
    try:
        with tempfile.NamedTemporaryFile(suffix='.nii.gz', delete=False) as tmp:
            tmp.write(file_bytes)
            temp_path = Path(tmp.name)
        try:
            image = nib.load(str(temp_path))
            array = np.asarray(image.get_fdata(dtype=np.float32))
        finally:
            temp_path.unlink(missing_ok=True)
    except Exception:
        return {
            'available': False,
            'fileType': 'nii',
            'url': None,
            'message': 'Preview generation is unavailable because the uploaded NIfTI data could not be decoded.',
            'availableViews': ['axial'],
        }

    data = np.nan_to_num(array, nan=0.0, posinf=0.0, neginf=0.0)
    if data.ndim == 4:
        data = data[..., 0]
    if data.ndim == 1:
        data = data.reshape(1, -1)
    if data.ndim == 3:
        axis_index = max(0, min(data.shape[2] - 1, data.shape[2] // 2))
        data = data[:, :, axis_index]
    if data.ndim != 2:
        data = np.mean(data, axis=0) if data.ndim == 3 else data
    if data.size == 0:
        return {
            'available': False,
            'fileType': 'nii',
            'url': None,
            'message': 'Preview generation is unavailable because the uploaded NIfTI data is empty.',
            'availableViews': ['axial'],
        }

    finite_data = np.asarray(data, dtype=np.float32)
    min_value = float(np.min(finite_data))
    max_value = float(np.max(finite_data))
    if not np.isfinite(min_value) or not np.isfinite(max_value) or max_value == min_value:
        normalized = np.zeros_like(finite_data, dtype=np.float32)
    else:
        normalized = (finite_data - min_value) / (max_value - min_value + 1e-8)

    target_width = 120
    target_height = 120
    sample_y = np.linspace(0, finite_data.shape[0] - 1, target_height, dtype=int)
    sample_x = np.linspace(0, finite_data.shape[1] - 1, target_width, dtype=int)
    sampled = normalized[np.ix_(sample_y, sample_x)]

    svg_parts: list[str] = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 120 120">',
        '<rect width="120" height="120" fill="#07080b"/>',
    ]
    for row_idx, row in enumerate(sampled):
        for col_idx, value in enumerate(row):
            intensity = float(value)
            grayscale = int(max(0, min(255, round(intensity * 255))))
            svg_parts.append(
                f'<rect x="{col_idx}" y="{row_idx}" width="1" height="1" fill="rgb({grayscale},{grayscale},{grayscale})" />'
            )
    svg_parts.append('</svg>')
    svg_document = ''.join(svg_parts)
    data_url = 'data:image/svg+xml;charset=utf-8,' + quote(svg_document)
    return {
        'available': True,
        'fileType': 'image',
        'url': data_url,
        'message': 'MRI preview generated from the central axial slice of the uploaded NIfTI volume.',
        'availableViews': ['axial'],
    }


def save_valid_mri_upload(file: UploadFile | None, *, subject_id: str | None = None) -> dict[str, Any]:
    if file is None:
        exc = HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='No MRI file was provided.')
        exc.code = 'invalid_file'
        raise exc

    original_name = file.filename or 'upload'
    file_bytes = _read_file_bytes(file)
    validation = analyse_mri_upload(original_name, file_bytes)
    if not validation['valid']:
        message = validation['errors'][0] if validation['errors'] else 'The MRI file failed validation.'
        status_code = status.HTTP_413_REQUEST_ENTITY_TOO_LARGE if 'oversized' in message.lower() or 'exceeds the maximum supported size' in message.lower() else status.HTTP_400_BAD_REQUEST
        exc = HTTPException(status_code=status_code, detail=message)
        exc.code = 'file_too_large' if status_code == status.HTTP_413_REQUEST_ENTITY_TOO_LARGE else 'invalid_file'
        raise exc

    extension = _normalized_extension(original_name)
    safe_name = _safe_original_name(original_name)
    safe_stem = safe_name[:-len(extension)] if extension and safe_name.lower().endswith(extension) else safe_name
    storage_name = f'{uuid.uuid4().hex}_{safe_stem}{extension}'
    storage_root = _storage_root()
    target_path = storage_root / storage_name
    target_path.parent.mkdir(parents=True, exist_ok=True)
    target_path.write_bytes(file_bytes)

    assessment_id = f'assessment_{uuid.uuid4().hex}'
    preview = _generate_preview_from_nifti(file_bytes)
    payload = {
        'id': assessment_id,
        'assessmentId': assessment_id,
        'status': 'queued',
        'message': 'MRI uploaded and validated. Ready for preprocessing.',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'subject_id': subject_id,
        'preview': preview,
    }
    return payload
