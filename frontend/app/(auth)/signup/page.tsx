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

// ─── Shared styles (matches LoginPage) ─────────────────────────────────────────
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

const labelCls = 'text-[11px] font-bold text-zinc-400 uppercase tracking-widest'

// ─── Signature element: plate stack (matches LoginPage) ────────────────────────
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

const capabilities = [
  { icon: CalendarCheck, label: 'ATTENDANCE TRACKED AT THE DOOR' },
  { icon: Receipt,       label: 'PAYMENTS RECONCILED AUTOMATICALLY' },
  { icon: Users,         label: 'EVERY MEMBER, ONE LIVE ROSTER' },
]

// ─── Brand panel (shared shell for both the form and success screens) ──────────
function BrandPanel() {
  return (
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
  )
}

// ─── Background Layer (shared for both form and success screens) ───────────────
function BackgroundLayer() {
  return (
    <>
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
    </>
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
      <div className={`min-h-screen flex items-center justify-center relative overflow-hidden bg-black p-4 sm:p-8 ${inter.className}`}>
        <BackgroundLayer />
        
        <div className="relative z-10 flex w-full max-w-5xl h-[700px] max-h-[calc(100vh-4rem)] bg-zinc-950/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden">
          <BrandPanel />

          <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 py-12 relative bg-transparent overflow-y-auto">
            <div className="w-full max-w-[380px] mx-auto text-center">

              <div className="lg:hidden flex flex-col items-center mb-10">
                <div className="h-14 w-14 flex items-center justify-center mb-4 bg-white/5 border border-white/10 rounded-2xl shadow-sm">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <h1 className={`text-3xl font-extrabold tracking-tighter text-white`}>Jovifitx</h1>
              </div>

              <div className="flex justify-center mb-8">
                <div className="h-16 w-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  <Check size={28} className="text-white" strokeWidth={2.5} />
                </div>
              </div>

              <h2 className={`text-4xl font-extrabold tracking-tighter text-white`}>
                Gym Registered
              </h2>
              <p className="text-[15px] font-medium text-zinc-400 mt-3">
                <span className="text-white font-bold">{success.gymName}</span> is ready to go.
              </p>

              <div className="mt-10 text-left">
                <p className={labelCls}>Your dashboard URL</p>
                <div className="mt-2 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-4 hover:bg-white/10 transition-colors">
                  <p className="flex-1 font-mono text-[14px] font-bold text-primary truncate">{success.url}</p>
                  <button onClick={copyUrl} className="text-zinc-400 hover:text-white transition-colors shrink-0" aria-label="Copy URL">
                    <Copy size={16} />
                  </button>
                </div>
                <p className="mt-3 text-[13px] font-medium text-zinc-500">Bookmark this — it&apos;s your gym&apos;s login page.</p>
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
      </div>
    )
  }

  // ── Signup form ───────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden bg-black p-4 sm:p-8 ${inter.className}`}>
      <BackgroundLayer />
      
      <div className="relative z-10 flex w-full max-w-5xl h-[700px] max-h-[calc(100vh-4rem)] bg-zinc-950/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden">
        <BrandPanel />

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 py-12 relative bg-transparent overflow-y-auto">
          <div className="w-full max-w-[380px] mx-auto">

            <div className="lg:hidden flex flex-col items-center text-center mb-8">
              <div className="h-14 w-14 flex items-center justify-center mb-4 bg-white/5 border border-white/10 rounded-2xl shadow-sm">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <h1 className={`text-3xl font-extrabold tracking-tighter text-white`}>Jovifitx</h1>
            </div>

            <div className="mb-8 text-center lg:text-left">
              <h2 className={`text-4xl font-extrabold tracking-tighter text-white`}>
                Create your gym
              </h2>
              <p className="text-[14px] font-medium text-zinc-400 mt-2">Set up your dashboard in a couple of minutes.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                <FormField control={form.control} name="ownerName" render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className={labelCls}>Your name</FormLabel>
                    <FormControl><Input placeholder="John Doe" className={inputCls} {...field} /></FormControl>
                    <FormMessage className="text-[12px] text-red-500" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="gymName" render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className={labelCls}>Gym name</FormLabel>
                    <FormControl><Input placeholder="Fitzone Gym" className={inputCls} {...field} /></FormControl>
                    <FormMessage className="text-[12px] text-red-500" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className={labelCls}>
                      Email <span className="normal-case text-zinc-500 font-normal tracking-normal">(optional)</span>
                    </FormLabel>
                    <FormControl><Input placeholder="owner@yourgym.com" type="email" className={inputCls} {...field} /></FormControl>
                    <FormMessage className="text-[12px] text-red-500" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className={labelCls}>Phone number</FormLabel>
                    <FormControl><Input placeholder="9876543210" type="tel" className={inputCls} {...field} /></FormControl>
                    <FormMessage className="text-[12px] text-red-500" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem className="space-y-1.5">
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
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary transition-colors"
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
                  <FormItem className="space-y-1.5">
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
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary transition-colors"
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

            <div className="mt-8 text-center text-[13px] text-zinc-500 font-medium">
              Already have a gym account?{' '}
              <a href="/login" className="text-white font-bold hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-[1px]">
                Log in
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}