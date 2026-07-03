'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/src/lib/api'
import { Plan } from '@/src/types'
import { toast } from 'sonner'
import {
  Loader2, User, StickyNote, Dumbbell, ChevronRight, ChevronLeft,
  AlertCircle, CheckCircle, Clock, CalendarDays, Wallet, CreditCard, 
  Smartphone, Copy, X
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PAYMENT_METHODS } from '@/src/constants'

const schema = z.object({
  name:         z.string().min(2, 'Name required'),
  phone:        z.string().min(10, 'Valid phone required'),
  email:        z.string().email().optional().or(z.literal('')),
  gender:       z.string().optional(),
  dateOfBirth:  z.string().optional(),
  address:      z.string().optional(),
  notes:        z.string().optional(),
  planId:       z.string().optional(),
  discount:     z.string().optional(),
  additionalFee: z.string().optional(),
  paidAmount:   z.string().optional(),
  paymentMethod: z.string().optional(),
  planStartDate: z.string().optional(),
  paymentNotes: z.string().optional(),
}).superRefine((d, ctx) => {
  if (d.planId) {
    if (!d.paymentMethod) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select payment method', path: ['paymentMethod'] })
    }
    if (!d.paidAmount || d.paidAmount === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter amount paid', path: ['paidAmount'] })
    }
  }
})

type FormData = z.infer<typeof schema>

interface NewMemberModalProps {
  isOpen: boolean
  onClose: () => void
}

const toDateInputValue = (d: Date) => d.toISOString().split('T')[0]

const STATUS_CONFIG = {
  PAID:    { label: 'Fully Paid',  color: 'text-[#4ade80]', bg: 'bg-[#22c55e15]', border: 'border-[#22c55e30]', icon: CheckCircle },
  PARTIAL: { label: 'Partial',     color: 'text-[#fbbf24]', bg: 'bg-[#f59e0b15]', border: 'border-[#f59e0b30]', icon: AlertCircle },
  PENDING: { label: 'Pending',     color: 'text-[#f87171]', bg: 'bg-[#ef444415]', border: 'border-[#ef444430]', icon: Clock       },
}

const inputCls = `
  w-full rounded-xl border border-border bg-background
  px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground
  focus:border-[#7c3aed44] focus:shadow-[0_0_0_3px_#7c3aed12] focus:outline-none transition-all
`
const selectCls = `
  w-full rounded-xl border border-border bg-background
  px-3 py-2.5 text-[13px] text-foreground
  focus:border-[#7c3aed44] focus:shadow-[0_0_0_3px_#7c3aed12] focus:outline-none transition-all
  appearance-none cursor-pointer
`

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-[11px] text-[#f87171]">{error}</p>}
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7c3aed15] border border-border text-[#a855f7]">
          <Icon size={15} />
        </div>
        <p className="text-[14px] font-semibold text-foreground">{title}</p>
      </div>
      {children}
    </div>
  )
}

export default function NewMemberModal({ isOpen, onClose }: NewMemberModalProps) {
  const queryClient  = useQueryClient()
  const [step,           setStep]           = useState<1 | 2>(1)
  const [loading,        setLoading]        = useState(false)
  const [planAmount,     setPlanAmount]     = useState(0)
  const [createdMember,  setCreatedMember]  = useState<{
    name:         string
    phone:        string
    tempPassword: string
    loginUrl:     string
  } | null>(null)

  const { register, handleSubmit, watch, setValue, reset, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      discount:      '0',
      additionalFee: '0',
      paidAmount:    '',
      planStartDate: toDateInputValue(new Date()),
    }
  })

  useEffect(() => {
    if (isOpen) {
      reset()
      setStep(1)
      setPlanAmount(0)
      setCreatedMember(null)
      setValue('planStartDate', toDateInputValue(new Date()))
    }
  }, [isOpen, reset, setValue])

  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ['plans', { includeInactive: false }],
    queryFn:  async () => {
      const res = await api.get('/api/plans')
      return res.data.data
    },
    staleTime: 1000 * 60 * 2,
    enabled: isOpen 
  })

  const handlePlanChange = (planId: string) => {
    const plan = plans.find(p => p.id === planId)
    if (plan) {
      const priceInRupees = plan.price / 100
      setPlanAmount(priceInRupees)
      setValue('discount', '0')
      setValue('additionalFee', '0')
      setValue('paidAmount', priceInRupees.toString())
    } else {
      setPlanAmount(0)
      setValue('discount', '0')
      setValue('additionalFee', '0')
      setValue('paidAmount', '')
    }
  }

  const syncPaidAmount = (newDiscount: number, newAdditionalFee: number, prevNetDue: number) => {
    const currentPaid = Number(watch('paidAmount') || 0)
    if (currentPaid === prevNetDue) {
      const newNet = Math.max(0, planAmount - newDiscount + newAdditionalFee)
      setValue('paidAmount', newNet.toString())
    }
  }

  const handleDiscountChange = (val: string) => {
    const oldDiscount   = Number(watch('discount')      || 0)
    const additionalFee = Number(watch('additionalFee') || 0)
    const prevNetDue    = Math.max(0, planAmount - oldDiscount + additionalFee)
    syncPaidAmount(Number(val || 0), additionalFee, prevNetDue)
  }

  const handleAdditionalFeeChange = (val: string) => {
    const discount = Number(watch('discount')      || 0)
    const oldFee   = Number(watch('additionalFee') || 0)
    const prevNetDue = Math.max(0, planAmount - discount + oldFee)
    syncPaidAmount(discount, Number(val || 0), prevNetDue)
  }

  const discount      = Number(watch('discount')      || 0)
  const additionalFee = Number(watch('additionalFee') || 0)
  const paidAmount    = Number(watch('paidAmount')    || 0)
  const planStartDate = watch('planStartDate')
  const planId        = watch('planId')

  const netDue  = Math.max(0, planAmount - discount + additionalFee)
  const pending = Math.max(0, netDue - paidAmount)

  const paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING' =
    paidAmount <= 0     ? 'PENDING' :
    paidAmount < netDue ? 'PARTIAL' : 'PAID'

  const statusCfg  = STATUS_CONFIG[paymentStatus]
  const StatusIcon = statusCfg.icon

  const expiryPreview = (() => {
    const plan = plans.find(p => p.id === planId)
    if (!plan || !planStartDate) return null
    const start = new Date(planStartDate)
    start.setHours(0, 0, 0, 0)
    const expiry = new Date(start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000)
    return expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  })()

  const handleNextStep = async () => {
    const isValid = await trigger(['name', 'phone', 'email', 'gender', 'dateOfBirth', 'address', 'notes'])
    if (isValid) {
      setStep(2)
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const memberClean = Object.fromEntries(
        Object.entries({
          name:        data.name,
          phone:       data.phone,
          email:       data.email,
          gender:      data.gender,
          address:     data.address,
          notes:       data.notes,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : undefined,
        }).filter(([_, v]) => v !== '' && v != null)
      )

      const memberRes  = await api.post('/api/members', memberClean)
      const memberData = memberRes.data.data
      const memberId   = memberData?.id

      if (data.planId && data.paymentMethod && memberId) {
        await api.post('/api/payments', {
          memberId,
          planId:        data.planId,
          discount:      Math.round(Number(data.discount      || 0) * 100),
          additionalFee: Math.round(Number(data.additionalFee || 0) * 100),
          paidAmount:    Math.round(Number(data.paidAmount    || 0) * 100),
          paymentMethod: data.paymentMethod,
          planStartDate: data.planStartDate
            ? new Date(`${data.planStartDate}T00:00:00`).toISOString()
            : undefined,
          notes: data.paymentNotes,
        })
      }

      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })

      if (memberData?.tempPassword) {
        setCreatedMember({
          name:         memberData.name,
          phone:        memberData.phone,
          tempPassword: memberData.tempPassword,
          loginUrl:     memberData.loginUrl,
        })
      } else {
        toast.success(data.planId ? 'Member added and payment recorded' : 'Member added successfully')
        onClose()
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  const onFormSubmit = (e: React.FormEvent) => {
    if (step === 1) {
      e.preventDefault()
      handleNextStep()
    } else {
      handleSubmit(onSubmit)(e)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-card/75 backdrop-blur-[4px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      
      {createdMember ? (
        <div className="w-full max-w-[400px] overflow-hidden rounded-3xl bg-card border border-border shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="h-1 w-full bg-emerald-500/20" />
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <CheckCircle size={28} className="text-emerald-500" strokeWidth={2} />
              </div>
              <p className="text-[17px] font-semibold text-foreground" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.01em' }}>
                Member Added!
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                Share these login details with <span className="text-foreground font-medium">{createdMember.name}</span>
              </p>
            </div>

            <div className="h-px bg-muted" />

            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-muted-foreground">📱 Phone</span>
                <span className="text-[14px] font-mono font-medium text-foreground">{createdMember.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-muted-foreground">🔑 Temp Password</span>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-mono font-bold text-emerald-500">
                    {createdMember.tempPassword}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdMember.tempPassword)
                      toast.success('Password copied!')
                    }}
                    className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <div className="pt-2 border-t border-black/10 dark:border-white/10">
                <p className="text-[11px] text-muted-foreground">
                  Member must change this password on first login.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                <Smartphone size={14} />
              </div>
              <p className="text-[12.5px] text-emerald-600 dark:text-emerald-400 font-medium leading-snug">
                Login link has been sent to {createdMember.phone} via WhatsApp
              </p>
            </div>

            <div className="flex gap-3 pt-2 sm:justify-end">
              <button
                onClick={() => {
                  setCreatedMember(null)
                  reset()
                  setStep(1)
                  setPlanAmount(0)
                  setValue('planStartDate', toDateInputValue(new Date()))
                }}
                className="h-11 flex-1 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[13px] font-medium text-foreground transition-all sm:flex-none px-4"
              >
                Add Another
              </button>
              <button
                onClick={onClose}
                className="h-11 flex-1 border-0 text-[13px] font-medium transition-all sm:flex-none px-6 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full max-w-2xl max-h-full flex flex-col overflow-hidden rounded-3xl bg-card border border-border shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
          
          <div className="flex items-center justify-between border-b border-border px-5 sm:px-6 py-4 bg-card shrink-0">
            <div>
              <h2 className="text-[18px] font-bold tracking-tight text-foreground sm:text-[20px]" style={{ fontFamily: "'Syne', sans-serif" }}>
                Add Member
              </h2>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">
                {step === 1 ? 'Step 1 of 2: Personal Details' : 'Step 2 of 2: Assign Plan (Optional)'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          <form id="new-member-form" onSubmit={onFormSubmit} className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
            
            {step === 1 ? (
              <>
                <Section icon={User} title="Personal Information">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Full Name *" error={errors.name?.message}>
                      <input className={inputCls} placeholder="Ravi Kumar" {...register('name')} />
                    </Field>
                    <Field label="Phone *" error={errors.phone?.message}>
                      <input className={inputCls} placeholder="9876543210" type="tel" {...register('phone')} />
                    </Field>
                    <Field label="Email" error={errors.email?.message}>
                      <input className={inputCls} placeholder="ravi@example.com" type="email" {...register('email')} />
                    </Field>
                    <Field label="Gender">
                      <select className={selectCls} {...register('gender')}>
                        <option value="" style={{ background: 'var(--background)' }}>Select gender</option>
                        <option value="MALE"   style={{ background: 'var(--background)' }}>Male</option>
                        <option value="FEMALE" style={{ background: 'var(--background)' }}>Female</option>
                        <option value="OTHER"  style={{ background: 'var(--background)' }}>Other</option>
                      </select>
                    </Field>
                    <Field label="Date of Birth">
                      <input className={inputCls} type="date" style={{ colorScheme: 'dark' }} {...register('dateOfBirth')} />
                    </Field>
                  </div>
                  <div className="mt-4">
                    <Field label="Address">
                      <input className={inputCls} placeholder="Chennai, Tamil Nadu" {...register('address')} />
                    </Field>
                  </div>
                </Section>

                <Section icon={StickyNote} title="Notes">
                  <Field label="Staff Notes">
                    <textarea
                      className={`${inputCls} min-h-[80px] resize-none`}
                      placeholder="Health conditions, goals, preferences..."
                      {...register('notes')}
                    />
                  </Field>
                </Section>
              </>
            ) : (
              <div className="space-y-6">
                <Section icon={Dumbbell} title="Select Plan">
                  <div className="space-y-4">
                    <Field label="Membership Plan" error={errors.planId?.message}>
                      <select
                        className={selectCls}
                        {...register('planId')}
                        onChange={e => { register('planId').onChange(e); handlePlanChange(e.target.value) }}
                      >
                        <option value="" style={{ background: 'var(--background)' }}>— Select a plan or leave empty to skip —</option>
                        {plans.map(plan => (
                          <option key={plan.id} value={plan.id} style={{ background: 'var(--background)' }}>
                            {plan.name}  •  ₹{(plan.price / 100).toLocaleString('en-IN')}  •  {plan.durationDays} days
                          </option>
                        ))}
                      </select>
                    </Field>
                    
                    {planAmount > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Amount Collected Today (₹)" error={errors.paidAmount?.message}>
                          <input
                            className={inputCls}
                            type="number" inputMode="numeric"
                            placeholder={netDue > 0 ? netDue.toString() : '0'}
                            min={0} max={netDue || undefined}
                            {...register('paidAmount')}
                          />
                        </Field>

                        <Field label="Payment Method" error={errors.paymentMethod?.message}>
                          <select className={selectCls} {...register('paymentMethod')}>
                            <option value="" style={{ background: 'var(--background)' }}>Select method</option>
                            {PAYMENT_METHODS.map(m => (
                              <option key={m.value} value={m.value} style={{ background: 'var(--background)' }}>{m.label}</option>
                            ))}
                          </select>
                        </Field>
                      </div>
                    )}
                    
                    {planAmount > 0 && (
                      <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 ${statusCfg.bg} ${statusCfg.border}`}>
                        <StatusIcon size={16} className={statusCfg.color} />
                        <div>
                          <p className={`text-[13px] font-semibold ${statusCfg.color}`}>
                            {paymentStatus === 'PAID'    && 'Fully Paid ✓'}
                            {paymentStatus === 'PARTIAL' && `Partial Payment — ₹${pending} still due`}
                            {paymentStatus === 'PENDING' && 'Nothing paid — member will be marked as Inactive'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {planAmount > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <Field label="Membership Start Date">
                          <input className={inputCls} type="date" style={{ colorScheme: 'dark' }} {...register('planStartDate')} />
                        </Field>
                        {expiryPreview && (
                          <div className="flex flex-col justify-end pb-1.5">
                            <span className="text-[12px] text-muted-foreground">Expires on: <span className="font-semibold text-[#4ade80]">{expiryPreview}</span></span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hidden advanced fields for compatibility with existing schema */}
                    <input type="hidden" {...register('discount')} />
                    <input type="hidden" {...register('additionalFee')} />
                  </div>
                </Section>
              </div>
            )}
          </form>

          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-border bg-card shrink-0">
            {step === 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl border border-border bg-background px-6 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 h-11 rounded-xl border border-border bg-background px-6 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
            
            {step === 1 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 h-11 px-6 text-[13px] font-medium text-foreground transition-all duration-150 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground"
              >
                Next: Assign Plan <ChevronRight size={16} />
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setValue('planId', '');
                    setValue('paidAmount', '');
                    setValue('paymentMethod', '');
                    handleSubmit(onSubmit)();
                  }}
                  disabled={loading}
                  className="flex h-11 items-center justify-center px-6 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground rounded-xl border border-border bg-background"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  form="new-member-form"
                  disabled={loading}
                  className="flex h-11 items-center justify-center gap-2 px-6 text-[13px] font-medium text-foreground transition-all duration-150 disabled:opacity-60 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Saving...' : 'Add Plan & Payment'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}