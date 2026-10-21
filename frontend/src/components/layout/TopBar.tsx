import React from 'react'
import { Bell, ChevronRight, Menu, Search, ShieldCheck } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/assessment': 'Assessment',
  '/assessments': 'Assessments',
  '/reports': 'Reports',
  '/progress': 'Progress',
  '/methodology': 'Methodology',
  '/settings': 'Settings',
  '/signin': 'Sign in',
  '/register': 'Register',
  '/session-expired': 'Session expired',
  '/unauthorized': 'Unauthorized',
  '/forbidden': 'Forbidden',
}

interface TopBarProps {
  onMenuClick: () => void
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const location = useLocation()
  const pathname = location.pathname

  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, all) => {
      const path = `/${all.slice(0, index + 1).join('/')}`
      return {
        label: routeLabels[path] ?? segment.replace(/-/g, ' '),
        path,
      }
    })

  const currentLabel = segments.at(-1)?.label ?? 'Overview'

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#111217]/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#0a0b0e] text-[#ebecef] md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5eead4]"
            aria-label="Open navigation menu"
            onClick={onMenuClick}
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="hidden min-w-0 items-center gap-2 text-xs font-mono text-[#8d909c] sm:flex">
            <span className="uppercase tracking-[0.18em] text-[#8d909c]">
              Workspace
            </span>
            {segments.length > 0 && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="truncate text-[#ebecef]">{currentLabel}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-[#0a0b0e] px-3 py-2 text-xs text-[#8d909c] md:flex">
            <Search className="h-3.5 w-3.5" />
            <span>Search subject ID or report</span>
          </div>

          <Badge variant="teal" className="hidden gap-1.5 sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Anonymous assessment access</span>
          </Badge>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#0a0b0e] px-3 py-2 text-xs font-medium text-[#ebecef]">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#5eead4]/12 text-[10px] text-[#5eead4]">
                A
              </span>
              <span className="hidden sm:inline">Ready</span>
            </div>
            <Bell className="h-3.5 w-3.5 text-[#8d909c]" />
          </div>
        </div>
      </div>
    </header>
  )
}
