'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  IndianRupee,
  CalendarCheck,
  UserPlus,
  Settings,
  BellDot,
  Dumbbell,
  X,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/src/store/authStore'
import { toast } from 'sonner'
import api from '@/src/lib/api'
import { useSidebar } from '../../store/sidebarStore'
import { useNotificationBadge } from '@/src/hooks/useNotificationBadge'

// ✅ every item has roles — filter never crashes on undefined
const navItems: {
  label: string
  href: string
  icon: any
  roles: string[]
}[] = [
  { label: 'Dashboard',     href: '/dashboard',    icon: LayoutDashboard, roles: ['OWNER', 'MANAGER'] },
  { label: 'Members',       href: '/members',      icon: Users,           roles: ['OWNER', 'MANAGER', 'TRAINER'] },
  { label: 'Attendance',    href: '/attendance',   icon: CalendarCheck,   roles: ['OWNER', 'MANAGER', 'TRAINER'] },
  { label: 'Plans',         href: '/plans',        icon: CreditCard,      roles: ['OWNER', 'MANAGER', 'TRAINER'] },
  { label: 'Payments',      href: '/payments',     icon: IndianRupee,     roles: ['OWNER', 'MANAGER', 'TRAINER'] },
  { label: 'PT Sessions',   href: '/pt',            icon: Dumbbell,        roles: ['OWNER', 'MANAGER', 'TRAINER'] },
  { label: 'Add Leads',     href: '/leads',        icon: UserPlus,        roles: ['OWNER', 'MANAGER', 'TRAINER'] },
  { label: 'Add Staff',     href: '/staff',        icon: UserPlus,        roles: ['OWNER', 'TRAINER', 'MANAGER'] },
  { label: 'Notifications', href: '/notification', icon: BellDot,         roles: ['OWNER', 'TRAINER', 'MANAGER'] },
  { label: 'Settings',      href: '/settings',     icon: Settings,        roles: ['OWNER', 'TRAINER', 'MANAGER'] },
]

// NOTE: "Diet & Weight" is NOT in this sidebar.
// Staff access it via Members → member detail → "Diet & Weight" button.
// The member portal has its own separate layout at /member/* with its own nav.

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { staff, tenant, logout } = useAuthStore()
  const { hasNew, markSeen } = useNotificationBadge()

  const filteredNavItems = navItems.filter((item) =>
    staff?.role ? item.roles.includes(staff.role) : false
  )

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout') } catch {}
    logout()
    toast.success('System disconnected')
    router.push('/login')
  }

  const initials = staff?.name?.charAt(0).toUpperCase() ?? 'U'

  return (
    <div
      className={cn(
        'flex h-full w-[82vw] max-w-[280px] flex-shrink-0 flex-col overflow-hidden',
        'bg-transparent border-r border-border-strong',
        'md:w-64 md:max-w-none',
        'font-sans'
      )}
    >
      {/* Logo — compact on mobile so the whole rail fits without scrolling */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#1A1A1A] sm:gap-3 sm:px-6 sm:py-6">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm border border-violet-500/30 bg-violet-500/10 sm:h-9 sm:w-9">
          <Dumbbell className="h-3.5 w-3.5 text-violet-500 sm:h-4 sm:w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg leading-none tracking-widest text-white sm:text-2xl font-heading">
            JOVIFITX
          </p>
          <p className="mt-0.5 truncate text-[9.5px] font-medium tracking-wide text-[#555555] uppercase sm:mt-1 sm:text-[11px]">
            {tenant?.name || 'Loading…'}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm border border-[#2A2A2A] text-[#888888] transition-colors hover:bg-[#1A1A1A] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 md:hidden"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Menu label */}
      <div className="px-4 pb-1.5 pt-2.5 sm:px-6 sm:pb-3 sm:pt-6">
        <p className="text-[9.5px] font-bold uppercase tracking-widest text-[#555555] sm:text-[11px]">
          System Menu
        </p>
      </div>

      {/* Nav — fills the space down to the footer on mobile, packed at the top on desktop */}
      <nav className="flex flex-1 flex-col justify-around gap-1 overflow-y-auto px-3 pb-3 sm:gap-1 sm:px-4 sm:pb-4 md:justify-start">
        {filteredNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (item.href === '/notification') markSeen()
                onClose?.()
              }}
              className={cn(
                'group relative flex items-center gap-3 rounded-sm border px-3 py-3 text-[11.5px] font-bold uppercase tracking-wide transition-colors sm:gap-3 sm:px-3 sm:py-3 sm:text-[12px]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
                isActive
                  ? 'border-[#2A2A2A] bg-[#121212] text-white'
                  : 'border-transparent text-[#888888] hover:bg-[#0A0A0A] hover:text-white active:bg-[#141414]'
              )}
            >
              {isActive && (
                <span className="absolute inset-y-0 left-0 w-[3px] rounded-l-sm bg-violet-600" />
              )}
              <span className="relative flex-shrink-0">
                <Icon
                  className="h-[17px] w-[17px] transition-colors sm:h-[18px] sm:w-[18px]"
                  style={{ color: isActive ? '#7C3AED' : undefined }}
                />
                {item.href === '/notification' && hasNew && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full border-2 border-[#121212] bg-red-600 sm:h-2.5 sm:w-2.5" />
                )}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User + logout — compact footer that always stays in view */}
      <div className="flex-shrink-0 border-t border-[#1A1A1A] p-2.5 sm:p-4">
        <div className="mb-2 flex items-center gap-2.5 rounded-sm px-1.5 py-1 sm:mb-3 sm:gap-3 sm:px-2 sm:py-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm border border-violet-500/20 bg-violet-500/10 text-[12px] font-bold text-violet-500 sm:h-10 sm:w-10 sm:text-[14px]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-bold tracking-wide text-white sm:text-[13px]">
              {staff?.name ?? 'User'}
            </p>
            <p className="text-[9.5px] font-medium uppercase tracking-wide text-[#555555] sm:text-[11px]">
              {staff?.role ?? ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-sm border border-[#2A2A2A] bg-transparent px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider text-[#888888] transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 sm:py-3 sm:text-[12px]"
        >
          <LogOut className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
          Disconnect
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { isOpen, close } = useSidebar()

  return (
    <>
      {/* Desktop: always-visible rail */}
      <div className="hidden h-full md:flex">
        <SidebarContent />
      </div>

      {/* Mobile: overlay + slide-in drawer */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/80 transition-opacity duration-300 md:hidden',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={close}
        aria-hidden={!isOpen}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent onClose={close} />
      </div>
    </>
  )
}