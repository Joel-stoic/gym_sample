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
  MessageSquare, Check
} from 'lucide-react'
import { toast } from 'sonner'
import LightRays from '@/src/components/ui/LightRays'

// ─── Fonts ────────────────────────────────────────────────────────────────────
const inter = Inter({ subsets: ['latin'], variable: '--font-body' })

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
  'h-11 bg-background border border-input text-foreground placeholder:text-muted-foreground ' +
  'focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring rounded-md transition-all text-sm px-4 ' +
  '[&:-webkit-autofill]:[-webkit-text-fill-color:hsl(var(--foreground))] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_hsl(var(--background))_inset] ' +
  '[&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]'

const primaryBtnCls =
  'h-11 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2 w-full'

const ghostBtnCls =
  'h-11 rounded-md text-sm font-semibold text-muted-foreground bg-transparent border border-border ' +
  'hover:bg-accent hover:text-foreground transition-all w-full flex justify-center items-center'

const labelCls = 'text-xs font-semibold text-foreground uppercase tracking-wider'

// ─── Background Component (From Homepage) ─────────────────────────────────────
function AuthBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {/* Light Rays Background */}
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 0 0 0)' }}>
        <LightRays 
          raysOrigin="top-center" 
          raysColor="#ffffff" 
          raysSpeed={1.5}
          rayLength={2.5}
          lightSpread={2.0}
          saturation={1.5}
          className="opacity-100 dark:opacity-80 mix-blend-plus-lighter"
        />
      </div>
      {/* Dot pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
      {/* Subtle grid lines */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute top-0 bottom-0 left-[10%] w-[1px] bg-foreground" />
        <div className="absolute top-0 bottom-0 left-[50%] w-[1px] bg-foreground hidden md:block" />
        <div className="absolute top-0 bottom-0 right-[10%] w-[1px] bg-foreground" />
        <div className="absolute left-0 right-0 top-[20%] h-[1px] bg-foreground" />
        <div className="absolute left-0 right-0 top-[60%] h-[1px] bg-foreground hidden md:block" />
      </div>
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
    phone:       { title: 'Forgot password',  icon: <KeyRound size={18} className="text-foreground" /> },
    otp:         { title: 'Enter OTP',        icon: <MessageSquare size={18} className="text-foreground" /> },
    newPassword: { title: 'New password',     icon: <KeyRound size={18} className="text-foreground" /> },
    done:        { title: 'Password reset',   icon: <ShieldCheck size={18} className="text-foreground" /> },
  }[step]

  const stepIndex = { phone: 0, otp: 1, newPassword: 2, done: 3 }[step]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`bg-card text-card-foreground border border-border p-0 overflow-hidden gap-0 rounded-2xl sm:max-w-[420px] shadow-xl ${inter.className}`}>
        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary border border-border">
                {stepMeta.icon}
              </div>
              <div className="flex items-center gap-2" aria-hidden="true">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={`h-[3px] rounded-full transition-all duration-300 ${
                      i <= stepIndex ? 'w-8 bg-primary' : 'w-3 bg-secondary'
                    }`}
                  />
                ))}
              </div>
            </div>
            <DialogTitle className={`text-2xl font-bold tracking-tight text-foreground`}>
              {stepMeta.title}
            </DialogTitle>
          </DialogHeader>

          {step === 'phone' && (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Enter the phone number on your account. We&apos;ll send a code to your WhatsApp.
                </p>
                <FormField control={phoneForm.control} name="phone" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelCls}>Phone number</FormLabel>
                    <FormControl><Input placeholder="9876543210" className={inputCls} {...field} /></FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )} />
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className={ghostBtnCls}>Cancel</button>
                  <button type="submit" disabled={loading} className={primaryBtnCls}>
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
                <p className="text-sm leading-relaxed text-muted-foreground">
                  OTP sent to <span className="text-foreground font-semibold">{phone}</span> on WhatsApp.
                </p>
                <FormField control={otpForm.control} name="otp" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelCls}>6-digit code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000000"
                        maxLength={6}
                        inputMode="numeric"
                        className={`${inputCls} tracking-[0.75em] text-center text-xl font-bold tabular-nums h-14 bg-secondary border-border`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )} />
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setStep('phone')} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft size={14} /> Change number
                  </button>
                  <button type="button" onClick={handleResend} disabled={resendWait > 0 || loading} className="text-xs font-bold text-primary hover:text-primary/80 disabled:text-muted-foreground transition-colors">
                    {resendWait > 0 ? `Resend in ${resendWait}s` : 'Resend OTP'}
                  </button>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className={ghostBtnCls}>Cancel</button>
                  <button type="submit" disabled={loading} className={primaryBtnCls}>
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
                <p className="text-sm leading-relaxed text-muted-foreground">OTP verified. Set your new password below.</p>
                <FormField control={pwForm.control} name="newPassword" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelCls}>New password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPw ? 'text' : 'password'} className={`${inputCls} pr-11`} {...field} />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )} />
                <FormField control={pwForm.control} name="confirmPassword" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelCls}>Confirm password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showCfm ? 'text' : 'password'} className={`${inputCls} pr-11`} {...field} />
                        <button type="button" onClick={() => setShowCfm(!showCfm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showCfm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )} />
                <button type="submit" disabled={loading} className={`${primaryBtnCls} mt-2`}>
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Resetting' : 'Reset password'}
                </button>
              </form>
            </Form>
          )}

          {step === 'done' && (
            <div className="text-center space-y-6 py-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-2xl bg-secondary border border-border flex items-center justify-center shadow-inner">
                  <Check size={28} className="text-primary" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className={`text-2xl font-bold tracking-tight text-foreground`}>Password reset</p>
                <p className="mt-2 text-sm text-muted-foreground">You can log in with your new password now.</p>
              </div>
              <button onClick={onClose} className={primaryBtnCls}>Back to login</button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Login Page ───────────────────────────────────────────────────────────────
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
    <div className={`${inter.variable} min-h-screen bg-background text-foreground font-[family-name:var(--font-body)] relative flex items-center justify-center p-6 selection:bg-primary/10 overflow-x-hidden`}>
      <AuthBackground />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 flex items-center justify-center mb-4 bg-secondary border border-border rounded-xl shadow-sm">
            <Dumbbell className="h-5 w-5 text-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Log in to your gym dashboard.</p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {isLocalhost && (
                <FormField control={form.control} name="gymSlug" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelCls}>Gym slug</FormLabel>
                    <FormControl>
                      <Input placeholder="fitzone" className={inputCls} {...field} />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )} />
              )}

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelCls}>Phone number</FormLabel>
                  <FormControl>
                    <Input placeholder="9876543210" className={inputCls} {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className={labelCls}>Password</FormLabel>
                    <button
                      type="button"
                      onClick={handleForgotClick}
                      className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )} />

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className={primaryBtnCls}
                >
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> LOGGING IN</>
                    : 'LOG IN'
                  }
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground font-medium">
          Don&apos;t have a gym account?{' '}
          <a href="/signup" className="text-foreground font-bold hover:text-primary transition-colors">
            Create one
          </a>
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