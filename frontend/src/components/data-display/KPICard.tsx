import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface KPICardProps {
  label: string
  value: string | number
  unit?: string
  delta?: {
    value: string
    status: 'resilient' | 'typical' | 'accelerated'
  }
  subtext?: string
  icon?: React.ReactNode
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  unit,
  delta,
  subtext,
  icon,
}) => {
  return (
    <Card className="flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-center justify-between text-[#8d909c] text-xs font-mono uppercase tracking-wider mb-2">
        <span>{label}</span>
        {icon && <span className="text-[#c6c9d2]">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-2 my-1">
        <span className="text-3xl font-bold font-mono text-[#ebecef] tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-mono text-[#8d909c]">{unit}</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
        {delta ? (
          <Badge
            variant={
              delta.status === 'resilient'
                ? 'teal'
                : delta.status === 'accelerated'
                  ? 'coral'
                  : 'neutral'
            }
          >
            {delta.value}
          </Badge>
        ) : (
          <span />
        )}

        {subtext && (
          <span className="text-xs text-[#8d909c] font-mono truncate max-w-[150px]">
            {subtext}
          </span>
        )}
      </div>
    </Card>
  )
}
