'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/src/lib/api'
import { useAuthStore } from '@/src/store/authStore'
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage
} from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Building2, User, Lock, Loader2,
  CheckCircle, XCircle, Copy, ExternalLink,
  KeyRound, Eye, EyeOff, ShieldCheck, Pencil, X,
  ShieldAlert,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Schemas ──────────────────────────────────────────
const gymSchema = z.object({
  name: z.string().min(2, 'Gym name required'),
  phone: z.string().min(10, 'Valid phone required'),
  address: z.string().optional()
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Required'),
  newPassword: z.string().min(6, 'Min 6 characters'),
  confirmPassword: z.string()
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

type GymForm = z.infer<typeof gymSchema>
type PasswordForm = z.infer<typeof passwordSchema>

// ─── Section wrapper ──────────────────────────────────
function Section({
  icon: Icon, title, children, action,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-md border border-border bg-card p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center /20 text-violet-400 bg-card hover:bg-accent text-card-foreground border border-border rounded-md shadow-sm">
            <Icon size={18} />
          </div>
          <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

// ─── Info row ─────────────────────────────────────────
function InfoRow({
  label, value, mono, action,
}: {
  label: string
  value: string
  mono?: boolean
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] py-4 last:border-0">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <span className={`text-[14px] font-medium text-foreground ${mono ? 'font-mono' : ''}`}>
          {value}
        </span>
        {action}
      </div>
    </div>
  )
}

// ─── Styled input ─────────────────────────────────────
const inputClass =
  'h-11 rounded-xl border border-border bg-white/[0.04] px-4 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-violet-500/50 focus:outline-none focus:ring-0 w-full transition-colors'

// ─── Edit button ──────────────────────────────────────
function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-border bg-white/[0.04] px-4 h-9 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-all"
    >
      <Pencil size={14} />
      Edit
    </button>
  )
}

// ─── Cancel button ────────────────────────────────────
function CancelButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-border bg-white/[0.04] px-4 h-9 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-all"
    >
      <X size={14} />
      Cancel
    </button>
  )
}

// ─── Default Passwords Modal ──────────────────────────
function DefaultPasswordsModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [memberPw, setMemberPw] = useState('')
  const [staffPw, setStaffPw] = useState('')
  const [showMemberPw, setShowMemberPw] = useState(false)
  const [showStaffPw, setShowStaffPw] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setMemberPw('')
      setStaffPw('')
      setShowMemberPw(false)
      setShowStaffPw(false)
    }
  }, [open])

  const handleSave = async () => {
    if (!memberPw && !staffPw) {
      toast.error('Enter at least one password')
      return
    }
    if (memberPw && memberPw.length < 6) {
      toast.error('Member password must be at least 6 characters')
      return
    }
    if (staffPw && staffPw.length < 6) {
      toast.error('Staff password must be at least 6 characters')
      return
    }
    setSaving(true)
    try {
      await api.put('/api/settings/default-passwords', {
        ...(memberPw && { defaultMemberPassword: memberPw }),
        ...(staffPw && { defaultStaffPassword: staffPw }),
      })
      toast.success('Default passwords updated')
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
    !bg-card
    !text-foreground
    border border-violet-500/20
    p-0 overflow-hidden gap-0
    sm:max-w-[425px]
    [&>button]:text-violet-300
    [&>button]:opacity-100
    [&>button]:hover:text-foreground
  "
      >
        <div className="h-1 w-full bg-accent" />

        <div className="p-6">
          <DialogHeader className="mb-5">
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-violet-500/10 border border-violet-500/20"
            >
              <KeyRound size={20} className="text-violet-400" />
            </div>
            <DialogTitle
              className="text-[18px] font-semibold text-foreground"
              style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.01em' }}
            >
              Set Default Passwords
            </DialogTitle>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              These passwords will be used when creating new members or staff. Leave a field blank to keep the existing password.
            </p>
          </DialogHeader>

          <div className="mb-6 h-px bg-violet-500/20" />

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-muted-foreground">
                Default Member Password
              </label>
              <div className="relative">
                <input
                  type={showMemberPw ? 'text' : 'password'}
                  value={memberPw}
                  onChange={(e) => setMemberPw(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Member@123"
                />
                <button
                  type="button"
                  onClick={() => setShowMemberPw(!showMemberPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showMemberPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-muted-foreground">
                Default Staff Password
              </label>
              <div className="relative">
                <input
                  type={showStaffPw ? 'text' : 'password'}
                  value={staffPw}
                  onChange={(e) => setStaffPw(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Staff@123"
                />
                <button
                  type="button"
                  onClick={() => setShowStaffPw(!showStaffPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showStaffPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="border border-violet-500/20 /5 px-4 py-3.5 bg-card hover:bg-accent text-card-foreground border border-border rounded-md shadow-sm">
              <p className="text-[13px] text-violet-300">
                Applies only to newly created members and staff. Existing accounts are not affected.
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-xl text-[14px] font-medium text-muted-foreground transition-all"
              style={{ background: '#ffffff08', border: '1px solid var(--border)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ffffff12' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ffffff08' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl text-[14px] font-medium transition-all duration-150 bg-card hover:bg-accent dark:bg-white/5 dark:hover:bg-white/10  border border-border text-foreground disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? 'Saving...' : 'Save Passwords'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main page ────────────────────────────────────────
export default function SettingsPage() {
  const { staff, tenant } = useAuthStore()
  const [gymLoading, setGymLoading] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [gymInfo, setGymInfo] = useState<any>(null)
  const [showDefaultPwModal, setShowDefaultPwModal] = useState(false)

  // Edit mode toggles
  const [editingGym, setEditingGym] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)

  // Password visibility
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  const gymForm = useForm<GymForm>({
    resolver: zodResolver(gymSchema),
    defaultValues: { name: '', phone: '', address: '' }
  })

  const passForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  })

  useEffect(() => {
    api.get('/api/settings/gym')
      .then(res => {
        const gym = res.data.data
        setGymInfo(gym)
        gymForm.reset({
          name: gym.name || '',
          phone: gym.phone || '',
          address: gym.address || ''
        })
      })
      .catch(() => { })
  }, [])

  const onGymSubmit = async (data: GymForm) => {
    setGymLoading(true)
    try {
      await api.put('/api/settings/gym', data)
      setGymInfo((prev: any) => ({ ...prev, ...data }))
      toast.success('Gym details updated')
      setEditingGym(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update')
    } finally {
      setGymLoading(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPassLoading(true)
    try {
      await api.put('/api/settings/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      toast.success('Password changed')
      passForm.reset()
      setEditingPassword(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed')
    } finally {
      setPassLoading(false)
    }
  }

  const handleCancelGym = () => {
    gymForm.reset({
      name: gymInfo?.name || '',
      phone: gymInfo?.phone || '',
      address: gymInfo?.address || ''
    })
    setEditingGym(false)
  }

  const handleCancelPassword = () => {
    passForm.reset()
    setShowCurrentPw(false)
    setShowNewPw(false)
    setShowConfirmPw(false)
    setEditingPassword(false)
  }

  const gymUrl = `${tenant?.slug}.jovifitx.online`

  const copyUrl = () => {
    navigator.clipboard.writeText(`https://${gymUrl}`)
    toast.success('URL copied!')
  }

  return (
    <div
      className="min-h-screen p-6 md:p-10 lg:p-12"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="mx-auto max-w-6xl">

        {/* ── 2-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ── LEFT COLUMN — Gym-level ── */}
          <div className="flex flex-col gap-6">

            {/* ── Gym Info ─────────────────────────────────────── */}
            {staff?.role === 'OWNER' && (
              <Section
                icon={Building2}
                title="Gym Information"
                action={
                  editingGym
                    ? <CancelButton onClick={handleCancelGym} />
                    : <EditButton onClick={() => setEditingGym(true)} />
                }
              >
                {editingGym ? (
                  <Form {...gymForm}>
                    <form onSubmit={gymForm.handleSubmit(onGymSubmit)} className="space-y-5">
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <FormField
                          control={gymForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-[13px] font-medium text-muted-foreground">Gym Name</FormLabel>
                              <FormControl>
                                <input className={inputClass} {...field} />
                              </FormControl>
                              <FormMessage className="text-[12px] text-red-400" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={gymForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-[13px] font-medium text-muted-foreground">Phone</FormLabel>
                              <FormControl>
                                <input className={inputClass} {...field} />
                              </FormControl>
                              <FormMessage className="text-[12px] text-red-400" />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={gymForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-[13px] font-medium text-muted-foreground">Address</FormLabel>
                            <FormControl>
                              <input className={inputClass} placeholder="Gym address" {...field} />
                            </FormControl>
                            <FormMessage className="text-[12px] text-red-400" />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-4 pt-2">
                        <button
                          type="button"
                          onClick={handleCancelGym}
                          className="h-11 rounded-xl border border-border bg-white/[0.04] px-6 text-[14px] font-medium text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={gymLoading}
                          className="flex h-11 items-center gap-2 px-6 rounded-xl text-[14px] font-medium transition-all duration-150 bg-card hover:bg-accent dark:bg-white/5 dark:hover:bg-white/10  border border-border text-foreground disabled:opacity-50"
                        >
                          {gymLoading && <Loader2 size={16} className="animate-spin" />}
                          {gymLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-0 divide-y divide-white/[0.05]">
                    <div className="flex items-center justify-between py-4">
                      <span className="text-[13px] text-muted-foreground">Gym Name</span>
                      <span className="text-[14px] font-medium text-foreground">{gymInfo?.name || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between py-4">
                      <span className="text-[13px] text-muted-foreground">Phone</span>
                      <span className="text-[14px] font-medium text-foreground">{gymInfo?.phone || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between py-4">
                      <span className="text-[13px] text-muted-foreground">Address</span>
                      <span className="text-[14px] font-medium text-foreground max-w-[70%] text-right">{gymInfo?.address || '—'}</span>
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* ── Default Passwords ─────────────────────────────── */}
            {staff?.role === 'OWNER' && (
              <Section icon={KeyRound} title="Default Login Passwords">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[14px] text-foreground font-medium">Member & Staff passwords</p>
                    <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed">
                      Set the default passwords assigned when creating new accounts
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDefaultPwModal(true)}
                    className="flex h-10 flex-shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-[14px] font-medium transition-all duration-150 bg-card hover:bg-accent dark:bg-white/5 dark:hover:bg-white/10  border border-border text-foreground hover:-translate-y-0.5"
                  >
                    <ShieldCheck size={16} />
                    Set Passwords
                  </button>
                </div>
              </Section>
            )}

            {/* ── Subscription ──────────────────────────────────── */}
            {gymInfo === null ? (
              <div className="rounded-md border border-border bg-card p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white/[0.06] animate-pulse" />
                  <div className="space-y-3">
                    <div className="h-4 w-28 rounded-lg bg-white/[0.06] animate-pulse" />
                    <div className="h-3.5 w-40 rounded-lg bg-white/[0.06] animate-pulse" />
                  </div>
                </div>
              </div>
            ) : (() => {
              const isExpired = !gymInfo.isActive || (gymInfo.trialEndsAt
                ? new Date(gymInfo.trialEndsAt) < new Date()
                : false)

              return (
                <div className={`rounded-md border p-6 ${isExpired
                  ? 'border-red-500/20 bg-red-500/5'
                  : 'border-emerald-500/20 bg-emerald-500/5'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${isExpired
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-emerald-500/20 text-emerald-400'}`}
                    >
                      {isExpired ? <XCircle size={20} /> : <CheckCircle size={20} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-foreground">
                        {isExpired ? 'Trial Expired' : 'Trial Active'}
                      </p>
                      <p className="text-[13px] text-muted-foreground mt-0.5">
                        {gymInfo?.trialEndsAt
                          ? isExpired
                            ? `Expired on ${new Date(gymInfo.trialEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
                            : `Ends on ${new Date(gymInfo.trialEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
                          : '30-day free trial active'
                        }
                      </p>
                    </div>
                    <div className="ml-auto flex-shrink-0">
                      <span className={`rounded-md border px-4 py-1.5 text-[12px] font-medium ${isExpired
                        ? 'border-red-500/30 bg-red-500/10 text-red-400'
                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'}`}
                      >
                        {isExpired ? 'Expired' : 'Free Trial'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* ── RIGHT COLUMN — Personal account ── */}
          <div className="flex flex-col gap-6">

            {/* ── Account Info ──────────────────────────────────── */}
            <Section icon={User} title="Account Info">
              <InfoRow label="Name" value={staff?.name || '—'} />
              <InfoRow label="Email" value={staff?.email || '—'} />
              <InfoRow
                label="Role"
                value={staff?.role ? staff.role.charAt(0) + staff.role.slice(1).toLowerCase() : '—'}
              />
              <InfoRow
                label="Gym URL"
                value={gymUrl}
                mono
                action={
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyUrl}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Copy URL"
                    >
                      <Copy size={15} />
                    </button>
                     <a
                      href={`https://${gymUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Open URL"
                    >
                      <ExternalLink size={15} />
                    </a>
                  </div>
                }
              />
            </Section>

            {/* ── Change Password ───────────────────────────────── */}
            {staff?.role === 'OWNER' && (
              <Section
                icon={Lock}
                title="Change Password"
                action={
                  editingPassword
                    ? <CancelButton onClick={handleCancelPassword} />
                    : <EditButton onClick={() => setEditingPassword(true)} />
                }
              >
                {editingPassword ? (
                  <Form {...passForm}>
                    <form onSubmit={passForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                      <FormField
                        control={passForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-[13px] font-medium text-muted-foreground">Current Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <input type={showCurrentPw ? 'text' : 'password'} className={inputClass} {...field} />
                                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-[12px] text-red-400" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-[13px] font-medium text-muted-foreground">New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <input type={showNewPw ? 'text' : 'password'} className={inputClass} {...field} />
                                <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-[12px] text-red-400" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-[13px] font-medium text-muted-foreground">Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <input type={showConfirmPw ? 'text' : 'password'} className={inputClass} {...field} />
                                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-[12px] text-red-400" />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-4 pt-2">
                        <button
                          type="button"
                          onClick={handleCancelPassword}
                          className="h-11 rounded-xl border border-border bg-white/[0.04] px-6 text-[14px] font-medium text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={passLoading}
                          className="flex h-11 items-center gap-2 px-6 rounded-xl text-[14px] font-medium transition-all duration-150 bg-card hover:bg-accent dark:bg-white/5 dark:hover:bg-white/10  border border-border text-foreground disabled:opacity-50"
                        >
                          {passLoading && <Loader2 size={16} className="animate-spin" />}
                          {passLoading ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  /* ── Production-grade read-only state ── */
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 rounded-xl border border-border bg-white/[0.02] px-5 py-4">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                        <ShieldCheck size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-medium text-foreground">Password secured</p>
                          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                            Active
                          </span>
                        </div>
                        <p className="mt-1 flex items-center gap-2 text-[13px] text-muted-foreground">
                          <span className="tracking-[2px] text-muted-foreground">••••••••••</span>
                          <span className="text-[#3a3a48]">·</span>
                          <span>Last changed recently</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.05] bg-white/[0.015] px-4 py-3">
                      <ShieldAlert size={14} className="mt-0.5 flex-shrink-0 text-muted-foreground" />
                      <p className="text-[12px] leading-relaxed text-muted-foreground">
                        For account security, use a unique password you don't reuse elsewhere. Changing it will not sign out other devices.
                      </p>
                    </div>
                  </div>
                )}
              </Section>
            )}

          </div>
        </div>

      </div>

      <DefaultPasswordsModal
        open={showDefaultPwModal}
        onClose={() => setShowDefaultPwModal(false)}
      />
    </div>
  )
}