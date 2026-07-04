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
  'h-12 bg-white/[0.03] dark:bg-white/[0.03] border border-white/[0.08] dark:border-white/[0.08] text-foreground placeholder:text-muted-foreground ' +
  'hover:bg-white/[0.05] dark:hover:bg-white/[0.05] ' +
  'focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-white/[0.05] ' +
  'rounded-xl transition-all shadow-inner text-[15px] px-4 ' +
  '[&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_#121212_inset] ' +
  '[&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]'

const primaryBtnCls =
  'h-12 rounded-xl text-[14px] font-bold tracking-wide text-primary-foreground bg-primary ' +
  'hover:bg-primary/90 hover:scale-[1.02] shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] ' +
  'disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none disabled:cursor-not-allowed transition-all ' +
  'flex items-center justify-center gap-2'

const ghostBtnCls =
  'h-12 rounded-xl text-[14px] font-medium text-muted-foreground bg-transparent border border-white/10 ' +
  'hover:bg-white/5 hover:text-foreground transition-all'

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
          className={`rounded-full ${i === 3 ? 'bg-primary shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-white/20'}`}
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
    phone:       { title: 'Forgot password',  icon: <KeyRound size={18} className="text-primary" /> },
    otp:         { title: 'Enter OTP',        icon: <MessageSquare size={18} className="text-primary" /> },
    newPassword: { title: 'New password',     icon: <KeyRound size={18} className="text-primary" /> },
    done:        { title: 'Password reset',   icon: <ShieldCheck size={18} className="text-primary" /> },
  }[step]

  const stepIndex = { phone: 0, otp: 1, newPassword: 2, done: 3 }[step]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`!bg-zinc-950/80 backdrop-blur-3xl !text-foreground border border-white/10 p-0 overflow-hidden gap-0 rounded-2xl sm:max-w-[420px] shadow-2xl ${inter.className}`}>
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
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i <= stepIndex ? 'w-8 bg-primary shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'w-2 bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
            <DialogTitle className={`text-2xl font-extrabold tracking-tight text-foreground`}>
              {stepMeta.title}
            </DialogTitle>
          </DialogHeader>

          {step === 'phone' && (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-5">
                <p className="text-[14px] leading-relaxed text-muted-foreground">
                  Enter the phone number on your account. We&apos;ll send a code to your WhatsApp.
                </p>
                <FormField control={phoneForm.control} name="phone" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Phone number</FormLabel>
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
                <p className="text-[14px] leading-relaxed text-muted-foreground">
                  OTP sent to <span className="text-foreground font-semibold">{phone}</span> on WhatsApp.
                </p>
                <FormField control={otpForm.control} name="otp" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">6-digit code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000000"
                        maxLength={6}
                        inputMode="numeric"
                        className={`${inputCls} tracking-[0.75em] text-center text-xl font-bold tabular-nums h-14 text-primary bg-primary/5 border-primary/20 focus-visible:ring-primary/50`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-500" />
                  </FormItem>
                )} />
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setStep('phone')} className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft size={14} /> Change number
                  </button>
                  <button type="button" onClick={handleResend} disabled={resendWait > 0 || loading} className="text-[13px] font-bold text-primary hover:text-primary/80 disabled:text-muted-foreground transition-colors">
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
                <p className="text-[14px] leading-relaxed text-muted-foreground">OTP verified. Set your new password below.</p>
                <FormField control={pwForm.control} name="newPassword" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">New password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPw ? 'text' : 'password'} className={`${inputCls} pr-11`} {...field} />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-500" />
                  </FormItem>
                )} />
                <FormField control={pwForm.control} name="confirmPassword" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Confirm password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showCfm ? 'text' : 'password'} className={`${inputCls} pr-11`} {...field} />
                        <button type="button" onClick={() => setShowCfm(!showCfm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
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
                <div className="h-16 w-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                  <Check size={28} className="text-primary" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className={`text-2xl font-extrabold tracking-tight text-foreground`}>Password reset</p>
                <p className="mt-2 text-[14px] text-muted-foreground">You can log in with your new password now.</p>
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
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden bg-black p-4 sm:p-8 ${inter.className}`}>
      
      {/* ── Intense Ambient Glow behind the card ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* ── Background Grid & Light Rays ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 0 0 0)' }}>
          <LightRays 
            raysOrigin="top-center" 
            raysColor="#ffffff" 
            raysSpeed={1.5}
            rayLength={2.5}
            lightSpread={2.0}
            saturation={1.5}
            className="opacity-60 mix-blend-plus-lighter"
          />
        </div>
        <div 
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
      </div>

      {/* ── Floating Glass Card ── */}
      <div className="relative z-10 flex w-full max-w-5xl h-[700px] max-h-[calc(100vh-4rem)] bg-zinc-950/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden">
        
        {/* ── Brand panel ── */}
        <div className="hidden lg:flex w-[45%] flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-transparent px-12 py-14 border-r border-white/10 relative">
          
          {/* Subtle noise over brand panel */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

          <div className="relative z-10 flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl shadow-sm">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <span className={`text-2xl font-extrabold tracking-tighter text-white mt-1`}>
              Jovifitx
            </span>
          </div>

          <div className="relative z-10">
            <h1 className={`text-5xl md:text-6xl font-extrabold tracking-tighter leading-[1.05] text-white mb-8`}>
              Run the floor.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-primary">Not the spreadsheets.</span>
            </h1>

            <ul className="space-y-6">
              {capabilities.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-4 group">
                  <div className="h-8 w-8 shrink-0 border border-white/10 bg-white/5 rounded-lg flex items-center justify-center transition-colors group-hover:bg-primary/20 group-hover:border-primary/30">
                    <Icon size={14} className="text-primary" />
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-200 transition-colors`}>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
            Built for gyms across India.
          </p>

          {/* Minimalist plate stack overlay */}
          <PlateStack className="absolute top-1/2 -right-[1px] -translate-y-1/2 z-10" />
        </div>

        {/* ── Form panel ── */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 py-12 relative bg-transparent overflow-y-auto">

          <div className="w-full max-w-[380px] mx-auto">
            {/* Mobile wordmark */}
            <div className="lg:hidden flex flex-col items-center text-center mb-10">
              <div className="h-14 w-14 flex items-center justify-center mb-4 bg-white/5 border border-white/10 rounded-2xl shadow-sm">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <h1 className={`text-3xl font-extrabold tracking-tighter text-white`}>Jovifitx</h1>
            </div>

            <div className="mb-10 text-center lg:text-left">
              <h2 className={`text-4xl font-extrabold tracking-tighter text-white`}>
                Welcome back
              </h2>
              <p className="text-[15px] font-medium text-zinc-400 mt-2">Log in to your gym dashboard.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {isLocalhost && (
                  <FormField control={form.control} name="gymSlug" render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Gym slug</FormLabel>
                      <FormControl>
                        <Input placeholder="fitzone" className={inputCls} {...field} />
                      </FormControl>
                      <FormMessage className="text-[12px] text-red-500" />
                    </FormItem>
                  )} />
                )}

                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Phone number</FormLabel>
                    <FormControl>
                      <Input placeholder="9876543210" className={inputCls} {...field} />
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-500" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Password</FormLabel>
                      <button
                        type="button"
                        onClick={handleForgotClick}
                        className="text-[12px] font-bold text-primary hover:text-primary/80 transition-colors"
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
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary transition-colors">
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

            <div className="mt-10 text-center text-[13px] text-zinc-500 font-medium">
              Don&apos;t have a gym account?{' '}
              <a href="/signup" className="text-white font-bold hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-[1px]">
                Create one
              </a>
            </div>

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