'use client'

import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/src/store/authStore'
import { useSidebar } from '@/src/store/sidebarStore'
import { Menu } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/members': 'Members',
  '/plans': 'Manage Plans',
  '/payments': 'Payments',
  '/attendance': 'Attendance',
  '/pt': 'Personal Training',
  '/leads': 'Add Leads',
  '/staff': 'Add Staff',
  '/notification':'Notification',
  '/settings': 'Settings',
}

const pageSubtitles: Record<string, string> = {
  '/dashboard': 'Overview of your gym performance',
  '/members': 'Manage your gym members',
  '/plans': 'Manage membership plans',
  '/payments': 'Track payments and dues',
  '/attendance': 'View daily check-ins',
  '/pt': 'Manage personal training',
  '/leads': 'Track and convert leads',
  '/staff': 'Here you can add and delete staff',
  '/settings': 'Configure your gym settings',
}

export default function Header() {
  const pathname = usePathname()
  const { staff } = useAuthStore()
  const { toggle } = useSidebar()

  const title = Object.entries(pageTitles).find(
    ([path]) => pathname === path || pathname.startsWith(path + '/')
  )?.[1] ?? 'Jovifitx'

  const subtitle = Object.entries(pageSubtitles).find(
    ([path]) => pathname === path || pathname.startsWith(path + '/')
  )?.[1] ?? ''

  const initials = staff?.name?.charAt(0).toUpperCase() ?? 'U'
  const roleLabel = staff?.role || 'STAFF'

  return (
    <header className="flex flex-shrink-0 items-center justify-between px-4 py-4 md:px-6 sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border shadow-sm">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-4">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div>
          {/* Page title — Orbitron, matches JOVIFITX sidebar treatment */}
          <h1
            className="text-[24px] md:text-[28px] text-foreground"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '0.06em' }}
          >
            {title}
          </h1>
          <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase hidden sm:block min-h-[14px] mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: role badge + avatar */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-flex items-center justify-center rounded-md bg-secondary px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-muted-foreground border border-border">
          {roleLabel}
        </span>
        <div className="relative">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[14px] font-bold text-primary-foreground glow-primary transition-transform hover:scale-105 cursor-pointer ring-2 ring-border">
            {initials}
          </div>
          {/* Online indicator dot */}
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500 shadow-sm"></span>
        </div>
      </div>
    </header>
  )
}