# Brain-age model evaluation report

## Scope and method

This evaluation was performed against the repository’s reproducible synthetic MRI validation fixture, which exercises the selected baseline brain-age model and the project’s preprocessing/reporting pipeline. The model is a regularized intensity-based regression baseline, not a clinically validated brain-age model.

The selected model computes:

- predicted brain age
- brain age difference = predicted brain age - chronological age
- optional residual and bias summaries for validation use

The sign convention is fixed as:

- positive value: model predicts an older apparent brain age than the subject’s chronological age
- negative value: model predicts a younger apparent brain age than the subject’s chronological age

This convention is used consistently in the model output, persistence, and reporting pipeline.

## Data and sample counts

The synthetic validation dataset used for the current report contained:

- 6 subjects
- age range: 40 to 90 years
- one baseline ridge-regression fit with subject-safe split handling

The results below are therefore a technical validation of the project pipeline, not an external clinical evaluation or deployment-grade benchmark.

## Computed metrics

The actual evaluation outputs from the current repository code are:

- MAE: 8.252896633346532e-06 years
- RMSE: 1.0300175056885835e-05 years
- Pearson correlation: 0.9999999999998573
- sample count: 6
- mean prediction: 64.99999732538141 years

These values reflect the synthetic validation fixture and should not be interpreted as a real-world model performance estimate.

## Residual distribution and interval summary

The residuals (chronological age - predicted age) in the validation fixture were approximately centered near zero, with a median residual of 5.732772692113031e-07 years and a mean residual of 2.6746185935640674e-06 years.

Residual summary:

- min: -1.1309700468586925e-05
- p05: -9.685752241139767e-06
- p25: -3.7632371920892638e-06
- p50: 5.732772692113031e-07
- p75: 1.1615312919488474e-05
- p95: 1.5817995279832076e-05
- max: 1.6123608034490644e-05
- std: 1.0896239071245885e-05

Bootstrap 95% interval summary:

- MAE CI: [3.5683721624953555e-06, 1.373982363418828e-05]
- RMSE CI: [5.691085008487305e-06, 1.3950805011140686e-05]

## Age-group metrics

Age-group results from the current validation fixture:

- 0 to <50 years: n=1, MAE=4.8139075587982916e-06, RMSE=4.8139075587982916e-06, Pearson r=1.0
- 50 to <70 years: n=2, MAE=1.1845033611734834e-06, RMSE=1.3159388435735334e-06, Pearson r=1.0
- 70 to 120 years: n=3, MAE=1.4111488506311312e-05, RMSE=1.4258617758514229e-05, Pearson r=0.999999999998801

These numbers are not a demographic benchmark; they are only produced from the small, synthetic validation set and should not be generalized to broader age groups.

## Bias analysis

A linear age-bias regression was fit on the available validation data using the documented protocol:

- model: linear age-bias correction of the form
  predicted brain age - (intercept + slope * chronological age)
- fitted intercept: 1.23677775650863e-05
- fitted slope: -2.3142147936385177e-07

Interpretation:

- the slope is extremely close to zero in this synthetic dataset, indicating no appreciable age-related bias in the validation fixture
- this does not establish the absence of real biological, demographic, or scanner bias in a real cohort
- this does not remove all bias, and it should not be presented as a claim that the model is unbiased in clinical or external data

Raw vs corrected summary:

- raw MAE: 8.252896633346532e-06
- raw RMSE: 1.0300175056885835e-05
- corrected MAE: 7.095789235004683e-06
- corrected RMSE: 9.127954339394795e-06

The correction improved the synthetic validation metric slightly, but it is not evidence of generalizable correction across external datasets or different scanner protocols.

## Uncertainty estimation

No calibrated prediction interval or uncertainty estimate is claimed for this baseline model. The project intentionally does not convert MAE, Pearson correlation, or model ranking into a per-person confidence percentage.

## Limitations

This evaluation has important limitations:

1. The sample size is very small (n=6) and is not representative of a real brain-age dataset.
2. The dataset does not cover external validation, scanner variation, or multi-site heterogeneity.
3. Demographic coverage is incomplete and cannot support subgroup conclusions beyond the synthetic study fixture.
4. The evaluation is not a clinical or diagnostic claim; it is an engineering and pipeline validation.
5. The model output is a statistical estimate, not a diagnosis, disease label, or treatment recommendation.
6. Any real deployment would require an approved external cohort and independent test-set evaluation before any clinical or research interpretation.

## What has and has not been validated

Validated in the current repository:

- the model pipeline runs end-to-end for a synthetic validation fixture
- metrics are computed in a reproducible way
- the residual and bias-reporting logic is implemented and tested
- the brain age difference sign convention is consistent across the project code path

Not validated in the current repository:

- external-dataset generalization
- scanner-based generalization
- demographic subgroup performance in a real cohort
- model calibration or uncertainty estimation with a defensible method
- clinical readiness or medical interpretation

## Final interpretation

The current baseline model is a useful engineering prototype and a reproducible evaluation scaffold. It should be interpreted as an exploratory regression estimate, not a clinically valid brain-age assessment. Without a real approved MRI cohort and external validation, the model must not be described as a validated medical tool or used for individual health or disease interpretation.
