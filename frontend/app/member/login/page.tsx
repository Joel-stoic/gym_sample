'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Dumbbell, Eye, EyeOff, Loader2, Lock, Phone } from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { setAccessToken, setTenantSlug } from '@/src/lib/auth'

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

export default function MemberLoginPage() {
  const router = useRouter()
  const { setTheme } = useTheme()

  const [phone, setPhone]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [gymName, setGymName]   = useState('Your Gym')
  const [slugMissing, setSlugMissing] = useState(false)
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [passFocused, setPassFocused]   = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const slug = getSlug()
    if (!slug) {
      setSlugMissing(true)
      return
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
        headers: { 'x-tenant-slug': slug },
      })
      .then((res) => {
        if (res.data.tenant) setGymName(res.data.tenant)
        setSlugMissing(false)
      })
      .catch(() => setSlugMissing(true))
  }, [])

  const login = async () => {
    const slug = getSlug()

    if (!slug) {
      toast.error('Add ?slug=yourgymslug to the URL (localhost dev)')
      return
    }
    if (!phone || phone.length < 10) {
      toast.error('Enter a valid phone number')
      return
    }
    if (!password) {
      toast.error('Enter your password')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/member/login`,
        { phone, password },
        {
          headers: { 'x-tenant-slug': slug },
          withCredentials: true,
        }
      )

      const { accessToken, member } = res.data.data

      // Store tokens
      Cookies.set('memberAccessToken', accessToken, { expires: 1 })
      Cookies.set('memberData', JSON.stringify(member), { expires: 1 })
      Cookies.set('memberTenantSlug', slug, { expires: 30 })
      setAccessToken(accessToken)
      setTenantSlug(slug)

      toast.success(`Welcome, ${member.name}!`)

      // ── Redirect based on mustChangePassword ──
      setTheme('dark')

      if (member.mustChangePassword) {
        router.push('/member/change-password')
      } else {
        router.push('/member')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const focusStyle = {
    border: '1px solid #7c3aed66',
    boxShadow: '0 0 0 3px #7c3aed14',
  }

  const baseInput: React.CSSProperties = {
    background: 'var(--background)',
    border: '1px solid var(--border)',
    color: 'var(--foreground)',
    borderRadius: '12px',
    outline: 'none',
    width: '100%',
    height: '44px',
    fontSize: '14px',
    paddingLeft: '2.5rem',
    paddingRight: '1rem',
    transition: 'all 0.15s',
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      
    >
      {/* Glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, #7c3aed18 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm space-y-5">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-14 w-14 rounded-md flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              boxShadow: '0 8px 32px #7c3aed40',
            }}
          >
            <Dumbbell className="h-7 w-7 text-foreground" />
          </div>
          <div className="text-center">
            <h1
              className="text-lg font-bold text-foreground"
              style={{ letterSpacing: '-0.02em' }}
            >
              {gymName}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Member Portal</p>
          </div>
        </div>

        {/* Slug missing warning — localhost dev */}
        {slugMissing && (
          <div
            className="rounded-xl px-4 py-3 space-y-1.5"
            style={{
              background: '#1e1200',
              border: '1px solid #f9731650',
            }}
          >
            <p className="text-xs font-semibold text-orange-400">
              ⚠ Gym not found
            </p>
            <p className="text-xs text-orange-300/70">
              On localhost, append{' '}
              <code className="bg-muted px-1 py-0.5 rounded">
                ?slug=yourgymslug
              </code>{' '}
              to the URL:
            </p>
            <p className="text-[11px] text-orange-200 font-mono break-all">
              localhost:3000/member/login?slug=<strong>powerfit</strong>
            </p>
          </div>
        )}

        {/* Login card */}
        <div
          className="rounded-md p-6 space-y-5"
          style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 64px #00000060',
          }}
        >
          <div>
            <h2
              className="text-xl font-bold text-foreground"
              style={{ letterSpacing: '-0.02em' }}
            >
              Login
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your registered phone and password
            </p>
          </div>

          <div className="space-y-3">

            {/* Phone */}
            <div className="relative">
              <Phone
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: phoneFocused ? '#a855f7' : '#3d3d52' }}
              />
              <input
                type="tel"
                maxLength={10}
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
                className="placeholder:text-muted-foreground"
                style={{ ...baseInput, ...(phoneFocused ? focusStyle : {}) }}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: passFocused ? '#a855f7' : '#3d3d52' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                onKeyDown={(e) => e.key === 'Enter' && login()}
                className="placeholder:text-muted-foreground"
                style={{
                  ...baseInput,
                  paddingRight: '2.75rem',
                  ...(passFocused ? focusStyle : {}),
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={login}
            disabled={loading}
            className="w-full h-11 rounded-xl text-sm font-medium text-foreground flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: loading
                ? '#7c3aed99'
                : 'linear-gradient(135deg, #7c3aed, #a855f7)',
              boxShadow: loading ? 'none' : '0 4px 20px #7c3aed35',
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
                : '0 4px 20px #7c3aed35'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        <p className="text-center text-xs text-zinc-600">
          Having trouble? Contact your gym reception.
        </p>
      </div>
    </div>
  )
}