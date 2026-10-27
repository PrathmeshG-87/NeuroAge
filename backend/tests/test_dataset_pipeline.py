from __future__ import annotations

import csv
import json
from pathlib import Path

import nibabel as nib
import numpy as np

from app.data_pipeline.dataset_inventory import analyze_dataset, load_metadata, write_report


def _write_nifti(path: Path) -> None:
    img = nib.Nifti1Image(np.zeros((6, 7, 8), dtype=np.float32), np.eye(4))
    nib.save(img, str(path))


def test_analyze_dataset_detects_eligible_files_and_exclusions(tmp_path: Path) -> None:
    dataset_root = tmp_path / 'raw_dataset'
    dataset_root.mkdir()
    (dataset_root / 'subj_a').mkdir()
    (dataset_root / 'subj_b').mkdir()
    _write_nifti(dataset_root / 'subj_a' / 'subj_a_t1.nii.gz')
    _write_nifti(dataset_root / 'subj_b' / 'subj_b_t1.nii.gz')
    (dataset_root / 'subj_b' / 'subj_b_repeat.nii.gz').write_bytes((dataset_root / 'subj_b' / 'subj_b_t1.nii.gz').read_bytes())

    metadata_path = tmp_path / 'metadata.csv'
    with metadata_path.open('w', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=['subject_id', 'age', 'modality'])
        writer.writeheader()
        writer.writerow({'subject_id': 'subj_a', 'age': '52', 'modality': 'T1'})
        writer.writerow({'subject_id': 'subj_b', 'age': '63', 'modality': 'T1'})
        writer.writerow({'subject_id': 'subj_c', 'age': 'not_a_number', 'modality': 'T1'})

    summary = analyze_dataset(dataset_root, metadata_path=metadata_path)

    assert summary['image_count'] == 3
    assert summary['valid_image_count'] == 2
    assert summary['eligible_subject_count'] == 2
    assert summary['duplicate_subject_count'] == 1
    assert summary['missing_label_count'] == 0
    assert summary['invalid_age_count'] == 1
    assert summary['accepted_subject_ids'] == ['subj_a', 'subj_b']


def test_load_metadata_and_report_output(tmp_path: Path) -> None:
    dataset_root = tmp_path / 'raw_dataset'
    dataset_root.mkdir()
    _write_nifti(dataset_root / 'subject_001.nii.gz')

    metadata_path = tmp_path / 'subject_metadata.csv'
    with metadata_path.open('w', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=['subject_id', 'age', 'sex'])
        writer.writeheader()
        writer.writerow({'subject_id': 'subject_001', 'age': '58', 'sex': 'F'})

    metadata = load_metadata(metadata_path)
    assert metadata['subject_001']['age'] == 58.0
    assert metadata['subject_001']['sex'] == 'F'

    report_dir = tmp_path / 'derived'
    report_dir.mkdir()
    output = write_report({'eligible_subject_count': 1, 'age_distribution': {'min': 58.0, 'max': 58.0, 'mean': 58.0}}, report_dir)
    assert output.exists()
    payload = json.loads(output.read_text())
    assert payload['eligible_subject_count'] == 1
