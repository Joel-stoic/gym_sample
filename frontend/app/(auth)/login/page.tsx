'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { Bebas_Neue, Inter } from 'next/font/google'
import { useAuthStore } from '@/src/store/authStore'
import { setAccessToken, setTenantSlug } from '@/src/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage
} from '@/components/ui/form'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import {
  Loader2, Dumbbell, ShieldCheck,
  Eye, EyeOff, KeyRound, ArrowLeft,
  MessageSquare, Check, Users, Receipt, CalendarCheck,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Fonts ────────────────────────────────────────────────────────────────────
const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

// ─── Schemas ──────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  gymSlug:  z.string().optional(),
  phone:    z.string().min(10, 'Enter valid phone'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const phoneSchema = z.object({
  phone: z.string().min(10, 'Enter valid phone'),
})

const otpSchema = z.object({
  otp: z.string().length(6, 'Enter the 6-digit OTP'),
})

const newPasswordSchema = z.object({
  newPassword:     z.string().min(6, 'Minimum 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
})

type LoginForm       = z.infer<typeof loginSchema>
type PhoneForm       = z.infer<typeof phoneSchema>
type OtpForm         = z.infer<typeof otpSchema>
type NewPasswordForm = z.infer<typeof newPasswordSchema>

// ─── Shared Styles ─────────────────────────────────────────────────────────────
// Monochrome base with flat violet accents for branding and interaction.
// The autofill overrides below stop Chrome/Edge from painting saved-credential
// fields white — without them, autofilled inputs break the dark theme (that's
// what was happening in the screenshot: the browser painting its own colors
// over your dark inputs, not a bug in the component itself).

const inputCls =
  'h-12 bg-card border border-border text-foreground placeholder:text-muted-foreground ' +
  'focus-visible:ring-1 focus-visible:ring-violet-600 focus-visible:border-violet-600 rounded-md transition-colors shadow-none text-[14px] ' +
  '[&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_#121212_inset] ' +
  '[&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]'

const primaryBtnCls =
  'h-12 rounded-md text-[14px] font-semibold tracking-wide text-foreground bg-violet-600 ' +
  'hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ' +
  'flex items-center justify-center gap-2'

const ghostBtnCls =
  'h-12 rounded-md text-[14px] font-medium text-[#888888] bg-transparent border border-border ' +
  'hover:border-violet-600 hover:text-foreground transition-colors'

// ─── Signature element: plate stack ───────────────────────────────────────────
function PlateStack({ vertical = true, className = '' }: { vertical?: boolean; className?: string }) {
  const sizes = [16, 28, 40, 52, 40, 28, 16]
  return (
    <div
      className={`flex ${vertical ? 'flex-col items-center' : 'items-center'} gap-[4px] ${className}`}
      aria-hidden="true"
    >
      {sizes.map((s, i) => (
        <div
          key={i}
          style={vertical ? { width: s, height: 2 } : { height: s, width: 2 }}
          className={`rounded-full ${i === 3 ? 'bg-violet-600' : 'bg-[#333333]'}`}
        />
      ))}
    </div>
  )
}

// ─── Forgot Password Modal ────────────────────────────────────────────────────
type ForgotStep = 'phone' | 'otp' | 'newPassword' | 'done'

function ForgotPasswordModal({
  open,
  onClose,
  slug,
  userType = 'staff',
}: {
  open:      boolean
  onClose:   () => void
  slug:      string
  userType?: 'staff' | 'member'
}) {
  const [step,       setStep]       = useState<ForgotStep>('phone')
  const [loading,    setLoading]    = useState(false)
  const [phone,      setPhone]      = useState('')
  const [resetToken, setResetToken] = useState('')
  const [resendWait, setResendWait] = useState(0)
  const [showPw,     setShowPw]     = useState(false)
  const [showCfm,    setShowCfm]    = useState(false)

  useEffect(() => {
    if (resendWait <= 0) return
    const t = setTimeout(() => setResendWait(w => w - 1), 1000)
    return () => clearTimeout(t)
  }, [resendWait])

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('phone')
        setPhone('')
        setResetToken('')
        setResendWait(0)
        phoneForm.reset()
        otpForm.reset()
        pwForm.reset()
      }, 300)
    }
  }, [open])

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  })

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  })

  const pwForm = useForm<NewPasswordForm>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const headers = { 'x-tenant-slug': slug }
  const base    = process.env.NEXT_PUBLIC_API_URL

  const onPhoneSubmit = async (data: PhoneForm) => {
    setLoading(true)
    try {
      await axios.post(`${base}/api/auth/forgot-password`, { phone: data.phone, userType }, { headers })
      setPhone(data.phone)
      setResendWait(60)
      setStep('otp')
      toast.success('OTP sent to your WhatsApp!')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendWait > 0) return
    setLoading(true)
    try {
      await axios.post(`${base}/api/auth/forgot-password`, { phone, userType }, { headers })
      setResendWait(60)
      otpForm.reset()
      toast.success('New OTP sent!')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const onOtpSubmit = async (data: OtpForm) => {
    setLoading(true)
    try {
      const res = await axios.post(`${base}/api/auth/verify-otp`, { phone, otp: data.otp }, { headers })
      setResetToken(res.data.resetToken)
      setStep('newPassword')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const onPasswordSubmit = async (data: NewPasswordForm) => {
    setLoading(true)
    try {
      await axios.post(`${base}/api/auth/reset-password`, { resetToken, newPassword: data.newPassword }, { headers })
      setStep('done')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const stepMeta = {
    phone:       { title: 'Forgot password',  icon: <KeyRound size={18} className="text-violet-500" /> },
    otp:         { title: 'Enter OTP',        icon: <MessageSquare size={18} className="text-violet-500" /> },
    newPassword: { title: 'New password',     icon: <KeyRound size={18} className="text-violet-500" /> },
    done:        { title: 'Password reset',   icon: <ShieldCheck size={18} className="text-violet-500" /> },
  }[step]

  const stepIndex = { phone: 0, otp: 1, newPassword: 2, done: 3 }[step]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`!bg-background !text-foreground border border-border p-0 overflow-hidden gap-0 rounded-xl sm:max-w-[420px] ${inter.className}`}>
        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-card border border-border">
                {stepMeta.icon}
              </div>
              <div className="flex items-center gap-2" aria-hidden="true">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i <= stepIndex ? 'w-6 bg-violet-600' : 'w-2 bg-[#2A2A2A]'
                    }`}
                  />
                ))}
              </div>
            </div>
            <DialogTitle className={`text-2xl font-normal tracking-wide text-foreground ${bebas.className}`}>
              {stepMeta.title}
            </DialogTitle>
          </DialogHeader>

          {step === 'phone' && (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-5">
                <p className="text-[14px] leading-relaxed text-[#888888]">
                  Enter the phone number on your account. We&apos;ll send a code to your WhatsApp.
                </p>
                <FormField control={phoneForm.control} name="phone" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[12px] font-semibold text-[#888888] uppercase tracking-wider">Phone number</FormLabel>
                    <FormControl><Input placeholder="9876543210" className={inputCls} {...field} /></FormControl>
                    <FormMessage className="text-[12px] text-red-500" />
                  </FormItem>
                )} />
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className={`flex-1 ${ghostBtnCls}`}>Cancel</button>
                  <button type="submit" disabled={loading} className={`flex-1 ${primaryBtnCls}`}>
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? 'Sending' : 'Send OTP'}
                  </button>
                </div>
              </form>
            </Form>
          )}

          {step === 'otp' && (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-5">
                <p className="text-[14px] leading-relaxed text-[#888888]">
                  OTP sent to <span className="text-foreground font-medium">{phone}</span> on WhatsApp.
                </p>
                <FormField control={otpForm.control} name="otp" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[12px] font-semibold text-[#888888] uppercase tracking-wider">6-digit code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000000"
                        maxLength={6}
                        inputMode="numeric"
                        className={`${inputCls} tracking-[0.75em] text-center text-xl font-medium tabular-nums h-14 text-violet-400`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-500" />
                  </FormItem>
                )} />
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setStep('phone')} className="flex items-center gap-1.5 text-[13px] text-[#888888] hover:text-foreground transition-colors">
                    <ArrowLeft size={14} /> Change number
                  </button>
                  <button type="button" onClick={handleResend} disabled={resendWait > 0 || loading} className="text-[13px] font-medium text-violet-500 hover:text-violet-400 disabled:text-[#444444] transition-colors">
                    {resendWait > 0 ? `Resend in ${resendWait}s` : 'Resend OTP'}
                  </button>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className={`flex-1 ${ghostBtnCls}`}>Cancel</button>
                  <button type="submit" disabled={loading} className={`flex-1 ${primaryBtnCls}`}>
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? 'Verifying' : 'Verify OTP'}
                  </button>
                </div>
              </form>
            </Form>
          )}

          {step === 'newPassword' && (
            <Form {...pwForm}>
              <form onSubmit={pwForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                <p className="text-[14px] leading-relaxed text-[#888888]">OTP verified. Set your new password below.</p>
                <FormField control={pwForm.control} name="newPassword" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[12px] font-semibold text-[#888888] uppercase tracking-wider">New password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPw ? 'text' : 'password'} className={`${inputCls} pr-11`} {...field} />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-violet-400 transition-colors">
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-500" />
                  </FormItem>
                )} />
                <FormField control={pwForm.control} name="confirmPassword" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[12px] font-semibold text-[#888888] uppercase tracking-wider">Confirm password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showCfm ? 'text' : 'password'} className={`${inputCls} pr-11`} {...field} />
                        <button type="button" onClick={() => setShowCfm(!showCfm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-violet-400 transition-colors">
                          {showCfm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-500" />
                  </FormItem>
                )} />
                <button type="submit" disabled={loading} className={`w-full ${primaryBtnCls} mt-2`}>
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Resetting' : 'Reset password'}
                </button>
              </form>
            </Form>
          )}

          {step === 'done' && (
            <div className="text-center space-y-6 py-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                  <Check size={28} className="text-violet-500" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className={`text-2xl tracking-wide text-foreground ${bebas.className}`}>Password reset</p>
                <p className="mt-2 text-[14px] text-[#888888]">You can log in with your new password now.</p>
              </div>
              <button onClick={onClose} className={`w-full ${primaryBtnCls}`}>Back to login</button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Login Page ───────────────────────────────────────────────────────────────
const capabilities = [
  { icon: CalendarCheck, label: 'ATTENDANCE TRACKED AT THE DOOR' },
  { icon: Receipt,       label: 'PAYMENTS RECONCILED AUTOMATICALLY' },
  { icon: Users,         label: 'EVERY MEMBER, ONE LIVE ROSTER' },
]

export default function LoginPage() {
  const router = useRouter()
  const { setAuth, logout } = useAuthStore()

  const [loading,         setLoading]         = useState(false)
  const [showPassword,    setShowPassword]    = useState(false)
  const [isLocalhost,     setIsLocalhost]     = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [modalSlug,       setModalSlug]       = useState('')

  useEffect(() => {
    setIsLocalhost(window.location.hostname === 'localhost')
  }, [])

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { gymSlug: '', phone: '', password: '' },
  })

  const getSlug = (formSlug?: string): string => {
    if (typeof window === 'undefined') return ''
    const host = window.location.hostname
    if (host !== 'localhost') return host.split('.')[0]
    return formSlug || ''
  }

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const slug = getSlug(data.gymSlug)
      if (!slug) { toast.error('Please enter gym slug'); return }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        { phone: data.phone, password: data.password },
        { headers: { 'x-tenant-slug': slug }, withCredentials: true }
      )

      if (response.data.pending) { toast.warning(response.data.message); return }

      const { accessToken, staff, tenant } = response.data.data
      logout()
      setAccessToken(accessToken)
      setTenantSlug(slug)
      setAuth(staff, { id: tenant.id, name: tenant.name, slug: tenant.slug })
      toast.success(`Welcome back, ${staff.name}`)

      if (staff.mustChangePassword)      router.push('/staff/change-password')
      else if (staff.role === 'TRAINER') router.push('/members')
      else                               router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotClick = () => {
    setModalSlug(getSlug(form.getValues('gymSlug')))
    setShowForgotModal(true)
  }

  return (
    <div className={`min-h-screen bg-background flex items-stretch ${inter.className}`}>

      {/* ── Brand panel ─────────────────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[45%] flex-col justify-between overflow-hidden bg-black px-16 py-12 border-r border-border">

        {/* Subtle noise/texture overlay for a premium feel */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 bg-violet-600 rounded-md flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-foreground" />
          </div>
          <span className={`text-2xl tracking-widest text-foreground mt-1 ${bebas.className}`}>
            JOVIFITX
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className={`text-[4rem] leading-[0.9] text-foreground tracking-wide mb-8 ${bebas.className}`}>
            RUN THE FLOOR.<br />NOT THE<br />SPREADSHEETS.
          </h1>

          <ul className="space-y-5">
            {capabilities.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-4">
                <div className="h-8 w-8 shrink-0 border border-[#333333] rounded-md flex items-center justify-center">
                  <Icon size={14} className="text-violet-500" />
                </div>
                <span className={`text-[15px] tracking-widest text-[#888888] ${bebas.className}`}>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-[12px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
          Built for gyms across India.
        </p>

        {/* Minimalist plate stack */}
        <PlateStack className="absolute top-1/2 -right-[1px] -translate-y-1/2 z-10" />
      </div>

      {/* ── Form panel ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative bg-background">

        <div className="relative z-10 w-full max-w-[400px]">
          {/* Mobile wordmark */}
          <div className="lg:hidden flex flex-col items-center text-center mb-10">
            <div className="h-14 w-14 bg-violet-600 rounded-lg flex items-center justify-center mb-4">
              <Dumbbell className="h-6 w-6 text-foreground" />
            </div>
            <h1 className={`text-4xl tracking-widest text-foreground ${bebas.className}`}>JOVIFITX</h1>
          </div>

          <div className="mb-10">
            <h2 className={`text-4xl text-foreground tracking-wide ${bebas.className}`}>
              WELCOME BACK
            </h2>
            <p className="text-[14px] text-[#888888] mt-2">Log in to your gym dashboard.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {isLocalhost && (
                <FormField control={form.control} name="gymSlug" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[12px] font-semibold text-[#888888] uppercase tracking-wider">Gym slug</FormLabel>
                    <FormControl>
                      <Input placeholder="fitzone" className={inputCls} {...field} />
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-500" />
                  </FormItem>
                )} />
              )}

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[12px] font-semibold text-[#888888] uppercase tracking-wider">Phone number</FormLabel>
                  <FormControl>
                    <Input placeholder="9876543210" className={inputCls} {...field} />
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-500" />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-[12px] font-semibold text-[#888888] uppercase tracking-wider">Password</FormLabel>
                    <button
                      type="button"
                      onClick={handleForgotClick}
                      className="text-[12px] font-medium text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={`${inputCls} pr-11`}
                        {...field}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-violet-400 transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-500" />
                </FormItem>
              )} />

              <Button
                type="submit"
                disabled={loading}
                className={`w-full mt-4 ${primaryBtnCls}`}
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> LOGGING IN</>
                  : 'LOG IN'
                }
              </Button>
            </form>
          </Form>

          <div className="mt-10 text-center text-[13px] text-[#666666]">
            Don&apos;t have a gym account?{' '}
            <a href="/signup" className="text-foreground font-medium hover:text-violet-400 transition-colors border-b border-white hover:border-violet-400 pb-[1px]">
              Create one
            </a>
          </div>

        </div>
      </div>

      <ForgotPasswordModal
        open={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        slug={modalSlug}
        userType="staff"
      />
    </div>
  )
}