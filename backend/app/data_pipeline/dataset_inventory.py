from __future__ import annotations

import csv
import hashlib
import json
import math
import os
import re
from collections import defaultdict
from pathlib import Path
from typing import Any

import nibabel as nib

DATASET_ROOT_ENV_KEYS = ('NEUROAGE_DATASET_ROOT', 'DATASET_ROOT', 'APP_DATASET_ROOT')
DEFAULT_IMAGE_EXTENSIONS = ('.nii', '.nii.gz')


def resolve_dataset_root(dataset_root: str | Path | None = None) -> Path:
    """Resolve a dataset root from the CLI, an explicit argument, or environment config."""
    if dataset_root is not None:
        return Path(dataset_root).expanduser().resolve()

    for key in DATASET_ROOT_ENV_KEYS:
        value = os.getenv(key)
        if value:
            return Path(value).expanduser().resolve()

    return (Path.cwd() / 'data' / 'raw').resolve()


def _normalise_subject_id(value: Any) -> str:
    if value is None:
        return ''
    text = str(value).strip().lower()
    text = text.replace(' ', '')
    text = re.sub(r'[^a-z0-9._-]+', '', text)
    return text


def _coerce_age(value: Any) -> float | None:
    if value is None or value == '':
        return None
    if isinstance(value, (int, float)):
        numeric = float(value)
    else:
        text = str(value).strip()
        if text == '':
            return None
        text = text.replace(',', '.')
        try:
            numeric = float(text)
        except ValueError:
            return None

    if not math.isfinite(numeric):
        return None
    if numeric < 0 or numeric > 120:
        return None
    return float(numeric)


def _read_csv_like(path: Path) -> list[dict[str, str]]:
    with path.open('r', newline='', encoding='utf-8-sig') as handle:
        sample = handle.read(4096)
        handle.seek(0)
        dialect = 'excel-tab' if path.suffix.lower() == '.tsv' else 'excel'
        reader = csv.DictReader(handle, dialect=dialect)
        return [{key: (value.strip() if isinstance(value, str) else value) for key, value in row.items()} for row in reader]


def load_metadata(metadata_path: str | Path | None, *, subject_id_column: str = 'subject_id', age_column: str = 'age') -> dict[str, dict[str, Any]]:
    """Load a subject metadata manifest and return a subject_id -> row mapping."""
    if metadata_path is None:
        return {}

    path = Path(metadata_path).expanduser()
    if not path.exists():
        return {}

    manifest: dict[str, dict[str, Any]] = {}
    for row in _read_csv_like(path):
        subject_id = row.get(subject_id_column)
        if not subject_id:
            continue
        key = _normalise_subject_id(subject_id)
        age_raw = row.get(age_column)
        manifest[key] = {
            **row,
            'subject_id': subject_id,
            'age': _coerce_age(age_raw),
            'age_raw': age_raw,
        }

    return manifest


def _infer_subject_id_from_path(path: Path) -> str:
    identifier = path.stem.lower()
    for pattern in (
        r'(?:subject|subj|participant|patient|case)[_-]?[a-z0-9]+',
        r'(?:ixi|oasis|adni)[_-]?[a-z0-9]+',
        r'[a-z]+[._-]?[0-9]+' ,
    ):
        match = re.search(pattern, identifier)
        if match:
            return _normalise_subject_id(match.group(0))
    return _normalise_subject_id(path.parent.name)


def _hash_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(65536), b''):
            digest.update(chunk)
    return digest.hexdigest()


def _scan_file(path: Path) -> dict[str, Any]:
    record: dict[str, Any] = {
        'path': str(path),
        'filename': path.name,
        'subject_id': _infer_subject_id_from_path(path),
        'file_size_bytes': path.stat().st_size,
        'sha256': _hash_file(path),
        'valid_nifti': False,
        'shape': None,
        'n_dimensions': None,
        'exclusion_reasons': [],
    }

    try:
        img = nib.load(str(path))
        record['valid_nifti'] = True
        record['shape'] = tuple(int(value) for value in getattr(img, 'shape', ()))
        record['n_dimensions'] = int(getattr(img, 'ndim', 0))
        if record['n_dimensions'] < 3:
            record['exclusion_reasons'].append('invalid_dimensions')
        if record['n_dimensions'] > 4:
            record['exclusion_reasons'].append('unsupported_ndim')
    except Exception:
        record['exclusion_reasons'].append('corrupted_file')

    return record


def analyze_dataset(
    dataset_root: str | Path | None = None,
    *,
    metadata_path: str | Path | None = None,
    subject_id_column: str = 'subject_id',
    age_column: str = 'age',
    output_dir: str | Path | None = None,
) -> dict[str, Any]:
    """Scan a raw MRI dataset tree, reconcile it with labels, and summarize quality issues."""
    dataset_root = resolve_dataset_root(dataset_root)
    if not dataset_root.exists():
        raise FileNotFoundError(
            f'Dataset root does not exist: {dataset_root}. '
            'Set DATASET_ROOT or provide --dataset-root to a valid MRI directory.'
        )

    metadata = load_metadata(metadata_path, subject_id_column=subject_id_column, age_column=age_column)

    image_files = sorted(
        path
        for path in dataset_root.rglob('*')
        if path.is_file() and path.name.lower().endswith(DEFAULT_IMAGE_EXTENSIONS)
    )

    records = [_scan_file(path) for path in image_files]
    for record in records:
        row = metadata.get(record['subject_id'])
        if row is None:
            record['metadata_found'] = False
            record['age'] = None
            if record['valid_nifti']:
                record['exclusion_reasons'].append('missing_label')
        else:
            record['metadata_found'] = True
            record['age'] = row.get('age')
            age_raw = row.get('age_raw')
            if record['age'] is None:
                if record['valid_nifti']:
                    if age_raw not in (None, ''):
                        record['exclusion_reasons'].append('invalid_age')
                    else:
                        record['exclusion_reasons'].append('missing_label')
            elif record['age'] < 0 or record['age'] > 120:
                if record['valid_nifti']:
                    record['exclusion_reasons'].append('invalid_age')

    grouped_by_subject: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        if record['subject_id']:
            grouped_by_subject[record['subject_id']].append(record)

    duplicate_subjects = sorted(subject_id for subject_id, group in grouped_by_subject.items() if len(group) > 1)
    accepted_subjects: list[str] = []
    accepted_records: list[dict[str, Any]] = []
    rejected_duplicate_records: list[dict[str, Any]] = []
    for subject_id in sorted(grouped_by_subject):
        group = sorted(grouped_by_subject[subject_id], key=lambda item: item['path'])
        if len(group) > 1:
            preferred = group[0]
            rejected_duplicate_records.extend(group[1:])
        else:
            preferred = group[0]
        if preferred['valid_nifti']:
            accepted_records.append(preferred)
            accepted_subjects.append(subject_id)

    eligible_subjects: list[str] = []
    eligible_records: list[dict[str, Any]] = []
    for record in accepted_records:
        if not record['valid_nifti']:
            continue
        age = record.get('age')
        if age is None:
            record['exclusion_reasons'].append('missing_label')
            continue
        if age < 0 or age > 120:
            record['exclusion_reasons'].append('invalid_age')
            continue
        eligible_records.append(record)
        eligible_subjects.append(record['subject_id'])

    missing_label_count = sum(1 for record in records if record['valid_nifti'] and record.get('age') is None)
    invalid_age_count = sum(
        1
        for item in metadata.values()
        if item.get('age_raw') not in (None, '') and item.get('age') is None
    )

    ages = [float(record['age']) for record in eligible_records if record.get('age') is not None]
    age_distribution = {
        'min': min(ages) if ages else None,
        'max': max(ages) if ages else None,
        'mean': sum(ages) / len(ages) if ages else None,
        'median': sorted(ages)[len(ages) // 2] if ages else None,
        'count': len(ages),
    }

    summary = {
        'dataset_root': str(dataset_root),
        'metadata_path': str(metadata_path) if metadata_path else None,
        'image_count': len(image_files),
        'valid_image_count': len(eligible_records),
        'duplicate_subject_count': len(duplicate_subjects),
        'missing_label_count': missing_label_count,
        'invalid_age_count': invalid_age_count,
        'eligible_subject_count': len(eligible_subjects),
        'accepted_subject_ids': sorted(set(eligible_subjects)),
        'age_distribution': age_distribution,
        'duplicate_subject_ids': duplicate_subjects,
        'excluded_duplicate_records': [record['path'] for record in rejected_duplicate_records],
        'exclusion_reasons': {
            'corrupted_file': sum(1 for record in records if 'corrupted_file' in record['exclusion_reasons']),
            'invalid_dimensions': sum(1 for record in records if 'invalid_dimensions' in record['exclusion_reasons']),
            'unsupported_ndim': sum(1 for record in records if 'unsupported_ndim' in record['exclusion_reasons']),
            'missing_label': sum(1 for record in records if 'missing_label' in record['exclusion_reasons']),
            'invalid_age': sum(1 for record in records if 'invalid_age' in record['exclusion_reasons']),
        },
        'records': [
            {
                'path': record['path'],
                'subject_id': record['subject_id'],
                'file_size_bytes': record['file_size_bytes'],
                'valid_nifti': record['valid_nifti'],
                'shape': record['shape'],
                'age': record.get('age'),
                'metadata_found': record.get('metadata_found', False),
                'exclusion_reasons': record['exclusion_reasons'],
            }
            for record in records
        ],
    }

    if output_dir is not None:
        write_report(summary, output_dir)

    return summary


def write_report(summary: dict[str, Any], output_dir: str | Path) -> Path:
    output_path = Path(output_dir).expanduser()
    output_path.mkdir(parents=True, exist_ok=True)
    report_path = output_path / 'dataset_quality_summary.json'
    report_path.write_text(json.dumps(summary, indent=2, sort_keys=True), encoding='utf-8')
    return report_path


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description='Inventory a raw structural-MRI dataset and flag quality issues.')
    parser.add_argument('--dataset-root', default=None, help='Root directory containing MRI scans (defaults to DATASET_ROOT or ./data/raw).')
    parser.add_argument('--metadata-path', default=None, help='CSV/TSV manifest containing subject_id and age labels.')
    parser.add_argument('--subject-id-column', default='subject_id', help='Column name containing the subject identifier.')
    parser.add_argument('--age-column', default='age', help='Column name containing chronological age.')
    parser.add_argument('--output-dir', default=None, help='Directory for the derived quality report. Defaults to DATASET_DERIVED_DIR or ./data/derived.')
    args = parser.parse_args()

    dataset_root = resolve_dataset_root(args.dataset_root)
    output_dir = Path(args.output_dir) if args.output_dir else None
    if output_dir is None:
        output_dir = Path(os.getenv('DATASET_DERIVED_DIR', './data/derived')).expanduser().resolve()

    summary = analyze_dataset(
        dataset_root,
        metadata_path=args.metadata_path,
        subject_id_column=args.subject_id_column,
        age_column=args.age_column,
        output_dir=output_dir,
    )
    print(json.dumps({
        'dataset_root': summary['dataset_root'],
        'image_count': summary['image_count'],
        'valid_image_count': summary['valid_image_count'],
        'eligible_subject_count': summary['eligible_subject_count'],
        'duplicate_subject_count': summary['duplicate_subject_count'],
        'missing_label_count': summary['missing_label_count'],
        'invalid_age_count': summary['invalid_age_count'],
        'accepted_subject_ids': summary['accepted_subject_ids'],
    }, indent=2, sort_keys=True))


if __name__ == '__main__':
    main()
