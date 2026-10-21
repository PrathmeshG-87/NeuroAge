import React, { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AlertTriangle, Layers, Maximize2, Sliders } from 'lucide-react'

type ViewPlane = 'axial' | 'coronal' | 'sagittal'

interface MRIViewerProps {
  currentSlice?: number
  totalSlices?: number
  onSliceChange?: (slice: number) => void
  previewUrl?: string | null
  previewStatus?: 'loading' | 'ready' | 'unavailable' | 'error'
  availableViews?: ViewPlane[]
  unavailableReason?: string
  title?: string
  imageAlt?: string
}

export const MRIViewer: React.FC<MRIViewerProps> = ({
  currentSlice = 88,
  totalSlices = 176,
  onSliceChange,
  previewUrl,
  previewStatus = previewUrl ? 'ready' : 'unavailable',
  availableViews = ['axial', 'coronal', 'sagittal'],
  unavailableReason = 'A browser-safe preview is unavailable for this MRI dataset. Use a backend-generated preview or a medical imaging viewer.',
  title = 'Structural MRI Orthogonal Preview',
  imageAlt = 'MRI preview image',
}) => {
  const [slice, setSlice] = useState(currentSlice)
  const [plane, setPlane] = useState<ViewPlane>('axial')

  const activeViews = useMemo<ViewPlane[]>(() => {
    if (!availableViews || availableViews.length === 0) {
      return ['axial']
    }
    return availableViews
  }, [availableViews])

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    setSlice(val)
    if (onSliceChange) onSliceChange(val)
  }

  const hasPreview = previewStatus === 'ready' && Boolean(previewUrl)
  const previewSource = previewUrl ?? undefined

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#5eead4]" />
          <span className="font-mono text-sm font-semibold tracking-wide uppercase text-[#ebecef]">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeViews.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlane(p)}
              className={`px-2.5 py-1 text-xs font-mono rounded-md uppercase transition-colors ${
                plane === p
                  ? 'bg-[#5eead4]/20 text-[#5eead4] border border-[#5eead4]/30'
                  : 'bg-white/5 text-[#8d909c] hover:text-[#ebecef]'
              }`}
              aria-pressed={plane === p}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div
        className="relative flex aspect-square max-h-[360px] items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#07080b]"
        aria-label="MRI preview canvas"
      >
        {previewStatus === 'loading' ? (
          <div className="flex flex-col items-center gap-3 text-[#c6c9d2]">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#5eead4] border-t-transparent" />
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#8d909c]">
              Preparing preview
            </span>
          </div>
        ) : hasPreview ? (
          <>
            <img
              src={previewSource}
              alt={imageAlt}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => {
                /* Preview can fail when the backend returns an unsupported image or the URL expires. */
              }}
            />
            <div className="absolute bottom-3 left-3 flex gap-2">
              <Badge variant="neutral">Plane: {plane}</Badge>
              <Badge variant="teal">Voxel: 1.0mm isotropic</Badge>
            </div>
            <button
              type="button"
              aria-label="Expand MRI preview"
              className="absolute right-3 top-3 rounded border border-white/10 bg-black/50 p-1.5 text-[#c6c9d2] hover:bg-black/80"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex max-w-sm flex-col items-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#fb923c]/25 bg-[#fb923c]/10 text-[#fb923c]">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#fb923c]">
                Preview unavailable
              </p>
              <p className="mt-2 text-sm leading-7 text-[#c6c9d2]">
                {unavailableReason}
              </p>
            </div>
          </div>
        )}
      </div>

      {hasPreview ? (
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-mono text-[#8d909c]">
            <span className="flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" /> Slice Position
            </span>
            <span className="font-semibold text-[#ebecef]">{slice}</span>
          </div>
          <input
            type="range"
            min="1"
            max={totalSlices}
            value={slice}
            onChange={handleSlider}
            aria-label="Select MRI slice position"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[#1f222d] accent-[#5eead4]"
          />
        </div>
      ) : null}
    </Card>
  )
}
