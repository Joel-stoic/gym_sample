'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Building2, CheckCircle, Search, ChevronRight,
  Plus, X, Users, Shield, Clock
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null

interface Tenant {
  id: string
  name: string
  slug: string
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  trialEndsAt: string | null
  email?: string
  phone?: string
  _count?: { members: number; staff: number }
}

interface AddGymForm {
  gymName: string
  slug: string
  ownerName: string
  ownerPhone: string
  ownerEmail: string
  ownerPassword: string
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function trialStatus(t: Tenant) {
  if (!t.trialEndsAt) return null
  const days = Math.ceil((new Date(t.trialEndsAt).getTime() - Date.now()) / 86400000)
  if (days < 0) return { label: 'Trial expired', color: 'text-red-400 bg-red-500/10' }
  if (days <= 5) return { label: `Trial: ${days}d left`, color: 'text-amber-400 bg-amber-500/10' }
  return { label: `Trial: ${days}d left`, color: 'text-sky-400 bg-sky-500/10' }
}

// ── Inner component that uses useSearchParams ──────────────────────────────

function AdminGymsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [filtered, setFiltered] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'pending'>(
    (searchParams.get('filter') as any) || 'all'
  )
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<AddGymForm>({
    gymName: '', slug: '', ownerName: '', ownerPhone: '', ownerEmail: '', ownerPassword: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => { fetchTenants() }, [])

  useEffect(() => {
    let list = tenants
    if (filter === 'active') list = list.filter(t => t.isActive)
    if (filter === 'pending') list = list.filter(t => !t.isActive)
    if (search) list = list.filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(list)
  }, [tenants, filter, search])

  const fetchTenants = async () => {
    try {
      const res = await fetch(`${API}/api/admin/tenants`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await res.json()
      setTenants(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setApprovingId(id)
    try {
      const res = await fetch(`${API}/api/admin/tenants/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (res.ok) setTenants(prev => prev.map(t => t.id === id ? { ...t, isActive: true } : t))
    } finally {
      setApprovingId(null)
    }
  }

  const handleNameChange = (val: string) => {
    setForm(prev => ({
      ...prev,
      gymName: val,
      slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }))
  }

  const handleAddGym = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.gymName.trim() || !form.slug.trim() || !form.ownerName.trim() || !form.ownerPhone.trim()) {
      setFormError('Gym name, slug, owner name and phone are required.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/api/admin/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          gymName: form.gymName,
          slug: form.slug,
          ownerName: form.ownerName,
          ownerPhone: form.ownerPhone,
          ownerEmail: form.ownerEmail || undefined,
          ownerPassword: form.ownerPassword || undefined,
        })
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.message || 'Something went wrong.'); return }
      setTenants(prev => [data.data.tenant, ...prev])
      setShowModal(false)
      setForm({ gymName: '', slug: '', ownerName: '', ownerPhone: '', ownerEmail: '', ownerPassword: '' })
      if (data.data.temporaryPassword) {
        alert(`Gym created!\n\nOwner login:\nPhone: ${form.ownerPhone}\nTemporary password: ${data.data.temporaryPassword}\n\nShare this with the gym owner.`)
      }
    } catch {
      setFormError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const filterTabs = [
    { key: 'all',     label: 'All',     count: tenants.length },
    { key: 'active',  label: 'Active',  count: tenants.filter(t => t.isActive).length },
    { key: 'pending', label: 'Pending', count: tenants.filter(t => !t.isActive).length },
  ]

  const inputCls = 'w-full bg-[#111118] border border-white/5 focus:border-crayola/50 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all'

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gyms</h1>
          <p className="text-sm text-white/40 mt-1">{tenants.length} gyms registered on the platform</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-crayola hover:bg-crayola text-white text-sm font-medium rounded-xl transition-all"
        >
          <Plus size={15} />Add Gym
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or slug..."
            className="w-full bg-[#111118] border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-crayola/40 transition-all"
          />
        </div>
        <div className="flex gap-1 bg-[#111118] border border-white/5 rounded-xl p-1">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === tab.key ? 'bg-crayola text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 opacity-60">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-[#111118] border border-white/5 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-crayola border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 size={28} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No gyms found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(gym => {
              const trial = trialStatus(gym)
              return (
                <div
                  key={gym.id}
                  onClick={() => router.push(`/admin/gyms/${gym.id}`)}
                  className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-crayola/15 flex items-center justify-center text-crayola text-sm font-bold flex-shrink-0">
                      {gym.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-white">{gym.name}</p>
                        {gym.isActive && <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />}
                        {trial && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${trial.color}`}>
                            {trial.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <p className="text-xs text-white/30">{gym.slug}.jovifitx.online</p>
                        <span className="text-white/10">·</span>
                        <p className="text-xs text-white/30">{formatDate(gym.createdAt)}</p>
                        {gym._count && (
                          <>
                            <span className="text-white/10 hidden sm:block">·</span>
                            <p className="text-xs text-white/30 hidden sm:block">
                              {gym._count.members} members · {gym._count.staff} staff
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    {!gym.isActive ? (
                      <button
                        onClick={e => handleApprove(gym.id, e)}
                        disabled={approvingId === gym.id}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg transition-all disabled:opacity-50"
                      >
                        {approvingId === gym.id ? 'Approving...' : 'Approve'}
                      </button>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                        Active
                      </span>
                    )}
                    <ChevronRight size={15} className="text-white/20 group-hover:text-white/50 transition-colors" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Gym Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-[#0e0e15] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 sticky top-0 bg-[#0e0e15]">
              <div>
                <h2 className="text-base font-bold text-white">Add Gym</h2>
                <p className="text-xs text-white/30 mt-0.5">Gym will be pending until approved</p>
              </div>
              <button
                onClick={() => { setShowModal(false); setFormError('') }}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddGym} className="px-6 py-5 space-y-4">
              {/* Gym info */}
              <div className="space-y-3">
                <p className="text-[11px] text-white/30 uppercase tracking-widest font-semibold">Gym Info</p>
                <div className="space-y-1">
                  <label className="text-xs text-white/40 font-medium">Gym Name *</label>
                  <input value={form.gymName} onChange={e => handleNameChange(e.target.value)}
                    placeholder="e.g. Iron Temple Fitness" required className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/40 font-medium">Slug *</label>
                  <div className="flex items-center bg-[#111118] border border-white/5 focus-within:border-crayola/50 rounded-xl overflow-hidden transition-all">
                    <span className="px-3 text-xs text-white/20 border-r border-white/5 py-2.5 whitespace-nowrap flex-shrink-0">
                      jovifitx.online/
                    </span>
                    <input
                      value={form.slug}
                      onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                      placeholder="iron-temple" required
                      className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Owner info */}
              <div className="space-y-3 pt-1 border-t border-white/5">
                <p className="text-[11px] text-white/30 uppercase tracking-widest font-semibold">Owner Info</p>
                <div className="space-y-1">
                  <label className="text-xs text-white/40 font-medium">Owner Name *</label>
                  <input value={form.ownerName} onChange={e => setForm(p => ({ ...p, ownerName: e.target.value }))}
                    placeholder="e.g. Ravi Kumar" required className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/40 font-medium">Owner Phone *</label>
                  <input value={form.ownerPhone} onChange={e => setForm(p => ({ ...p, ownerPhone: e.target.value }))}
                    placeholder="9876543210" type="tel" required className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-white/40 font-medium">Email <span className="text-white/20">(opt)</span></label>
                    <input value={form.ownerEmail} onChange={e => setForm(p => ({ ...p, ownerEmail: e.target.value }))}
                      placeholder="owner@gym.com" type="email" className={inputCls} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-white/40 font-medium">Password <span className="text-white/20">(opt)</span></label>
                    <input value={form.ownerPassword} onChange={e => setForm(p => ({ ...p, ownerPassword: e.target.value }))}
                      placeholder="Welcome@123" type="text" className={inputCls} />
                  </div>
                </div>
                <p className="text-[11px] text-white/25">
                  Leave password blank to use default: <span className="text-white/40 font-mono">Welcome@123</span>
                </p>
              </div>

              {formError && (
                <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3.5 py-2.5">{formError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowModal(false); setFormError('') }}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm font-medium transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-crayola hover:bg-crayola disabled:opacity-50 text-white text-sm font-medium transition-all">
                  {submitting ? 'Creating...' : 'Create Gym'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Spinner fallback ───────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-crayola border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ── Default export wrapped in Suspense ────────────────────────────────────

export default function AdminGymsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminGymsContent />
    </Suspense>
  )
}