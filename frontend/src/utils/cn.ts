import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAge(age: number | null | undefined): string {
  if (age === null || age === undefined || isNaN(age)) return '--'
  return `${age.toFixed(1)} yrs`
}

export function formatPAD(pad: number | null | undefined): {
  text: string
  status: 'resilient' | 'typical' | 'accelerated'
} {
  if (pad === null || pad === undefined || isNaN(pad)) {
    return { text: '--', status: 'typical' }
  }
  const sign = pad > 0 ? '+' : ''
  const text = `${sign}${pad.toFixed(1)} yrs`

  if (pad <= -2.5) return { text, status: 'resilient' }
  if (pad >= 2.5) return { text, status: 'accelerated' }
  return { text, status: 'typical' }
}
