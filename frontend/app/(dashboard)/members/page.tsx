'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMembers } from '@/src/hooks/useMembers'

import MemberTable from '@/src/components/members/MemberTable'
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { Users, Plus, Search, ChevronLeft, ChevronRight, ChevronDown, Trash2 } from 'lucide-react'
import NewMemberModal from '@/src/components/members/NewMemberModal'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Member {
  id: string
  name: string
  phone?: string
  planName?: string
  status: string
  expiresAt?: string | null
}

export interface GymPlan {
  id: string
  name: string
}

// ─── Shared dark style tokens ─────────────────────────────────────────────────
const surfaceClass = "bg-surface-raised border border-border-subtle rounded-2xl"
const inputCls = `
  w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all
  placeholder:text-zinc-500 bg-surface-base border border-border-subtle
  focus:border-ember-500/50 focus:ring-2 focus:ring-ember-500/50
`

// Status → color mapping
const STATUS_STYLES: Record<string, { bg: string; border: string; text: string; label: string; dot: string }> = {
  ACTIVE:         { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400',  label: 'Active',    dot: 'bg-emerald-500' },
  EXPIRED:        { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400',  label: 'Expired',   dot: 'bg-rose-500' },
  SUSPENDED:      { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400',  label: 'Suspended', dot: 'bg-amber-500' },
  PLAN_NOT_ADDED: { bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', text: 'text-zinc-400',  label: 'No plan',   dot: 'bg-zinc-500' },
}

// ─── Skeleton pulse ───────────────────────────────────────────────────────────
function SkeletonCell({ width = '100%', height = 14 }: { width?: string | number; height?: number }) {
  return (
    <div
      className="rounded-md bg-white/5 animate-pulse"
      style={{ width, height }}
    />
  )
}

function MemberTableSkeleton() {
  return (
    <div className={`hidden overflow-hidden md:block ${surfaceClass}`}>
      <div
        className="grid px-5 py-4 border-b border-border-subtle bg-surface-raised"
        style={{ gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 80px' }}
      >
        {['Member', 'Phone', 'Plan', 'Status', 'Expires', ''].map((h) => (
          <div key={h} className="flex items-center">
            <span className="text-xs font-semibold text-zinc-500">
              {h}
            </span>
          </div>
        ))}
      </div>

      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="grid items-center px-5 py-5 border-b border-border-subtle last:border-0 bg-surface-base"
          style={{ gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 80px', opacity: 1 - i * 0.08 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse flex-shrink-0" style={{ animationDelay: `${i * 0.07}s` }} />
            <div className="flex flex-col gap-2">
              <SkeletonCell width={110} height={14} />
              <SkeletonCell width={70} height={12} />
            </div>
          </div>
          <SkeletonCell width={90} height={14} />
          <SkeletonCell width={72} height={24} />
          <SkeletonCell width={62} height={24} />
          <SkeletonCell width={80} height={14} />
          <div className="flex justify-end">
            <SkeletonCell width={32} height={32} />
          </div>
        </div>
      ))}
    </div>
  )
}

function MemberCardSkeleton() {
  return (
    <div className={`flex flex-col md:hidden ${surfaceClass} !rounded-none sm:!rounded-2xl border-x-0 sm:border-x bg-surface-base`}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4 border-b border-border-subtle last:border-0"
          style={{ opacity: 1 - i * 0.09 }}
        >
          <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse flex-shrink-0" style={{ animationDelay: `${i * 0.06}s` }} />
          <div className="flex flex-1 flex-col gap-2">
            <SkeletonCell width="46%" height={14} />
            <SkeletonCell width="30%" height={12} />
          </div>
          <div className="flex flex-shrink-0 flex-col items-center gap-2">
            <SkeletonCell width={40} height={12} />
            <SkeletonCell width={12} height={12} />
          </div>
        </div>
      ))}
    </div>
  )
}

function MemberCard({
  member,
  onDelete,
  onOpen,
}: {
  member: Member
  onDelete: (id: string) => void
  onOpen: (id: string) => void
}) {
  const st = STATUS_STYLES[member.status] ?? STATUS_STYLES.PLAN_NOT_ADDED
  const initials = member.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || '?'

  const subtitle = [member.planName, member.phone].filter(Boolean).join('  ·  ')

  return (
    <div
      className="relative flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/5 cursor-pointer border-b border-border-subtle last:border-0 group bg-surface-base"
      onClick={() => onOpen(member.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(member.id) }}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium text-zinc-300 bg-surface-raised border border-border-strong">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-white">{member.name}</p>
        <p className="mt-0.5 truncate text-[13px] font-medium text-zinc-500">
          {subtitle || 'No plan yet'}
        </p>
      </div>

      <div className="flex flex-shrink-0 flex-col items-center gap-1.5 pr-8">
        <span className="text-xs font-medium text-zinc-500 tracking-[0.01em]">
          {member.expiresAt
            ? new Date(member.expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
            : '—'}
        </span>
        <span className={`flex items-center gap-1.5 rounded-md px-2 py-1 border ${st.bg} ${st.border}`}>
          <span className={`rounded-full w-1.5 h-1.5 ${st.dot}`} />
          <span className={`text-[11px] font-medium ${st.text}`}>
            {st.label}
          </span>
        </span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(member.id)
        }}
        aria-label={`Delete ${member.name}`}
        className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
      >
        <Trash2 className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  )
}

function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 px-1 py-4 border-t border-border-subtle">
      <SkeletonCell width={90} height={36} />
      <SkeletonCell width={70} height={14} />
      <SkeletonCell width={90} height={36} />
    </div>
  )
}

function DarkSelect({
  value, onChange, options, placeholder, width = 160,
}: {
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
  placeholder: string
  width?: number
}) {
  return (
    <div className="relative w-full sm:w-auto" style={{ maxWidth: width }}>
      <select
        value={value || 'ALL'}
        onChange={(e) => onChange(e.target.value === 'ALL' ? '' : e.target.value)}
        className="w-full appearance-none rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-colors cursor-pointer bg-surface-base border border-border-subtle focus:border-ember-500/50 focus:ring-2 focus:ring-ember-500/50 shadow-sm"
        style={{ color: value ? 'white' : '#71717a' }}
      >
        <option value="ALL" className="bg-surface-base">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface-base text-white">{o.label}</option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
      />
    </div>
  )
}

export default function MembersPage() {
  const router = useRouter()

  const {
    members, total, loading,
    page, setPage,
    search, setSearch,
    status, setStatus,
    plan, setPlan,
    plans, deleteMember,
  } = useMembers()

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [stableTotal, setStableTotal] = useState(0)
  
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (!loading) setStableTotal(total)
  }, [loading, total])

  const displayTotal = loading ? stableTotal : total
  const deletingMember = members.find((m: Member) => m.id === deleteId)

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMember(deleteId)
      setDeleteId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(displayTotal / 20))

  return (
    <div className="space-y-8 font-sans pb-10 max-w-7xl mx-auto">
      
      {/* Header row */}
      <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-0">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-white">
            Members
          </h1>
          <p className="text-[14px] text-zinc-400 mt-1">
            Manage your gym members, plans, and attendance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors sm:w-auto bg-ember-500 hover:bg-ember-600 focus-visible:ring-2 focus-visible:ring-ember-500/50"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      <div className="px-4 sm:px-0">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              className={`${inputCls} pl-11`}
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <div className="flex gap-3">
            <DarkSelect
              value={status}
              onChange={(v) => { setStatus(v); setPage(1) }}
              placeholder="All Status"
              width={160}
              options={[
                { label: 'Active',         value: 'ACTIVE' },
                { label: 'Expired',        value: 'EXPIRED' },
                { label: 'Suspended',      value: 'SUSPENDED' },
                { label: 'Plan Not Added', value: 'PLAN_NOT_ADDED' },
              ]}
            />
            <DarkSelect
              value={plan}
              onChange={(v) => { setPlan(v); setPage(1) }}
              placeholder="All Plans"
              width={180}
              options={plans.map((p: GymPlan) => ({ label: p.name, value: p.id }))}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div>
            <MemberTableSkeleton />
            <MemberCardSkeleton />
            {displayTotal > 20 && <PaginationSkeleton />}
          </div>
        ) : members.length === 0 ? (
          <div className={`flex flex-col items-start justify-center py-16 px-8 rounded-2xl ${surfaceClass} bg-surface-base`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-raised border border-border-strong mb-5">
              <Users className="h-6 w-6 text-zinc-400" />
            </div>
            <p className="text-[18px] font-semibold text-white mb-2">No members found</p>
            <p className="text-[14px] text-zinc-400 max-w-md mb-6 leading-relaxed">It looks like you don't have any members yet. Add your first member to start managing your gym.</p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white transition-colors bg-surface-raised border border-border-strong hover:bg-white/5"
            >
              <Plus className="h-4 w-4" />
              Add Member
            </button>
          </div>
        ) : (
          <div>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl md:block">
              <div className={`overflow-hidden ${surfaceClass}`}>
                <MemberTable members={members} onDelete={(id: string) => setDeleteId(id)} />
              </div>
            </div>

            {/* Mobile list */}
            <div className={`flex flex-col overflow-hidden md:hidden ${surfaceClass} !rounded-none sm:!rounded-2xl border-x-0 sm:border-x bg-surface-base`}>
              {members.map((m: Member) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  onDelete={(id) => setDeleteId(id)}
                  onOpen={(id) => router.push(`/members/${id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            {displayTotal > 20 && (
              <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-6">
                {/* Mobile */}
                <div className="flex w-full items-center justify-between gap-4 sm:hidden">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    aria-label="Previous page"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-30 bg-surface-raised border border-border-strong text-zinc-300 hover:bg-white/5"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </button>
                  <div className="flex flex-col items-center gap-1 px-2">
                    <span className="text-[13px] font-semibold text-white">
                      {page} <span className="text-zinc-500 font-medium">/ {totalPages}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={page * 20 >= displayTotal}
                    onClick={() => setPage(page + 1)}
                    aria-label="Next page"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-30 bg-surface-raised border border-border-strong text-zinc-300 hover:bg-white/5"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Desktop */}
                <div className="hidden w-full items-center justify-between gap-4 sm:flex">
                  <p className="text-[13px] font-medium text-zinc-500">
                    Showing <span className="font-semibold tabular-nums text-white">{(page - 1) * 20 + 1}</span>
                    <span className="mx-1.5">–</span>
                    <span className="font-semibold tabular-nums text-white">{Math.min(page * 20, displayTotal)}</span>
                    <span className="mx-1.5">of</span>
                    <span className="font-semibold tabular-nums text-white">{displayTotal}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-30 text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-border-subtle"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {(() => {
                      const delta = 1
                      const start = Math.max(1, Math.min(page - delta, totalPages - delta * 2))
                      const end = Math.min(totalPages, start + delta * 2)
                      return Array.from({ length: end - start + 1 }, (_, i) => {
                        const p = start + i
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPage(p)}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${
                              page === p
                                ? 'bg-surface-raised text-white border border-border-strong'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-border-subtle'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      })
                    })()}
                    <button
                      type="button"
                      disabled={page * 20 >= displayTotal}
                      onClick={() => setPage(page + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-30 text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-border-subtle"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogOverlay className="bg-black/60" />
        <AlertDialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-[420px] p-0 overflow-hidden bg-surface-popover border border-border-strong rounded-2xl shadow-xl">
          <div className="p-6">
            <AlertDialogHeader className="mb-6">
              <AlertDialogTitle className="text-[18px] font-semibold text-white tracking-tight text-left">
                Delete {deletingMember?.name ?? 'member'}?
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-2 text-[14px] leading-relaxed text-zinc-400 text-left">
                This will hide the member from your list. Their payment history and attendance records will be permanently archived but preserved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-3">
              <AlertDialogCancel className="w-full sm:w-auto h-10 rounded-xl border border-border-strong bg-surface-raised hover:bg-white/5 text-[14px] font-medium text-white transition-colors mt-0 sm:mt-0">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="w-full sm:w-auto h-10 rounded-xl border-0 bg-rose-600 hover:bg-rose-700 text-[14px] font-medium text-white transition-colors"
              >
                Delete Member
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <NewMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}