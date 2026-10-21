import React from 'react'
import { cn } from '@/utils/cn'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'teal' | 'coral' | 'neutral' | 'success' | 'warning' | 'danger'
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  children,
  ...props
}) => {
  const variants = {
    teal: 'bg-[#5eead4]/15 text-[#5eead4] border border-[#5eead4]/30',
    coral: 'bg-[#fb923c]/15 text-[#fb923c] border border-[#fb923c]/30',
    neutral: 'bg-white/10 text-[#c6c9d2] border border-white/10',
    success: 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30',
    warning: 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30',
    danger: 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
