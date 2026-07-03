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

// ─── Schema & Types ──────────────────────────────────────────────────────────
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

// ─── Helpers & Styles ────────────────────────────────────────────────────────
const toDateInputValue = (d: Date) => d.toISOString().split('T')[0]

const STATUS_CONFIG = {
  PAID:    { label: 'Fully Paid',  color: 'text-[#4ade80]', bg: 'bg-[#22c55e15]', border: 'border-[#22c55e30]', icon: CheckCircle },
  PARTIAL: { label: 'Partial',     color: 'text-[#fbbf24]', bg: 'bg-[#f59e0b15]', border: 'border-[#f59e0b30]', icon: AlertCircle },
  PENDING: { label: 'Pending',     color: 'text-[#f87171]', bg: 'bg-[#ef444415]', border: 'border-[#ef444430]', icon: Clock       },
}

const inputCls = `
  w-full rounded-xl border border-[#ffffff0a] bg-[#0f0f0f]
  px-3 py-2.5 text-[13px] text-foreground placeholder:text-[#3d3d52]
  focus:border-[#7c3aed44] focus:shadow-[0_0_0_3px_#7c3aed12] focus:outline-none transition-all
`
const selectCls = `
  w-full rounded-xl border border-[#ffffff0a] bg-[#0f0f0f]
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
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7c3aed15] border border-[#7c3aed25] text-[#a855f7]">
          <Icon size={15} />
        </div>
        <p className="text-[14px] font-semibold text-foreground">{title}</p>
      </div>
      {children}
    </div>
  )
}

// ─── Main Modal Component ────────────────────────────────────────────────────
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

  // Reset form when modal closes or opens
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
    enabled: isOpen // Only fetch when modal is open
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/75 backdrop-blur-[4px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* ── Success View ─────────────────────────────────────────────── */}
      {createdMember ? (
        <div className="w-full max-w-[400px] overflow-hidden rounded-3xl bg-card border border-border shadow-[0_24px_64px_#00000080,0_0_0_1px_#ffffff05] animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="h-1 w-full bg-gradient-to-r from-[#10b981] to-[#34d399]" />
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#10b98115] border border-[#10b98125]">
                <CheckCircle size={22} className="text-[#10b981]" strokeWidth={2} />
              </div>
              <p className="text-[17px] font-semibold text-foreground" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.01em' }}>
                Member Added!
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                Share these login details with <span className="text-foreground font-medium">{createdMember.name}</span>
              </p>
            </div>

            <div className="h-px bg-[#ffffff0a]" />

            <div className="rounded-xl border border-[#ffffff0a] bg-[#0f0f0f] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-muted-foreground">📱 Phone</span>
                <span className="text-[13px] font-mono font-medium text-foreground">{createdMember.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-muted-foreground">🔑 Temp Password</span>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-mono font-semibold text-violet-300">
                    {createdMember.tempPassword}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdMember.tempPassword)
                      toast.success('Password copied!')
                    }}
                    className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-[#ffffff0a] transition-colors"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>
              <div className="pt-1 border-t border-border">
                <p className="text-[11px] text-muted-foreground">
                  Member must change this password on first login.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#7c3aed25] bg-[#7c3aed10] px-4 py-3">
              <p className="text-[12.5px] text-violet-300">
                ✅ Login link sent to {createdMember.phone} via WhatsApp
              </p>
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
                className="h-10 flex-1 rounded-xl border border-[#ffffff0f] bg-[#ffffff08] hover:bg-[#ffffff12] text-[13px] font-medium text-[#9898b0] hover:text-foreground transition-all sm:flex-none px-4"
              >
                Add Another
              </button>
              <button
                onClick={onClose}
                className="h-10 flex-1 rounded-xl border-0 bg-gradient-to-br from-[#10b981] to-[#059669] shadow-[0_4px_16px_#10b98128] hover:shadow-[0_6px_20px_#10b98148] hover:-translate-y-[1px] text-[13px] font-medium text-foreground transition-all sm:flex-none px-6"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : (
      
      /* ── Main Form View ────────────────────────────────────────────── */
        <div className="relative w-full max-w-2xl max-h-full flex flex-col overflow-hidden rounded-3xl bg-card border border-border shadow-[0_24px_64px_#00000080,0_0_0_1px_#ffffff05] animate-in fade-in-0 zoom-in-95 duration-150">
          
          {/* Header (Sticky) */}
          <div className="flex items-center justify-between border-b border-border px-5 sm:px-6 py-4 bg-card shrink-0">
            <div>
              <h2 className="text-[18px] font-bold tracking-tight text-foreground sm:text-[20px]" style={{ fontFamily: "'Syne', sans-serif" }}>
                Add Member
              </h2>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">Register a new gym member</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ffffff0a] bg-[#0f0f0f] text-[#9898b0] transition-colors hover:bg-[#ffffff05] hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable Form Content */}
          <form id="new-member-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
            
            {/* Personal Info */}
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
                    <option value="" style={{ background: '#0f0f0f' }}>Select gender</option>
                    <option value="MALE"   style={{ background: '#0f0f0f' }}>Male</option>
                    <option value="FEMALE" style={{ background: '#0f0f0f' }}>Female</option>
                    <option value="OTHER"  style={{ background: '#0f0f0f' }}>Other</option>
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

            {/* Notes */}
            <Section icon={StickyNote} title="Notes">
              <Field label="Staff Notes">
                <textarea
                  className={`${inputCls} min-h-[80px] resize-none`}
                  placeholder="Health conditions, goals, preferences..."
                  {...register('notes')}
                />
              </Field>
            </Section>

            {/* Membership & Payment */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
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
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[#ffffff03] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7c3aed15] border border-[#7c3aed25] text-[#a855f7]">
                    <Dumbbell size={15} />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">Membership Plan & Payment</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                      {addPayment ? 'Will be saved when you click Add Member' : 'Tap to assign a plan now'}
                    </p>
                  </div>
                </div>
                <div className={`flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 h-8 text-[12px] font-medium transition-all ${
                  addPayment
                    ? 'bg-[#7c3aed1a] text-violet-300 border border-[#7c3aed30]'
                    : 'bg-[#ffffff05] text-[#9898b0] border border-[#ffffff0a]'
                }`}>
                  {addPayment ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  {addPayment ? 'Hide' : 'Add Plan'}
                </div>
              </button>

              {addPayment && (
                <div className="border-t border-border p-5 space-y-6">
                  {/* Step 1: Plan */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7c3aed20] text-[10px] font-bold text-violet-300">1</span>
                      <span className="text-[12px] font-semibold text-[#9898b0] uppercase tracking-wide">Choose Plan</span>
                    </div>
                    <select
                      className={selectCls}
                      {...register('planId')}
                      onChange={e => { register('planId').onChange(e); handlePlanChange(e.target.value) }}
                    >
                      <option value="" style={{ background: '#0f0f0f' }}>— Select a membership plan —</option>
                      {plans.map(plan => (
                        <option key={plan.id} value={plan.id} style={{ background: '#0f0f0f' }}>
                          {plan.name}  •  ₹{(plan.price / 100).toLocaleString('en-IN')}  •  {plan.durationDays} days
                        </option>
                      ))}
                    </select>
                    {errors.planId && <p className="text-[11px] text-[#f87171]">{errors.planId.message}</p>}
                    {plans.length === 0 && (
                      <p className="text-[12px] text-muted-foreground">
                        No plans found. Please create a plan first.
                      </p>
                    )}
                    {planAmount > 0 && (
                      <div className="flex items-center justify-between rounded-xl border border-[#7c3aed30] bg-[#7c3aed10] px-4 py-3">
                        <div>
                          <p className="text-[13px] font-semibold text-foreground">{plans.find(p => p.id === planId)?.name}</p>
                          <p className="text-[12px] text-muted-foreground mt-0.5">{plans.find(p => p.id === planId)?.durationDays} days membership</p>
                        </div>
                        <p className="text-[18px] font-bold text-violet-300">₹{planAmount}</p>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Adjust Amount */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7c3aed20] text-[10px] font-bold text-violet-300">2</span>
                      <span className="text-[12px] font-semibold text-[#9898b0] uppercase tracking-wide">Adjust Amount</span>
                      <span className="text-[11px] text-[#3d3d52]">(optional)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-medium text-muted-foreground">Discount (₹)</label>
                        <input
                          className={inputCls} type="number" inputMode="numeric" placeholder="0" min={0}
                          {...register('discount')}
                          onChange={e => { register('discount').onChange(e); handleDiscountChange(e.target.value) }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-medium text-muted-foreground">Extra Charge (₹)</label>
                        <input
                          className={inputCls} type="number" inputMode="numeric" placeholder="0" min={0}
                          {...register('additionalFee')}
                          onChange={e => { register('additionalFee').onChange(e); handleAdditionalFeeChange(e.target.value) }}
                        />
                      </div>
                    </div>
                    {planAmount > 0 && (
                      <div className="rounded-xl border border-[#ffffff0a] bg-[#ffffff03] p-3 space-y-2 mt-2">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-muted-foreground">Plan price</span>
                          <span className="text-foreground">₹{planAmount}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="text-muted-foreground">Discount</span>
                            <span className="text-[#4ade80]">− ₹{discount}</span>
                          </div>
                        )}
                        {additionalFee > 0 && (
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="text-muted-foreground">Extra charge</span>
                            <span className="text-[#fbbf24]">+ ₹{additionalFee}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between border-t border-[#ffffff0a] pt-2">
                          <span className="text-[13px] font-semibold text-foreground">Total to collect</span>
                          <span className="text-[16px] font-bold text-foreground">₹{netDue}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 3: Amount Collected */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7c3aed20] text-[10px] font-bold text-violet-300">3</span>
                      <span className="text-[12px] font-semibold text-[#9898b0] uppercase tracking-wide">Amount Collected Today</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-muted-foreground">₹</span>
                        <input
                          className={`${inputCls} pl-7 text-[16px] font-semibold`}
                          type="number" inputMode="numeric"
                          placeholder={netDue > 0 ? netDue.toString() : '0'}
                          min={0} max={netDue || undefined}
                          {...register('paidAmount')}
                        />
                      </div>
                      {errors.paidAmount && <p className="text-[11px] text-[#f87171]">{errors.paidAmount.message}</p>}
                    </div>
                    {planAmount > 0 && (
                      <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 ${statusCfg.bg} ${statusCfg.border}`}>
                        <StatusIcon size={16} className={statusCfg.color} />
                        <div>
                          <p className={`text-[13px] font-semibold ${statusCfg.color}`}>
                            {paymentStatus === 'PAID'    && 'Fully Paid ✓'}
                            {paymentStatus === 'PARTIAL' && `Partial — ₹${pending} still due`}
                            {paymentStatus === 'PENDING' && 'Nothing paid — member will be Inactive'}
                          </p>
                          {paymentStatus === 'PARTIAL' && paidAmount > 0 && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">You can collect the rest later from Payments</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 4: Start Date */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7c3aed20] text-[10px] font-bold text-violet-300">4</span>
                      <span className="text-[12px] font-semibold text-[#9898b0] uppercase tracking-wide">Membership Start Date</span>
                    </div>
                    <input className={inputCls} type="date" style={{ colorScheme: 'dark' }} {...register('planStartDate')} />
                    {expiryPreview && (
                      <div className="flex items-center justify-between rounded-xl border border-[#22c55e30] bg-[#22c55e15] px-4 py-2.5">
                        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                          <CalendarDays size={13} className="text-[#4ade80]" />
                          Membership expires on
                        </div>
                        <span className="text-[13px] font-semibold text-[#4ade80]">{expiryPreview}</span>
                      </div>
                    )}
                  </div>

                  {/* Step 5: Payment Method */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7c3aed20] text-[10px] font-bold text-violet-300">5</span>
                      <span className="text-[12px] font-semibold text-[#9898b0] uppercase tracking-wide">How Did They Pay?</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {PAYMENT_METHODS.map(m => {
                        const selected = watch('paymentMethod') === m.value
                        const icons: Record<string, React.ReactNode> = {
                          CASH: <Wallet size={14} />,
                          UPI:  <Smartphone size={14} />,
                          CARD: <CreditCard size={14} />,
                        }
                        return (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => setValue('paymentMethod', m.value)}
                            className={`flex items-center justify-center gap-2.5 h-12 rounded-xl border text-[13px] font-medium transition-all ${
                              selected
                                ? 'border-[#7c3aed50] bg-[#7c3aed20] text-violet-300 shadow-[0_0_0_3px_#7c3aed12]'
                                : 'border-[#ffffff0a] bg-[#0f0f0f] text-[#9898b0] hover:bg-[#ffffff05]'
                            }`}
                          >
                            <span className={selected ? 'text-violet-400' : 'text-muted-foreground'}>
                              {icons[m.value] ?? <Wallet size={14} />}
                            </span>
                            {m.label}
                          </button>
                        )
                      })}
                    </div>
                    {errors.paymentMethod && <p className="text-[11px] text-[#f87171]">{errors.paymentMethod.message}</p>}
                  </div>

                  {/* Payment notes */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[12px] font-medium text-muted-foreground">
                      Notes <span className="text-[#3d3d52]">(optional)</span>
                    </label>
                    <input className={inputCls} placeholder="e.g. Paid via GPay, receipt #123" {...register('paymentNotes')} />
                  </div>

                </div>
              )}
            </div>
          </form>

          {/* Footer Actions (Sticky) */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-border bg-card shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto h-11 rounded-xl border border-[#ffffff0a] bg-[#0f0f0f] px-6 text-[13px] font-medium text-[#9898b0] transition-colors hover:bg-[#ffffff08] hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="new-member-form"
              disabled={loading}
              className="flex w-full sm:w-auto h-11 items-center justify-center gap-2 rounded-xl px-6 text-[13px] font-medium text-foreground transition-all duration-150 disabled:opacity-60 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] shadow-[0_4px_20px_#7c3aed30] hover:shadow-[0_4px_28px_#7c3aed55] hover:-translate-y-[1px]"
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