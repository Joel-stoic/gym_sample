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
      <div className="flex min-h-screen items-center justify-center bg-[#df2531]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600/20">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
          <p className="text-[12px] font-medium uppercase tracking-widest text-[#6b6b80]">Loading</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex h-screen overflow-hidden bg-[#df2531]">
      {/* Sidebar handles its own mobile/desktop rendering */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header />
        <main
          className="flex-1 overflow-y-auto bg-[#df2531]"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#ffffff10 transparent',
          }}
        >
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}