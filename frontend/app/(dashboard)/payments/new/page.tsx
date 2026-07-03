'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'

import api from '@/src/lib/api'
import PageHeader from '@/src/components/shared/PageHeader'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage
} from '@/components/ui/form'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'

import {
  ArrowLeft, Loader2, IndianRupee,
  Wallet, CreditCard, Smartphone,
  AlertCircle, CheckCircle, Clock, CalendarDays, Lock, PlusCircle
} from 'lucide-react'

import { toast } from 'sonner'
import { Plan, Member } from '@/src/types'
import { PAYMENT_METHODS } from '@/src/constants'

// ─── Schema ───────────────────────────────────────────
const paymentSchema = z.object({
  memberId: z.string().min(1, 'Select a member'),
  planId: z.string().min(1, 'Select a plan'),
  discount: z.string(),
  additionalFee: z.string(),
  paidAmount: z.string().min(1, 'Paid amount required'),
  paymentMethod: z.string().min(1, 'Select payment method'),
  planStartDate: z.string().optional(),
  notes: z.string().optional()
})

type PaymentForm = z.infer<typeof paymentSchema>

// ─── Status config ─────────────────────────────────────
const STATUS_CONFIG = {
  PAID:    { label: 'Fully Paid', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
  PARTIAL: { label: 'Partial',    color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: AlertCircle },
  PENDING: { label: 'Pending',    color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  icon: Clock       },
}

const toDateInputValue = (d: Date) => d.toISOString().split('T')[0]

export default function NewPaymentPage() {
  const router      = useRouter()
  const queryClient = useQueryClient()

  const [loading,     setLoading]     = useState(false)
  const [plans,       setPlans]       = useState<Plan[]>([])
  const [planAmount,  setPlanAmount]  = useState(0)

  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      memberId:      '',
      planId:        '',
      discount:      '0',
      additionalFee: '0',
      paidAmount:    '',
      paymentMethod: '',
      planStartDate: toDateInputValue(new Date()),
      notes:         ''
    }
  })

  const [memberSearch,       setMemberSearch]       = useState('')
  const [memberResults,      setMemberResults]      = useState<Member[]>([])
  const [selectedMember,     setSelectedMember]     = useState<Member | null>(null)
  const [memberSearching,    setMemberSearching]    = useState(false)
  const [showMemberDropdown, setShowMemberDropdown] = useState(false)

  // ─── Fetch plans ──────────────────────────────────
  useEffect(() => {
    api.get('/api/plans')
      .then(r => setPlans(r.data?.data || []))
      .catch(() => toast.error('Failed to load plans'))
  }, [])

  // ─── Member search ────────────────────────────────
  useEffect(() => {
    if (!memberSearch || memberSearch.length < 2) {
      setMemberResults([])
      setShowMemberDropdown(false)
      return
    }
    const t = setTimeout(async () => {
      setMemberSearching(true)
      try {
        const res = await api.get(`/api/members?search=${memberSearch}&limit=10`)
        setMemberResults(res.data?.data?.members || [])
        setShowMemberDropdown(true)
      } catch {
        toast.error('Failed to search members')
      } finally {
        setMemberSearching(false)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [memberSearch])

  // ─── Plan change ──────────────────────────────────
  const handlePlanChange = (planId: string) => {
    const plan = plans.find(p => p.id === planId)
    if (plan) {
      const priceInRupees = plan.price / 100
      setPlanAmount(priceInRupees)
      form.setValue('discount',      '0')
      form.setValue('additionalFee', '0')
      form.setValue('paidAmount',    priceInRupees.toString())
    } else {
      setPlanAmount(0)
      form.setValue('discount',      '0')
      form.setValue('additionalFee', '0')
      form.setValue('paidAmount',    '')
    }
  }

  // ─── Sync paidAmount when netDue changes ──────────
  const syncPaidAmount = (newDiscount: number, newAdditionalFee: number, prevNetDue: number) => {
    const currentPaid = Number(form.getValues('paidAmount') || 0)
    if (currentPaid === prevNetDue) {
      const newNet = Math.max(0, planAmount - newDiscount + newAdditionalFee)
      form.setValue('paidAmount', newNet.toString())
    }
  }

  const handleDiscountChange = (val: string) => {
    const oldDiscount   = Number(form.getValues('discount')      || 0)
    const additionalFee = Number(form.getValues('additionalFee') || 0)
    const prevNetDue    = Math.max(0, planAmount - oldDiscount + additionalFee)
    syncPaidAmount(Number(val || 0), additionalFee, prevNetDue)
  }

  const handleAdditionalFeeChange = (val: string) => {
    const discount = Number(form.getValues('discount')      || 0)
    const oldFee   = Number(form.getValues('additionalFee') || 0)
    const prevNetDue = Math.max(0, planAmount - discount + oldFee)
    syncPaidAmount(discount, Number(val || 0), prevNetDue)
  }

  // ─── Derived values ───────────────────────────────
  const discount      = Number(form.watch('discount')      || 0)
  const additionalFee = Number(form.watch('additionalFee') || 0)
  const paidAmount    = Number(form.watch('paidAmount')    || 0)
  const planStartDate = form.watch('planStartDate')

  const netDue  = Math.max(0, planAmount - discount + additionalFee)
  const pending = Math.max(0, netDue - paidAmount)

  const paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING' =
    paidAmount <= 0     ? 'PENDING' :
    paidAmount < netDue ? 'PARTIAL' : 'PAID'

  const statusCfg  = STATUS_CONFIG[paymentStatus]
  const StatusIcon = statusCfg.icon

  // ─── Expiry preview ───────────────────────────────
  const expiryPreview = (() => {
    const planId = form.watch('planId')
    const plan   = plans.find(p => p.id === planId)
    if (!plan || !planStartDate) return null
    const start = new Date(planStartDate)
    start.setHours(0, 0, 0, 0)
    const expiry = new Date(start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000)
    return expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  })()

  // ─── Submit ───────────────────────────────────────
  const onSubmit = async (data: PaymentForm) => {
    setLoading(true)
    try {
      await api.post('/api/payments', {
        memberId:      data.memberId,
        planId:        data.planId,
        discount:      Math.round(Number(data.discount)      * 100),
        additionalFee: Math.round(Number(data.additionalFee) * 100),
        paidAmount:    Math.round(Number(data.paidAmount)    * 100),
        paymentMethod: data.paymentMethod,
        planStartDate: data.planStartDate
          ? new Date(`${data.planStartDate}T00:00:00`).toISOString()
          : undefined,
        notes: data.notes
      })

      // ── Invalidate before redirect so cache is busted
      // by the time the payments page renders ──────────
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['members'] })

      toast.success(
        paymentStatus === 'PARTIAL'
          ? `Partial payment saved — ₹${pending} still pending`
          : 'Payment recorded successfully'
      )
      router.push('/payments')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to record payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Record Payment"
        description="Record a membership payment"
        action={
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-white/[0.08] bg-transparent text-foreground hover:bg-white/[0.05]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

        {/* ── Form ── */}
        <div className="rounded-3xl border border-border bg-background p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* MEMBER */}
              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#d4d4dc]">Member</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <input
                          className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-[13px] text-foreground outline-none placeholder:text-[#3d3d52] transition-all focus:border-violet-500/50"
                          placeholder="Search member by name or phone..."
                          value={selectedMember ? `${selectedMember.name} — ${selectedMember.phone}` : memberSearch}
                          onChange={e => {
                            setMemberSearch(e.target.value)
                            setSelectedMember(null)
                            field.onChange('')
                          }}
                        />
                        {memberSearching && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                        )}

                        {showMemberDropdown && memberResults.length > 0 && (
                          <div
                            className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl shadow-xl"
                            style={{ background: '#0d0d14', border: '1px solid #ffffff0a' }}
                          >
                            {memberResults.map(m => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setSelectedMember(m)
                                  setMemberSearch('')
                                  setShowMemberDropdown(false)
                                  field.onChange(m.id)
                                }}
                                className="w-full border-b border-white/[0.05] px-4 py-3 text-left last:border-0 transition-colors hover:bg-white/[0.05]"
                              >
                                <p className="text-[13px] font-medium text-foreground">{m.name}</p>
                                <p className="text-xs text-muted-foreground">{m.phone} · {m.status}</p>
                              </button>
                            ))}
                          </div>
                        )}

                        {showMemberDropdown && memberResults.length === 0 && !memberSearching && (
                          <div
                            className="absolute z-50 mt-1 w-full rounded-xl px-4 py-3"
                            style={{ background: '#0d0d14', border: '1px solid #ffffff0a' }}
                          >
                            <p className="text-[13px] text-muted-foreground">No members found</p>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PLAN */}
              <FormField
                control={form.control}
                name="planId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#d4d4dc]">Plan</FormLabel>
                    <Select
                      onValueChange={val => { field.onChange(val); handlePlanChange(val) }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 border-white/[0.08] bg-white/[0.03] text-foreground">
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {plans.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} — ₹{p.price / 100}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PLAN AMOUNT + DISCOUNT + ADDITIONAL FEE */}
              <div className="grid gap-4 md:grid-cols-3">

                {/* Plan Amount — read-only */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-[#d4d4dc]">
                    Plan Amount (₹)
                    <Lock size={11} className="text-[#3d3d52]" />
                  </label>
                  <div className="flex h-12 cursor-not-allowed select-none items-center rounded-xl border border-white/[0.05] bg-white/[0.015] px-4 text-[13px]">
                    {planAmount > 0
                      ? <span className="text-muted-foreground">₹{planAmount}</span>
                      : <span className="text-[#3d3d52]">Select a plan first</span>
                    }
                  </div>
                  <p className="text-[11px] text-[#3d3d52]">Fixed by the selected plan</p>
                </div>

                {/* Discount */}
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#d4d4dc]">Discount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          min={0}
                          max={planAmount}
                          {...field}
                          onChange={e => { field.onChange(e); handleDiscountChange(e.target.value) }}
                          className="h-12 border-white/[0.08] bg-white/[0.03] text-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Additional Fee */}
                <FormField
                  control={form.control}
                  name="additionalFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-[#d4d4dc]">
                        <PlusCircle size={13} className="text-amber-400" />
                        Additional Fee (₹)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          min={0}
                          {...field}
                          onChange={e => { field.onChange(e); handleAdditionalFeeChange(e.target.value) }}
                          className="h-12 border-white/[0.08] bg-white/[0.03] text-foreground"
                        />
                      </FormControl>
                      <p className="text-[11px] text-[#3d3d52]">Joining fee, locker, etc.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* PAID AMOUNT */}
              <FormField
                control={form.control}
                name="paidAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between text-[#d4d4dc]">
                      <span>Amount Paid (₹)</span>
                      {netDue > 0 && (
                        <span className="text-[11px] font-normal text-muted-foreground">
                          Net due: ₹{netDue}
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={netDue > 0 ? netDue.toString() : '0'}
                        min={0}
                        max={netDue}
                        {...field}
                        className="h-12 border-white/[0.08] bg-white/[0.03] text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                    {paymentStatus === 'PARTIAL' && paidAmount > 0 && (
                      <p className="flex items-center gap-1.5 text-[12px] text-amber-400">
                        <AlertCircle size={12} />
                        Partial — ₹{pending} will remain as pending dues
                      </p>
                    )}
                    {paymentStatus === 'PENDING' && planAmount > 0 && (
                      <p className="flex items-center gap-1.5 text-[12px] text-orange-400">
                        <Clock size={12} />
                        No payment recorded — membership set to Inactive
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* PLAN START DATE */}
              <FormField
                control={form.control}
                name="planStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between text-[#d4d4dc]">
                      <span className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-violet-400" />
                        Plan Start Date
                      </span>
                      {expiryPreview && (
                        <span className="text-[11px] font-normal text-emerald-400">
                          Expires {expiryPreview}
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <input
                        type="date"
                        {...field}
                        className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-[13px] text-foreground outline-none transition-all focus:border-violet-500/50"
                        style={{ colorScheme: 'dark' }}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-[11px] text-[#3d3d52]">
                      Leave as today to start immediately. Change for backdated or future plans.
                    </p>
                  </FormItem>
                )}
              />

              {/* PAYMENT METHOD */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#d4d4dc]">Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 border-white/[0.08] bg-white/[0.03] text-foreground">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map(m => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NOTES */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#d4d4dc]">Notes</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional notes..."
                        {...field}
                        className="h-12 border-white/[0.08] bg-white/[0.03] text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SUBMIT */}
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-violet-600 text-foreground hover:bg-violet-500"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Recording...' : 'Record Payment'}
              </Button>
            </form>
          </Form>
        </div>

        {/* ── Summary sidebar ── */}
        <div className="space-y-4">

          <div className="rounded-3xl border border-border bg-[#0f0f18] p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-violet-600/15 p-3 text-violet-400">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Summary</p>
                <h3 className="text-lg font-semibold text-foreground">Breakdown</h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Plan Amount</span>
                <span className="text-foreground">
                  {planAmount > 0 ? `₹${planAmount}` : '—'}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-red-400">-₹{discount}</span>
                </div>
              )}
              {additionalFee > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Additional Fee</span>
                  <span className="text-amber-400">+₹{additionalFee}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="text-muted-foreground">Net Due</span>
                <span className="font-medium text-foreground">₹{netDue}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-semibold text-emerald-400">₹{paidAmount}</span>
              </div>
              {pending > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-semibold text-amber-400">₹{pending}</span>
                </div>
              )}

              {/* Membership dates preview */}
              {planStartDate && expiryPreview && (
                <div className="mt-1 space-y-2 border-t border-border pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Starts</span>
                    <span className="text-violet-300">
                      {new Date(planStartDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expires</span>
                    <span className="text-emerald-400">{expiryPreview}</span>
                  </div>
                </div>
              )}

              {planAmount > 0 && (
                <div className={`mt-1 flex items-center gap-2 rounded-xl border px-3 py-2.5 ${statusCfg.bg} ${statusCfg.border}`}>
                  <StatusIcon size={14} className={statusCfg.color} />
                  <span className={`text-[13px] font-medium ${statusCfg.color}`}>
                    {statusCfg.label}
                    {paymentStatus === 'PARTIAL' && ` — ₹${pending} pending`}
                    {paymentStatus === 'PENDING' && ' — nothing paid yet'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-[#0f0f18] p-5">
            <p className="mb-4 text-sm font-medium text-foreground">Supported Methods</p>
            <div className="space-y-3">
              {[
                { icon: Wallet,      label: 'Cash'        },
                { icon: Smartphone,  label: 'UPI'         },
                { icon: CreditCard,  label: 'Card / Online' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3">
                  <Icon className="h-4 w-4 text-violet-400" />
                  <span className="text-sm text-[#d4d4dc]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}