import React from 'react'
import { Card } from '@/components/ui/Card'
import { MRIUploader } from '@/components/mri/MRIUploader'
import { MedicalDisclaimer } from '@/components/assessment/MedicalDisclaimer'

export const UploadPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#ebecef]">
          MRI Scan Ingestion & Validation
        </h2>
        <p className="text-xs text-[#8d909c] font-mono mt-0.5">
          Select or drop a 3D structural MRI volume to run automated pre-checks.
        </p>
      </div>

      <MRIUploader />

      <Card className="space-y-3">
        <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-[#ebecef]">
          Preprocessing Pipeline Checklist
        </h3>
        <p className="text-xs text-[#8d909c] leading-relaxed">
          Before inference is executed, the backend preprocessing module
          verifies:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono text-[#c6c9d2]">
          <div className="p-2.5 bg-[#0a0b0e] border border-white/5 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5eead4]" />
            NIfTI Header Integrity & Dimensions
          </div>
          <div className="p-2.5 bg-[#0a0b0e] border border-white/5 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5eead4]" />
            RAS Orientation Realignment
          </div>
          <div className="p-2.5 bg-[#0a0b0e] border border-white/5 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5eead4]" />
            Z-score Intensity Normalization
          </div>
          <div className="p-2.5 bg-[#0a0b0e] border border-white/5 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5eead4]" />
            Isotropic Resampling (1.0mm)
          </div>
        </div>
      </Card>

      <MedicalDisclaimer />
    </div>
  )
}
