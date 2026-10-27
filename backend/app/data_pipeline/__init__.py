"""Dataset preparation utilities for MRI brain-age modeling."""

from app.data_pipeline.baseline_regression import (
    BaselineRegressionConfig,
    RidgeRegressionModel,
    build_model_evaluation_report,
    compute_age_group_metrics,
    evaluate_model,
    fit_baseline_model,
    save_model_bundle,
)
from app.data_pipeline.dataset_inventory import (
    analyze_dataset,
    load_metadata,
    resolve_dataset_root,
    write_report,
)
from app.data_pipeline.preprocessing import (
    PreprocessingConfig,
    SubjectSplitConfig,
    build_subject_split_manifest,
    load_preprocessing_config,
    preprocess_image,
    preprocess_image_with_metadata,
    save_preprocessing_config,
)

__all__ = [
    'BaselineRegressionConfig',
    'PreprocessingConfig',
    'RidgeRegressionModel',
    'SubjectSplitConfig',
    'analyze_dataset',
    'build_model_evaluation_report',
    'build_subject_split_manifest',
    'compute_age_group_metrics',
    'evaluate_model',
    'fit_baseline_model',
    'load_metadata',
    'load_preprocessing_config',
    'preprocess_image',
    'preprocess_image_with_metadata',
    'resolve_dataset_root',
    'save_model_bundle',
    'save_preprocessing_config',
    'write_report',
]
