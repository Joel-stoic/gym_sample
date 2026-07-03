'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { Dumbbell, LogOut, Scale, Utensils, Home, CalendarCheck } from 'lucide-react'
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
  const [gymName, setGymName] = useState('')

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
    Cookies.remove('memberTenantSlug') // ← rename
    toast.success('Logged out')
    router.push('/member/login')
  }

  if (!hydrated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        
      >
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  const navItems = [
    { href: '/member', label: 'Home', icon: Home },
    { href: '/member/checkin', label: 'Attendance', icon: CalendarCheck },
    { href: '/member/diet', label: 'Diet & Weight', icon: Utensils }
    
  ]

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Top nav */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
        style={{
          background: '#111118',
          borderBottom: '1px solid #ffffff0a',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          >
            <Dumbbell className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <p
              className="text-[14px] font-bold text-foreground leading-none"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {memberName}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Member Portal
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:text-red-400"
          style={{ border: '1px solid #ffffff08' }}
        >
          <LogOut size={13} />
          Logout
        </button>
      </header>

      {/* Bottom nav for mobile */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-10 flex md:hidden"
        
      >
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors',
                isActive ? 'text-violet-400' : 'text-muted-foreground'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Desktop side nav */}
      <div className="hidden md:flex">
        <aside
          className="fixed left-0 top-[57px] bottom-0 w-52 flex flex-col gap-1 p-3"
          
        >
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                style={
                  isActive
                    ? {
                      background: '#7c3aed20',
                      border: '1px solid #7c3aed30'
                    }
                    : { border: '1px solid transparent' }
                }
              >
                <Icon size={15} />
                {item.label}
              </Link>
            )
          })}
        </aside>

        <main className="ml-52 flex-1 p-6 pb-6">
          {children}
        </main>
      </div>

      {/* Mobile main */}
      <main className="md:hidden p-4 pb-24">
        {children}
      </main>
    </div>
  )
}