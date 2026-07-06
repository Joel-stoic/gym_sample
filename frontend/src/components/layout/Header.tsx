'use client'

import { usePathname } from 'next/navigation'
import { Bebas_Neue, Inter } from 'next/font/google'
import { useAuthStore } from '@/src/store/authStore'
import { useSidebar } from '@/src/store/sidebarStore'
import { useTheme } from 'next-themes'
import { Menu, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

// ─── Fonts ────────────────────────────────────────────────────────────────────
const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/members': 'Members',
  '/plans': 'Manage Plans',
  '/payments': 'Payments',
  '/attendance': 'Attendance',
  '/pt': 'Personal training',
  '/leads': 'Add Leads',
  '/staff': 'Add Staff',
  '/notification': 'Notification',
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
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
      style={{ position: 'sticky', top: 0, zIndex: 50 }}
      className={`flex-shrink-0 flex items-center justify-between px-4 py-5 md:px-6 bg-background/30 backdrop-blur-2xl backdrop-saturate-150 border-b border-black/10 dark:border-white/10 ${inter.className}`}
    >
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-4">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="mt-1">
          <h1 className={`text-2xl tracking-widest text-foreground uppercase ${bebas.className}`}>
            {title}
          </h1>
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase hidden sm:block min-h-[14px]">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: toggle + role badge + avatar */}
      <div className="flex items-center gap-3">
        {mounted && (
          <div className="relative group flex items-center justify-center">
            <button
              onClick={() => toast('Light theme in development', { description: 'A massive UI update is currently underway.' })}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:text-zinc-100 hover:border-white/20 active:scale-95 cursor-not-allowed shadow-sm"
              title="Coming soon"
            >
              <Moon className="h-4 w-4" />
            </button>
            <div className="absolute top-full mt-3 right-0 px-3 py-2 bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.5)] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300 pointer-events-none w-max z-[100] flex items-center gap-2 origin-top-right">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-[10px] font-bold tracking-widest text-zinc-300 uppercase">Coming soon</p>
            </div>
          </div>
        )}
        <span
          className="hidden sm:inline-flex items-center justify-center rounded-sm border border-border bg-card px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-muted-foreground"
        >
          {roleLabel}
        </span>
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-[13px] font-bold text-foreground"
        >
          {initials}
        </div>
      </div>
    </header>
  )
}