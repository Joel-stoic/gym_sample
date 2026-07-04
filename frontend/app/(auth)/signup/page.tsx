'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { Inter } from 'next/font/google'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage
} from '@/components/ui/form'
import {
  Loader2, Dumbbell, Check, Eye, EyeOff,
  Users, Receipt, CalendarCheck, Copy,
} from 'lucide-react'
import { toast } from 'sonner'
import LightRays from '@/src/components/ui/LightRays'

// ─── Fonts ────────────────────────────────────────────────────────────────────
const inter = Inter({ subsets: ['latin'] })

// ─── Schema ───────────────────────────────────────────────────────────────────
const signupSchema = z.object({
  ownerName:       z.string().min(2, 'Owner name must be at least 2 characters'),
  gymName:         z.string().min(3, 'Gym name must be at least 3 characters'),
  email:           z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone:           z.string().min(10, 'Enter a valid phone number'),
  password:        z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
})

type SignupForm = z.infer<typeof signupSchema>

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

const labelCls = 'text-[11px] font-bold text-white/50 uppercase tracking-[0.1em]'

// ─── Capabilities Data ────────────────────────────────────────────────────────
const capabilities = [
  { icon: CalendarCheck, label: 'ATTENDANCE TRACKED AT THE DOOR' },
  { icon: Receipt,       label: 'PAYMENTS RECONCILED AUTOMATICALLY' },
  { icon: Users,         label: 'EVERY MEMBER, ONE LIVE ROSTER' },
]

// ─── Brand panel (shared shell for both the form and success screens) ──────────
function BrandPanel() {
  return (
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
  )
}

// ─── Background Layer (shared for both form and success screens) ───────────────
function BackgroundLayer() {
  return (
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
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [loading,             setLoading]             = useState(false)
  const [showPassword,        setShowPassword]        = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState<{
    gymName: string
    slug:    string
    url:     string
  } | null>(null)

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      ownerName: '', gymName: '', email: '', phone: '',
      password: '', confirmPassword: '',
    },
  })

  const onSubmit = async (data: SignupForm) => {
    setLoading(true)
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        {
          ownerName: data.ownerName,
          gymName:   data.gymName,
          email:     data.email || undefined,
          phone:     data.phone,
          password:  data.password,
        }
      )
      setSuccess(response.data.data.gym)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Signup failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(success!.url)
    toast.success('Copied to clipboard')
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className={`min-h-screen flex items-stretch bg-[#030303] ${inter.className}`}>
        <BackgroundLayer />
        
        <BrandPanel />

        <div className="flex-1 flex justify-center relative z-10 bg-transparent overflow-y-auto">
          <div className="w-full max-w-[420px] flex flex-col justify-center py-16 px-6 text-center">

            <div className="lg:hidden flex flex-col items-center mb-10 text-center">
              <div className="h-12 w-12 flex items-center justify-center mb-4 bg-white/5 border border-white/10 rounded-xl shadow-sm">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <h1 className={`text-2xl font-bold tracking-tight text-white`}>Jovifitx</h1>
            </div>

            <div className="flex justify-center mb-8">
              <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <Check size={28} className="text-black" strokeWidth={3} />
              </div>
            </div>

            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm`}>
              Gym Registered
            </h2>
            <p className="text-[15px] text-white/50 mt-3 font-medium">
              <span className="text-white font-bold">{success.gymName}</span> is ready to go.
            </p>

            <div className="mt-10 text-left">
              <p className={labelCls}>Your dashboard URL</p>
              <div className="mt-2 flex items-center gap-2 bg-white/[0.02] border border-white/[0.08] rounded-lg px-4 py-4 hover:bg-white/[0.04] transition-colors shadow-sm">
                <p className="flex-1 font-mono text-[14px] font-bold text-white truncate">{success.url}</p>
                <button onClick={copyUrl} className="text-white/30 hover:text-white transition-colors shrink-0" aria-label="Copy URL">
                  <Copy size={16} />
                </button>
              </div>
              <p className="mt-3 text-[13px] text-white/40 font-medium">Bookmark this — it&apos;s your gym&apos;s login page.</p>
            </div>

            <div className="pt-8">
              <button
                onClick={() => {
                  localStorage.setItem('gymSlug', success.slug)
                  router.push('/login')
                }}
                className={`w-full ${primaryBtnCls}`}
              >
                GO TO LOGIN
              </button>
            </div>

          </div>
        </div>
      </div>
    )
  }

  // ── Signup form ───────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen flex items-stretch bg-[#030303] ${inter.className}`}>
      <BackgroundLayer />
      
      <BrandPanel />

      <div className="flex-1 flex justify-center relative z-10 bg-transparent overflow-y-auto">
        <div className="w-full max-w-[420px] flex flex-col justify-center py-16 px-6">

          <div className="lg:hidden flex flex-col items-center text-center mb-12">
            <div className="h-12 w-12 flex items-center justify-center mb-4 bg-white/5 border border-white/10 rounded-xl shadow-sm">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <h1 className={`text-2xl font-bold tracking-tight text-white`}>Jovifitx</h1>
          </div>

          <div className="mb-10 text-left">
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm`}>
              Create your gym
            </h2>
            <p className="text-[15px] text-white/50 mt-3 font-medium">Set up your dashboard in a couple of minutes.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              <FormField control={form.control} name="ownerName" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelCls}>Your name</FormLabel>
                  <FormControl><Input placeholder="John Doe" className={inputCls} {...field} /></FormControl>
                  <FormMessage className="text-[12px] text-red-500" />
                </FormItem>
              )} />

              <FormField control={form.control} name="gymName" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelCls}>Gym name</FormLabel>
                  <FormControl><Input placeholder="Fitzone Gym" className={inputCls} {...field} /></FormControl>
                  <FormMessage className="text-[12px] text-red-500" />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelCls}>
                    Email <span className="normal-case text-white/30 font-normal tracking-normal">(optional)</span>
                  </FormLabel>
                  <FormControl><Input placeholder="owner@yourgym.com" type="email" className={inputCls} {...field} /></FormControl>
                  <FormMessage className="text-[12px] text-red-500" />
                </FormItem>
              )} />

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelCls}>Phone number</FormLabel>
                  <FormControl><Input placeholder="9876543210" type="tel" className={inputCls} {...field} /></FormControl>
                  <FormMessage className="text-[12px] text-red-500" />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelCls}>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        className={`${inputCls} pr-11`}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-500" />
                </FormItem>
              )} />

              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelCls}>Confirm password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`${inputCls} pr-11`}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-500" />
                </FormItem>
              )} />

              <div className="pt-2">
                <Button type="submit" disabled={loading} className={`w-full ${primaryBtnCls}`}>
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> CREATING YOUR GYM</>
                    : 'CREATE GYM ACCOUNT'
                  }
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-10 text-left text-[14px] text-white/50 font-medium">
            Already have a gym account?{' '}
            <a href="/login" className="text-white font-bold hover:text-white/80 transition-colors border-b border-transparent hover:border-white/50 pb-0.5">
              Log in
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}