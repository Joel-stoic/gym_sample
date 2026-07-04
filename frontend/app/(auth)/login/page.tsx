'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { Inter } from 'next/font/google'
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
import LightRays from '@/src/components/ui/LightRays'

// ─── Fonts ────────────────────────────────────────────────────────────────────
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
const inputCls =
  'h-12 bg-white/[0.02] border border-white/[0.08] text-white placeholder:text-white/30 ' +
  'hover:bg-white/[0.04] hover:border-white/[0.15] ' +
  'focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/30 focus-visible:bg-white/[0.04] ' +
  'rounded-lg transition-all shadow-sm text-[15px] px-4 ' +
  '[&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_#0a0a0a_inset] ' +
  '[&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]'

const primaryBtnCls =
  'h-12 rounded-lg text-[14px] font-bold tracking-wide text-black bg-white ' +
  'hover:bg-white/90 hover:scale-[1.01] shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] ' +
  'disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none disabled:cursor-not-allowed transition-all ' +
  'flex items-center justify-center gap-2'

const ghostBtnCls =
  'h-12 rounded-lg text-[14px] font-semibold text-white/50 bg-transparent border border-white/10 ' +
  'hover:bg-white/5 hover:text-white transition-all'

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
    phone:       { title: 'Forgot password',  icon: <KeyRound size={18} className="text-white" /> },
    otp:         { title: 'Enter OTP',        icon: <MessageSquare size={18} className="text-white" /> },
    newPassword: { title: 'New password',     icon: <KeyRound size={18} className="text-white" /> },
    done:        { title: 'Password reset',   icon: <ShieldCheck size={18} className="text-white" /> },
  }[step]

  const stepIndex = { phone: 0, otp: 1, newPassword: 2, done: 3 }[step]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`!bg-[#0a0a0a] !text-white border border-white/10 p-0 overflow-hidden gap-0 rounded-2xl sm:max-w-[420px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] ${inter.className}`}>
        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-inner">
                {stepMeta.icon}
              </div>
              <div className="flex items-center gap-2" aria-hidden="true">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={`h-[3px] rounded-full transition-all duration-300 ${
                      i <= stepIndex ? 'w-8 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'w-3 bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
            <DialogTitle className={`text-2xl font-bold tracking-tight text-white`}>
              {stepMeta.title}
            </DialogTitle>
          </DialogHeader>

          {step === 'phone' && (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-5">
                <p className="text-[14px] leading-relaxed text-white/50">
                  Enter the phone number on your account. We&apos;ll send a code to your WhatsApp.
                </p>
                <FormField control={phoneForm.control} name="phone" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Phone number</FormLabel>
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
                <p className="text-[14px] leading-relaxed text-white/50">
                  OTP sent to <span className="text-white font-semibold">{phone}</span> on WhatsApp.
                </p>
                <FormField control={otpForm.control} name="otp" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[11px] font-bold text-white/50 uppercase tracking-widest">6-digit code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000000"
                        maxLength={6}
                        inputMode="numeric"
                        className={`${inputCls} tracking-[0.75em] text-center text-xl font-bold tabular-nums h-14 text-white bg-white/5 border-white/20`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-500" />
                  </FormItem>
                )} />
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setStep('phone')} className="flex items-center gap-1.5 text-[13px] font-semibold text-white/50 hover:text-white transition-colors">
                    <ArrowLeft size={14} /> Change number
                  </button>
                  <button type="button" onClick={handleResend} disabled={resendWait > 0 || loading} className="text-[13px] font-bold text-white hover:text-white/80 disabled:text-white/20 transition-colors">
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
                <p className="text-[14px] leading-relaxed text-white/50">OTP verified. Set your new password below.</p>
                <FormField control={pwForm.control} name="newPassword" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[11px] font-bold text-white/50 uppercase tracking-widest">New password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPw ? 'text' : 'password'} className={`${inputCls} pr-11`} {...field} />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-500" />
                  </FormItem>
                )} />
                <FormField control={pwForm.control} name="confirmPassword" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Confirm password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showCfm ? 'text' : 'password'} className={`${inputCls} pr-11`} {...field} />
                        <button type="button" onClick={() => setShowCfm(!showCfm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
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
                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                  <Check size={28} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className={`text-2xl font-bold tracking-tight text-white`}>Password reset</p>
                <p className="mt-2 text-[14px] text-white/50">You can log in with your new password now.</p>
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
    <div className={`min-h-screen flex items-stretch bg-[#030303] ${inter.className}`}>
      
      {/* ── Intense Bright Background Light Rays & Glow ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center">
        {/* Core glowing orb for backlight */}
        <div className="absolute top-[-100px] left-1/4 w-[800px] h-[500px] bg-white/[0.04] blur-[100px] rounded-[100%] mix-blend-screen" />
        
        <LightRays 
          raysOrigin="top-center" 
          raysColor="#ffffff" 
          raysSpeed={1.5}
          rayLength={3.5}
          lightSpread={3.0}
          saturation={0}
          className="opacity-90 mix-blend-plus-lighter w-full max-w-[1600px]"
        />

        {/* Cinematic Film Grain Overlay */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      </div>

      {/* ── Brand panel (Left Half) ── */}
      <div className="hidden lg:flex w-1/2 justify-center border-r border-white/[0.08] relative z-10 bg-black/10 backdrop-blur-[1px]">
        
        {/* Centered content wrapper */}
        <div className="w-full max-w-lg flex flex-col justify-between py-16 px-4 relative z-10">
          
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg shadow-sm">
              <Dumbbell className="h-4 w-4 text-white" />
            </div>
            <span className={`text-xl font-bold tracking-tight text-white`}>
              Jovifitx
            </span>
          </div>

          <div className="relative z-10 -mt-16">
            <h1 className={`text-[4.5rem] xl:text-[5.5rem] font-extrabold tracking-tighter leading-[0.95] text-white mb-12 drop-shadow-2xl`}>
              Run the floor.<br />
              <span className="text-white/40 mix-blend-plus-lighter">Not the spreadsheets.</span>
            </h1>

            <ul className="space-y-7">
              {capabilities.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-5">
                  <div className="h-10 w-10 shrink-0 border border-white/[0.12] bg-white/[0.03] rounded-lg flex items-center justify-center">
                    <Icon size={16} className="text-white/60" />
                  </div>
                  <span className={`text-[12px] font-bold uppercase tracking-[0.15em] text-white/50`}>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 text-[11px] font-bold tracking-[0.25em] text-white/30 uppercase">
            Built for gyms across India.
          </p>
        </div>

        {/* ── Connecting Dash (Directly on border) ── */}
        <div className="absolute top-1/2 -right-[1px] -translate-y-1/2 w-8 h-[2px] bg-white z-20 shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
      </div>

      {/* ── Form panel (Right Half) ── */}
      <div className="flex-1 flex justify-center relative z-10 bg-transparent overflow-y-auto">

        {/* Centered form wrapper */}
        <div className="w-full max-w-[420px] flex flex-col justify-center py-16 px-6">
          
          {/* Mobile wordmark */}
          <div className="lg:hidden flex flex-col items-center text-center mb-12">
            <div className="h-12 w-12 flex items-center justify-center mb-4 bg-white/5 border border-white/10 rounded-xl shadow-sm">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <h1 className={`text-2xl font-bold tracking-tight text-white`}>Jovifitx</h1>
          </div>

          <div className="mb-10 text-left">
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm`}>
              Welcome back
            </h2>
            <p className="text-[15px] text-white/50 mt-3 font-medium">Log in to your gym dashboard.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {isLocalhost && (
                <FormField control={form.control} name="gymSlug" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[11px] font-bold text-white/50 uppercase tracking-[0.1em]">Gym slug</FormLabel>
                    <FormControl>
                      <Input placeholder="fitzone" className={inputCls} {...field} />
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-500" />
                  </FormItem>
                )} />
              )}

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[11px] font-bold text-white/50 uppercase tracking-[0.1em]">Phone number</FormLabel>
                  <FormControl>
                    <Input placeholder="9876543210" className={inputCls} {...field} />
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-500" />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-[11px] font-bold text-white/50 uppercase tracking-[0.1em]">Password</FormLabel>
                    <button
                      type="button"
                      onClick={handleForgotClick}
                      className="text-[12px] font-bold text-white hover:text-white/80 transition-colors"
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-500" />
                </FormItem>
              )} />

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full ${primaryBtnCls}`}
                >
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> LOGGING IN</>
                    : 'LOG IN'
                  }
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-10 text-left text-[14px] text-white/50 font-medium">
            Don&apos;t have a gym account?{' '}
            <a href="/signup" className="text-white font-bold hover:text-white/80 transition-colors border-b border-transparent hover:border-white/50 pb-0.5">
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