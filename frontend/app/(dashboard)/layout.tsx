'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/store/authStore'
import Sidebar from '@/src/components/layout/Sidebar'
import Header from '@/src/components/layout/Header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.push('/login')
  }, [hydrated, isAuthenticated, router])

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center" >
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl /20 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
          <p className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">Loading</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar handles its own mobile/desktop rendering */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0 md:ml-64 h-full">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 pt-[80px] md:p-6 md:pt-[88px]">
          {children}
        </main>
      </div>
    </div>
  )
}