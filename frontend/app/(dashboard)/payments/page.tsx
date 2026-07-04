'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePayments } from '@/src/hooks/usePayments'

import PageHeader from '@/src/components/shared/PageHeader'
import LoadingSpinner from '@/src/components/shared/LoadingSpinner'
import EmptyState from '@/src/components/shared/EmptyState'
import StatusBadge from '@/src/components/shared/StatusBadge'

import { Button } from '@/components/ui/button'

import {
  IndianRupee, Plus, CreditCard,
  Wallet, Smartphone, AlertCircle, X, Loader2,
  ChevronLeft, ChevronRight, TrendingUp, Pencil, Save, PlusCircle, Trash2,
} from 'lucide-react'

import { formatDate, toRupees } from '@/src/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'
import api from '@/src/lib/api'
import { useAuthStore } from '@/src/store/authStore'

function PaymentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 animate-pulse rounded-md bg-muted mb-2" />
          <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="hidden md:grid grid-cols-8 border-b border-border px-6 py-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 w-16 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="grid grid-cols-8 items-center border-b border-border px-6 py-4">
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded-md bg-muted" />
            </div>
            <div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded-md bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-10 animate-pulse rounded-md bg-muted" />
            <div className="flex gap-2">
              <div className="h-6 w-12 animate-pulse rounded-md bg-muted" />
              <div className="h-6 w-12 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


const METHOD_LABELS: Record<string, string> = {
  CASH: 'Cash', UPI: 'UPI', CARD: 'Card', ONLINE: 'Online'
}
const METHOD_ICONS: Record<string, any> = {
  CASH: Wallet, UPI: Smartphone, CARD: CreditCard, ONLINE: IndianRupee
}

type Period = 'today' | 'thisMonth' | 'lastMonth' | 'all'

const PERIOD_LABELS: Record<Period, string> = {
  today:     'Today',
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  all:       'All Time',
}

interface RevenueSummary {
  today:       number
  thisMonth:   number
  lastMonth:   number
  total:       number
  pendingDues: number
}

// ─── Shared form primitives ───────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">
      {children}
    </label>
  )
}

function StyledInput({
  type = 'text',
  value,
  onChange,
  placeholder,
  min,
  max,
}: {
  type?: string
  value: string | number
  onChange: (v: string) => void
  placeholder?: string
  min?: number
  max?: number
}) {
  return (
    <input
      type={type}
      value={value}
      min={min}
      max={max}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl px-3 py-2.5 text-[14px] text-foreground outline-none transition-all"
      style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
      onFocus={e => (e.currentTarget.style.border = '1px solid #7c3aed44')}
      onBlur={e  => (e.currentTarget.style.border = '1px solid #ffffff0a')}
    />
  )
}

function MethodPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[
        { value: 'CASH',   label: 'Cash',   icon: Wallet      },
        { value: 'UPI',    label: 'UPI',    icon: Smartphone  },
        { value: 'CARD',   label: 'Card',   icon: CreditCard  },
        { value: 'ONLINE', label: 'Online', icon: IndianRupee },
      ].map(({ value: v, label, icon: Icon }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all"
          style={
            value === v
              ? { background: '#7c3aed22', border: '1px solid #7c3aed40', color: '#a855f7' }
              : { background: 'var(--background)',   border: '1px solid var(--border)', color: 'var(--muted-foreground)' }
          }
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────

interface DeleteConfirmState {
  paymentId:  string
  memberName: string
  amount:     number
}

function DeleteConfirmModal({
  state,
  onClose,
  onSuccess,
}: {
  state:     DeleteConfirmState
  onClose:   () => void
  onSuccess: () => void
}) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/payments/${state.paymentId}`)
      toast.success('Payment deleted')
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete payment')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-md p-5 sm:p-6 shadow-2xl border border-border bg-card"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
              style={{ background: '#ef444415', border: '1px solid #ef444425' }}
            >
              <Trash2 size={15} className="text-red-400" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-foreground">Delete Payment</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">{state.memberName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            style={{ background: '#ffffff08' }}
          >
            <X size={14} />
          </button>
        </div>

        <div
          className="mb-5 rounded-xl px-4 py-3 text-[13px] text-red-300"
          style={{ background: '#ef444410', border: '1px solid #ef444420' }}
        >
          This will permanently delete the{' '}
          <span className="font-semibold text-foreground">{toRupees(state.amount)}</span> payment
          and re-sync the member's membership to their previous payment.
          This action cannot be undone.
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold text-destructive bg-background border border-border hover:bg-destructive hover:text-destructive-foreground transition-all hover:opacity-90 disabled:opacity-50 dark:text-red-500 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:border-red-500/20"
          >
            {deleting
              ? <Loader2 size={13} className="animate-spin" />
              : <Trash2 size={13} />}
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Payment Modal ───────────────────────────────

interface EditPaymentState {
  id:              string
  planId:          string
  planName:        string
  amount:          number
  discount:        number
  additionalFee:   number
  finalAmount:     number
  paymentMethod:   string
  membershipStart: string | null
  notes:           string
}

function EditPaymentModal({
  state,
  onClose,
  onSuccess,
}: {
  state:     EditPaymentState
  onClose:   () => void
  onSuccess: () => void
}) {
  const [plans, setPlans]               = useState<any[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [saving, setSaving]             = useState(false)

  const [planId,         setPlanId]         = useState(state.planId)
  const [discount,       setDiscount]       = useState((state.discount      / 100).toString())
  const [additionalFee,  setAdditionalFee]  = useState((state.additionalFee / 100).toString())
  const [paidAmount,     setPaidAmount]     = useState((state.finalAmount   / 100).toString())
  const [method,         setMethod]         = useState(state.paymentMethod)
  const [startDate,      setStartDate]      = useState(
    state.membershipStart ? state.membershipStart.split('T')[0] : ''
  )
  const [notes, setNotes] = useState(state.notes ?? '')

  const [planAmount, setPlanAmount] = useState(state.amount / 100)

  useState(() => {
    setLoadingPlans(true)
    api.get('/api/plans')
      .then(res => {
        const raw = res.data?.data
        setPlans(Array.isArray(raw) ? raw : raw?.plans ?? [])
      })
      .catch(() => toast.error('Failed to load plans'))
      .finally(() => setLoadingPlans(false))
  })

  const handlePlanChange = (id: string) => {
    setPlanId(id)
    const p = plans.find(pl => pl.id === id)
    if (p) {
      const priceRupees = p.price / 100
      setPlanAmount(priceRupees)
      setDiscount('0')
      setAdditionalFee('0')
      setPaidAmount(priceRupees.toString())
    }
  }

  const discAmt = Number(discount      || 0)
  const feeAmt  = Number(additionalFee || 0)
  const netDue  = Math.max(0, planAmount - discAmt + feeAmt)

  const selectedPlan = plans.find(p => p.id === planId)

  const previewExpiry = (() => {
    if (!selectedPlan || !startDate) return null
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    return new Date(start.getTime() + selectedPlan.durationDays * 24 * 60 * 60 * 1000)
  })()

  const handleSave = async () => {
    const discNum  = Number(discount      || 0)
    const feeNum   = Number(additionalFee || 0)
    const paidNum  = Number(paidAmount)

    if (!planId)              return toast.error('Select a plan')
    if (discNum < 0)          return toast.error('Discount cannot be negative')
    if (discNum > planAmount) return toast.error('Discount cannot exceed plan price')
    if (feeNum  < 0)          return toast.error('Additional fee cannot be negative')
    if (paidNum < 0)          return toast.error('Paid amount cannot be negative')
    if (paidNum > netDue)     return toast.error('Amount paid cannot exceed final amount due')

    setSaving(true)
    try {
      await api.patch(`/api/payments/${state.id}`, {
        planId,
        discount:      Math.round(discNum * 100),
        additionalFee: Math.round(feeNum  * 100),
        paidAmount:    Math.round(paidNum * 100),
        paymentMethod: method,
        planStartDate: startDate ? new Date(startDate).toISOString() : undefined,
        notes:         notes     || undefined,
      })
      toast.success('Payment updated')
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update payment')
    } finally {
      setSaving(false)
    }
  }

  const paid    = Number(paidAmount || 0)
  const pending = Math.max(0, netDue - paid)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-md p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[92vh] sm:max-h-[90vh] border border-border bg-card"
        
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[15px] font-bold text-foreground">Edit Payment</p>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            style={{ background: '#ffffff08' }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-4">

          <div>
            <FieldLabel>Selected Plan *</FieldLabel>
            {loadingPlans ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 size={13} className="animate-spin" />
                Loading plans…
              </div>
            ) : (
              <>
                <select
                  value={planId}
                  onChange={e => handlePlanChange(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-[14px] text-foreground outline-none transition-all"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                  onFocus={e => (e.currentTarget.style.border = '1px solid #7c3aed44')}
                  onBlur={e  => (e.currentTarget.style.border = '1px solid #ffffff0a')}
                >
                  <option value="">— Select plan —</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price / 100} / {p.durationMonths}mo
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Choose the plan the member is paying for. Changing this resets discount and fees.
                </p>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Discount Given (₹)</FieldLabel>
              <StyledInput
                type="number"
                value={discount}
                onChange={setDiscount}
                placeholder="0"
                min={0}
                max={planAmount}
              />
              <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
                Any price concession given.
              </p>
            </div>
            <div>
              <FieldLabel>
                <span className="flex items-center gap-1.5">
                  <PlusCircle size={11} className="text-amber-400" />
                  Extra Fee (₹)
                </span>
              </FieldLabel>
              <StyledInput
                type="number"
                value={additionalFee}
                onChange={setAdditionalFee}
                placeholder="0"
                min={0}
              />
              <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
                E.g. Admission / registration.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-black/5 border-border bg-card p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Bill Summary</p>
            <div className="space-y-1.5 text-[13px]">
              <div className="flex justify-between text-muted-foreground">
                <span>Base Plan Price:</span>
                <span>₹{planAmount}</span>
              </div>
              {discAmt > 0 && (
                <div className="flex justify-between text-red-500/90 dark:text-red-400">
                  <span>Discount Applied:</span>
                  <span>− ₹{discAmt}</span>
                </div>
              )}
              {feeAmt > 0 && (
                <div className="flex justify-between text-amber-500/90 dark:text-amber-400">
                  <span>Extra Fees:</span>
                  <span>+ ₹{feeAmt}</span>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t border-black/5 border-border pt-2 font-semibold text-foreground">
                <span>Final Amount Due:</span>
                <span>₹{netDue}</span>
              </div>
            </div>
          </div>

          <div>
            <FieldLabel>Amount Paid by Member (₹) *</FieldLabel>
            <StyledInput
              type="number"
              value={paidAmount}
              onChange={setPaidAmount}
              placeholder={netDue > 0 ? netDue.toString() : '0'}
              min={0}
              max={netDue}
            />
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              How much money the member has actually paid so far. <br/>
              <span className="font-medium text-foreground">Status: </span>
              {paid > netDue
                ? <span className="text-red-400 font-medium">Overpaid (Maximum due is ₹{netDue})</span>
                : paid >= netDue && netDue > 0
                ? <span className="text-green-500 font-medium">Fully Paid ✓</span>
                : paid > 0
                  ? <span className="text-amber-500 font-medium">Partial Payment (₹{pending.toFixed(0)} still pending)</span>
                  : <span className="text-red-500 font-medium">Unpaid (Full ₹{netDue} pending)</span>}
            </p>
          </div>

          <div>
            <FieldLabel>Plan Start Date</FieldLabel>
            <StyledInput
              type="date"
              value={startDate}
              onChange={setStartDate}
            />
            <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
              The date this gym plan activates for the member.
            </p>
            {previewExpiry && (
              <p className="mt-1 text-[11px] font-medium text-foreground">
                Estimated Expiry: <span className="text-violet-500 dark:text-violet-400">{format(previewExpiry, 'd MMM yyyy')}</span>
              </p>
            )}
          </div>

          <div>
            <FieldLabel>Payment Method *</FieldLabel>
            <MethodPicker value={method} onChange={setMethod} />
          </div>

          <div>
            <FieldLabel>Notes</FieldLabel>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional"
              className="w-full rounded-xl px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground outline-none resize-none transition-all"
              style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
              onFocus={e => (e.currentTarget.style.border = '1px solid #7c3aed44')}
              onBlur={e  => (e.currentTarget.style.border = '1px solid #ffffff0a')}
            />
          </div>

          <div
            className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-[12px] text-amber-400"
            style={{ background: '#f59e0b10', border: '1px solid #f59e0b20' }}
          >
            <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
            <span>
              Editing will re-sync the member's plan, dates, and status if this is their latest payment.
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 h-10 px-5 text-[13px] font-medium transition-all duration-150 bg-card hover:bg-accent text-card-foreground border border-border rounded-md shadow-sm hover:-translate-y-0.5 disabled:opacity-50"
            >
              {saving
                ? <Loader2 size={13} className="animate-spin" />
                : <Save size={13} />
              }
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Collect Due Modal ────────────────────────────────

interface CollectDueState {
  paymentId:  string
  memberName: string
  pendingAmt: number
}

function CollectDueModal({
  state,
  onClose,
  onSuccess,
}: {
  state:     CollectDueState
  onClose:   () => void
  onSuccess: () => void
}) {
  const [amount,     setAmount]     = useState((state.pendingAmt / 100).toString())
  const [method,     setMethod]     = useState('CASH')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    const amt = Number(amount)
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return }

    setSubmitting(true)
    try {
      const res = await api.post(`/api/payments/${state.paymentId}/collect-due`, {
        collectedAmount: amt * 100,
        paymentMethod: method,
      })
      toast.success(res.data.message)
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to collect due')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-md p-5 sm:p-6 shadow-2xl border border-border bg-card"
        
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-[15px] font-bold text-foreground">Collect Due</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {state.memberName} — Pending {toRupees(state.pendingAmt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            style={{ background: '#ffffff08' }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10">
          <AlertCircle size={14} className="text-amber-400" />
          <span className="text-[13px] text-amber-400">
            Total pending: {toRupees(state.pendingAmt)}
          </span>
        </div>

        <div className="mb-4">
          <FieldLabel>Amount Collecting (₹)</FieldLabel>
          <StyledInput
            type="number"
            value={amount}
            onChange={setAmount}
            max={state.pendingAmt / 100}
          />
        </div>

        <div className="mb-5">
          <FieldLabel>Payment Method</FieldLabel>
          <MethodPicker value={method} onChange={setMethod} />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-medium text-muted-foreground transition-all hover:text-foreground"
            style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex flex-1 items-center justify-center gap-2 h-10 px-5 text-[13px] font-medium transition-all duration-150 bg-card hover:bg-accent text-card-foreground border border-border rounded-md shadow-sm hover:-translate-y-0.5 disabled:opacity-50"
          >
            {submitting && <Loader2 size={13} className="animate-spin" />}
            {submitting ? 'Collecting...' : 'Collect'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Pagination ────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page:         number
  totalPages:   number
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const getPages = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1]
    if (page > 3) pages.push('...')
    const start = Math.max(2, page - 1)
    const end   = Math.min(totalPages - 1, page + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  const btnBase = "flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2.5 text-[13px] font-medium transition-all flex-shrink-0"

  return (
    <div className="flex items-center justify-center gap-1.5 py-4 overflow-x-auto px-2 max-w-full">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`${btnBase} text-muted-foreground hover:text-foreground disabled:opacity-30`}
        style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
      >
        <ChevronLeft size={14} />
      </button>

      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-[13px] text-muted-foreground flex-shrink-0">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`${btnBase} ${p === page ? 'bg-accent  border border-border text-foreground' : 'bg-transparent text-muted-foreground border border-border hover:bg-muted'}`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={`${btnBase} text-muted-foreground hover:text-foreground disabled:opacity-30`}
        style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────

export default function PaymentsPage() {
  const router      = useRouter()
  const { staff }   = useAuthStore()
  const queryClient = useQueryClient()

  const [period, setPeriod] = useState<Period>('all')

  const { payments, loading, isFetching, page, totalPages, totalCount, setPage, refetch } = usePayments()

  const isOwner   = staff?.role === 'OWNER'
  const isManager = staff?.role === 'MANAGER'

  // ── Revenue summary via TanStack Query ──────────────
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['payments', 'revenue-summary'],
    queryFn: async () => {
      const res = await api.get('/api/payments/revenue/summary')
      return res.data.data as RevenueSummary
    },
    staleTime: 30_000,
    enabled: isOwner || isManager,
  })

  // ── Modal state ──────────────────────────────────────
  const [collectDue,    setCollectDue]    = useState<CollectDueState | null>(null)
  const [editPayment,   setEditPayment]   = useState<EditPaymentState | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null)

  // ── After any mutation: refetch list + summary + members ───────
  const refreshAll = () => {
    refetch()
    queryClient.invalidateQueries({ queryKey: ['payments', 'revenue-summary'] })
    queryClient.invalidateQueries({ queryKey: ['members'] })
  }

  const periodRevenue: number = (() => {
    if (!summary) return 0
    switch (period) {
      case 'today':     return summary.today
      case 'thisMonth': return summary.thisMonth
      case 'lastMonth': return summary.lastMonth
      case 'all':       return summary.total
    }
  })()

  const toEditState = (payment: any): EditPaymentState => ({
    id:              payment.id,
    planId:          payment.plan?.id ?? payment.planId ?? '',
    planName:        payment.plan?.name ?? '',
    amount:          payment.amount        ?? 0,
    discount:        payment.discount      ?? 0,
    additionalFee:   payment.additionalFee ?? 0,
    finalAmount:     payment.finalAmount   ?? 0,
    paymentMethod:   payment.paymentMethod,
    membershipStart: payment.membershipStart ?? null,
    notes:           payment.notes ?? '',
  })

  if (loading) {
    return <PaymentsSkeleton />
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <PageHeader
        title="Payments"
        description={`${totalCount} total payments`}
        action={
          <Button
            onClick={() => router.push('/payments/new')}
            className="h-10 w-full sm:w-auto px-4 text-foreground hover: bg-card hover:bg-accent text-card-foreground border border-border rounded-md shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        }
      />

      {/* ── Period filter ── */}
      {(isOwner || isManager) && (
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition-all ${period === p ? 'bg-accent  border border-border text-foreground' : 'bg-transparent text-muted-foreground border border-border hover:bg-muted'}`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      )}

      {/* ── Stats ── */}
      {(isOwner || isManager) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-md p-5 border border-border bg-card" >
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp size={14} className="text-violet-400" />
              <p className="text-sm text-muted-foreground">Revenue · {PERIOD_LABELS[period]}</p>
            </div>
            {summaryLoading ? (
              <div className="mt-2 h-8 w-32 animate-pulse rounded-lg bg-muted" />
            ) : (
              <h3 className="mt-1 text-2xl font-bold text-violet-300">{toRupees(periodRevenue)}</h3>
            )}
          </div>

          <div className="rounded-md border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Pending Dues</p>
            {summaryLoading ? (
              <div className="mt-2 h-8 w-24 animate-pulse rounded-lg bg-muted" />
            ) : (
              <h3 className="mt-2 text-2xl font-bold text-amber-400">
                {toRupees(summary?.pendingDues ?? 0)}
              </h3>
            )}
          </div>

          <div className="rounded-md border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">All-Time Revenue</p>
            {summaryLoading ? (
              <div className="mt-2 h-8 w-28 animate-pulse rounded-lg bg-muted" />
            ) : (
              <h3 className="mt-2 text-2xl font-bold text-green-400">
                {toRupees(summary?.total ?? 0)}
              </h3>
            )}
          </div>
        </div>
      )}

      {/* ── Empty ── */}
      {payments.length === 0 && !loading ? (
        <EmptyState
          icon={IndianRupee}
          title="No payments yet"
          description="Record your first payment"
          actionLabel="Record Payment"
          onAction={() => router.push('/payments/new')}
        />
      ) : (
        <>
          {/* ── Table / Cards ── */}
          <div
            className="overflow-hidden rounded-lg border border-border bg-card"
            style={{ opacity: isFetching && payments.length > 0 ? 0.6 : 1, transition: 'opacity 0.15s' }}
          >
            {/* desktop header */}
            <div className="hidden md:grid grid-cols-8 border-b border-border bg-card px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div>Member</div>
              <div>Plan</div>
              <div>Method</div>
              <div>Amount</div>
              <div>Status</div>
              <div>Date</div>
              <div>Action</div>
              <div>Manage</div>
            </div>

            {/* ── Desktop rows ── */}
            <div className="hidden md:block">
              {payments.map((payment: any) => {
                const Icon      = METHOD_ICONS[payment.paymentMethod] || IndianRupee
                const netDue    = (payment.amount ?? 0) - (payment.discount ?? 0) + (payment.additionalFee ?? 0)
                const pending   = Math.max(0, netDue - (payment.finalAmount ?? 0))
                const isPartial = payment.status === 'PARTIAL'

                return (
                  <div
                    key={payment.id}
                    className="grid grid-cols-8 items-center border-b border-border px-6 py-4 transition-colors hover:bg-accent"
                  >
                    {/* member */}
                    <div>
                      <p className="text-sm font-medium text-foreground">{payment.member?.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{payment.member?.phone}</p>
                    </div>

                    {/* plan */}
                    <div>
                      <p className="text-sm text-[#d4d4dc]">{payment.plan?.name}</p>
                    </div>

                    {/* method */}
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5">
                        <Icon className="h-3.5 w-3.5 text-violet-400" />
                        <span className="text-xs text-[#d4d4dc]">
                          {METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}
                        </span>
                      </div>
                    </div>

                    {/* amount */}
                    <div>
                      <p className="text-sm font-semibold text-green-400">
                        {toRupees(payment.finalAmount)}
                      </p>
                      {payment.discount > 0 && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Discount: {toRupees(payment.discount)}
                        </p>
                      )}
                      {payment.additionalFee > 0 && (
                        <p className="mt-0.5 text-xs text-amber-300">
                          +Fee: {toRupees(payment.additionalFee)}
                        </p>
                      )}
                      {isPartial && pending > 0 && (
                        <p className="mt-0.5 text-xs text-amber-400">
                          Pending: {toRupees(pending)}
                        </p>
                      )}
                    </div>

                    {/* status */}
                    <div>
                      <StatusBadge status={payment.status} />
                    </div>

                    {/* date */}
                    <div>
                      <p className="text-sm text-[#8d8da3]">{formatDate(payment.createdAt)}</p>
                    </div>

                    {/* collect due */}
                    <div>
                      {isPartial && pending > 0 ? (
                        <button
                          onClick={() => setCollectDue({
                            paymentId:  payment.id,
                            memberName: payment.member?.name ?? 'Member',
                            pendingAmt: pending,
                          })}
                          className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-amber-400 transition-all hover:text-amber-300"
                          style={{ background: '#f59e0b12', border: '1px solid #f59e0b25' }}
                        >
                          <AlertCircle size={11} />
                          Collect Due
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>

                    {/* edit + delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditPayment(toEditState(payment))}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-violet-400 transition-colors"
                        style={{ background: '#ffffff06', border: '1px solid var(--border)' }}
                      >
                        <Pencil size={11} />
                        Edit
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => setDeleteConfirm({
                            paymentId:  payment.id,
                            memberName: payment.member?.name ?? 'Member',
                            amount:     payment.finalAmount ?? 0,
                          })}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-red-400 transition-colors"
                          style={{ background: '#ffffff06', border: '1px solid var(--border)' }}
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Mobile cards ── */}
            <div className="md:hidden divide-y divide-white/[0.04]">
              {payments.map((payment: any) => {
                const Icon      = METHOD_ICONS[payment.paymentMethod] || IndianRupee
                const netDue    = (payment.amount ?? 0) - (payment.discount ?? 0) + (payment.additionalFee ?? 0)
                const pending   = Math.max(0, netDue - (payment.finalAmount ?? 0))
                const isPartial = payment.status === 'PARTIAL'

                return (
                  <div key={payment.id} className="p-4 space-y-3">
                    {/* member + status */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{payment.member?.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{payment.member?.phone}</p>
                      </div>
                      <StatusBadge status={payment.status} />
                    </div>

                    {/* plan + method */}
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-[#d4d4dc]">{payment.plan?.name}</p>
                      <div className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1">
                        <Icon className="h-3 w-3 text-violet-400" />
                        <span className="text-[11px] text-[#d4d4dc]">
                          {METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}
                        </span>
                      </div>
                    </div>

                    {/* amount + date */}
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-green-400">
                          {toRupees(payment.finalAmount)}
                        </p>
                        {payment.discount > 0 && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Discount: {toRupees(payment.discount)}
                          </p>
                        )}
                        {payment.additionalFee > 0 && (
                          <p className="mt-0.5 text-xs text-amber-300">
                            +Fee: {toRupees(payment.additionalFee)}
                          </p>
                        )}
                        {isPartial && pending > 0 && (
                          <p className="mt-0.5 text-xs text-amber-400">
                            Pending: {toRupees(pending)}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-[#8d8da3]">{formatDate(payment.createdAt)}</p>
                    </div>

                    {/* actions */}
                    <div className="flex gap-2 pt-1">
                      {isPartial && pending > 0 && (
                        <button
                          onClick={() => setCollectDue({
                            paymentId:  payment.id,
                            memberName: payment.member?.name ?? 'Member',
                            pendingAmt: pending,
                          })}
                          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold text-amber-400 transition-all hover:text-amber-300"
                          style={{ background: '#f59e0b12', border: '1px solid #f59e0b25' }}
                        >
                          <AlertCircle size={12} />
                          Collect Due
                        </button>
                      )}
                      <button
                        onClick={() => setEditPayment(toEditState(payment))}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium text-muted-foreground hover:text-violet-400 transition-colors"
                        style={{ background: '#ffffff06', border: '1px solid var(--border)' }}
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => setDeleteConfirm({
                            paymentId:  payment.id,
                            memberName: payment.member?.name ?? 'Member',
                            amount:     payment.finalAmount ?? 0,
                          })}
                          className="flex items-center justify-center rounded-lg px-3 py-2 text-[12px] text-muted-foreground hover:text-red-400 transition-colors"
                          style={{ background: '#ffffff06', border: '1px solid var(--border)' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Pagination ── */}
          <div className="flex flex-col items-center gap-1">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            <p className="text-[12px] text-muted-foreground">
              Page {page} of {totalPages} · {totalCount} payments
            </p>
          </div>
        </>
      )}

      {/* ── Modals ── */}
      {collectDue && (
        <CollectDueModal
          state={collectDue}
          onClose={() => setCollectDue(null)}
          onSuccess={refreshAll}
        />
      )}

      {editPayment && (
        <EditPaymentModal
          state={editPayment}
          onClose={() => setEditPayment(null)}
          onSuccess={refreshAll}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          state={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onSuccess={refreshAll}
        />
      )}
    </div>
  )
}