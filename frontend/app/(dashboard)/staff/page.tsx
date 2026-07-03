'use client'

import { useEffect, useState } from 'react'
import PageHeader from '@/src/components/shared/PageHeader'
import EmptyState from '@/src/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  Plus,
  MoreHorizontal,
  Shield,
  Phone,
  Mail,
  RefreshCcw,
  Trash2,
  Pencil,
  Dumbbell,
  AlertTriangle,
} from 'lucide-react'
import api from '@/src/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────
interface StaffMember {
  id: string
  name: string
  phone: string
  email?: string
  role: 'MANAGER' | 'TRAINER'
  isActive: boolean
}

// ─── Skeleton ────────────────────────────────────────────
function StaffCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2.5">
          <div className="h-4 w-32 bg-white/[0.06] rounded-md" />
          <div className="h-5 w-20 bg-white/[0.06] rounded-full" />
        </div>
        <div className="h-8 w-8 bg-white/[0.06] rounded-lg" />
      </div>
      <div className="border-t border-white/[0.05] my-3" />
      <div className="space-y-3 pt-1">
        <div className="h-3.5 w-36 bg-white/[0.06] rounded-md" />
        <div className="h-3.5 w-44 bg-white/[0.06] rounded-md" />
      </div>
    </div>
  )
}

// ─── Role badge ───────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const isTrainer = role === 'TRAINER'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ring-1 ring-inset',
        isTrainer
          ? 'bg-amber-500/10 text-amber-400 ring-amber-500/20'
          : 'bg-crayola-100 text-crayola ring-crayola/20'
      )}
    >
      {isTrainer ? (
        <Dumbbell className="h-3 w-3" />
      ) : (
        <Shield className="h-3 w-3" />
      )}
      {isTrainer ? 'Trainer' : 'Manager'}
    </span>
  )
}

// ─── Active dot ───────────────────────────────────────────
function ActiveIndicator({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium transition-colors',
        isActive ? 'text-emerald-400' : 'text-gunmetal-400'
      )}
    >
      {isActive ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      ) : (
        <span className="h-2 w-2 rounded-full bg-zinc-600" />
      )}
      {isActive ? 'Active Account' : 'Inactive'}
    </span>
  )
}

// ─── Form dialog fields ───────────────────────────────────
function FormField({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gunmetal-100 ml-0.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-white/[0.08] bg-black/20 text-white placeholder:text-zinc-600 h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-crayola focus-visible:border-crayola transition-all"
      />
    </div>
  )
}

const EMPTY_FORM = { name: '', phone: '', email: '', role: 'MANAGER' }

// ─── Main page ────────────────────────────────────────────
export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modals state
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  // Data state
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  
  // Async status state
  const [saving, setSaving] = useState(false)
  const [sendingLink, setSendingLink] = useState<string | null>(null)

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/staff')
      setStaff(res.data.data)
    } catch {
      toast.error('Failed to load staff list. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStaff() }, [])

  const addStaff = async () => {
    if (!form.name || !form.phone) {
      toast.error('Name and Phone are required fields.')
      return
    }

    try {
      setSaving(true)
      await api.post('/api/staff', form)
      toast.success(`${form.name} added successfully`)
      setOpen(false)
      setForm(EMPTY_FORM)
      await fetchStaff()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add staff member')
    } finally {
      setSaving(false)
    }
  }

  const updateStaff = async () => {
    if (!editingStaff) return
    try {
      setSaving(true)
      await api.patch(`/api/staff/${editingStaff.id}/role`, editingStaff)
      toast.success('Staff profile updated')
      setEditOpen(false)
      fetchStaff()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update staff')
    } finally {
      setSaving(false)
    }
  }

  const removeStaff = async () => {
    if (!deleteId) return
    try {
      setSaving(true)
      await api.delete(`/api/staff/${deleteId}`)
      toast.success('Staff member removed permanently')
      setDeleteId(null)
      fetchStaff()
    } catch {
      toast.error('Failed to remove staff member')
    } finally {
      setSaving(false)
    }
  }

  const resendLink = async (id: string, name: string) => {
    try {
      setSendingLink(id)
      await api.post(`/api/staff/${id}/resend-link`)
      toast.success(`Login link sent to ${name}`)
    } catch {
      toast.error('Failed to send login link')
    } finally {
      setSendingLink(null)
    }
  }

  const selectClass = 'border-white/[0.08] bg-black/20 text-white rounded-xl h-10 focus:ring-1 focus:ring-crayola'
  const selectContentClass = 'border-white/[0.08] bg-[#11111a] text-white'

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      <PageHeader
        title="Staff Management"
        description="Invite and manage trainers, managers, and permissions."
        action={
          <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) setForm(EMPTY_FORM) // Reset on close
          }}>
            <DialogTrigger asChild>
              <Button className="bg-crayola hover:bg-crayola text-white rounded-xl h-10 px-4 text-sm font-medium gap-2 shadow-lg shadow-violet-900/20 transition-all active:scale-95">
                <Plus className="h-4 w-4" />
                Add Staff Member
              </Button>
            </DialogTrigger>

            <DialogContent className="border-white/[0.08] bg-[#0f0f18] text-white rounded-2xl shadow-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">New Staff Member</DialogTitle>
                <DialogDescription className="text-gunmetal-400">
                  Enter their details below. They will receive a link to log in.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-3">
                <FormField label="Full Name" placeholder="e.g. Jane Doe" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <FormField label="Phone Number" placeholder="e.g. +1 234 567 8900" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
                <FormField label="Email Address" placeholder="jane@gym.com" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gunmetal-100 ml-0.5">Role <span className="text-red-400">*</span></label>
                  <Select value={form.role} onValueChange={(v: 'MANAGER' | 'TRAINER') => setForm({ ...form, role: v })}>
                    <SelectTrigger className={selectClass}><SelectValue /></SelectTrigger>
                    <SelectContent className={selectContentClass}>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="TRAINER">Trainer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-2">
                  <Button
                    disabled={saving || !form.name || !form.phone}
                    className="w-full bg-crayola hover:bg-crayola rounded-xl h-11 text-base font-medium transition-all"
                    onClick={addStaff}
                  >
                    {saving ? (
                      <><RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> Creating Profile...</>
                    ) : (
                      'Send Invite'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="border-white/[0.08] bg-[#0f0f18] text-white rounded-2xl shadow-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit Staff Profile</DialogTitle>
          </DialogHeader>
          {editingStaff && (
            <div className="space-y-4 pt-3">
              <FormField label="Full Name" placeholder="Full name" value={editingStaff.name} onChange={(v) => setEditingStaff({ ...editingStaff, name: v })} required />
              <FormField label="Phone Number" placeholder="Phone number" value={editingStaff.phone} onChange={(v) => setEditingStaff({ ...editingStaff, phone: v })} required />
              <FormField label="Email Address" placeholder="Email address" value={editingStaff.email || ''} onChange={(v) => setEditingStaff({ ...editingStaff, email: v })} type="email" />
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gunmetal-100 ml-0.5">Role</label>
                  <Select value={editingStaff.role} onValueChange={(v: 'MANAGER' | 'TRAINER') => setEditingStaff({ ...editingStaff, role: v })}>
                    <SelectTrigger className={selectClass}><SelectValue /></SelectTrigger>
                    <SelectContent className={selectContentClass}>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="TRAINER">Trainer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gunmetal-100 ml-0.5">Status</label>
                  <Select
                    value={editingStaff.isActive ? 'ACTIVE' : 'INACTIVE'}
                    onValueChange={(v) => setEditingStaff({ ...editingStaff, isActive: v === 'ACTIVE' })}
                  >
                    <SelectTrigger className={selectClass}><SelectValue /></SelectTrigger>
                    <SelectContent className={selectContentClass}>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2">
                <Button disabled={saving} className="w-full bg-crayola hover:bg-crayola rounded-xl h-11" onClick={updateStaff}>
                  {saving ? <RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Prompt */}
      <Dialog open={!!deleteId} onOpenChange={(isOpen) => !isOpen && setDeleteId(null)}>
        <DialogContent className="border-white/[0.08] bg-[#0f0f18] text-white rounded-2xl shadow-2xl sm:max-w-sm">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 mb-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-center text-lg font-semibold">Remove Staff Member?</DialogTitle>
            <DialogDescription className="text-center text-gunmetal-400">
              This action cannot be undone. This will permanently remove their access to the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4 sm:space-x-0">
            <Button variant="ghost" onClick={() => setDeleteId(null)} className="w-full sm:w-1/2 rounded-xl text-gunmetal-100 hover:text-white hover:bg-white/[0.05]">
              Cancel
            </Button>
            <Button disabled={saving} onClick={removeStaff} className="w-full sm:w-1/2 rounded-xl bg-red-500/90 hover:bg-red-500 text-white shadow-lg shadow-red-900/20">
              {saving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : 'Yes, Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Grid */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StaffCardSkeleton key={i} />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <EmptyState icon={Users} title="No staff members found" description="Get started by adding your first trainer or manager." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {staff.map((member) => (
            <div
              key={member.id}
              className={cn(
                'group relative rounded-2xl border p-5 transition-colors duration-200',
                member.isActive
                  ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]'
                  : 'bg-black/20 border-white/[0.03] opacity-75 hover:opacity-100'
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1.5">
                  <h3 className="text-base font-medium text-zinc-100 group-hover:text-white transition-colors">
                    {member.name}
                  </h3>
                  <RoleBadge role={member.role} />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg text-gunmetal-400 hover:text-white hover:bg-white/[0.08] focus-visible:ring-1 focus-visible:ring-crayola"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 border-white/[0.08] bg-[#11111a] text-white p-1 rounded-xl shadow-xl">
                    <DropdownMenuItem
                      className="gap-2.5 rounded-lg cursor-pointer hover:bg-white/[0.06] focus:bg-white/[0.06]"
                      onClick={() => { setEditingStaff(member); setEditOpen(true) }}
                    >
                      <Pencil className="h-4 w-4 text-gunmetal-400" />
                      Edit Profile
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem
                      className="gap-2.5 rounded-lg cursor-pointer hover:bg-white/[0.06] focus:bg-white/[0.06]"
                      disabled={sendingLink === member.id}
                      onClick={() => resendLink(member.id, member.name)}
                    >
                      <RefreshCcw className={cn("h-4 w-4 text-gunmetal-400", sendingLink === member.id && "animate-spin")} />
                      {sendingLink === member.id ? 'Sending...' : 'Resend Login Link'}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-white/[0.06] my-1" />
                    
                    <DropdownMenuItem
                      className="gap-2.5 rounded-lg cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300"
                      onClick={() => setDeleteId(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove Access
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="border-t border-white/[0.05] mb-4 transition-colors group-hover:border-white/[0.08]" />

              {/* Contact Info & Status */}
              <div className="flex flex-col justify-between h-auto gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gunmetal-100 group-hover:text-zinc-200 transition-colors">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-crayola-100 text-crayola">
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    <span>{member.phone}</span>
                  </div>
                  
                  {member.email && (
                    <div className="flex items-center gap-3 text-sm text-gunmetal-100 group-hover:text-zinc-200 transition-colors">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-crayola-100 text-crayola">
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <ActiveIndicator isActive={member.isActive} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}