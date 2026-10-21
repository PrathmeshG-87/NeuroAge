# ML resource requirements and unresolved dependencies

## 1. Core dependencies still unresolved

The following items are still unresolved before a real model can be trained or deployed:

- a genuine, approved MRI dataset with age labels
- a documented data-use policy and consent review
- a model artifact path configured for the target runtime
- a metrics artifact file for evaluation and version tracking
- a final backend/frontend contract approval for output fields
- an environment with enough compute for 3D MRI preprocessing and model training

## 2. Expected computational requirements

### CPU environment

A CPU-only environment is acceptable for:

- local validation
- smoke tests
- simple preprocessing experiments
- small-scale model development

However, CPU-only training on full 3D MRI data is slow and may be impractical for repeated experiments unless the dataset is small.

### GPU environment

A GPU-enabled environment is strongly preferred for:

- 3D CNN training
- repeated model tuning
- faster validation cycles
- larger batch sizes and higher throughput

The project does not currently specify a configured GPU environment, so this remains an unresolved deployment requirement.

## 3. Storage and data governance requirements

The training pipeline will need:

- secure storage for MRI files and manifests
- subject de-identification controls where required
- retention and access controls aligned with approved dataset terms
- a reproducible manifest and preprocessing cache

## 4. Data access, licensing, and consent requirements

Before training, the team must confirm:

- source dataset access conditions
- any required publication or attribution requirements
- whether the dataset is open or restricted
- whether the data can be used for a research prototype and evaluation workflow
- whether subject-level age and acquisition metadata are permitted to be retained in the project

## 5. Operational readiness checklist

The model work should not advance until the following are confirmed:

1. data source is approved and legally usable
2. dataset manifest exists with age labels and subject metadata limits
3. preprocessing pipeline is reproducible
4. training/evaluation scripts are versioned
5. model artifact and metrics artifact are produced and stored in a controlled path
6. backend contract is approved and tested with the actual output payload
7. compute environment and storage are provisioned for the target runtime

## 6. Conclusion

The main unresolved dependencies are data access, governance, and runtime resources. The repository can support an integration contract and architecture plan, but it cannot yet support deep learning training without a real dataset and valid model artifact workflow.
