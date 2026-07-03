'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/src/lib/api'
import { useAuthStore } from '@/src/store/authStore'

function PwField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-white/[0.04] pl-9 pr-10 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-violet-500/50 focus:outline-none transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-foreground transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  )
}

export default function ChangePasswordPage() {
  const router = useRouter()
  const { staff, logout } = useAuthStore()
  const [hydrated, setHydrated] = useState(false)  // ← add

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { setHydrated(true) }, [])  // ← add

  useEffect(() => {
    if (!hydrated) return  // ← wait for hydration
    if (!staff) {
      router.replace('/login')
      return
    }
    if (staff.mustChangePassword === false) {
      router.replace('/members')
    }
  }, [hydrated, staff])  // ← add hydrated to deps

  const handleSubmit = async () => {
    if (!current || !next || !confirm) {
      toast.error('All fields are required')
      return
    }
    if (next.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (next !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (next === current) {
      toast.error('New password must be different from current password')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/auth/staff/change-password', {
        currentPassword: current,
        newPassword: next,
      })
      toast.success('Password changed! Please log in again.')
      logout()
      router.push('/login')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, #7c3aed18 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm space-y-5">

        {/* Icon + heading */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              boxShadow: '0 8px 32px #7c3aed40',
            }}
          >
            <ShieldCheck className="h-7 w-7 text-foreground" />
          </div>
          <div>
            <h1
              className="text-[20px] font-bold text-foreground"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Set Your Password
            </h1>
            <p className="text-[12px] text-muted-foreground mt-1">
              You're using a default password. Set a personal one to continue.
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 64px #00000060',
          }}
        >
          {/* Info banner */}
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: '#1c1200',
              border: '1px solid #f9731630',
            }}
          >
            <p className="text-[12px] text-amber-300/80">
              🔑 Enter the default password given by your gym, then choose a
              new personal password.
            </p>
          </div>

          <PwField
            label="Current (Default) Password"
            value={current}
            onChange={setCurrent}
            placeholder="Enter default password"
          />
          <PwField
            label="New Password"
            value={next}
            onChange={setNext}
            placeholder="Min 6 characters"
          />
          <PwField
            label="Confirm New Password"
            value={confirm}
            onChange={setConfirm}
            placeholder="Repeat new password"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-medium text-foreground transition-all disabled:opacity-60"
            style={{
              background: loading
                ? '#7c3aed99'
                : 'linear-gradient(135deg, #7c3aed, #a855f7)',
              boxShadow: loading ? 'none' : '0 4px 20px #7c3aed30',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = '0 4px 28px #7c3aed55'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = loading
                ? 'none'
                : '0 4px 20px #7c3aed30'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Saving...' : 'Set New Password'}
          </button>
        </div>

        <p className="text-center text-xs text-zinc-600">
          Having trouble? Contact your gym reception.
        </p>
      </div>
    </div>
  )
}