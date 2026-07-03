'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { Dumbbell, LogOut, Utensils, Home, CalendarCheck } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function MemberPortalLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [hydrated, setHydrated] = useState(false)
  const [memberName, setMemberName] = useState('')

  useEffect(() => {
    const token = Cookies.get('memberAccessToken')
    const memberData = Cookies.get('memberData')

    if (!token || !memberData) {
      router.replace('/member/login')
      return
    }

    try {
      const member = JSON.parse(memberData)
      setMemberName(member.name || '')
    } catch {
      router.replace('/member/login')
      return
    }

    setHydrated(true)
  }, [])

  const handleLogout = () => {
    Cookies.remove('memberAccessToken')
    Cookies.remove('memberRefreshToken')
    Cookies.remove('memberData')
    Cookies.remove('memberTenantSlug') 
    toast.success('Logged out')
    router.push('/member/login')
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  const navItems = [
    { href: '/member', label: 'Home', icon: Home },
    { href: '/member/checkin', label: 'Attendance', icon: CalendarCheck },
    { href: '/member/diet', label: 'Diet & Weight', icon: Utensils }
  ]

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* Background glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top nav */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-white leading-tight">
                {memberName}
              </p>
              <p className="text-[12px] text-gunmetal-400 font-medium tracking-wide uppercase">
                Member Portal
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium text-gunmetal-400 bg-white/5 border border-white/5 transition-all hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 active:scale-95"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        <div className="flex flex-1 relative">
          {/* Desktop side nav */}
          <aside className="hidden md:flex flex-col w-64 fixed left-0 top-[73px] bottom-0 p-4 bg-black/20 border-r border-white/5 backdrop-blur-lg">
            <nav className="flex flex-col gap-2">
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium transition-all duration-200',
                      isActive
                        ? 'text-white bg-indigo-500/10 border border-indigo-500/20 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.05)]'
                        : 'text-gunmetal-400 hover:text-gunmetal-100 hover:bg-white/5 border border-transparent'
                    )}
                  >
                    <Icon size={18} className={isActive ? 'text-indigo-400' : ''} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 md:ml-64 p-6 sm:p-8 pb-24 md:pb-8 relative">
            <div className="max-w-4xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>

        {/* Bottom nav for mobile */}
        <nav className="fixed bottom-0 left-0 right-0 z-20 flex md:hidden bg-black/80 backdrop-blur-xl border-t border-white/10 pb-safe">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1.5 py-4 text-[11px] font-medium transition-colors',
                  isActive ? 'text-indigo-400' : 'text-gunmetal-400'
                )}
              >
                <div className={cn('p-1.5 rounded-lg transition-colors', isActive && 'bg-indigo-500/10')}>
                  <Icon size={20} />
                </div>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}