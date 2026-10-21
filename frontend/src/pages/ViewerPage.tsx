import React from 'react'
import { MRIViewer } from '@/components/mri/MRIViewer'
import { Badge } from '@/components/ui/Badge'
import { MedicalDisclaimer } from '@/components/assessment/MedicalDisclaimer'

export const ViewerPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#ebecef]">
            Interactive MRI Volumetric Slice Explorer
          </h2>
          <p className="text-xs text-[#8d909c] font-mono mt-0.5">
            Axial, Coronal, and Sagittal orthogonal cross-sectional viewports
          </p>
        </div>
        <Badge variant="teal">Voxel Matrix: 256 x 256 x 176</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MRIViewer currentSlice={88} totalSlices={176} />
        <MRIViewer currentSlice={128} totalSlices={256} />
        <MRIViewer currentSlice={120} totalSlices={256} />
      </div>

      <MedicalDisclaimer />
    </div>
  )
}
