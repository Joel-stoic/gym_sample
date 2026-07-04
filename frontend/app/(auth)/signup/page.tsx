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
  Loader2, Dumbbell, Check, Eye, EyeOff, Copy
} from 'lucide-react'
import { toast } from 'sonner'
import LightRays from '@/src/components/ui/LightRays'

// ─── Fonts ────────────────────────────────────────────────────────────────────
const inter = Inter({ subsets: ['latin'], variable: '--font-body' })

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
  'h-11 bg-background border border-input text-foreground placeholder:text-muted-foreground ' +
  'focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring rounded-md transition-all text-sm px-4 ' +
  '[&:-webkit-autofill]:[-webkit-text-fill-color:hsl(var(--foreground))] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_hsl(var(--background))_inset] ' +
  '[&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]'

const primaryBtnCls =
  'h-11 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2 w-full'

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
      <div className={`${inter.variable} min-h-screen bg-background text-foreground font-[family-name:var(--font-body)] relative flex items-center justify-center p-6 selection:bg-primary/10 overflow-x-hidden`}>
        <AuthBackground />

        <div className="relative z-10 w-full max-w-[420px] bg-card border border-border rounded-2xl shadow-xl p-8 text-center">
          
          <div className="flex justify-center mb-6">
            <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Check size={28} className="text-primary" strokeWidth={2.5} />
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Gym Registered
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            <span className="text-foreground font-semibold">{success.gymName}</span> is ready to go.
          </p>

          <div className="mt-8 text-left">
            <p className={labelCls}>Your dashboard URL</p>
            <div className="mt-2 flex items-center gap-2 bg-secondary border border-border rounded-lg px-4 py-3 hover:bg-secondary/80 transition-colors">
              <p className="flex-1 font-mono text-sm font-semibold text-foreground truncate">{success.url}</p>
              <button onClick={copyUrl} className="text-muted-foreground hover:text-foreground transition-colors shrink-0" aria-label="Copy URL">
                <Copy size={16} />
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Bookmark this — it&apos;s your gym&apos;s login page.</p>
          </div>

          <div className="pt-8">
            <button
              onClick={() => {
                localStorage.setItem('gymSlug', success.slug)
                router.push('/login')
              }}
              className={primaryBtnCls}
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
    <div className={`${inter.variable} min-h-screen bg-background text-foreground font-[family-name:var(--font-body)] relative flex items-center justify-center p-6 selection:bg-primary/10 overflow-x-hidden`}>
      <AuthBackground />

      <div className="relative z-10 w-full max-w-[420px] my-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 flex items-center justify-center mb-4 bg-secondary border border-border rounded-xl shadow-sm">
            <Dumbbell className="h-5 w-5 text-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create your gym
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Set up your dashboard in minutes.</p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <FormField control={form.control} name="ownerName" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelCls}>Your name</FormLabel>
                  <FormControl><Input placeholder="John Doe" className={inputCls} {...field} /></FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )} />

              <FormField control={form.control} name="gymName" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelCls}>Gym name</FormLabel>
                  <FormControl><Input placeholder="Fitzone Gym" className={inputCls} {...field} /></FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelCls}>
                    Email <span className="normal-case text-muted-foreground font-normal tracking-normal">(optional)</span>
                  </FormLabel>
                  <FormControl><Input placeholder="owner@yourgym.com" type="email" className={inputCls} {...field} /></FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )} />

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelCls}>Phone number</FormLabel>
                  <FormControl><Input placeholder="9876543210" type="tel" className={inputCls} {...field} /></FormControl>
                  <FormMessage className="text-xs text-destructive" />
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )} />

              <div className="pt-2">
                <Button type="submit" disabled={loading} className={primaryBtnCls}>
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> CREATING YOUR GYM</>
                    : 'CREATE GYM ACCOUNT'
                  }
                </Button>
              </div>
            </form>
          </Form>
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground font-medium">
          Already have a gym account?{' '}
          <a href="/login" className="text-foreground font-bold hover:text-primary transition-colors">
            Log in
          </a>
        </div>

      </div>
    </div>
  )
}