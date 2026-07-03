'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { Bebas_Neue, Inter } from 'next/font/google'
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

// ─── Fonts ────────────────────────────────────────────────────────────────────
const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
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
  'h-12 bg-card border border-border text-foreground placeholder:text-muted-foreground ' +
  'focus-visible:ring-1 focus-visible:ring-violet-600 focus-visible:border-violet-600 rounded-md transition-colors shadow-none text-[14px] ' +
  '[&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_#121212_inset] ' +
  '[&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]'

const primaryBtnCls =
  'h-12 rounded-md text-[14px] font-semibold tracking-wide text-foreground bg-violet-600 ' +
  'hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ' +
  'flex items-center justify-center gap-2'

const labelCls = 'text-[12px] font-semibold text-muted-foreground uppercase tracking-wider'

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
          className={`rounded-full ${i === 3 ? 'bg-violet-600' : 'bg-background'}`}
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
    <div className="relative hidden lg:flex lg:w-[45%] flex-col justify-between overflow-hidden bg-background px-16 py-12 border-r border-border">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      <div className="relative z-10 flex items-center gap-3">
        
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
              <span className={`text-[15px] tracking-widest text-muted-foreground ${bebas.className}`}>{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-[12px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
        Built for gyms across India.
      </p>

      <PlateStack className="absolute top-1/2 -right-[1px] -translate-y-1/2 z-10" />
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
      <div className={`min-h-screen bg-background flex items-stretch ${inter.className}`}>
        <BrandPanel />

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[400px] text-center">

            <div className="lg:hidden flex flex-col items-center mb-8">
              <div className="h-14 w-14 bg-violet-600 rounded-lg flex items-center justify-center mb-4">
                <Dumbbell className="h-6 w-6 text-foreground" />
              </div>
              <h1 className={`text-4xl tracking-widest text-foreground ${bebas.className}`}>JOVIFITX</h1>
            </div>

            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                <Check size={28} className="text-violet-500" strokeWidth={2.5} />
              </div>
            </div>

            <h2 className={`text-4xl text-foreground tracking-wide ${bebas.className}`}>
              GYM REGISTERED
            </h2>
            <p className="text-[14px] text-muted-foreground mt-2">
              <span className="text-foreground font-medium">{success.gymName}</span> is ready to go.
            </p>

            <div className="mt-8 text-left">
              <p className={labelCls}>Your dashboard URL</p>
              <div className="mt-2 flex items-center gap-2 bg-card border border-border rounded-md px-4 py-3">
                <p className="flex-1 font-mono text-[13px] text-violet-400 truncate">{success.url}</p>
                <button onClick={copyUrl} className="text-muted-foreground hover:text-violet-400 transition-colors shrink-0" aria-label="Copy URL">
                  <Copy size={15} />
                </button>
              </div>
              <p className="mt-2 text-[12px] text-muted-foreground">Bookmark this — it&apos;s your gym&apos;s login page.</p>
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
    )
  }

  // ── Signup form ───────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-background flex items-stretch ${inter.className}`}>
      <BrandPanel />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">

          <div className="lg:hidden flex flex-col items-center text-center mb-10">
            <div className="h-14 w-14 bg-violet-600 rounded-lg flex items-center justify-center mb-4">
              <Dumbbell className="h-6 w-6 text-foreground" />
            </div>
            <h1 className={`text-4xl tracking-widest text-foreground ${bebas.className}`}>JOVIFITX</h1>
          </div>

          <div className="mb-8">
            <h2 className={`text-4xl text-foreground tracking-wide ${bebas.className}`}>
              CREATE YOUR GYM
            </h2>
            <p className="text-[14px] text-muted-foreground mt-2">Set up your dashboard in a couple of minutes.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

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
                    Email <span className="normal-case text-muted-foreground font-normal tracking-normal">(optional)</span>
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-violet-400 transition-colors"
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-violet-400 transition-colors"
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

          <div className="mt-8 text-center text-[13px] text-[#666666]">
            Already have a gym account?{' '}
            <a href="/login" className="text-foreground font-medium hover:text-violet-400 transition-colors border-b border-white hover:border-violet-400 pb-[1px]">
              Log in
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}