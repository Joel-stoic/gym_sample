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
  '/pt': 'Personal training',
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
    <header
      className="flex flex-shrink-0 items-center justify-between px-4 py-7 md:px-6 bg-surface-base border-b border-border-strong font-sans"
    >
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-4">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm border border-[#2A2A2A] text-[#888888] hover:text-white hover:bg-[#1A1A1A] transition-colors md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="mt-1">
          <h1 className="text-2xl tracking-widest text-white uppercase font-heading">
            {title}
          </h1>
          <p className="text-[11px] font-medium tracking-wide text-[#555555] uppercase hidden sm:block min-h-[14px]">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: role badge + avatar */}
      <div className="flex items-center gap-3">
        <span
          className="hidden sm:inline-flex items-center justify-center rounded-sm border border-[#2A2A2A] bg-[#121212] px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-[#888888]"
        >
          {roleLabel}
        </span>
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm border border-violet-500/20 bg-violet-500/10 text-[13px] font-bold text-violet-500"
        >
          {initials}
        </div>
      </div>
    </header>
  )
}