'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Users, CreditCard, CheckCircle, Clock, ExternalLink,
  Plus, X, Shield, Activity, ToggleLeft, ToggleRight, Trash2,
  KeyRound, LogIn, AlertCircle, UserCheck, TrendingUp,
  QrCode,
} from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tenant {
  id: string; name: string; slug: string; isActive: boolean; isDeleted: boolean
  createdAt: string; trialEndsAt: string | null; gracePeriodEndsAt: string | null
  email?: string; phone?: string
  _count?: { members: number; staff: number; payments: number }
}

interface Owner {
  id: string; name: string; phone: string; email: string | null; createdAt: string
}

interface UsageStats {
  memberCount: number; staffCount: number; activeMembers: number; totalRevenue: number
}

interface Member {
  id: string; name: string; phone: string; status: string; membershipExpiry: string | null
  plan?: { name: string }
}

interface Payment {
  id: string; finalAmount: number; status: string; paymentMethod: string
  createdAt: string; member?: { name: string }; plan?: { name: string }
}

interface ActivityEntry {
  type: 'PAYMENT' | 'CHECK_IN'; id: string; memberName: string
  detail: string; status: string; timestamp: string
}

type Tab = 'overview' | 'members' | 'payments' | 'activity'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toRupees(p: number) { return `₹${(p / 100).toLocaleString('en-IN')}` }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function daysFromNow(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}



const inputCls = 'w-full bg-card border border-border focus:border-violet-500/50 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder-white/20 outline-none transition-all'

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ open, title, message, danger, onConfirm, onCancel, loading }: {
  open: boolean; title: string; message: string; danger?: boolean
  onConfirm: () => void; onCancel: () => void; loading?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-background border border-border rounded-2xl p-6 shadow-2xl">
        <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-foreground/50 mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-muted hover:bg-muted text-foreground/60 text-sm font-medium transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-foreground text-sm font-medium transition-all disabled:opacity-50 ${danger ? 'bg-red-600 hover:bg-red-500' : 'bg-violet-600 hover:bg-violet-500'
              }`}>
            {loading ? 'Please wait...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminGymDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [owners, setOwners] = useState<Owner[]>([])
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [qrResult, setQrResult] = useState<{ qrCode: string; checkinUrl: string } | null>(null)
  const [qrLoading, setQrLoading] = useState(false)

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; title: string; message: string; danger?: boolean; action: () => Promise<void>
  }>({ open: false, title: '', message: '', action: async () => { } })

  // Member modal
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [memberForm, setMemberForm] = useState({
    name: '', phone: '', email: '',
    gender: '', dateOfBirth: '', address: '', notes: ''
  })
  const [memberError, setMemberError] = useState('')
  const [memberSubmitting, setMemberSubmitting] = useState(false)

  // Trial / Grace modals
  const [showTrialModal, setShowTrialModal] = useState(false)
  const [trialDate, setTrialDate] = useState('')
  const [showGraceModal, setShowGraceModal] = useState(false)
  const [graceDate, setGraceDate] = useState('')

  // Support tool results
  const [impersonateResult, setImpersonateResult] = useState<{
    accessToken: string; loginUrl: string; ownerName: string; expiresIn: string
  } | null>(null)
  const [resetResult, setResetResult] = useState<{
    temporaryPassword: string; ownerName: string
  } | null>(null)

  // Owner modal
  const [showOwnerModal, setShowOwnerModal] = useState(false)
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null)
  const [ownerForm, setOwnerForm] = useState({ name: '', phone: '', email: '', password: '' })
  const [ownerError, setOwnerError] = useState('')
  const [ownerSubmitting, setOwnerSubmitting] = useState(false)

  useEffect(() => { fetchAll() }, [id])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${getToken()}` }
      const [tenantRes, usageRes, membersRes, paymentsRes, activityRes, ownersRes] = await Promise.all([
        fetch(`${API}/api/admin/tenants/${id}`, { headers }),
        fetch(`${API}/api/admin/tenants/${id}/usage`, { headers }),
        fetch(`${API}/api/admin/tenants/${id}/members`, { headers }),
        fetch(`${API}/api/admin/tenants/${id}/payments`, { headers }),
        fetch(`${API}/api/admin/tenants/${id}/activity?limit=30`, { headers }),
        fetch(`${API}/api/admin/tenants/${id}/owners`, { headers }),
      ])
      const [td, ud, md, pd, ad, od] = await Promise.all([
        tenantRes.json(), usageRes.json(), membersRes.json(),
        paymentsRes.json(), activityRes.json(), ownersRes.json(),
      ])
      if (td.success) setTenant(td.data)
      if (ud.success) setUsage(ud.data)
      if (md.success) setMembers(md.data || [])
      if (pd.success) setPayments(pd.data || [])
      if (ad.success) setActivity(ad.data || [])
      if (od.success) setOwners(od.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const doAction = async (url: string, method: string, body?: object) => {
    const res = await fetch(`${API}${url}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Action failed')
    return data
  }

  const confirm = (title: string, message: string, action: () => Promise<void>, danger = false) => {
    setConfirmDialog({ open: true, title, message, danger, action })
  }

  const handleConfirm = async () => {
    setActionLoading(true)
    try {
      await confirmDialog.action()
      setConfirmDialog(p => ({ ...p, open: false }))
    } catch (e: any) {
      alert(e.message)
    } finally {
      setActionLoading(false)
    }
  }

  // ── Gym actions ──────────────────────────────────────────────────────────────

  const handleApprove = () => confirm(
    'Approve Gym', `Approve "${tenant?.name}" and allow them to log in?`,
    async () => {
      await doAction(`/api/admin/tenants/${id}/approve`, 'PATCH')
      setTenant(p => p ? { ...p, isActive: true } : p)
    }
  )

  const handleToggleActive = () => {
    if (tenant?.isActive) {
      confirm('Suspend Gym', `Suspend "${tenant.name}"? Their staff will not be able to log in.`,
        async () => {
          await doAction(`/api/admin/tenants/${id}/deactivate`, 'PATCH')
          setTenant(p => p ? { ...p, isActive: false } : p)
        }, true)
    } else {
      confirm('Reactivate Gym', `Reactivate "${tenant?.name}"?`,
        async () => {
          await doAction(`/api/admin/tenants/${id}/activate`, 'PATCH')
          setTenant(p => p ? { ...p, isActive: true } : p)
        })
    }
  }

  const handleDelete = () => confirm(
    'Delete Gym',
    `Permanently delete "${tenant?.name}"? This will deactivate all staff. Member data is preserved.`,
    async () => {
      await doAction(`/api/admin/tenants/${id}`, 'DELETE')
      router.push('/admin/gyms')
    }, true
  )

  const handleResetPassword = async () => {
    setActionLoading(true)
    try {
      const data = await doAction(`/api/admin/tenants/${id}/reset-password`, 'POST')
      setResetResult(data.data)
    } catch (e: any) { alert(e.message) }
    finally { setActionLoading(false) }
  }

  const handleImpersonate = async () => {
    setActionLoading(true)
    try {
      const data = await doAction(`/api/admin/tenants/${id}/impersonate`, 'POST')
      setImpersonateResult(data.data)
    } catch (e: any) { alert(e.message) }
    finally { setActionLoading(false) }
  }

  const handleSetTrial = async (e: FormEvent) => {
    e.preventDefault()
    if (!trialDate) return
    setActionLoading(true)
    try {
      const data = await doAction(`/api/admin/tenants/${id}/trial`, 'PATCH', {
        trialEndsAt: new Date(trialDate).toISOString()
      })
      setTenant(p => p ? { ...p, trialEndsAt: data.data.trialEndsAt } : p)
      setShowTrialModal(false); setTrialDate('')
    } catch (e: any) { alert(e.message) }
    finally { setActionLoading(false) }
  }

  const handleSetGrace = async (e: FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const data = await doAction(`/api/admin/tenants/${id}/grace-period`, 'PATCH', {
        gracePeriodEndsAt: graceDate ? new Date(graceDate).toISOString() : null
      })
      setTenant(p => p ? { ...p, gracePeriodEndsAt: data.data.gracePeriodEndsAt } : p)
      setShowGraceModal(false); setGraceDate('')
    } catch (e: any) { alert(e.message) }
    finally { setActionLoading(false) }
  }

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault()
    setMemberError('')
    if (!memberForm.name.trim() || !memberForm.phone.trim()) {
      setMemberError('Name and phone are required.'); return
    }
    setMemberSubmitting(true)
    try {
      const res = await fetch(`${API}/api/admin/tenants/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          name: memberForm.name,
          phone: memberForm.phone,
          email: memberForm.email || undefined,
          gender: memberForm.gender || undefined,
          dateOfBirth: memberForm.dateOfBirth || undefined,
          address: memberForm.address || undefined,
          notes: memberForm.notes || undefined,
        })
      })
      const data = await res.json()
      if (!res.ok) { setMemberError(data.message || 'Failed'); return }
      setMembers(prev => [data.data, ...prev])
      setShowMemberModal(false)
      setMemberForm({ name: '', phone: '', email: '', gender: '', dateOfBirth: '', address: '', notes: '' })
    } catch { setMemberError('Network error.') }
    finally { setMemberSubmitting(false) }
  }

  // ── Owner actions ────────────────────────────────────────────────────────────

  const openAddOwner = () => {
    setEditingOwner(null)
    setOwnerForm({ name: '', phone: '', email: '', password: '' })
    setOwnerError('')
    setShowOwnerModal(true)
  }

  const openEditOwner = (o: Owner) => {
    setEditingOwner(o)
    setOwnerForm({ name: o.name, phone: o.phone, email: o.email || '', password: '' })
    setOwnerError('')
    setShowOwnerModal(true)
  }

  const handleOwnerSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setOwnerError('')
    if (!ownerForm.name.trim() || !ownerForm.phone.trim()) {
      setOwnerError('Name and phone are required.'); return
    }
    setOwnerSubmitting(true)
    try {
      if (editingOwner) {
        const data = await doAction(
          `/api/admin/tenants/${id}/owners/${editingOwner.id}`,
          'PATCH',
          { name: ownerForm.name, phone: ownerForm.phone, email: ownerForm.email }
        )
        setOwners(prev => prev.map(o => o.id === editingOwner.id ? data.data : o))
      } else {
        const data = await doAction(
          `/api/admin/tenants/${id}/owners`,
          'POST',
          { name: ownerForm.name, phone: ownerForm.phone, email: ownerForm.email, password: ownerForm.password }
        )
        setOwners(prev => [data.data, ...prev])
        if (data.temporaryPassword) {
          alert(`Owner added!\n\nLogin: ${ownerForm.phone}\nTemp password: ${data.temporaryPassword}\n\nShare this with the owner.`)
        }
      }
      setShowOwnerModal(false)
    } catch (e: any) {
      setOwnerError(e.message)
    } finally {
      setOwnerSubmitting(false)
    }
  }

  // ── Early returns ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle size={28} className="text-foreground/20" />
        <p className="text-foreground/30 text-sm">Gym not found</p>
        <button onClick={() => router.push('/admin/gyms')}
          className="text-xs text-violet-400 hover:text-violet-300">← Back to gyms</button>
      </div>
    )
  }

  const trialDays = tenant.trialEndsAt ? daysFromNow(tenant.trialEndsAt) : null
  const graceDays = tenant.gracePeriodEndsAt ? daysFromNow(tenant.gracePeriodEndsAt) : null
  const totalRevenue = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.finalAmount, 0)

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'members', label: 'Members', count: members.length },
    { key: 'payments', label: 'Payments', count: payments.length },
    { key: 'activity', label: 'Activity', count: activity.length },
  ]

  const handleGenerateQR = async () => {
    setQrLoading(true)
    try {
      const res = await fetch(`${API}/api/admin/tenants/${id}/qr`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to generate QR')
      setQrResult(data.data)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setQrLoading(false)
    }
  }

  const handleDownloadQR = () => {
    if (!qrResult?.qrCode) return
    const link = document.createElement('a')
    link.href = qrResult.qrCode
    link.download = `${tenant?.slug}-checkin-qr.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        danger={confirmDialog.danger}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmDialog(p => ({ ...p, open: false }))}
        loading={actionLoading}
      />

      <div className="space-y-6 max-w-5xl">

        {/* ── Back + Header ── */}
        <div>
          <button onClick={() => router.push('/admin/gyms')}
            className="flex items-center gap-2 text-foreground/40 hover:text-foreground text-sm mb-4 transition-colors">
            <ArrowLeft size={15} />Back to Gyms
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center text-violet-400 text-lg font-bold flex-shrink-0">
                {tenant.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-foreground">{tenant.name}</h1>
                  {tenant.isActive
                    ? <CheckCircle size={15} className="text-emerald-400" />
                    : <Clock size={15} className="text-amber-400" />
                  }
                  {!tenant.isActive && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">
                      Pending Approval
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-foreground/30">{tenant.slug}.jovifitx.online</p>
                  <a href={`https://${tenant.slug}.jovifitx.online`} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-foreground/20 hover:text-violet-400 transition-colors">
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {!tenant.isActive && (
                <button onClick={handleApprove} disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-xl transition-all disabled:opacity-50">
                  <CheckCircle size={13} />Approve
                </button>
              )}
              {tenant.isActive && (
                <button onClick={handleToggleActive} disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium rounded-xl transition-all disabled:opacity-50">
                  <ToggleLeft size={13} />Suspend
                </button>
              )}
              {!tenant.isActive && !tenant.isDeleted && (
                <button onClick={handleToggleActive} disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-medium rounded-xl transition-all disabled:opacity-50">
                  <ToggleRight size={13} />Reactivate
                </button>
              )}
              <button onClick={() => setShowMemberModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 text-xs font-medium rounded-xl transition-all">
                <Plus size={13} />Add Member
              </button>
              <button onClick={handleDelete} disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-xl transition-all disabled:opacity-50">
                <Trash2 size={13} />Delete
              </button>
            </div>
          </div>
        </div>

        {/* ── Trial alert ── */}
        {trialDays !== null && trialDays <= 5 && (
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border ${trialDays < 0
            ? 'bg-red-500/10 border-red-500/20 text-red-400'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
            <AlertCircle size={15} className="flex-shrink-0" />
            <p className="text-sm">
              {trialDays < 0
                ? `Trial expired ${Math.abs(trialDays)} days ago`
                : `Trial expires in ${trialDays} day${trialDays !== 1 ? 's' : ''}`}
            </p>
            <button onClick={() => setShowTrialModal(true)}
              className="ml-auto text-xs underline opacity-70 hover:opacity-100">Extend</button>
          </div>
        )}

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Members', value: usage?.memberCount ?? 0, icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10' },
            { label: 'Active Members', value: usage?.activeMembers ?? 0, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Staff Count', value: usage?.staffCount ?? 0, icon: Shield, color: 'text-sky-400', bg: 'bg-sky-500/10' },
            { label: 'Total Revenue', value: toRupees(usage?.totalRevenue ?? 0), icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-4">
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon size={15} className={color} />
              </div>
              <p className="text-xl font-bold text-foreground">{value}</p>
              <p className="text-[11px] text-foreground/40 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1 w-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t.key ? 'bg-violet-600 text-foreground' : 'text-foreground/40 hover:text-foreground'
                }`}>
              {t.label}
              {t.count !== undefined && <span className="ml-1.5 opacity-60">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            OVERVIEW TAB
        ══════════════════════════════════════════════ */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Gym info */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <p className="text-[11px] uppercase tracking-widest text-foreground/30 font-semibold">Gym Info</p>
              <InfoRow label="Name" value={tenant.name} />
              <InfoRow label="Slug" value={`${tenant.slug}.jovifitx.online`} />
              <InfoRow label="Phone" value={tenant.phone || '—'} />
              <InfoRow label="Email" value={tenant.email || '—'} />
              <InfoRow label="Joined" value={formatDate(tenant.createdAt)} />
              <InfoRow label="Status" value={
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tenant.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>{tenant.isActive ? 'Active' : 'Inactive'}</span>
              } />
            </div>

            {/* Trial & Grace */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <p className="text-[11px] uppercase tracking-widest text-foreground/30 font-semibold">Trial & Access</p>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-foreground/40">Trial Expiry</p>
                  <button onClick={() => {
                    setTrialDate(tenant.trialEndsAt ? tenant.trialEndsAt.substring(0, 10) : '')
                    setShowTrialModal(true)
                  }} className="text-[11px] text-violet-400 hover:text-violet-300">Edit</button>
                </div>
                {tenant.trialEndsAt ? (
                  <div className="rounded-xl bg-white/[0.02] border border-border px-3 py-2.5">
                    <p className="text-sm text-foreground">{formatDate(tenant.trialEndsAt)}</p>
                    <p className={`text-xs mt-0.5 ${trialDays! < 0 ? 'text-red-400' : trialDays! <= 5 ? 'text-amber-400' : 'text-foreground/30'
                      }`}>
                      {trialDays! < 0 ? `Expired ${Math.abs(trialDays!)}d ago` : `${trialDays}d remaining`}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-foreground/30">Not set</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-foreground/40">Grace Period</p>
                  <button onClick={() => {
                    setGraceDate(tenant.gracePeriodEndsAt ? tenant.gracePeriodEndsAt.substring(0, 10) : '')
                    setShowGraceModal(true)
                  }} className="text-[11px] text-violet-400 hover:text-violet-300">
                    {tenant.gracePeriodEndsAt ? 'Edit' : 'Set'}
                  </button>
                </div>
                {tenant.gracePeriodEndsAt ? (
                  <div className="rounded-xl bg-white/[0.02] border border-border px-3 py-2.5">
                    <p className="text-sm text-foreground">{formatDate(tenant.gracePeriodEndsAt)}</p>
                    <p className={`text-xs mt-0.5 ${graceDays! < 0 ? 'text-red-400' : 'text-sky-400'}`}>
                      {graceDays! < 0 ? 'Grace period ended' : `${graceDays}d remaining`}
                    </p>
                    <button onClick={() => confirm('Remove Grace Period', 'Remove the grace period for this gym?',
                      async () => {
                        await doAction(`/api/admin/tenants/${id}/grace-period`, 'PATCH', { gracePeriodEndsAt: null })
                        setTenant(p => p ? { ...p, gracePeriodEndsAt: null } : p)
                      })}
                      className="text-[11px] text-red-400/60 hover:text-red-400 mt-1.5 block transition-colors">
                      Remove grace period
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-foreground/30">No grace period set</p>
                )}
              </div>
            </div>

            {/* Support tools — full width */}
            <div className="bg-card border border-border rounded-2xl p-5 sm:col-span-2">
              <p className="text-[11px] uppercase tracking-widest text-foreground/30 font-semibold mb-4">Support Tools</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">

                {/* Reset password */}
                <div className="rounded-xl bg-white/[0.02] border border-border p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <KeyRound size={15} className="text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Reset Owner Password</p>
                      <p className="text-xs text-foreground/30 mt-0.5">Resets to Welcome@123, forces change on next login</p>
                      <button onClick={handleResetPassword} disabled={actionLoading}
                        className="mt-3 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium rounded-lg transition-all disabled:opacity-50">
                        Reset Password
                      </button>
                      {resetResult && (
                        <div className="mt-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <p className="text-[11px] text-amber-400/80">Temp password for {resetResult.ownerName}:</p>
                          <p className="text-xs font-mono text-amber-300 mt-0.5">{resetResult.temporaryPassword}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Impersonate */}
                <div className="rounded-xl bg-white/[0.02] border border-border p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <LogIn size={15} className="text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Login as Owner</p>
                      <p className="text-xs text-foreground/30 mt-0.5">Get a 1-hour access token to support this gym</p>
                      <button onClick={handleImpersonate} disabled={actionLoading}
                        className="mt-3 px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-xs font-medium rounded-lg transition-all disabled:opacity-50">
                        Generate Token
                      </button>
                      {impersonateResult && (
                        <div className="mt-2 p-2 rounded-lg bg-violet-500/5 border border-violet-500/10 space-y-1">
                          <p className="text-[11px] text-violet-400/80">
                            Token for {impersonateResult.ownerName} (expires in {impersonateResult.expiresIn}):
                          </p>
                          <p className="text-[10px] font-mono text-violet-300 break-all">
                            {impersonateResult.accessToken.substring(0, 60)}...
                          </p>
                          <a href={impersonateResult.loginUrl} target="_blank" rel="noopener noreferrer"
                            className="text-[11px] text-violet-400 hover:underline flex items-center gap-1">
                            Open gym dashboard <ExternalLink size={10} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="rounded-xl bg-white/[0.02] border border-border p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <QrCode size={15} className="text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Gym Check-in QR</p>
                      <p className="text-xs text-foreground/30 mt-0.5">Generate and download QR for member self check-in</p>
                      <button onClick={handleGenerateQR} disabled={qrLoading}
                        className="mt-3 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg transition-all disabled:opacity-50">
                        {qrLoading ? 'Generating...' : 'Generate QR'}
                      </button>

                      {qrResult && (
                        <div className="mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                          <img
                            src={qrResult.qrCode}
                            alt="Gym check-in QR"
                            className="w-32 h-32 rounded-lg bg-white p-1 mx-auto"
                          />
                          <button onClick={handleDownloadQR}
                            className="w-full px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg transition-all">
                            Download PNG
                          </button>
                          <p className="text-[10px] text-emerald-400/60 break-all">{qrResult.checkinUrl}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Owners list ── */}
              <div className="rounded-xl bg-white/[0.02] border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <UserCheck size={14} className="text-sky-400" />
                      Owners
                      {owners.length > 0 && (
                        <span className="text-[11px] text-foreground/30 font-normal">{owners.length}</span>
                      )}
                    </p>
                    <p className="text-xs text-foreground/30 mt-0.5">A gym can have multiple owners</p>
                  </div>
                  <button onClick={openAddOwner}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-medium rounded-lg transition-all">
                    <Plus size={12} />Add Owner
                  </button>
                </div>

                {owners.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-foreground/20">No owners found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {owners.map((o, i) => (
                      <div key={o.id} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 text-xs font-bold flex-shrink-0">
                            {o.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-foreground truncate">{o.name}</p>
                              {i === 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 font-medium flex-shrink-0">
                                  Primary
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-foreground/30 truncate">
                              {o.phone}{o.email ? ` · ${o.email}` : ''}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => openEditOwner(o)}
                          className="flex-shrink-0 ml-3 px-2.5 py-1 bg-muted hover:bg-muted text-foreground/40 hover:text-foreground text-xs rounded-lg transition-all">
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            MEMBERS TAB
        ══════════════════════════════════════════════ */}
        {tab === 'members' && (
          <div className="bg-card border border-border rounded-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{members.length} Members</p>
              <button onClick={() => setShowMemberModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 text-xs font-medium rounded-lg transition-all">
                <Plus size={12} />Add Member
              </button>
            </div>
            {members.length === 0 ? (
              <div className="py-12 text-center">
                <Users size={24} className="text-foreground/10 mx-auto mb-3" />
                <p className="text-foreground/30 text-sm">No members yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {members.map(m => (
                  <div key={m.id} className="px-6 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-foreground/40 text-xs font-medium">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-foreground">{m.name}</p>
                        <p className="text-xs text-foreground/30">{m.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {m.plan && <span className="text-xs text-foreground/30 hidden sm:block">{m.plan.name}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400'
                        : m.status === 'EXPIRED' ? 'bg-red-500/10 text-red-400'
                          : 'bg-muted text-foreground/30'
                        }`}>{m.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            PAYMENTS TAB
        ══════════════════════════════════════════════ */}
        {tab === 'payments' && (
          <div className="bg-card border border-border rounded-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{payments.length} Payments</p>
              <p className="text-xs text-foreground/30">Total: {toRupees(totalRevenue)}</p>
            </div>
            {payments.length === 0 ? (
              <div className="py-12 text-center text-foreground/30 text-sm">No payments yet</div>
            ) : (
              <div className="divide-y divide-white/5">
                {payments.map(p => (
                  <div key={p.id} className="px-6 py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">{p.member?.name || '—'}</p>
                      <p className="text-xs text-foreground/30">
                        {p.plan?.name} · {formatDate(p.createdAt)} · {p.paymentMethod}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-foreground">{toRupees(p.finalAmount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400'
                        : p.status === 'PARTIAL' ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-muted text-foreground/30'
                        }`}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            ACTIVITY TAB
        ══════════════════════════════════════════════ */}
        {tab === 'activity' && (
          <div className="bg-card border border-border rounded-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Recent Activity</p>
              <p className="text-xs text-foreground/30 mt-0.5">Last 30 events — payments and check-ins</p>
            </div>
            {activity.length === 0 ? (
              <div className="py-12 text-center text-foreground/30 text-sm">No activity yet</div>
            ) : (
              <div className="divide-y divide-white/5">
                {activity.map(a => (
                  <div key={a.id} className="px-6 py-3.5 flex items-center gap-4">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${a.type === 'PAYMENT' ? 'bg-emerald-500/10' : 'bg-violet-500/10'
                      }`}>
                      {a.type === 'PAYMENT'
                        ? <CreditCard size={13} className="text-emerald-400" />
                        : <CheckCircle size={13} className="text-violet-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{a.memberName}</p>
                      <p className="text-xs text-foreground/30 truncate">{a.detail}</p>
                    </div>
                    <p className="text-xs text-foreground/30 flex-shrink-0">{formatDate(a.timestamp)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════ */}

      {/* Add Member */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/60 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-background border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-background">
              <div>
                <h2 className="text-base font-bold text-foreground">Add Member</h2>
                <p className="text-xs text-foreground/30 mt-0.5">to {tenant.name}</p>
              </div>
              <button onClick={() => { setShowMemberModal(false); setMemberError('') }}
                className="w-8 h-8 rounded-xl bg-muted hover:bg-muted flex items-center justify-center text-foreground/40 hover:text-foreground transition-all">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="px-6 py-5 space-y-4">

              {/* Personal Info */}
              <div className="space-y-3">
                <p className="text-[11px] text-foreground/30 uppercase tracking-widest font-semibold">Personal Info</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-xs text-foreground/40 font-medium">Full Name *</label>
                    <input value={memberForm.name}
                      onChange={e => setMemberForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Ravi Kumar" required autoFocus className={inputCls} />
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-xs text-foreground/40 font-medium">Phone *</label>
                    <input value={memberForm.phone}
                      onChange={e => setMemberForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="9876543210" type="tel" required className={inputCls} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-foreground/40 font-medium">Email <span className="text-foreground/20">(optional)</span></label>
                  <input value={memberForm.email}
                    onChange={e => setMemberForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="ravi@email.com" type="email" className={inputCls} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-foreground/40 font-medium">Gender</label>
                    <select value={memberForm.gender}
                      onChange={e => setMemberForm(p => ({ ...p, gender: e.target.value }))}
                      className={inputCls + ' appearance-none'}>
                      <option value="">Select</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-foreground/40 font-medium">Date of Birth</label>
                    <input value={memberForm.dateOfBirth}
                      onChange={e => setMemberForm(p => ({ ...p, dateOfBirth: e.target.value }))}
                      type="date" className={inputCls} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-foreground/40 font-medium">Address</label>
                  <input value={memberForm.address}
                    onChange={e => setMemberForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="Chennai, Tamil Nadu" className={inputCls} />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2 pt-1 border-t border-border">
                <p className="text-[11px] text-foreground/30 uppercase tracking-widest font-semibold">Notes</p>
                <textarea value={memberForm.notes}
                  onChange={e => setMemberForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Health conditions, goals, preferences..."
                  rows={3}
                  className={inputCls + ' resize-none'} />
              </div>

              {memberError && (
                <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3.5 py-2.5">{memberError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button"
                  onClick={() => { setShowMemberModal(false); setMemberError('') }}
                  className="flex-1 py-2.5 rounded-xl bg-muted hover:bg-muted text-foreground/60 text-sm font-medium transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={memberSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-foreground text-sm font-medium transition-all">
                  {memberSubmitting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Trial */}
      {showTrialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-background border border-border rounded-2xl shadow-2xl p-6">
            <h2 className="text-base font-bold text-foreground mb-4">Set Trial Expiry</h2>
            <form onSubmit={handleSetTrial} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-foreground/40 font-medium">Trial Ends On</label>
                <input type="date" value={trialDate} onChange={e => setTrialDate(e.target.value)}
                  required className={inputCls} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowTrialModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-muted hover:bg-muted text-foreground/60 text-sm font-medium transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-foreground text-sm font-medium transition-all">
                  {actionLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grace Period */}
      {showGraceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-background border border-border rounded-2xl shadow-2xl p-6">
            <h2 className="text-base font-bold text-foreground mb-1">Set Grace Period</h2>
            <p className="text-xs text-foreground/30 mb-4">Lets the gym continue using the platform after trial expiry</p>
            <form onSubmit={handleSetGrace} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-foreground/40 font-medium">Grace Period Ends On</label>
                <input type="date" value={graceDate} onChange={e => setGraceDate(e.target.value)} className={inputCls} />
                <p className="text-[11px] text-foreground/25">Leave blank to remove grace period</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowGraceModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-muted hover:bg-muted text-foreground/60 text-sm font-medium transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-foreground text-sm font-medium transition-all">
                  {actionLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Owner */}
      {showOwnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-background border border-border rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {editingOwner ? 'Edit Owner' : 'Add Owner'}
                </h2>
                <p className="text-xs text-foreground/30 mt-0.5">{tenant.name}</p>
              </div>
              <button onClick={() => setShowOwnerModal(false)}
                className="w-8 h-8 rounded-xl bg-muted hover:bg-muted flex items-center justify-center text-foreground/40 hover:text-foreground transition-all">
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleOwnerSubmit} className="px-6 py-5 space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-foreground/40 font-medium">Full Name *</label>
                <input value={ownerForm.name}
                  onChange={e => setOwnerForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Ravi Kumar" required autoFocus className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-foreground/40 font-medium">Phone *</label>
                <input value={ownerForm.phone}
                  onChange={e => setOwnerForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="9876543210" type="tel" required className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-foreground/40 font-medium">Email <span className="text-foreground/20">(optional)</span></label>
                <input value={ownerForm.email}
                  onChange={e => setOwnerForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="owner@gym.com" type="email" className={inputCls} />
              </div>
              {!editingOwner && (
                <div className="space-y-1">
                  <label className="text-xs text-foreground/40 font-medium">
                    Password <span className="text-foreground/20">(optional)</span>
                  </label>
                  <input value={ownerForm.password}
                    onChange={e => setOwnerForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Leave blank for Welcome@123" type="text" className={inputCls} />
                </div>
              )}
              {ownerError && (
                <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3.5 py-2.5">{ownerError}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowOwnerModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-muted hover:bg-muted text-foreground/60 text-sm font-medium transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={ownerSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-foreground text-sm font-medium transition-all">
                  {ownerSubmitting ? 'Saving...' : editingOwner ? 'Save Changes' : 'Add Owner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Info row helper ──────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-foreground/30 flex-shrink-0">{label}</span>
      <span className="text-xs text-foreground text-right truncate">{value}</span>
    </div>
  )
}