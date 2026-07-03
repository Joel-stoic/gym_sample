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
        'bg-sidebar border-r border-sidebar-border',
        'md:w-64 md:max-w-none',
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border sm:gap-3 sm:px-6 sm:py-5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary sm:h-9 sm:w-9">
          <Dumbbell className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-base leading-none text-foreground sm:text-lg"
            style={{ fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.06em', fontWeight: 600 }}
          >
            JOVIFITX
          </p>
          <p className="mt-1 truncate text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            {tenant?.name || 'Loading…'}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-sidebar-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Menu label */}
      <div className="px-4 pb-2 pt-4 sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          System Menu
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col justify-around gap-0.5 overflow-y-auto px-3 pb-3 sm:gap-0.5 sm:px-4 sm:pb-4 md:justify-start">
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
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              {isActive && (
                <span className="absolute inset-y-0 left-0 w-[3px] rounded-l-lg bg-primary" />
              )}
              <span className="relative flex-shrink-0">
                <Icon
                  className={cn("h-[17px] w-[17px] transition-colors", isActive ? "text-primary" : "")}
                />
                {item.href === '/notification' && hasNew && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full border-2 border-sidebar bg-primary" />
                )}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="flex-shrink-0 border-t border-sidebar-border p-3 sm:p-4">
        <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2 sm:mb-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground text-[12px] font-bold sm:h-9 sm:w-9">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold text-foreground sm:text-[13px]">
              {staff?.name ?? 'User'}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {staff?.role ?? ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-sidebar-border bg-transparent px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:py-2.5 sm:text-[11px]"
        >
          <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
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
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden',
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