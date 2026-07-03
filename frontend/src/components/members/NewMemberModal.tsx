'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/src/lib/api'
import { Plan } from '@/src/types'
import { toast } from 'sonner'
import {
  Loader2, User, StickyNote, Dumbbell, ChevronDown, ChevronUp,
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
  PAID:    { label: 'Fully Paid',  color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
  PARTIAL: { label: 'Partial',     color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertCircle },
  PENDING: { label: 'Pending',     color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: Clock       },
}

const inputCls = `
  w-full rounded-xl border border-border-subtle bg-surface-base
  px-4 py-2.5 text-sm text-white placeholder:text-zinc-500
  focus:border-ember-500/50 focus:ring-2 focus:ring-ember-500/50 focus:outline-none transition-all
`
const selectCls = `
  w-full rounded-xl border border-border-subtle bg-surface-base
  px-4 py-2.5 text-sm text-white
  focus:border-ember-500/50 focus:ring-2 focus:ring-ember-500/50 focus:outline-none transition-all
  appearance-none cursor-pointer
`

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      {children}
      {error && <p className="text-[11px] text-rose-400">{error}</p>}
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-base border border-border-strong text-zinc-300">
          <Icon size={16} />
        </div>
        <p className="text-[14px] font-semibold text-white">{title}</p>
      </div>
      {children}
    </div>
  )
}

export default function NewMemberModal({ isOpen, onClose }: NewMemberModalProps) {
  const queryClient  = useQueryClient()
  const [loading,        setLoading]        = useState(false)
  const [addPayment,     setAddPayment]     = useState(true)
  const [planAmount,     setPlanAmount]     = useState(0)
  const [createdMember,  setCreatedMember]  = useState<{
    name:         string
    phone:        string
    tempPassword: string
    loginUrl:     string
  } | null>(null)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
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
      setAddPayment(true)
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

      if (addPayment && data.planId && data.paymentMethod && memberId) {
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
        toast.success(addPayment && data.planId ? 'Member added and payment recorded' : 'Member added successfully')
        onClose()
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 font-sans">
      
      {createdMember ? (
        <div className="w-full max-w-[400px] overflow-hidden rounded-2xl bg-surface-popover border border-border-strong shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle size={22} className="text-emerald-500" strokeWidth={2} />
              </div>
              <p className="text-[18px] font-semibold text-white tracking-tight">
                Member Added!
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                Share these login details with <span className="text-white font-medium">{createdMember.name}</span>
              </p>
            </div>

            <div className="h-px bg-border-subtle" />

            <div className="rounded-xl border border-border-subtle bg-surface-base p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">📱 Phone</span>
                <span className="text-sm font-mono font-medium text-white">{createdMember.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">🔑 Temp Password</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold text-white">
                    {createdMember.tempPassword}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdMember.tempPassword)
                      toast.success('Password copied!')
                    }}
                    className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <div className="pt-2 border-t border-border-subtle">
                <p className="text-xs text-zinc-500">
                  Member must change this password on first login.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2 sm:justify-end">
              <button
                onClick={() => {
                  setCreatedMember(null)
                  reset()
                  setAddPayment(true)
                  setPlanAmount(0)
                  setValue('planStartDate', toDateInputValue(new Date()))
                }}
                className="h-10 flex-1 rounded-xl border border-border-strong bg-surface-raised hover:bg-white/5 text-sm font-medium text-zinc-300 hover:text-white transition-all sm:flex-none px-4"
              >
                Add Another
              </button>
              <button
                onClick={onClose}
                className="h-10 flex-1 rounded-xl border-0 bg-ember-500 hover:bg-ember-600 text-sm font-medium text-white transition-all sm:flex-none px-6"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full max-w-2xl max-h-full flex flex-col overflow-hidden rounded-2xl bg-surface-popover border border-border-strong shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
          
          <div className="flex items-center justify-between border-b border-border-subtle px-5 sm:px-6 py-4 bg-surface-popover shrink-0">
            <div>
              <h2 className="text-[18px] font-semibold tracking-tight text-white">
                Add Member
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Register a new gym member</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <form id="new-member-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5 bg-surface-base">
            
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
                    <option value="" className="bg-surface-base">Select gender</option>
                    <option value="MALE"   className="bg-surface-base">Male</option>
                    <option value="FEMALE" className="bg-surface-base">Female</option>
                    <option value="OTHER"  className="bg-surface-base">Other</option>
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

            <div className="rounded-2xl border border-border-subtle bg-surface-raised overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setAddPayment(p => !p)
                  if (addPayment) {
                    setValue('planId', '')
                    setValue('discount', '0')
                    setValue('additionalFee', '0')
                    setValue('paidAmount', '')
                    setValue('paymentMethod', '')
                    setValue('paymentNotes', '')
                    setPlanAmount(0)
                  }
                }}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-base border border-border-strong text-zinc-300">
                    <Dumbbell size={16} />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-white">Membership Plan & Payment</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {addPayment ? 'Will be saved when you click Add Member' : 'Tap to assign a plan now'}
                    </p>
                  </div>
                </div>
                <div className={`flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 h-8 text-xs font-medium transition-colors ${
                  addPayment
                    ? 'bg-ember-500/10 text-ember-400 border border-ember-500/20'
                    : 'bg-surface-base text-zinc-400 border border-border-strong'
                }`}>
                  {addPayment ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {addPayment ? 'Hide' : 'Add Plan'}
                </div>
              </button>

              {addPayment && (
                <div className="border-t border-border-subtle p-5 space-y-6">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-base border border-border-strong text-[10px] font-bold text-zinc-300">1</span>
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Choose Plan</span>
                    </div>
                    <select
                      className={selectCls}
                      {...register('planId')}
                      onChange={e => { register('planId').onChange(e); handlePlanChange(e.target.value) }}
                    >
                      <option value="" className="bg-surface-base">— Select a membership plan —</option>
                      {plans.map(plan => (
                        <option key={plan.id} value={plan.id} className="bg-surface-base">
                          {plan.name}  •  ₹{(plan.price / 100).toLocaleString('en-IN')}  •  {plan.durationDays} days
                        </option>
                      ))}
                    </select>
                    {errors.planId && <p className="text-[11px] text-rose-400">{errors.planId.message}</p>}
                    {plans.length === 0 && (
                      <p className="text-xs text-zinc-500">
                        No plans found. Please create a plan first.
                      </p>
                    )}
                    {planAmount > 0 && (
                      <div className="flex items-center justify-between rounded-xl border border-border-strong bg-surface-base px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{plans.find(p => p.id === planId)?.name}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{plans.find(p => p.id === planId)?.durationDays} days membership</p>
                        </div>
                        <p className="text-[18px] font-bold text-white">₹{planAmount}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-base border border-border-strong text-[10px] font-bold text-zinc-300">2</span>
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Adjust Amount</span>
                      <span className="text-[11px] text-zinc-500">(optional)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400">Discount (₹)</label>
                        <input
                          className={inputCls} type="number" inputMode="numeric" placeholder="0" min={0}
                          {...register('discount')}
                          onChange={e => { register('discount').onChange(e); handleDiscountChange(e.target.value) }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400">Extra Charge (₹)</label>
                        <input
                          className={inputCls} type="number" inputMode="numeric" placeholder="0" min={0}
                          {...register('additionalFee')}
                          onChange={e => { register('additionalFee').onChange(e); handleAdditionalFeeChange(e.target.value) }}
                        />
                      </div>
                    </div>
                    {planAmount > 0 && (
                      <div className="rounded-xl border border-border-subtle bg-surface-base p-3 space-y-2 mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-400">Plan price</span>
                          <span className="text-white font-medium">₹{planAmount}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Discount</span>
                            <span className="text-emerald-400 font-medium">− ₹{discount}</span>
                          </div>
                        )}
                        {additionalFee > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Extra charge</span>
                            <span className="text-amber-400 font-medium">+ ₹{additionalFee}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between border-t border-border-subtle pt-2 mt-2">
                          <span className="text-sm font-semibold text-white">Total to collect</span>
                          <span className="text-base font-bold text-white">₹{netDue}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-base border border-border-strong text-[10px] font-bold text-zinc-300">3</span>
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Amount Collected Today</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-zinc-500">₹</span>
                        <input
                          className={`${inputCls} pl-7 text-[16px] font-semibold`}
                          type="number" inputMode="numeric"
                          placeholder={netDue > 0 ? netDue.toString() : '0'}
                          min={0} max={netDue || undefined}
                          {...register('paidAmount')}
                        />
                      </div>
                      {errors.paidAmount && <p className="text-[11px] text-rose-400">{errors.paidAmount.message}</p>}
                    </div>
                    {planAmount > 0 && (
                      <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 ${statusCfg.bg} ${statusCfg.border}`}>
                        <StatusIcon size={16} className={statusCfg.color} />
                        <div>
                          <p className={`text-sm font-semibold ${statusCfg.color}`}>
                            {paymentStatus === 'PAID'    && 'Fully Paid ✓'}
                            {paymentStatus === 'PARTIAL' && `Partial — ₹${pending} still due`}
                            {paymentStatus === 'PENDING' && 'Nothing paid — member will be Inactive'}
                          </p>
                          {paymentStatus === 'PARTIAL' && paidAmount > 0 && (
                            <p className="text-[11px] text-zinc-400 mt-0.5">You can collect the rest later from Payments</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-base border border-border-strong text-[10px] font-bold text-zinc-300">4</span>
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Membership Start Date</span>
                    </div>
                    <input className={inputCls} type="date" style={{ colorScheme: 'dark' }} {...register('planStartDate')} />
                    {expiryPreview && (
                      <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5">
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <CalendarDays size={14} className="text-emerald-400" />
                          Membership expires on
                        </div>
                        <span className="text-sm font-semibold text-emerald-400">{expiryPreview}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-base border border-border-strong text-[10px] font-bold text-zinc-300">5</span>
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">How Did They Pay?</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {PAYMENT_METHODS.map(m => {
                        const selected = watch('paymentMethod') === m.value
                        const icons: Record<string, React.ReactNode> = {
                          CASH: <Wallet size={16} />,
                          UPI:  <Smartphone size={16} />,
                          CARD: <CreditCard size={16} />,
                        }
                        return (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => setValue('paymentMethod', m.value)}
                            className={`flex items-center justify-center gap-2.5 h-12 rounded-xl border text-sm font-medium transition-all ${
                              selected
                                ? 'border-ember-500 bg-ember-500/10 text-ember-400'
                                : 'border-border-subtle bg-surface-base text-zinc-400 hover:bg-white/5 hover:text-zinc-300'
                            }`}
                          >
                            <span className={selected ? 'text-ember-400' : 'text-zinc-500'}>
                              {icons[m.value] ?? <Wallet size={16} />}
                            </span>
                            {m.label}
                          </button>
                        )
                      })}
                    </div>
                    {errors.paymentMethod && <p className="text-[11px] text-rose-400">{errors.paymentMethod.message}</p>}
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-medium text-zinc-400">
                      Notes <span className="text-zinc-500">(optional)</span>
                    </label>
                    <input className={inputCls} placeholder="e.g. Paid via GPay, receipt #123" {...register('paymentNotes')} />
                  </div>

                </div>
              )}
            </div>
          </form>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-border-subtle bg-surface-popover shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto h-10 rounded-xl border border-border-strong bg-surface-base px-6 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="new-member-form"
              disabled={loading}
              className="flex w-full sm:w-auto h-10 items-center justify-center gap-2 rounded-xl px-6 text-sm font-medium text-white transition-colors disabled:opacity-60 bg-ember-500 hover:bg-ember-600"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Saving...' : addPayment && planId ? 'Add Member & Record Payment' : 'Add Member'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}