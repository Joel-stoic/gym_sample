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
  'h-[46px] bg-[#0a0a0a] border border-[#222222] text-white placeholder:text-[#444444] ' +
  'focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/20 rounded-md transition-all shadow-sm text-[14px] px-4 ' +
  '[&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_#0a0a0a_inset] ' +
  '[&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]'

const primaryBtnCls =
  'h-[46px] rounded-md text-[14px] font-bold tracking-wide text-black bg-white ' +
  'hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all ' +
  'flex items-center justify-center gap-2'

const ghostBtnCls =
  'h-[46px] rounded-md text-[14px] font-semibold text-[#888888] bg-transparent border border-[#222222] ' +
  'hover:bg-[#111111] hover:text-white transition-all'

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
      <DialogContent className={`!bg-[#0a0a0a] !text-white border border-[#222222] p-0 overflow-hidden gap-0 rounded-xl sm:max-w-[420px] shadow-2xl ${inter.className}`}>
        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#111111] border border-[#222222] shadow-inner">
                {stepMeta.icon}
              </div>
              <div className="flex items-center gap-2" aria-hidden="true">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={`h-[2px] rounded-full transition-all duration-300 ${
                      i <= stepIndex ? 'w-8 bg-white' : 'w-4 bg-[#222222]'
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
                <p className="text-[14px] leading-relaxed text-[#888888]">
                  Enter the phone number on your account. We&apos;ll send a code to your WhatsApp.
                </p>
                <FormField control={phoneForm.control} name="phone" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[11px] font-bold text-[#666666] uppercase tracking-wider">Phone number</FormLabel>
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
                  OTP sent to <span className="text-white font-semibold">{phone}</span> on WhatsApp.
                </p>
                <FormField control={otpForm.control} name="otp" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[11px] font-bold text-[#666666] uppercase tracking-wider">6-digit code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000000"
                        maxLength={6}
                        inputMode="numeric"
                        className={`${inputCls} tracking-[0.75em] text-center text-xl font-bold tabular-nums h-14 text-white bg-[#111111] border-[#333333]`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-500" />
                  </FormItem>
                )} />
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setStep('phone')} className="flex items-center gap-1.5 text-[12px] font-semibold text-[#888888] hover:text-white transition-colors">
                    <ArrowLeft size={14} /> Change number
                  </button>
                  <button type="button" onClick={handleResend} disabled={resendWait > 0 || loading} className="text-[12px] font-bold text-white hover:text-white/80 disabled:text-[#444444] transition-colors">
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
                    <FormLabel className="text-[11px] font-bold text-[#666666] uppercase tracking-wider">New password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPw ? 'text' : 'password'} className={`${inputCls} pr-11`} {...field} />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors">
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-500" />
                  </FormItem>
                )} />
                <FormField control={pwForm.control} name="confirmPassword" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[11px] font-bold text-[#666666] uppercase tracking-wider">Confirm password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showCfm ? 'text' : 'password'} className={`${inputCls} pr-11`} {...field} />
                        <button type="button" onClick={() => setShowCfm(!showCfm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors">
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
                <div className="h-16 w-16 rounded-xl bg-[#111111] border border-[#222222] flex items-center justify-center shadow-inner">
                  <Check size={28} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className={`text-2xl font-bold tracking-tight text-white`}>Password reset</p>
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
    <div className={`min-h-screen flex items-stretch bg-black ${inter.className}`}>
      
      {/* ── Background Light Rays ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center">
        <LightRays 
          raysOrigin="top-center" 
          raysColor="#ffffff" 
          raysSpeed={1.0}
          rayLength={3.0}
          lightSpread={2.5}
          saturation={0}
          className="opacity-30 mix-blend-screen w-full max-w-[1400px]"
        />
      </div>

      {/* ── Brand panel ── */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between px-16 py-16 border-r border-[#1a1a1a] relative z-10 bg-transparent">
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-8 w-8 flex items-center justify-center bg-[#0a0a0a] border border-[#222222] rounded-md shadow-sm">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          <span className={`text-xl font-bold tracking-tight text-white`}>
            Jovifitx
          </span>
        </div>

        <div className="relative z-10 max-w-xl -mt-20">
          <h1 className={`text-[4rem] xl:text-[5rem] font-bold tracking-tight leading-[1] text-white mb-12`}>
            Run the floor.<br /><span className="text-[#666666]">Not the spreadsheets.</span>
          </h1>

          <ul className="space-y-6">
            {capabilities.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-4">
                <div className="h-8 w-8 shrink-0 border border-[#222222] bg-[#0a0a0a] rounded-md flex items-center justify-center">
                  <Icon size={14} className="text-[#888888]" />
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-widest text-[#888888]`}>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-[11px] font-bold tracking-[0.2em] text-[#444444] uppercase">
          Built for gyms across India.
        </p>

        {/* ── Minimalist connecting line ── */}
        <div className="absolute top-1/2 -right-[1px] -translate-y-1/2 w-8 h-[2px] bg-white z-20 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-24 py-16 relative z-10 bg-transparent overflow-y-auto">

        <div className="w-full max-w-[400px]">
          {/* Mobile wordmark */}
          <div className="lg:hidden flex flex-col items-center text-center mb-10">
            <div className="h-12 w-12 flex items-center justify-center mb-4 bg-[#0a0a0a] border border-[#222222] rounded-xl shadow-sm">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <h1 className={`text-2xl font-bold tracking-tight text-white`}>Jovifitx</h1>
          </div>

          <div className="mb-10 text-left">
            <h2 className={`text-3xl font-bold tracking-tight text-white`}>
              Welcome back
            </h2>
            <p className="text-[14px] text-[#888888] mt-2">Log in to your gym dashboard.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {isLocalhost && (
                <FormField control={form.control} name="gymSlug" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[11px] font-bold text-[#666666] uppercase tracking-widest">Gym slug</FormLabel>
                    <FormControl>
                      <Input placeholder="fitzone" className={inputCls} {...field} />
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-500" />
                  </FormItem>
                )} />
              )}

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[11px] font-bold text-[#666666] uppercase tracking-widest">Phone number</FormLabel>
                  <FormControl>
                    <Input placeholder="9876543210" className={inputCls} {...field} />
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-500" />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-[11px] font-bold text-[#666666] uppercase tracking-widest">Password</FormLabel>
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors">
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

          <div className="mt-10 text-left text-[13px] text-[#666666] font-medium">
            Don&apos;t have a gym account?{' '}
            <a href="/signup" className="text-white font-bold hover:text-white/80 transition-colors">
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