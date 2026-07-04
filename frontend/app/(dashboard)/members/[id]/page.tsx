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
      className={cn('rounded-lg bg-muted animate-pulse', className)}
      style={style}
    />
  )
}

function MemberDetailSkeleton() {
  return (
    <div className="space-y-5 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bone className="h-9 w-9 rounded-xl" />
          <div className="space-y-2"><Bone className="h-5 w-36" /><Bone className="h-3 w-24" /></div>
        </div>
        <Bone className="h-9 w-28 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
         <Bone className="h-64 rounded-xl" />
         <Bone className="h-64 rounded-xl" />
      </div>
    </div>
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
  const barColor = daysLeft <= 0 ? 'bg-red-500' : daysLeft <= 7 ? 'bg-orange-500' : 'bg-violet-500'
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>{daysLeft <= 0 ? 'Expired' : `${daysLeft} days left`}</span>
        <span>{pct}% used</span>
      </div>
      <div className="h-2 bg-muted rounded-md overflow-hidden">
        <div className={cn('h-full rounded-md transition-all duration-500', barColor)} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
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
    <div className={cn('rounded-xl border border-border bg-card p-5 shadow-sm', className)}>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-4">{children}</p>
}

function EmptyState({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
      <Icon className="h-8 w-8 opacity-50" /><p className="text-sm font-medium">{label}</p>
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground opacity-80 *:h-4 *:w-4">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Form primitives
// ─────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs text-muted-foreground mb-1.5 font-medium">{children}</label>
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
        'w-full rounded-xl border border-border bg-background px-3.5 py-2.5',
        'text-sm text-foreground placeholder:text-muted-foreground',
        'focus:outline-none focus:border-primary focus:bg-accent transition-colors duration-150',
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
        'w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground',
        'focus:outline-none focus:border-primary transition-colors duration-150',
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
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative z-10 w-full rounded-xl border border-border bg-card shadow-2xl p-6 max-h-[90vh] overflow-y-auto', wide ? 'max-w-lg' : 'max-w-md')}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
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
  const statusColor = payStatus === 'PAID' ? 'text-green-500' : payStatus === 'PARTIAL' ? 'text-orange-500' : 'text-muted-foreground'

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
      <div className="flex items-center gap-2 mb-5 px-3 py-2 border border-primary/20 bg-primary/5 rounded-lg text-primary">
        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-bold">
          {memberName[0]?.toUpperCase()}
        </div>
        <span className="text-sm font-medium">{memberName}</span>
      </div>

      <div className="space-y-4">
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

        {selectedPlan && (
          <div className="rounded-xl bg-muted border border-border px-3 py-2.5 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Plan Price</p>
              <p className="text-sm font-semibold text-foreground">₹{(planPrice / 100).toFixed(0)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Net Due</p>
              <p className="text-sm font-semibold text-foreground">₹{(netDue / 100).toFixed(0)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Status</p>
              <p className={cn('text-sm font-semibold', statusColor)}>{payStatus}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div><FieldLabel>Discount (₹)</FieldLabel><Input value={discount} onChange={setDiscount} placeholder="0" type="number" min="0" /></div>
          <div><FieldLabel>Additional Fee (₹)</FieldLabel><Input value={additionalFee} onChange={setAdditionalFee} placeholder="0" type="number" min="0" /></div>
        </div>

        <div>
          <FieldLabel>Amount Paid (₹) <span className="text-muted-foreground normal-case font-normal">— blank = full payment</span></FieldLabel>
          <Input value={paidAmount} onChange={setPaidAmount} placeholder={selectedPlan ? `${(netDue / 100).toFixed(0)}` : '0'} type="number" min="0" />
        </div>

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
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Plan Start Date <span className="text-muted-foreground normal-case font-normal">— blank = today</span></FieldLabel>
          <Input value={planStartDate} onChange={setPlanStartDate} type="date" />
        </div>

        <div>
          <FieldLabel>Notes</FieldLabel>
          <textarea
            value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" rows={2}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary transition-colors duration-150"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 rounded-xl border border-border bg-background py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !planId} className="flex-1 rounded-xl py-2.5 text-sm text-primary-foreground bg-primary hover:opacity-90 font-medium flex items-center justify-center gap-2 transition-colors">
            {saving ? <span className="h-4 w-4 rounded-md border-2 border-white/30 border-t-white animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
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
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary transition-colors duration-150"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 rounded-xl border border-border bg-background py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl py-2.5 text-sm text-primary-foreground bg-primary hover:opacity-90 font-medium flex items-center justify-center gap-2 transition-colors">
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

type TabType = 'overview' | 'payments' | 'attendance'

const TABS: { id: TabType, label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'payments', label: 'Payments' },
  { id: 'attendance', label: 'Attendance' }
]

export default function MemberDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<TabType>('overview')
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

      <div className="pb-10">
        
        {/* ── Header Card ── */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              <button
                onClick={() => router.back()}
                className="h-10 w-10 rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              
              <div className="h-16 w-16 rounded-2xl border border-primary/20 flex items-center justify-center text-2xl font-bold text-primary bg-primary/10 shadow-sm flex-shrink-0">
                {getInitials(member.name)}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-foreground leading-tight flex items-center gap-3">
                  {member.name}
                  <StatusBadge status={member.status} />
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Member since {formatDate(member.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap pl-[68px] md:pl-0">
              <Button
                onClick={() => setEditProfileOpen(true)}
                variant="outline"
                className="h-10 gap-2 border-border bg-background hover:bg-muted text-foreground font-medium rounded-xl shadow-sm"
              >
                <Pencil className="h-4 w-4" /> Edit Profile
              </Button>
              <Button
                onClick={() => router.push(`/members/${id}/diet`)}
                variant="outline"
                className="h-10 gap-2 border-border bg-background hover:bg-muted text-foreground font-medium rounded-xl shadow-sm"
              >
                <Utensils className="h-4 w-4" /> Diet & Weight
              </Button>
              <Button
                onClick={() => setAddPaymentOpen(true)}
                className="h-10 gap-2 bg-primary text-primary-foreground hover:opacity-90 font-medium rounded-xl shadow-sm border-0"
              >
                <Plus className="h-4 w-4" /> Record Payment
              </Button>
            </div>
          </div>

          {/* ── Tabs Navigation ── */}
          <div className="flex items-center gap-6 border-b border-border mt-8 -mb-6 px-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-3 text-sm font-medium transition-colors relative",
                  activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="mt-8">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Personal Details */}
              <Panel>
                <SectionLabel>Personal Details</SectionLabel>
                <div className="space-y-5">
                  <DetailRow icon={<Phone/>} label="Phone" value={member.phone} />
                  {member.email && <DetailRow icon={<Mail/>} label="Email" value={member.email} />}
                  {member.address && <DetailRow icon={<MapPin/>} label="Address" value={member.address} />}
                  {member.dateOfBirth && <DetailRow icon={<Calendar/>} label="Date of Birth" value={format(parseISO(member.dateOfBirth), 'd MMM yyyy')} />}
                  {member.gender && <DetailRow icon={<User/>} label="Gender" value={<span className="capitalize">{member.gender.toLowerCase()}</span>} />}
                </div>
              </Panel>

              {/* Current Plan */}
              <Panel>
                <SectionLabel>Current Plan</SectionLabel>
                {member.plan ? (
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <p className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-500" /> {member.plan.name}
                      </p>
                      <p className="text-sm font-medium text-muted-foreground mt-1">{member.plan.durationDays} days · <span className="text-foreground">{toRupees(member.plan.price)}</span></p>
                    </div>
                    
                    {member.membershipStart && member.membershipExpiry && (
                      <MembershipProgressBar start={member.membershipStart} expiry={member.membershipExpiry} />
                    )}
                    
                    {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
                      <div className="mt-4 rounded-xl bg-orange-500/10 border border-orange-500/20 px-4 py-3 flex items-center gap-2 text-orange-600 dark:text-orange-400 text-sm font-medium">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        Expiring in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                      </div>
                    )}
                    {daysLeft !== null && daysLeft <= 0 && (
                      <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        Membership expired
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState icon={Crown} label="No active membership" />
                )}
              </Panel>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-5 col-span-1 md:col-span-2">
                 <Panel className="flex items-center gap-5 p-6 hover:border-primary/30 transition-colors">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                       <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                       <p className="text-3xl font-bold text-foreground">{member.attendance?.length || 0}</p>
                       <p className="text-sm font-medium text-muted-foreground">Total Visits</p>
                    </div>
                 </Panel>
                 <Panel className="flex items-center gap-5 p-6 hover:border-green-500/30 transition-colors">
                    <div className="h-14 w-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                       <Wallet className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                       <p className="text-3xl font-bold text-foreground">{member.payments?.length || 0}</p>
                       <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                    </div>
                 </Panel>
              </div>
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
             <Panel className="p-0 overflow-hidden shadow-sm">
                {!member.payments?.length ? (
                   <EmptyState icon={CreditCard} label="No payments recorded" />
                ) : (
                   <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                       <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                         <tr>
                           <th className="px-6 py-4 font-medium">Date</th>
                           <th className="px-6 py-4 font-medium">Plan</th>
                           <th className="px-6 py-4 font-medium">Amount</th>
                           <th className="px-6 py-4 font-medium">Method</th>
                           <th className="px-6 py-4 font-medium text-right">Status</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-border">
                         {member.payments.map((p: any) => (
                            <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-medium">
                                {formatDate(p.createdAt)}
                              </td>
                              <td className="px-6 py-4 font-semibold text-foreground">
                                {p.plan?.name || 'Membership'}
                              </td>
                              <td className="px-6 py-4 text-foreground font-bold">
                                {toRupees(p.finalAmount)}
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">
                                  {p.paymentMethod}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <StatusBadge status={p.status} />
                              </td>
                            </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                )}
             </Panel>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === 'attendance' && (
            <Panel className="p-0 overflow-hidden shadow-sm">
               {!member.attendance?.length ? (
                  <EmptyState icon={Calendar} label="No attendance records" />
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                       <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                         <tr>
                           <th className="px-6 py-4 font-medium">Date</th>
                           <th className="px-6 py-4 font-medium">Time</th>
                           <th className="px-6 py-4 font-medium text-right">Check-in Method</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-border">
                         {member.attendance.map((a: any) => (
                            <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                                {format(parseISO(a.checkInAt), 'EEEE, d MMM yyyy')}
                              </td>
                              <td className="px-6 py-4 text-muted-foreground font-medium">
                                {format(parseISO(a.checkInAt), 'h:mm a')}
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">
                                    {a.markedBy === 'QR_SCAN' ? <><QrCode className="h-3.5 w-3.5" /> QR Scan</> : <><User className="h-3.5 w-3.5" /> Manual</>}
                                 </div>
                              </td>
                            </tr>
                         ))}
                       </tbody>
                     </table>
                  </div>
               )}
            </Panel>
          )}

        </div>
      </div>
    </>
  )
}
