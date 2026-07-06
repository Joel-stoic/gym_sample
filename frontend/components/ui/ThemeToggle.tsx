'use client'

import { useState, useEffect } from 'react'
import { Moon } from 'lucide-react'
import { toast } from 'sonner'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-9 w-9" /> // prevent hydration flash

  return (
    <div className="relative group flex items-center justify-center">
      <button
        onClick={() => toast('Light theme in development', { description: 'A massive UI update is currently underway.' })}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:text-zinc-100 hover:border-white/20 active:scale-95 cursor-not-allowed shadow-sm"
        title="Coming soon"
      >
        <Moon className="h-4 w-4" />
      </button>

      {/* Premium Tooltip */}
      <div className="absolute top-full mt-3 right-0 md:left-1/2 md:-translate-x-1/2 px-3 py-2 bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.5)] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300 pointer-events-none w-max z-50 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
        <p className="text-[10px] font-bold tracking-widest text-zinc-300 uppercase">Coming soon</p>
      </div>
    </div>
  )
}