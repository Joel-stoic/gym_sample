'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Building2,
  LogOut,
  Menu,
  X,
  Shield,
  Bell,       
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',     href: '/admin',               icon: LayoutDashboard },
  { label: 'Gyms',          href: '/admin/gyms',          icon: Building2 },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },  
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminName, setAdminName] = useState('Super Admin')

  useEffect(() => {
    // Check admin auth
    const token = localStorage.getItem('adminToken')
    if (!token && pathname !== '/admin/login') {
      router.replace('/admin/login')
    }
    const name = localStorage.getItem('adminName')
    if (name) setAdminName(name)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminName')
    router.replace('/admin/login')
  }

  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-30
          flex flex-col transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Shield size={16} className="text-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground font-[Syne]">GymFlow</p>
              <p className="text-[11px] text-foreground/40">Admin Console</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <button
                key={href}
                onClick={() => { router.push(href); setSidebarOpen(false) }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150
                  ${active
                    ? 'bg-violet-600/20 text-violet-400 font-medium'
                    : 'text-foreground/50 hover:text-foreground hover:bg-muted'
                  }
                `}
              >
                <Icon size={16} />
                {label}
              </button>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-violet-600/30 flex items-center justify-center text-violet-400 text-xs font-bold">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{adminName}</p>
              <p className="text-[10px] text-foreground/30">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/50 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
              <Shield size={12} />
            </div>
            <span className="text-sm font-semibold font-[Syne]">GymFlow Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="text-foreground/50 hover:text-foreground">
            <Menu size={20} />
          </button>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}