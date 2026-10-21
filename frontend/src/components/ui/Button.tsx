import React from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

  const variants = {
    primary:
      'bg-[#5eead4] text-[#0a0b0e] hover:bg-[#8cf5e3] focus-visible:outline-[#5eead4] shadow-[0_0_15px_rgba(94,234,212,0.2)]',
    secondary:
      'bg-[#171921] text-[#ebecef] hover:bg-[#242836] border border-white/10 focus-visible:outline-white/20',
    outline:
      'bg-transparent text-[#ebecef] border border-white/20 hover:bg-white/5 focus-visible:outline-[#5eead4]',
    ghost:
      'bg-transparent text-[#c6c9d2] hover:text-[#ebecef] hover:bg-white/5',
    danger:
      'bg-[#ef4444] text-white hover:bg-[#dc2626] focus-visible:outline-[#ef4444]',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  )
}
