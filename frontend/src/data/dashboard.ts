export type DashboardScenario = 'demo' | 'empty' | 'error'

export type AssessmentStatus = 'accelerated' | 'typical' | 'resilient'

export interface DashboardComparisonPoint {
  label: string
  chronologicalAge: number
  predictedBrainAge: number
}

export interface DashboardAssessmentRecord {
  id: string
  subjectId: string
  assessmentDate: string
  chronologicalAge: number
  predictedBrainAge: number
  brainAgeDifference: number
  status: AssessmentStatus
}

export interface DashboardModelMetric {
  name: string
  value: string
  detail: string
  status: 'good' | 'neutral' | 'warning'
}

export interface DashboardSummaryCard {
  id: string
  label: string
  value: string
  footnote: string
  tone: 'teal' | 'coral' | 'neutral' | 'info'
}

export interface DashboardData {
  heading: string
  overview: string
  demoNotice: string
  summary: DashboardSummaryCard[]
  comparison: DashboardComparisonPoint[]
  assessments: DashboardAssessmentRecord[]
  modelMetrics: DashboardModelMetric[]
  educationNotes: string[]
}

export async function fetchDashboardData(
  scenario: DashboardScenario,
): Promise<DashboardData> {
  if (scenario === 'empty') {
    return {
      heading: 'No assessments available',
      overview:
        'This workspace currently has no demonstration assessments available. Start a new analysis to populate the dashboard.',
      demoNotice:
        'Demonstration data only. No real assessment records are being used.',
      summary: [
        {
          id: 'predicted-brain-age',
          label: 'Latest predicted brain age',
          value: '—',
          footnote: 'Awaiting first assessment',
          tone: 'neutral',
        },
        {
          id: 'brain-age-difference',
          label: 'Latest brain age difference',
          value: '—',
          footnote: 'Awaiting first assessment',
          tone: 'neutral',
        },
        {
          id: 'total-assessments',
          label: 'Total assessments',
          value: '0',
          footnote: 'No assessments recorded',
          tone: 'info',
        },
        {
          id: 'latest-assessment-date',
          label: 'Latest assessment date',
          value: '—',
          footnote: 'No completed assessments',
          tone: 'neutral',
        },
      ],
      comparison: [],
      assessments: [],
      modelMetrics: [],
      educationNotes: [
        'Brain age difference reflects the difference between chronological age and the model-estimated age.',
        'A result near zero does not mean a diagnosis; it indicates a small difference relative to the model and data context.',
        'Uncertainty and cohort effects are important when interpreting structural MRI estimates.',
      ],
    }
  }

  if (scenario === 'error') {
    throw new Error(
      'Unable to load demonstration dashboard data. Please try again.',
    )
  }

  return {
    heading: 'Healthy Brain Aging Assessment Overview',
    overview:
      'This workspace is displaying demonstration data only for design and interface validation. It is not linked to a live backend or production patient data.',
    demoNotice:
      'Demonstration data only. These records are illustrative and not real patient assessments.',
    summary: [
      {
        id: 'predicted-brain-age',
        label: 'Latest predicted brain age',
        value: '67.2',
        footnote: 'Demonstration estimate',
        tone: 'teal',
      },
      {
        id: 'brain-age-difference',
        label: 'Latest brain age difference',
        value: '+5.2 yrs',
        footnote: 'Predicted − chronological',
        tone: 'coral',
      },
      {
        id: 'total-assessments',
        label: 'Total assessments',
        value: '12',
        footnote: 'Demo records in this view',
        tone: 'info',
      },
      {
        id: 'latest-assessment-date',
        label: 'Latest assessment date',
        value: '2026-10-18',
        footnote: 'Most recent demo record',
        tone: 'neutral',
      },
    ],
    comparison: [
      { label: 'Jan', chronologicalAge: 58, predictedBrainAge: 59 },
      { label: 'Mar', chronologicalAge: 60, predictedBrainAge: 62 },
      { label: 'May', chronologicalAge: 61, predictedBrainAge: 64 },
      { label: 'Jul', chronologicalAge: 62, predictedBrainAge: 67 },
      { label: 'Sep', chronologicalAge: 63, predictedBrainAge: 68 },
    ],
    assessments: [
      {
        id: 'EVAL-2026-001',
        subjectId: 'SUBJ_IXI_0442',
        assessmentDate: '2026-10-18',
        chronologicalAge: 62,
        predictedBrainAge: 67.2,
        brainAgeDifference: 5.2,
        status: 'accelerated',
      },
      {
        id: 'EVAL-2026-002',
        subjectId: 'SUBJ_OASIS_018',
        assessmentDate: '2026-10-11',
        chronologicalAge: 48.5,
        predictedBrainAge: 47.9,
        brainAgeDifference: -0.6,
        status: 'typical',
      },
      {
        id: 'EVAL-2026-003',
        subjectId: 'SUBJ_IXI_109',
        assessmentDate: '2026-09-29',
        chronologicalAge: 71,
        predictedBrainAge: 66.8,
        brainAgeDifference: -4.2,
        status: 'resilient',
      },
    ],
    modelMetrics: [],
    educationNotes: [
      'Brain age difference is the estimated brain age minus chronological age. It is an exploratory indicator, not a diagnosis.',
      'Uncertainty is influenced by image quality, preprocessing, and the model’s training sample. Interpretation should remain cautious and context-aware.',
      'This dashboard is designed for research review and educational discussion only; it should not guide clinical decisions.',
    ],
  }
}
