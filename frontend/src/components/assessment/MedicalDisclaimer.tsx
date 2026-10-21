import React from 'react'
import { AlertCircle } from 'lucide-react'

export const MedicalDisclaimer: React.FC = () => {
  return (
    <div className="bg-[#171921] border-l-4 border-[#fb923c] rounded-r-xl p-4 text-xs text-[#8d909c] flex items-start gap-3 my-4">
      <AlertCircle className="w-5 h-5 text-[#fb923c] shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-[#ebecef] mb-1">
          Investigational Research Prototype - Not for Clinical Diagnosis
        </p>
        <p className="leading-relaxed">
          NeuroAge estimates brain age from structural MRI for academic research
          and educational exploration only. Brain age differences (Brain-PAD) do
          not constitute medical diagnoses and should not be used to guide
          medical care. Consult a board-certified neurologist or healthcare
          provider for diagnostic assessments.
        </p>
      </div>
    </div>
  )
}
