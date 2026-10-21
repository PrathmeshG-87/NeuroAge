import React from 'react'
import { Card } from '@/components/ui/Card'
import { KPICard } from '@/components/data-display/KPICard'
import { MedicalDisclaimer } from '@/components/assessment/MedicalDisclaimer'
import { CheckCircle2, Sliders, Database, Cpu } from 'lucide-react'

export const ModelInfoPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#ebecef]">
          Model Performance & Evaluation Metrics
        </h2>
        <p className="text-xs text-[#8d909c] font-mono mt-0.5">
          Independent Test Set Evaluation (Subject-Level Stratified Split)
        </p>
      </div>

      {/* Model Performance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Mean Absolute Error (MAE)"
          value="4.18"
          unit="years"
          delta={{ value: 'Target < 5.0 yrs', status: 'resilient' }}
          subtext="Test set N = 184"
          icon={<CheckCircle2 className="w-4 h-4 text-[#5eead4]" />}
        />
        <KPICard
          label="Root Mean Squared Error (RMSE)"
          value="5.32"
          unit="years"
          subtext="Residual std dev"
          icon={<Sliders className="w-4 h-4 text-[#8d909c]" />}
        />
        <KPICard
          label="Pearson Correlation (r)"
          value="0.91"
          subtext="Chronological vs Predicted"
          delta={{ value: 'p < 0.001', status: 'resilient' }}
          icon={<Cpu className="w-4 h-4 text-[#5eead4]" />}
        />
        <KPICard
          label="Age-Bias Correction"
          value="Fitted"
          subtext="Cole et al. linear reg"
          delta={{ value: 'Training fold only', status: 'typical' }}
          icon={<Database className="w-4 h-4 text-[#8d909c]" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-[#ebecef]">
            Dataset Sources & Cohort Composition
          </h3>
          <p className="text-sm text-[#c6c9d2] leading-relaxed">
            The candidate models were evaluated on publicly accessible datasets
            adhering to data-use compliance agreements:
          </p>
          <ul className="text-xs font-mono text-[#8d909c] space-y-2 list-disc list-inside">
            <li>
              <strong>IXI Dataset</strong>: Healthy volunteers (Age 20-86), 3T
              Philips scanner, N=560
            </li>
            <li>
              <strong>OASIS-1 / OASIS-3</strong>: Cross-sectional normal aging
              cohorts (Age 18-90), N=416
            </li>
            <li>
              Subject-level train/validation/test split (70% / 15% / 15%)
              strictly preventing subject leakage.
            </li>
          </ul>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-[#ebecef]">
            Bias Correction & Limitations
          </h3>
          <p className="text-sm text-[#c6c9d2] leading-relaxed">
            Regression-toward-the-mean is a documented challenge in brain age
            prediction where younger subjects are slightly overestimated and
            older subjects are underestimated:
          </p>
          <div className="p-3 bg-[#0a0b0e] border border-white/10 rounded-lg text-xs font-mono text-[#ebecef]">
            PAD_corrected = Predicted_Age - (α * Chrono_Age + β)
          </div>
          <p className="text-xs text-[#8d909c]">
            The correction regression coefficients (α, β) were derived
            exclusively on the training set and applied out-of-fold without
            leakage.
          </p>
        </Card>
      </div>

      <MedicalDisclaimer />
    </div>
  )
}
