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
  'h-12 bg-[#090909] border border-[#1a1a1a] text-white placeholder:text-[#444444] ' +
  'focus-visible:ring-1 focus-visible:ring-white/10 focus-visible:border-white/10 rounded-md transition-all text-[14px] px-4 ' +
  '[&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_#090909_inset] ' +
  '[&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]'

const primaryBtnCls =
  'h-12 rounded-md text-[14px] font-bold tracking-wide text-black bg-white ' +
  'hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all ' +
  'flex items-center justify-center gap-2'

const labelCls = 'text-[11px] font-bold text-[#666666] uppercase tracking-widest'

// ─── Capabilities Data ────────────────────────────────────────────────────────
const capabilities = [
  { icon: CalendarCheck, label: 'ATTENDANCE TRACKED AT THE DOOR' },
  { icon: Receipt,       label: 'PAYMENTS RECONCILED AUTOMATICALLY' },
  { icon: Users,         label: 'EVERY MEMBER, ONE LIVE ROSTER' },
]

// ─── Brand panel (shared shell for both the form and success screens) ──────────
function BrandPanel() {
  return (
    <div className="hidden lg:flex w-1/2 flex-col justify-between px-16 xl:px-24 py-16 border-r border-[#1a1a1a] relative z-10 bg-transparent">
      
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 flex items-center justify-center bg-[#090909] border border-[#1a1a1a] rounded-md shadow-sm">
          <Dumbbell className="h-4 w-4 text-white" />
        </div>
        <span className={`text-2xl font-black tracking-tighter text-white uppercase`}>
          JOVIFITX
        </span>
      </div>

      <div className="max-w-xl -mt-20">
        <h1 className={`text-[4.5rem] xl:text-[5rem] font-bold tracking-tight leading-[0.95] text-white mb-10`}>
          Run the floor.<br /><span className="text-[#888888]">Not the spreadsheets.</span>
        </h1>

        <ul className="space-y-5">
          {capabilities.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-4">
              <div className="h-7 w-7 shrink-0 border border-[#1a1a1a] bg-[#090909] rounded-md flex items-center justify-center">
                <Icon size={12} className="text-[#888888]" />
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-widest text-[#888888]`}>{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[11px] font-bold tracking-[0.2em] text-[#444444] uppercase">
        Built for gyms across India.
      </p>

      {/* ── Minimalist connecting line exactly on border ── */}
      <div className="absolute top-1/2 -right-[1px] -translate-y-1/2 w-8 h-[2px] bg-white z-20 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
    </div>
  )
}

// ─── Background Layer (shared for both form and success screens) ───────────────
function BackgroundLayer() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center">
      <LightRays 
        raysOrigin="top-center" 
        raysColor="#ffffff" 
        raysSpeed={1.0}
        rayLength={3.0}
        lightSpread={2.5}
        saturation={0}
        className="opacity-60 mix-blend-screen w-full min-w-[100vw]"
      />
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
      <div className={`dark min-h-screen flex flex-col lg:flex-row bg-[#000000] ${inter.className} relative`}>
        <BackgroundLayer />
        
        <BrandPanel />

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-24 py-16 relative z-10 bg-transparent overflow-y-auto">
          <div className="w-full max-w-[400px] mx-auto">

            <div className="lg:hidden flex flex-col mb-10 text-left">
              <div className="h-10 w-10 flex items-center justify-center mb-4 bg-[#090909] border border-[#1a1a1a] rounded-md shadow-sm">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <h1 className={`text-2xl font-black tracking-tighter text-white uppercase`}>JOVIFITX</h1>
            </div>

            <div className="flex justify-start mb-8">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                <Check size={24} className="text-black" strokeWidth={3} />
              </div>
            </div>

            <h2 className={`text-3xl font-bold tracking-tight text-white`}>
              Gym Registered
            </h2>
            <p className="text-[14px] text-[#888888] mt-2 font-normal">
              <span className="text-white font-bold">{success.gymName}</span> is ready to go.
            </p>

            <div className="mt-10 text-left">
              <p className={labelCls}>Your dashboard URL</p>
              <div className="mt-2 flex items-center gap-2 bg-[#090909] border border-[#1a1a1a] rounded-md px-4 py-3 hover:bg-[#111111] transition-colors">
                <p className="flex-1 font-mono text-[14px] font-bold text-white truncate">{success.url}</p>
                <button onClick={copyUrl} className="text-[#888888] hover:text-white transition-colors shrink-0" aria-label="Copy URL">
                  <Copy size={16} />
                </button>
              </div>
              <p className="mt-3 text-[12px] text-[#666666]">Bookmark this — it&apos;s your gym&apos;s login page.</p>
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
    <div className={`dark min-h-screen flex flex-col lg:flex-row bg-[#000000] ${inter.className} relative`}>
      <BackgroundLayer />
      
      <BrandPanel />

      <div className="flex-1 flex flex-col justify-center px-8 sm:px-24 py-16 relative z-10 bg-transparent overflow-y-auto">
        <div className="w-full max-w-[400px] mx-auto">

          <div className="lg:hidden flex flex-col mb-10 text-left">
            <div className="h-10 w-10 flex items-center justify-center mb-4 bg-[#090909] border border-[#1a1a1a] rounded-md shadow-sm">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <h1 className={`text-2xl font-black tracking-tighter text-white uppercase`}>JOVIFITX</h1>
          </div>

          <div className="mb-10 text-left">
            <h2 className={`text-3xl font-bold tracking-tight text-white`}>
              Create your gym
            </h2>
            <p className="text-[14px] text-[#888888] mt-2 font-normal">Set up your dashboard in a couple of minutes.</p>
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
                    Email <span className="normal-case text-[#666666] font-normal tracking-normal">(optional)</span>
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors"
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors"
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

          <div className="mt-8 text-[13px] text-[#666666] font-normal text-left">
            Already have a gym account?{' '}
            <a href="/login" className="text-white font-bold hover:text-white/80 transition-colors">
              Log in
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}