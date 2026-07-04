'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/src/lib/api'
import { Payment, Attendance } from '@/src/types'
import StatusBadge from '@/src/components/shared/StatusBadge'

import {
  ArrowLeft, Phone, Mail, MapPin, CreditCard, User, Calendar,
  QrCode, CheckCircle2, AlertCircle, Crown, Wallet, Activity,
  Utensils, Pencil, X, Save, ChevronDown, ChevronUp,
  Receipt, UserCheck, PlusCircle, MinusCircle, Clock, Plus,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDate, toRupees } from '@/src/lib/utils'
import { format, parseISO, differenceInDays } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn('rounded-lg', className)}
      style={{
        background: 'linear-gradient(90deg, #1a1a26 25%, #22223a 50%, #1a1a26 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  )
}

function MemberDetailSkeleton() {
  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div className="space-y-5 pb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl border border-border bg-card" />
            <div className="space-y-2"><Bone className="h-5 w-36" /><Bone className="h-3 w-24" /></div>
          </div>
          <Bone className="h-9 w-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="space-y-4">
            <div className="rounded-md border border-border bg-card p-5">
              <div className="flex flex-col items-center pb-5 border-b border-border">
                <Bone className="h-20 w-20 rounded-md mb-3" /><Bone className="h-4 w-28 mb-2" />
                <Bone className="h-5 w-16 rounded-md mb-3" /><Bone className="h-7 w-24 rounded-lg" />
              </div>
              <div className="pt-4 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="flex items-center gap-3"><Bone className="h-3.5 w-3.5 flex-shrink-0" /><Bone className="h-3.5 flex-1" style={{ maxWidth: `${100 - i * 15}%` }} /></div>)}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                {[0, 1].map(i => <div key={i} className="rounded-xl border border-border bg-background/20 p-3 flex flex-col items-center"><Bone className="h-9 w-9 rounded-lg mb-2" /><Bone className="h-6 w-8 mb-1" /><Bone className="h-3 w-10" /></div>)}
              </div>
            </div>
          </div>
          <div className="xl:col-span-2 space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="rounded-md border border-border bg-card p-5">
                <Bone className="h-3 w-28 mb-4" />
                <div className="space-y-2">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="rounded-xl border border-border bg-background/20 px-4 py-3 flex items-center gap-3">
                      <Bone className="h-9 w-9 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-1.5"><Bone className="h-3.5 w-32" /><Bone className="h-3 w-24" /></div>
                      <div className="text-right space-y-1.5"><Bone className="h-3.5 w-16 ml-auto" /><Bone className="h-5 w-12 rounded-md ml-auto" /></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function MembershipProgressBar({ start, expiry }: { start: string; expiry: string }) {
  const startDate = parseISO(start)
  const expiryDate = parseISO(expiry)
  const today = new Date()
  const total = differenceInDays(expiryDate, startDate)
  const elapsed = differenceInDays(today, startDate)
  const daysLeft = differenceInDays(expiryDate, today)
  const pct = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
  const barColor = daysLeft <= 0 ? 'bg-foreground dark:bg-red-500' : daysLeft <= 7 ? 'bg-foreground dark:bg-orange-500' : 'bg-primary dark:bg-violet-500'
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>{daysLeft <= 0 ? 'Expired' : `${daysLeft} days left`}</span>
        <span>{pct}% used</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-md overflow-hidden">
        <div className={cn('h-full rounded-md transition-all duration-500', barColor)} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between text-[11px] text-zinc-600 mt-2">
        <span>{format(startDate, 'd MMM yyyy')}</span>
        <span>{format(expiryDate, 'd MMM yyyy')}</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Layout primitives
// ─────────────────────────────────────────────

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-md border border-border bg-card  p-5', className)}>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] uppercase tracking-[0.18em] text-violet-400 font-extrabold mb-4">{children}</p>
}

function EmptyState({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-600">
      <Icon className="h-7 w-7" /><p className="text-sm">{label}</p>
    </div>
  )
}

function ListRow({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-background/20 px-4 py-3 flex items-center gap-3">{children}</div>
}

function IconBox({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0', className)}>{children}</div>
}

// ─────────────────────────────────────────────
// Payment detail card
// ─────────────────────────────────────────────

function PaymentDetailRow({ label, value, valueClass }: {
  label: React.ReactNode; value: React.ReactNode; valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-xs font-medium text-right', valueClass ?? 'text-zinc-200')}>{value}</span>
    </div>
  )
}

function PaymentCard({ payment }: { payment: Payment }) {
  const [expanded, setExpanded] = useState(false)
  const planPrice = (payment as any).amount ?? null
  const discount = (payment as any).discount ?? 0
  const additionalFee = (payment as any).additionalFee ?? 0
  const finalAmount = payment.finalAmount
  const collectedBy = (payment as any).collectedBy ?? null
  const netDue = planPrice !== null ? planPrice - discount + additionalFee : null
  const remainingDue = netDue !== null ? Math.max(0, netDue - finalAmount) : null
  const membershipStart = (payment as any).membershipStart ?? null
  const membershipExpiry = (payment as any).membershipExpiry ?? null

  return (
    <div className="rounded-xl border border-border bg-background/20 overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3">
        <IconBox className="bg-background border border-border dark:bg-green-500/10 dark:border-transparent"><CreditCard className="h-4 w-4 text-foreground dark:text-green-400" /></IconBox>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{payment.plan?.name ?? 'Membership'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{payment.paymentMethod} · {formatDate(payment.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-sm font-semibold text-green-400">{toRupees(finalAmount)}</p>
            <div className="mt-1 flex justify-end"><StatusBadge status={payment.status} /></div>
          </div>
          <button
            onClick={() => setExpanded(v => !v)}
            className="h-7 w-7 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-violet-400 hover:border-violet-500/30 transition-colors ml-1"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 pt-3 pb-4 space-y-2">
          {planPrice !== null && (
            <div className="rounded-xl bg-card border border-border px-3 py-2">
              <p className="text-[11px] uppercase tracking-widest text-zinc-600 mb-2 font-semibold">Amount Breakdown</p>
              <PaymentDetailRow label="Plan Price" value={toRupees(planPrice)} />
              {discount > 0 && (
                <PaymentDetailRow
                  label={<span className="flex items-center gap-1"><MinusCircle className="h-3 w-3 text-orange-400" />Discount</span>}
                  value={`− ${toRupees(discount)}`} valueClass="text-orange-400"
                />
              )}
              {additionalFee > 0 && (
                <PaymentDetailRow
                  label={<span className="flex items-center gap-1"><PlusCircle className="h-3 w-3 text-blue-400" />Additional Fee</span>}
                  value={`+ ${toRupees(additionalFee)}`} valueClass="text-blue-400"
                />
              )}
              {(discount > 0 || additionalFee > 0) && (
                <div className="border-t border-border mt-1.5 pt-1.5">
                  <PaymentDetailRow label="Net Due" value={toRupees(netDue!)} valueClass="text-foreground font-semibold" />
                </div>
              )}
              <div className={cn('border-t border-border mt-1.5 pt-1.5', discount === 0 && additionalFee === 0 && 'border-t-0 mt-0 pt-0')}>
                <PaymentDetailRow label="Amount Paid" value={toRupees(finalAmount)} valueClass="text-green-400 font-bold" />
              </div>
              {remainingDue! > 0 && (
                <PaymentDetailRow label="Remaining Due" value={toRupees(remainingDue!)} valueClass="text-red-400 font-semibold" />
              )}
            </div>
          )}

          {(membershipStart || membershipExpiry) && (
            <div className="rounded-xl bg-card border border-border px-3 py-2">
              <p className="text-[11px] uppercase tracking-widest text-zinc-600 mb-2 font-semibold">Plan Period</p>
              {membershipStart && <PaymentDetailRow label="Start Date" value={format(parseISO(membershipStart), 'd MMM yyyy')} />}
              {membershipExpiry && <PaymentDetailRow label="Expiry Date" value={format(parseISO(membershipExpiry), 'd MMM yyyy')} />}
            </div>
          )}

          <div className="rounded-xl bg-card border border-border px-3 py-2">
            <p className="text-[11px] uppercase tracking-widest text-zinc-600 mb-2 font-semibold">Transaction Details</p>
            <PaymentDetailRow label={<span className="flex items-center gap-1"><Receipt className="h-3 w-3" />Method</span>} value={payment.paymentMethod} />
            <PaymentDetailRow label={<span className="flex items-center gap-1"><Clock className="h-3 w-3" />Date & Time</span>} value={format(parseISO(payment.createdAt), 'd MMM yyyy, h:mm a')} />
            {collectedBy?.name && (
              <PaymentDetailRow
                label={<span className="flex items-center gap-1"><UserCheck className="h-3 w-3" />Collected By</span>}
                value={<span className="flex items-center gap-1 justify-end">{collectedBy.name}{collectedBy.role && <span className="text-[10px] text-zinc-600 ml-1">· {collectedBy.role}</span>}</span>}
              />
            )}
            {(payment as any).notes && (
              <PaymentDetailRow label="Notes" value={(payment as any).notes} valueClass="text-zinc-400 text-right max-w-[60%] whitespace-normal" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Form primitives
// ─────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs text-zinc-400 mb-1.5 font-medium">{children}</label>
}

function Input({ value, onChange, placeholder, type = 'text', disabled, min }: {
  value: string; onChange: (v: string) => void; placeholder?: string
  type?: string; disabled?: boolean; min?: string
}) {
  return (
    <input
      type={type} value={value} min={min} disabled={disabled}
      onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className={cn(
        'w-full rounded-xl border border-border bg-card px-3.5 py-2.5',
        'text-sm text-foreground placeholder:text-zinc-600',
        'focus:outline-none focus:border-violet-500/60 focus:bg-accent transition-colors duration-150',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    />
  )
}

function FSelect({ value, onChange, children, disabled }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode; disabled?: boolean
}) {
  return (
    <select
      value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
      className={cn(
        'w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground',
        'focus:outline-none focus:border-violet-500/60 transition-colors duration-150',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {children}
    </select>
  )
}

// ─────────────────────────────────────────────
// Modal shell
// ─────────────────────────────────────────────

function Modal({ open, onClose, title, children, wide }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/70 " onClick={onClose} />
      <div className={cn('relative z-10 w-full rounded-md border border-border bg-card shadow-2xl p-6 max-h-[90vh] overflow-y-auto', wide ? 'max-w-lg' : 'max-w-md')}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-zinc-400 hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Add Payment Modal
// ─────────────────────────────────────────────

type PlanOption = { id: string; name: string; price: number; durationDays: number }
const PAYMENT_METHODS = ['CASH', 'UPI', 'CARD', 'ONLINE'] as const

function AddPaymentModal({ open, onClose, memberId, memberName, onSaved }: {
  open: boolean; onClose: () => void
  memberId: string; memberName: string; onSaved: () => void
}) {
  const [plans, setPlans] = useState<PlanOption[]>([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [planId, setPlanId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [discount, setDiscount] = useState('0')
  const [additionalFee, setAdditionalFee] = useState('0')
  const [paidAmount, setPaidAmount] = useState('')
  const [planStartDate, setPlanStartDate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setPlanId(''); setPaymentMethod('CASH'); setDiscount('0')
    setAdditionalFee('0'); setPaidAmount(''); setPlanStartDate(''); setNotes('')
    setPlansLoading(true)
    api.get('/api/plans')
      .then(res => setPlans(res.data.data ?? []))
      .catch(() => toast.error('Failed to load plans'))
      .finally(() => setPlansLoading(false))
  }, [open])

  const selectedPlan = plans.find(p => p.id === planId)
  const planPrice = selectedPlan?.price ?? 0
  const discountPaise = Math.max(0, Math.round((Number(discount) || 0) * 100))
  const addFeePaise = Math.max(0, Math.round((Number(additionalFee) || 0) * 100))
  const netDue = planPrice - discountPaise + addFeePaise
  const paidPreview = paidAmount === '' ? netDue : Math.min(Math.round(Number(paidAmount) * 100), netDue)
  const payStatus = paidPreview <= 0 ? 'PENDING' : paidPreview < netDue ? 'PARTIAL' : 'PAID'
  const statusColor = payStatus === 'PAID' ? 'text-green-400' : payStatus === 'PARTIAL' ? 'text-orange-400' : 'text-muted-foreground'

  const handleSubmit = async () => {
    if (!planId) return toast.error('Please select a plan')
    if (!paymentMethod) return toast.error('Please select a payment method')
    setSaving(true)
    try {
      await api.post('/api/payments', {
        memberId,
        planId,
        discount: discountPaise,
        additionalFee: addFeePaise,
        paidAmount: paidAmount === '' ? netDue : Math.round(Number(paidAmount) * 100),
        paymentMethod,
        notes: notes.trim() || undefined,
        planStartDate: planStartDate
        ? new Date(planStartDate).toISOString()
        : undefined,
      })
      toast.success('Payment recorded successfully')
      onSaved()
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Record Payment" wide>
      {/* Member chip */}
      <div className="flex items-center gap-2 mb-5 px-3 py-2 /10 border border-violet-500/20 bg-card hover:bg-accent text-card-foreground border border-border rounded-md shadow-sm">
        <div className="h-6 w-6 rounded-md /30 flex items-center justify-center text-[10px] font-bold text-violet-300 bg-card hover:bg-accent text-card-foreground border border-border rounded-md shadow-sm">
          {memberName[0]?.toUpperCase()}
        </div>
        <span className="text-sm text-violet-300 font-medium">{memberName}</span>
      </div>

      <div className="space-y-4">
        {/* Plan selector */}
        <div>
          <FieldLabel>Plan *</FieldLabel>
          <FSelect value={planId} onChange={setPlanId} disabled={plansLoading}>
            <option value="">{plansLoading ? 'Loading plans…' : '— Select a plan —'}</option>
            {plans.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} — ₹{(p.price / 100).toFixed(0)} / {p.durationDays}d
              </option>
            ))}
          </FSelect>
        </div>

        {/* Live preview bar */}
        {selectedPlan && (
          <div className="rounded-xl bg-card border border-border px-3 py-2.5 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-0.5">Plan Price</p>
              <p className="text-sm font-semibold text-foreground">₹{(planPrice / 100).toFixed(0)}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-0.5">Net Due</p>
              <p className="text-sm font-semibold text-foreground">₹{(netDue / 100).toFixed(0)}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-0.5">Status</p>
              <p className={cn('text-sm font-semibold', statusColor)}>{payStatus}</p>
            </div>
          </div>
        )}

        {/* Discount + Additional Fee */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Discount (₹)</FieldLabel>
            <Input value={discount} onChange={setDiscount} placeholder="0" type="number" min="0" />
          </div>
          <div>
            <FieldLabel>Additional Fee (₹)</FieldLabel>
            <Input value={additionalFee} onChange={setAdditionalFee} placeholder="0" type="number" min="0" />
          </div>
        </div>

        {/* Amount Paid */}
        <div>
          <FieldLabel>
            Amount Paid (₹){' '}
            <span className="text-zinc-600 normal-case font-normal">— blank = full payment</span>
          </FieldLabel>
          <Input
            value={paidAmount}
            onChange={setPaidAmount}
            placeholder={selectedPlan ? `${(netDue / 100).toFixed(0)}` : '0'}
            type="number" min="0"
          />
        </div>

        {/* Payment Method pill selector */}
        <div>
          <FieldLabel>Payment Method *</FieldLabel>
          <div className="grid grid-cols-4 gap-2">
            {PAYMENT_METHODS.map(m => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={cn(
                  'rounded-xl border py-2 text-xs font-medium transition-all duration-150',
                  paymentMethod === m
                    ? 'border-border bg-primary text-primary-foreground dark:border-violet-500 dark:bg-violet-500/20 dark:text-violet-300'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-border dark:hover:text-zinc-300 dark:hover:border-white/20',
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Start Date */}
        <div>
          <FieldLabel>
            Plan Start Date{' '}
            <span className="text-zinc-600 normal-case font-normal">— blank = today</span>
          </FieldLabel>
          <Input value={planStartDate} onChange={setPlanStartDate} type="date" />
        </div>

        {/* Notes */}
        <div>
          <FieldLabel>Notes</FieldLabel>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
            rows={2}
            className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-zinc-600 resize-none focus:outline-none focus:border-violet-500/60 focus:bg-accent transition-colors duration-150"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border bg-card py-2.5 text-sm text-zinc-400 hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !planId}
            className="flex-1 py-2.5 text-sm text-foreground font-medium flex items-center justify-center gap-2 transition-colors bg-card hover:bg-accent text-card-foreground border border-border rounded-md shadow-sm"
          >
            {saving
              ? <span className="h-4 w-4 rounded-md border-2 border-white/30 border-t-white animate-spin" />
              : <CreditCard className="h-3.5 w-3.5" />}
            Record Payment
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─────────────────────────────────────────────
// Edit Profile Modal
// ─────────────────────────────────────────────

function EditProfileModal({ open, onClose, member, onSaved }: {
  open: boolean; onClose: () => void; member: any; onSaved: () => void
}) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', gender: '', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && member) setForm({
      name: member.name ?? '', phone: member.phone ?? '', email: member.email ?? '',
      address: member.address ?? '', gender: member.gender ?? '', notes: member.notes ?? '',
    })
  }, [open, member])

  const field = (key: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [key]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required')
    if (!form.phone.trim()) return toast.error('Phone is required')
    setSaving(true)
    try {
      await api.put(`/api/members/${member.id}`, {
        name: form.name.trim(), phone: form.phone.trim(),
        email: form.email.trim() || undefined, address: form.address.trim() || undefined,
        gender: form.gender || undefined, notes: form.notes.trim() || undefined,
      })
      toast.success('Member updated'); onSaved(); onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update member')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile">
      <div className="space-y-4">
        <div><FieldLabel>Full Name *</FieldLabel><Input value={form.name} onChange={field('name')} placeholder="e.g. Ravi Kumar" /></div>
        <div><FieldLabel>Phone *</FieldLabel><Input value={form.phone} onChange={field('phone')} placeholder="10-digit number" type="tel" /></div>
        <div><FieldLabel>Email</FieldLabel><Input value={form.email} onChange={field('email')} placeholder="Optional" type="email" /></div>
        <div><FieldLabel>Address</FieldLabel><Input value={form.address} onChange={field('address')} placeholder="Optional" /></div>
        <div>
          <FieldLabel>Gender</FieldLabel>
          <FSelect value={form.gender} onChange={field('gender')}>
            <option value="">— Not specified —</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </FSelect>
        </div>
        <div>
          <FieldLabel>Notes</FieldLabel>
          <textarea value={form.notes} onChange={e => field('notes')(e.target.value)} placeholder="Internal notes (optional)" rows={2}
            className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-zinc-600 resize-none focus:outline-none focus:border-violet-500/60 focus:bg-accent transition-colors duration-150"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 rounded-xl border border-border bg-card py-2.5 text-sm text-zinc-400 hover:text-foreground transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 text-sm text-foreground font-medium flex items-center justify-center gap-2 transition-colors bg-card hover:bg-accent text-card-foreground border border-border rounded-md shadow-sm">
            {saving ? <span className="h-4 w-4 rounded-md border-2 border-white/30 border-t-white animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function MemberDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [addPaymentOpen, setAddPaymentOpen] = useState(false)

  const { data: member, isLoading: loading } = useQuery({
    queryKey: ['members', id],
    queryFn: async () => {
      const res = await api.get(`/api/members/${id}`)
      return res.data.data
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  })

  const handleMemberUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['members', id] })
    queryClient.invalidateQueries({ queryKey: ['members'] })
  }

  const handlePaymentSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['members', id] })
    queryClient.invalidateQueries({ queryKey: ['members'] })
    queryClient.invalidateQueries({ queryKey: ['payments'] })
  }

  if (loading) return <MemberDetailSkeleton />

  if (!member) {
    return (
      <div className="flex items-center justify-center h-[70vh] gap-2 text-muted-foreground">
        <AlertCircle className="h-4 w-4" /><span className="text-sm">Member not found</span>
      </div>
    )
  }

  const daysLeft = member.membershipExpiry
    ? differenceInDays(parseISO(member.membershipExpiry), new Date())
    : null

  return (
    <>
      <EditProfileModal open={editProfileOpen} onClose={() => setEditProfileOpen(false)} member={member} onSaved={handleMemberUpdated} />
      <AddPaymentModal
        open={addPaymentOpen}
        onClose={() => setAddPaymentOpen(false)}
        memberId={String(id)}
        memberName={member.name}
        onSaved={handlePaymentSaved}
      />

      <div className="space-y-5 pb-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="h-9 w-9 rounded-xl border border-border bg-card flex items-center justify-center text-zinc-400 hover:text-foreground transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-tight">{member.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Member since {formatDate(member.createdAt)}</p>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => setAddPaymentOpen(true)}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-border bg-background text-foreground hover:bg-accent text-sm font-medium transition-all duration-150 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 dark:hover:border-green-500/50"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Payment
            </button>
            <Button
              onClick={() => router.push(`/members/${id}/diet`)}
              className="text-foreground h-9 px-4 text-sm gap-2 bg-card hover:bg-accent text-card-foreground border border-border rounded-md shadow-sm"
            >
              <Utensils className="h-3.5 w-3.5" />
              Diet & Weight
            </Button>
          </div>
        </div>

        {/* ── Layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* ── LEFT ── */}
          <div className="space-y-4">
            <Panel>
              <div className="flex flex-col items-center text-center pb-5 border-b border-border">
                <div className="h-20 w-20 rounded-md /20 border border-violet-500/30 flex items-center justify-center text-xl font-bold text-violet-400 mb-3 bg-card hover:bg-accent text-card-foreground border border-border rounded-md shadow-sm">
                  {getInitials(member.name)}
                </div>
                <h2 className="text-base font-semibold text-foreground">{member.name}</h2>
                <div className="mt-2"><StatusBadge status={member.status} /></div>
                <button
                  onClick={() => setEditProfileOpen(true)}
                  className="mt-4 flex items-center gap-1.5 text-xs text-zinc-400 hover:text-violet-400 transition-colors border border-border hover:border-violet-500/40 rounded-lg px-3 py-1.5"
                >
                  <Pencil className="h-3 w-3" />Edit Profile
                </button>
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <Phone className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
                  <span className="truncate">{member.phone}</span>
                </div>
                {member.email && (
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Mail className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" /><span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.address && (
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <MapPin className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" /><span className="truncate">{member.address}</span>
                  </div>
                )}
                {member.dateOfBirth && (
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Calendar className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
                    <span>{format(parseISO(member.dateOfBirth), 'd MMM yyyy')}</span>
                  </div>
                )}
                {member.gender && (
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <User className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
                    <span className="capitalize">{member.gender.toLowerCase()}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="rounded-xl border border-border bg-background/20 p-3 text-center">
                  <div className="h-9 w-9 /10 flex items-center justify-center mx-auto mb-2 bg-card hover:bg-accent text-card-foreground border border-border rounded-md shadow-sm">
                    <Activity className="h-4 w-4 text-violet-400" />
                  </div>
                  <p className="text-xl font-bold text-foreground">{member.attendance?.length || 0}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Visits</p>
                </div>
                <div className="rounded-xl border border-border bg-background/20 p-3 text-center">
                  <div className="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center mx-auto mb-2 dark:bg-green-500/10 dark:border-transparent">
                    <Wallet className="h-4 w-4 text-green-400" />
                  </div>
                  <p className="text-xl font-bold text-foreground">{member.payments?.length || 0}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Payments</p>
                </div>
              </div>
            </Panel>

            {member.plan && (
              <Panel>
                <SectionLabel>Membership</SectionLabel>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Plan</span>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Crown className="h-3.5 w-3.5 text-yellow-400" />{member.plan.name}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Duration</span>
                    <span className="text-sm text-foreground">{member.plan.durationDays} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Fee</span>
                    <span className="text-sm font-semibold text-green-400">{toRupees(member.plan.price)}</span>
                  </div>
                </div>
                {member.membershipStart && member.membershipExpiry && (
                  <MembershipProgressBar start={member.membershipStart} expiry={member.membershipExpiry} />
                )}
                {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
                  <div className="mt-4 rounded-xl bg-background border border-border px-3 py-2.5 flex items-center gap-2 text-foreground text-xs dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    Expiring in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                  </div>
                )}
                {daysLeft !== null && daysLeft <= 0 && (
                  <div className="mt-4 rounded-xl bg-background border border-border px-3 py-2.5 flex items-center gap-2 text-foreground text-xs dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />Membership expired
                  </div>
                )}
              </Panel>
            )}
          </div>

          {/* ── RIGHT ── */}
          <div className="xl:col-span-2 space-y-4">

            {/* Payment History */}
            <Panel>
              <div className="flex items-center justify-between mb-4">
                <SectionLabel>Payment History</SectionLabel>
              </div>

              {!member.payments?.length ? (
                <div className="py-10 flex flex-col items-center justify-center gap-3 text-zinc-600">
                  <CreditCard className="h-7 w-7" />
                  <p className="text-sm">No payments yet</p>
                  <button
                    onClick={() => setAddPaymentOpen(true)}
                    className="flex items-center gap-1.5 text-xs text-foreground hover:text-foreground border border-border bg-background rounded-lg px-3 py-1.5 transition-all dark:text-green-400 dark:hover:text-green-300 dark:border-green-500/20 dark:bg-green-500/10"
                  >
                    <Plus className="h-3 w-3" />Record first payment
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {member.payments.map((payment: Payment) => (
                    <PaymentCard key={payment.id} payment={payment} />
                  ))}
                </div>
              )}
            </Panel>

            {/* Attendance */}
            <Panel>
              <SectionLabel>Recent Attendance</SectionLabel>
              {!member.attendance?.length ? (
                <EmptyState icon={Calendar} label="No attendance records" />
              ) : (
                <div className="space-y-2">
                  {member.attendance.map((record: Attendance) => (
                    <ListRow key={record.id}>
                      <IconBox className="/10 bg-card hover:bg-accent text-card-foreground border border-border rounded-md shadow-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      </IconBox>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {format(parseISO(record.checkInAt), 'EEEE, d MMM yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(parseISO(record.checkInAt), 'h:mm a')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                        {record.markedBy === 'QR_SCAN'
                          ? <><QrCode className="h-3.5 w-3.5" />QR Scan</>
                          : <><User className="h-3.5 w-3.5" />Manual</>}
                      </div>
                    </ListRow>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </>
  )
}