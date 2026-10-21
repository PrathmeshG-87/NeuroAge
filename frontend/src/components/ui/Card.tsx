import React from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive'
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-[#111217] border border-white/[0.08]',
    elevated: 'bg-[#171921] border border-white/[0.12] shadow-lg',
    interactive:
      'bg-[#111217] border border-white/[0.08] hover:border-white/[0.2] transition-colors cursor-pointer',
  }

  return (
    <div
      className={cn(
        'rounded-xl p-5 text-[#ebecef]',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
