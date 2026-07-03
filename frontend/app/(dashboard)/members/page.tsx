'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMembers } from '@/src/hooks/useMembers'

import MemberTable from '@/src/components/members/MemberTable'
// import NewMemberModal from '@/src/components/members/NewMemberModal'
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
const surface = { background: '#0a0a0a', border: '1px solid #ffffff0a' }
const inputCls = `
  w-full rounded-xl px-3 py-2.5 text-[13px] text-foreground outline-none transition-all
  placeholder:text-[#3d3d52] bg-[#0f0f0f] border border-[#ffffff0a]
  focus:border-[#7c3aed44] focus:shadow-[0_0_0_3px_#7c3aed12]
`

// Status → color mapping
const STATUS_STYLES: Record<string, { bg: string; border: string; text: string; label: string; dot: string }> = {
  ACTIVE:         { bg: '#22c55e15', border: '#22c55e30', text: '#4ade80',  label: 'Active',    dot: '#22c55e' },
  EXPIRED:        { bg: '#ef444415', border: '#ef444430', text: '#f87171',  label: 'Expired',   dot: '#ef4444' },
  SUSPENDED:      { bg: '#f59e0b15', border: '#f59e0b30', text: '#fbbf24',  label: 'Suspended', dot: '#f59e0b' },
  PLAN_NOT_ADDED: { bg: '#6b6b8015', border: '#6b6b8030', text: '#9898b0',  label: 'No plan',   dot: '#6b6b80' },
}

// ─── Skeleton pulse ───────────────────────────────────────────────────────────
function SkeletonCell({ width = '100%', height = 14 }: { width?: string | number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 6,
        background: 'linear-gradient(90deg, #171717 25%, #202020 50%, #171717 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  )
}

function MemberTableSkeleton() {
  return (
    <div className="hidden overflow-hidden rounded-2xl md:block" style={surface}>
      <div
        className="grid px-5 py-3 border-b border-[#ffffff08] bg-[#0a0a0a]"
        style={{ gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 80px' }}
      >
        {['Member', 'Phone', 'Plan', 'Status', 'Expires', ''].map((h) => (
          <div key={h} className="flex items-center">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#3d3d52]">
              {h}
            </span>
          </div>
        ))}
      </div>

      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="grid items-center px-5 py-4 border-b border-[#ffffff06]"
          style={{ gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 80px', opacity: 1 - i * 0.08 }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(90deg, #171717 25%, #202020 50%, #171717 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                animationDelay: `${i * 0.07}s`,
              }}
            />
            <div className="flex flex-col gap-1.5">
              <SkeletonCell width={110} height={13} />
              <SkeletonCell width={70} height={11} />
            </div>
          </div>
          <SkeletonCell width={90} height={13} />
          <div>
            <div style={{
              width: 72, height: 24, borderRadius: 20,
              background: 'linear-gradient(90deg, #171717 25%, #202020 50%, #171717 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              animationDelay: `${i * 0.07 + 0.1}s`,
            }} />
          </div>
          <div>
            <div style={{
              width: 62, height: 24, borderRadius: 20,
              background: 'linear-gradient(90deg, #171717 25%, #202020 50%, #171717 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              animationDelay: `${i * 0.07 + 0.15}s`,
            }} />
          </div>
          <SkeletonCell width={80} height={13} />
          <div className="flex justify-end">
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(90deg, #171717 25%, #202020 50%, #171717 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              animationDelay: `${i * 0.07 + 0.2}s`,
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function MemberCardSkeleton() {
  return (
    <div className="flex flex-col md:hidden sm:rounded-2xl" style={{ ...surface, borderRadius: 0 }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3"
          style={{
            opacity: 1 - i * 0.09,
            borderBottom: i === 6 ? 'none' : '1px solid #ffffff08',
          }}
        >
          <div
            style={{
              width: 46, height: 46, borderRadius: 999, flexShrink: 0,
              background: 'linear-gradient(90deg, #171717 25%, #202020 50%, #171717 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              animationDelay: `${i * 0.06}s`,
            }}
          />
          <div className="flex flex-1 flex-col gap-1.5">
            <SkeletonCell width="46%" height={13} />
            <SkeletonCell width="30%" height={11} />
          </div>
          <div className="flex flex-shrink-0 flex-col items-center gap-1.5">
            <SkeletonCell width={40} height={10} />
            <div style={{
              width: 10, height: 10, borderRadius: 999,
              background: 'linear-gradient(90deg, #171717 25%, #202020 50%, #171717 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              animationDelay: `${i * 0.06 + 0.1}s`,
            }} />
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
      className="relative flex items-center gap-3 px-4 py-3 transition-colors active:bg-[#ffffff05] cursor-pointer"
      style={{ borderBottom: '1px solid #ffffff08' }}
      onClick={() => onOpen(member.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(member.id) }}
    >
      <div
        className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-violet-300"
        style={{ background: '#7c3aed1f', border: '1px solid #7c3aed35' }}
      >
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14.5px] font-medium text-foreground">{member.name}</p>
        <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
          {subtitle || 'No plan yet'}
        </p>
      </div>

      <div className="flex flex-shrink-0 flex-col items-center gap-1.5 pr-7">
        <span className="text-[10.5px] font-medium text-[#4d4d66]">
          {member.expiresAt
            ? new Date(member.expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
            : '—'}
        </span>
        <span
          className="flex items-center gap-1 rounded-full px-1.5 py-[3px]"
          style={{ background: st.bg }}
        >
          <span className="rounded-full" style={{ width: 5, height: 5, background: st.dot }} />
          <span className="text-[9.5px] font-semibold uppercase tracking-wide" style={{ color: st.text }}>
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
        className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg transition-transform active:scale-90"
        style={{ background: '#ef444416', border: '1px solid #ef444430' }}
      >
        <Trash2 className="h-3.5 w-3.5" style={{ color: '#f87171' }} strokeWidth={2} />
      </button>
    </div>
  )
}

function PaginationSkeleton() {
  return (
    <div
      className="sticky bottom-0 z-10 -mb-5 flex items-center justify-between gap-3 rounded-t-xl px-4 py-3 border-t border-[#ffffff0a]"
      style={{ background: 'rgba(10, 10, 10, 0.9)', backdropFilter: 'blur(8px)' }}
    >
      <div style={{
        width: 90, height: 32, borderRadius: 8, flexShrink: 0,
        background: 'linear-gradient(90deg, #171717 25%, #202020 50%, #171717 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }} />
      <div style={{
        width: 70, height: 13, borderRadius: 6,
        background: 'linear-gradient(90deg, #171717 25%, #202020 50%, #171717 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        animationDelay: '0.07s',
      }} />
      <div style={{
        width: 90, height: 32, borderRadius: 8, flexShrink: 0,
        background: 'linear-gradient(90deg, #171717 25%, #202020 50%, #171717 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        animationDelay: '0.14s',
      }} />
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
        className="w-full appearance-none rounded-xl px-3 py-2.5 text-[13px] font-medium text-foreground outline-none transition-all cursor-pointer bg-[#0f0f0f] border border-[#ffffff0a]"
        style={{ color: value ? 'white' : '#6b6b80' }}
      >
        <option value="ALL">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
        style={{ color: '#3d3d52' }}
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
  
  // Controls the modal visibility state
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
    <div className="space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        select option { background: #0f0f0f; color: white; }
      `}</style>

      {/* Filters */}
      <div className="flex flex-col gap-2.5 px-4 sm:flex-row sm:items-center sm:gap-3 sm:px-0">
        <div className="relative min-w-0 flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: '#3d3d52' }}
          />
          <input
            className={`${inputCls} pl-9`}
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className="flex gap-2.5 sm:gap-3">
          <DarkSelect
            value={status}
            onChange={(v) => { setStatus(v); setPage(1) }}
            placeholder="All Status"
            width={150}
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

      {/* Header row */}
      <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-0">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl sm:hidden"
            style={{ background: '#7c3aed1a', border: '1px solid #7c3aed30' }}
          >
            <Users className="h-4 w-4 text-violet-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[24px] font-bold tracking-tight text-foreground sm:text-[28px]">
              {displayTotal}
            </span>
            <span className="text-[13px] font-medium text-muted-foreground sm:text-[14px]">
              total members
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium text-foreground transition-all duration-150 sm:w-auto bg-gradient-to-br from-[#7c3aed] to-[#a855f7] shadow-[0_4px_20px_#7c3aed30] hover:shadow-[0_4px_28px_#7c3aed55] hover:-translate-y-[1px]"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <>
          <div className="px-4 sm:px-0">
            <MemberTableSkeleton />
          </div>
          <MemberCardSkeleton />
          {displayTotal > 20 && <PaginationSkeleton />}
        </>
      ) : members.length === 0 ? (
        <div
          className="mx-4 flex h-56 flex-col items-center justify-center gap-4 rounded-2xl px-4 text-center sm:mx-0 sm:h-64"
          style={surface}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: '#7c3aed20' }}>
            <Users className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-foreground">No members yet</p>
            <p className="mt-1 text-[12px] text-muted-foreground">Add your first gym member to get started</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium text-foreground bg-[#7c3aed] shadow-[0_4px_16px_#7c3aed30] hover:bg-[#8b5cf6] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Member
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl px-4 sm:px-0 md:block">
            <div className="overflow-hidden rounded-2xl" style={surface}>
              <MemberTable members={members} onDelete={(id: string) => setDeleteId(id)} />
            </div>
          </div>

          {/* Mobile list */}
          <div
            className="flex flex-col overflow-hidden md:hidden sm:rounded-2xl"
            style={{ ...surface, borderRadius: 0 }}
          >
            {members.map((m: Member) => (
              <MemberCard
                key={m.id}
                member={m}
                onDelete={(id) => setDeleteId(id)}
                onOpen={(id) => router.push(`/members/${id}`)}
              />
            ))}
          </div>

          {displayTotal > 20 && <div className="h-16" />}

          {/* Pagination */}
          {displayTotal > 20 && (
            <div
              className="sticky bottom-0 z-10 -mb-5 rounded-t-xl border-t border-[#ffffff0a] px-3 py-3 sm:px-4"
              style={{ background: 'rgba(10, 10, 10, 0.9)', backdropFilter: 'blur(8px)' }}
            >
              {/* Mobile */}
              <div className="flex items-center justify-between gap-3 sm:hidden">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  aria-label="Previous page"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-medium transition-all duration-150 disabled:opacity-30 bg-[#0f0f0f] border border-[#ffffff0a] text-[#9898b0] active:bg-[#ffffff08]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>
                <div className="flex flex-shrink-0 flex-col items-center gap-0.5 px-1">
                  <span className="text-[12px] font-semibold text-foreground">
                    {page} <span className="text-[#4d4d66]">/ {totalPages}</span>
                  </span>
                  <span className="text-[9.5px] uppercase tracking-wide text-[#3d3d52]">
                    {(page - 1) * 20 + 1}–{Math.min(page * 20, displayTotal)} of {displayTotal}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={page * 20 >= displayTotal}
                  onClick={() => setPage(page + 1)}
                  aria-label="Next page"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-medium transition-all duration-150 disabled:opacity-30 bg-[#7c3aed] text-foreground border border-[#7c3aed]"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Desktop */}
              <div className="hidden items-center justify-between gap-3 sm:flex">
                <p className="flex-shrink-0 text-[12px] text-muted-foreground">
                  Showing <span className="text-foreground">{(page - 1) * 20 + 1}</span>
                  {'–'}
                  <span className="text-foreground">{Math.min(page * 20, displayTotal)}</span>
                  {' of '}
                  <span className="text-foreground">{displayTotal}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    aria-label="Previous page"
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-30 bg-[#0f0f0f] border border-[#ffffff0a] text-[#9898b0] hover:bg-[#ffffff05]"
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
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[12px] font-medium transition-all duration-150 ${
                            page === p
                              ? 'bg-[#7c3aed] text-foreground border border-[#7c3aed]'
                              : 'bg-[#0f0f0f] border border-[#ffffff0a] text-[#9898b0] hover:bg-[#ffffff05]'
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
                    aria-label="Next page"
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-30 bg-[#0f0f0f] border border-[#ffffff0a] text-[#9898b0] hover:bg-[#ffffff05]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogOverlay style={{ background: 'rgba(5, 5, 5, 0.75)', backdropFilter: 'blur(4px)' }} />
        <AlertDialogContent
          className="w-[calc(100%-2rem)] overflow-hidden p-0 sm:w-full bg-[#0a0a0a] border border-[#ffffff08] rounded-3xl max-w-[400px] shadow-[0_24px_64px_#00000080,0_0_0_1px_#ffffff05]"
        >
          <div className="h-1 w-full bg-gradient-to-r from-[#ef4444] to-[#f87171]" />
          <div className="p-5 sm:p-6">
            <AlertDialogHeader className="mb-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ef444415] border border-[#ef444425]">
                <Trash2 className="h-[18px] w-[18px]" style={{ color: '#ef4444' }} strokeWidth={2} />
              </div>
              <AlertDialogTitle
                className="text-[16px] font-semibold text-foreground sm:text-[17px]"
                style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.01em' }}
              >
                Delete {deletingMember?.name ?? 'member'}?
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground sm:text-[13px]">
                This will hide the member from your list. Their payment history and
                attendance records will be preserved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mb-5 h-px bg-[#ef444420]" />
            <AlertDialogFooter className="flex-row gap-3 sm:justify-end">
              <AlertDialogCancel
                className="h-10 flex-1 rounded-xl border border-[#ffffff0f] bg-[#ffffff08] hover:bg-[#ffffff12] text-[13px] font-medium text-[#9898b0] transition-all sm:flex-none"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="h-10 flex-1 rounded-xl border-0 bg-gradient-to-br from-[#dc2626] to-[#ef4444] shadow-[0_4px_16px_#ef444428] hover:shadow-[0_6px_20px_#ef444448] hover:-translate-y-[1px] text-[13px] font-medium text-foreground transition-all sm:flex-none"
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