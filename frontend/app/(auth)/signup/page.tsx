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
  'h-12 bg-black/5 dark:bg-white/5 backdrop-blur-md border border-black/10 dark:border-white/10 text-foreground placeholder:text-muted-foreground ' +
  'focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary rounded-xl transition-all shadow-inner text-[14px] ' +
  '[&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_#121212_inset] ' +
  '[&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]'

const primaryBtnCls =
  'h-12 rounded-xl text-[14px] font-semibold tracking-wide text-primary-foreground bg-primary ' +
  'hover:bg-primary/90 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all shadow-lg ' +
  'flex items-center justify-center gap-2'

const labelCls = 'text-[11px] font-bold text-muted-foreground uppercase tracking-wider'

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
          className={`rounded-full ${i === 3 ? 'bg-primary' : 'bg-black/20 dark:bg-white/20'}`}
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
    <div className="hidden lg:flex w-[45%] flex-col justify-between overflow-hidden bg-black/5 dark:bg-white/5 px-12 py-12 border-r border-black/10 dark:border-white/10 relative">
      <div className="relative z-10 flex items-center gap-3">
        <div className="h-10 w-10 flex items-center justify-center bg-background/50 backdrop-blur-md text-foreground border border-black/10 dark:border-white/10 rounded-xl shadow-sm">
          <Dumbbell className="h-5 w-5 text-foreground" />
        </div>
        <span className={`text-2xl font-extrabold tracking-tighter text-foreground mt-1`}>
          Jovifitx
        </span>
      </div>

      <div className="relative z-10 max-w-md">
        <h1 className={`text-5xl md:text-6xl font-extrabold tracking-tighter leading-[1.05] text-foreground mb-8`}>
          Run the floor.<br /><span className="text-muted-foreground">Not the spreadsheets.</span>
        </h1>

        <ul className="space-y-5">
          {capabilities.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-4">
              <div className="h-8 w-8 shrink-0 border border-black/10 dark:border-white/10 bg-background/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Icon size={14} className="text-primary" />
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wider text-muted-foreground`}>{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-[11px] font-bold tracking-[0.15em] text-muted-foreground uppercase">
        Built for gyms across India.
      </p>

      <PlateStack className="absolute top-1/2 -right-[1px] -translate-y-1/2 z-10" />
    </div>
  )
}

// ─── Background Layer (shared for both form and success screens) ───────────────
function BackgroundLayer() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-background">
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
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />
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
      <div className={`min-h-screen flex items-center justify-center relative overflow-hidden bg-background p-4 sm:p-8 ${inter.className}`}>
        <BackgroundLayer />
        
        <div className="relative z-10 flex w-full max-w-[1000px] bg-background/60 dark:bg-black/40 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] overflow-hidden min-h-[600px]">
          <BrandPanel />

          <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12 relative bg-transparent">
            <div className="w-full max-w-[360px] text-center">

              <div className="lg:hidden flex flex-col items-center mb-8">
                <div className="h-14 w-14 flex items-center justify-center mb-4 bg-background/50 backdrop-blur-md text-foreground border border-black/10 dark:border-white/10 rounded-2xl shadow-sm">
                  <Dumbbell className="h-6 w-6 text-foreground" />
                </div>
                <h1 className={`text-3xl font-extrabold tracking-tighter text-foreground`}>Jovifitx</h1>
              </div>

              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                  <Check size={28} className="text-primary" strokeWidth={2.5} />
                </div>
              </div>

              <h2 className={`text-3xl font-extrabold tracking-tighter text-foreground`}>
                Gym Registered
              </h2>
              <p className="text-[14px] font-medium text-muted-foreground mt-2">
                <span className="text-foreground font-bold">{success.gymName}</span> is ready to go.
              </p>

              <div className="mt-8 text-left">
                <p className={labelCls}>Your dashboard URL</p>
                <div className="mt-2 flex items-center gap-2 bg-black/5 dark:bg-white/5 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-xl px-4 py-3">
                  <p className="flex-1 font-mono text-[13px] font-bold text-primary truncate">{success.url}</p>
                  <button onClick={copyUrl} className="text-muted-foreground hover:text-primary transition-colors shrink-0" aria-label="Copy URL">
                    <Copy size={15} />
                  </button>
                </div>
                <p className="mt-2 text-[12px] font-medium text-muted-foreground">Bookmark this — it&apos;s your gym&apos;s login page.</p>
              </div>

              <button
                onClick={() => {
                  localStorage.setItem('gymSlug', success.slug)
                  router.push('/login')
                }}
                className={`w-full mt-8 ${primaryBtnCls}`}
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
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden bg-background p-4 sm:p-8 ${inter.className}`}>
      <BackgroundLayer />
      
      <div className="relative z-10 flex w-full max-w-[1000px] bg-background/60 dark:bg-black/40 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] overflow-hidden min-h-[600px]">
        <BrandPanel />

        <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12 relative bg-transparent">
          <div className="w-full max-w-[360px]">

            <div className="lg:hidden flex flex-col items-center text-center mb-8">
              <div className="h-14 w-14 flex items-center justify-center mb-4 bg-background/50 backdrop-blur-md text-foreground border border-black/10 dark:border-white/10 rounded-2xl shadow-sm">
                <Dumbbell className="h-6 w-6 text-foreground" />
              </div>
              <h1 className={`text-3xl font-extrabold tracking-tighter text-foreground`}>Jovifitx</h1>
            </div>

            <div className="mb-8 text-center lg:text-left">
              <h2 className={`text-3xl font-extrabold tracking-tighter text-foreground`}>
                Create your gym
              </h2>
              <p className="text-[14px] font-medium text-muted-foreground mt-2">Set up your dashboard in a couple of minutes.</p>
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
                      Email <span className="normal-case text-muted-foreground font-normal tracking-normal">(optional)</span>
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
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

                <Button type="submit" disabled={loading} className={`w-full mt-2 ${primaryBtnCls}`}>
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> CREATING YOUR GYM</>
                    : 'CREATE GYM ACCOUNT'
                  }
                </Button>
              </form>
            </Form>

            <div className="mt-8 text-center text-[13px] text-muted-foreground font-medium">
              Already have a gym account?{' '}
              <a href="/login" className="text-foreground font-bold hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-[1px]">
                Log in
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}