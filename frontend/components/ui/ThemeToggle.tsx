'use client'

import { useState, useEffect } from 'react'
import { Moon } from 'lucide-react'
import { toast } from 'sonner'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-8 w-8" /> // prevent hydration flash

  return (
    <div className="relative group">
      <button
        onClick={() => toast.info('Light theme is coming soon! ✨', { description: 'We are preparing a massive UI update.' })}
        aria-label="Toggle theme"
        className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors cursor-not-allowed hover:bg-muted"
        style={{
          background: '#ffffff08',
          borderColor: '#ffffff12',
          color: '#9898b0',
        }}
      >
        <Moon className="h-4 w-4 opacity-70" />
      </button>

      {/* Tooltip */}
      <div className="absolute top-full mt-2 right-0 md:left-1/2 md:-translate-x-1/2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-max z-50 origin-top-right md:origin-top">
        <p className="text-[11px] font-semibold text-zinc-300">Coming soon</p>
      </div>
    </div>
  )
}