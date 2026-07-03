'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import axios from 'axios'

// ── Slug helper (same as member login) ──────────────────
const getSlug = (): string => {
  const host = window.location.hostname

  const params = new URLSearchParams(window.location.search)
  const querySlug = params.get('slug')
  if (querySlug) {
    localStorage.setItem('gymSlug', querySlug)
    return querySlug
  }

  const stored = localStorage.getItem('gymSlug')
  if (stored) return stored

  const isCustomDomain =
    !host.includes('vercel.app') &&
    !host.includes('onrender.com') &&
    host !== 'localhost' &&
    host !== '127.0.0.1'

  if (isCustomDomain) return host.split('.')[0]

  return ''
}

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
      <label className="text-[12px] font-medium text-[#9898b0]">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3d3d52]" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-10 py-2.5 text-[13px] text-white placeholder:text-[#3d3d52] focus:border-violet-500/50 focus:outline-none transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  )
}

export default function MemberChangePasswordPage() {
  const router = useRouter()

  const [current, setCurrent] = useState('')
  const [next, setNext]       = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  // ── Guard: if already changed password, redirect to portal ──
  useEffect(() => {
    const memberData = Cookies.get('memberData')
    if (memberData) {
      try {
        const parsed = JSON.parse(memberData)
        if (!parsed.mustChangePassword) {
          router.replace('/member')
        }
      } catch {}
    } else {
      // Not logged in at all
      router.replace('/member/login')
    }
  }, [])

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
      const token = Cookies.get('memberAccessToken')
      const slug  = getSlug()

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/member/change-password`,
        { currentPassword: current, newPassword: next },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-tenant-slug': slug,
          },
        }
      )

      toast.success('Password set! Please log in again.')

      // Clear all member cookies
      Cookies.remove('memberAccessToken')
      Cookies.remove('memberData')
      Cookies.remove('memberTenantSlug')

      router.push('/member/login')
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to change password'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#0a0a0f', fontFamily: "'DM Sans', sans-serif" }}
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
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1
              className="text-[20px] font-bold text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Set Your Password
            </h1>
            <p className="text-[12px] text-[#6b6b80] mt-1">
              Your gym has assigned you a default password.
              Please set a personal one to continue.
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: '#111118',
            border: '1px solid #ffffff0a',
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
              new personal one.
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
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-medium text-white transition-all disabled:opacity-60"
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