'use client'

import { useState, useEffect } from 'react'
import api from '@/src/lib/api'

import PageHeader from '@/src/components/shared/PageHeader'
import LoadingSpinner from '@/src/components/shared/LoadingSpinner'
import EmptyState from '@/src/components/shared/EmptyState'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { z } from 'zod'

import {
  UserPlus,
  Plus,
  MoreHorizontal,
  Phone,
  Calendar,
  Loader2,
  Users,
  Flame,
  CheckCircle2,
  XCircle
} from 'lucide-react'

import { formatDate } from '@/src/lib/utils'

import { toast } from 'sonner'

import { Lead } from '@/src/types'

/* ───────────────── STATUS CONFIG ───────────────── */

const STATUS_CONFIG: Record<
  string,
  {
    label: string
    className: string
  }
> = {
  NEW: {
    label: 'New',
    className:
      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
  },

  CONTACTED: {
    label: 'Contacted',
    className:
      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
  },

  DEMO_DONE: {
    label: 'Demo Done',
    className:
      'bg-violet-500/10 text-violet-400 border border-violet-500/20'
  },

  CONVERTED: {
    label: 'Converted',
    className:
      'bg-green-500/10 text-green-400 border border-green-500/20'
  },

  LOST: {
    label: 'Lost',
    className:
      'bg-red-500/10 text-red-400 border border-red-500/20'
  }
}

/* ───────────────── SCHEMA ───────────────── */

const leadSchema = z.object({
  name: z.string().min(2, 'Name required'),

  phone: z.string().min(10, 'Valid phone required'),

  source: z.string().optional(),

  notes: z.string().optional()
})

type LeadForm = z.infer<typeof leadSchema>

/* ───────────────── PAGE ───────────────── */

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])

  const [loading, setLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  const form = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),

    defaultValues: {
      name: '',
      phone: '',
      source: '',
      notes: ''
    }
  })

  /* ───────────────── FETCH ───────────────── */

  const fetchLeads = async () => {
    try {
      setLoading(true)

      const params = statusFilter
        ? `?status=${statusFilter}`
        : ''

      const res = await api.get(`/api/leads${params}`)

      setLeads(res.data.data)
    } catch {
      toast.error('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [statusFilter])

  /* ───────────────── CREATE ───────────────── */

  const onSubmit = async (data: LeadForm) => {
    setSubmitting(true)

    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== '')
      )

      await api.post('/api/leads', cleanData)

      toast.success(
        'Lead added successfully'
      )

      form.reset()

      setDialogOpen(false)

      fetchLeads()
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        'Failed to add lead'
      )
    } finally {
      setSubmitting(false)
    }
  }

  /* ───────────────── UPDATE STATUS ───────────────── */

  const updateStatus = async (
    id: string,
    status: string
  ) => {
    try {
      await api.patch(`/api/leads/${id}/status`, {
        status
      })

      toast.success('Lead updated')

      fetchLeads()
    } catch {
      toast.error('Failed to update status')
    }
  }

  /* ───────────────── LOADING ───────────────── */


  /* ───────────────── STATS ───────────────── */

  const converted = leads.filter(
    (l) => l.status === 'CONVERTED'
  ).length

  const lost = leads.filter(
    (l) => l.status === 'LOST'
  ).length

  const newLeads = leads.filter(
    (l) => l.status === 'NEW'
  ).length

  /* ───────────────── UI ───────────────── */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Track walk-in enquiries and conversions"
        action={
          <Dialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-card hover:bg-accent text-card-foreground border border-border rounded-md shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </DialogTrigger>

            {/* ───────────────── MODAL ───────────────── */}

            <DialogContent className="border-border bg-background text-foreground">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  Add New Lead
                </DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 pt-3"
                >
                  {/* NAME */}

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>

                        <FormControl>
                          <Input
                            placeholder="Ravi Kumar"
                            {...field}
                            className="border-border bg-card"
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* PHONE */}

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>

                        <FormControl>
                          <Input
                            placeholder="9876543210"
                            {...field}
                            className="border-border bg-card"
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* SOURCE */}

                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source</FormLabel>

                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-border bg-card">
                              <SelectValue placeholder="Lead source" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            <SelectItem value="Walk-in">
                              Walk-in
                            </SelectItem>

                            <SelectItem value="Instagram">
                              Instagram
                            </SelectItem>

                            <SelectItem value="Referral">
                              Referral
                            </SelectItem>

                            <SelectItem value="Google">
                              Google
                            </SelectItem>

                            <SelectItem value="Other">
                              Other
                            </SelectItem>
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
                        <FormLabel>Notes</FormLabel>

                        <FormControl>
                          <Input
                            placeholder="Interested in fat loss..."
                            {...field}
                            className="border-border bg-card"
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* BUTTON */}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 w-full bg-card hover:bg-accent text-card-foreground border border-border rounded-md shadow-sm"
                  >
                    {submitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}

                    {submitting
                      ? 'Adding Lead...'
                      : 'Add Lead'}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* ───────────────── STATS ───────────────── */}

      {!loading && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="New Leads"
            value={newLeads}
            icon={Users}
            iconClassName="bg-violet-600/15 text-violet-400"
          />

          <StatsCard
            title="Converted"
            value={converted}
            icon={CheckCircle2}
            iconClassName="bg-green-500/15 text-green-400"
          />

          <StatsCard
            title="Lost"
            value={lost}
            icon={XCircle}
            iconClassName="bg-red-500/15 text-red-400"
          />
        </div>
      )}

      {/* ───────────────── FILTERS ───────────────── */}

      <div className="flex flex-wrap gap-2">
        {[
          '',
          'NEW',
          'CONTACTED',
          'DEMO_DONE',
          'CONVERTED',
          'LOST'
        ].map((status) => (
          <Button
            key={status}
            size="sm"
            variant={
              statusFilter === status
                ? 'default'
                : 'outline'
            }
            onClick={() => setStatusFilter(status)}
            className={
              statusFilter === status
                ? 'bg-accent  border border-border text-foreground'
                : 'border-border bg-transparent text-muted-foreground hover:bg-muted'
            }
          >
            {status === ''
              ? 'All'
              : STATUS_CONFIG[status]?.label}
          </Button>
        ))}
      </div>

      {/* ───────────────── EMPTY ───────────────── */}

      {loading ? (
        <>
          {/* skeleton stats */}
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[104px] animate-pulse rounded-lg border border-border bg-card p-5 flex flex-col justify-between"
              >
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-8 w-16 rounded bg-muted mt-2" />
              </div>
            ))}
          </div>

          {/* skeleton cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </>
      ) : leads.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No leads yet"
          description="Add walk-in enquiries to track follow-ups"
          actionLabel="Add Lead"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onUpdateStatus={updateStatus}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ───────────────── STATS CARD ───────────────── */

function StatsCard({
  title,
  value,
  icon: Icon,
  iconClassName
}: any) {
  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold text-foreground">
            {value}
          </h3>
        </div>

        <div
          className={`rounded-md p-3 ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
/* ───────────────── SkeletonCard ───────────────── */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
        <div className="h-8 w-8 rounded-lg bg-muted" />
      </div>

      <div className="space-y-3 mt-4">
        <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-muted" /><div className="h-4 w-32 rounded bg-muted" /></div>
        <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-muted" /><div className="h-4 w-24 rounded bg-muted" /></div>
      </div>

      <div className="mt-5 flex items-center justify-between pt-2">
        <div className="h-6 w-20 rounded-md bg-muted" />
      </div>
    </div>
  )
}

/* ───────────────── LEAD CARD ───────────────── */

function LeadCard({
  lead,
  onUpdateStatus
}: {
  lead: Lead
  onUpdateStatus: (
    id: string,
    status: string
  ) => void
}) {
  const config = STATUS_CONFIG[lead.status]

  return (
    <div className="rounded-lg border border-border bg-background p-5 transition hover:border-violet-500/30">
      {/* TOP */}

      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {lead.name}
          </h3>

          {lead.source && (
            <p className="mt-1 text-xs text-muted-foreground">
              via {lead.source}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="text-foreground hover:bg-muted"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="border-border bg-background text-foreground"
          >
            {Object.entries(STATUS_CONFIG).map(
              ([status, cfg]) => (
                <DropdownMenuItem
                  key={status}
                  disabled={lead.status === status}
                  onClick={() =>
                    onUpdateStatus(lead.id, status)
                  }
                >
                  Mark as {cfg.label}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* INFO */}

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4 text-violet-400" />
          {lead.phone}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 text-violet-400" />
          {formatDate(lead.createdAt)}
        </div>
      </div>

      {lead.status === 'CONTACTED' && lead.contactedBy && (
        <p className="mt-2 text-xs text-muted-foreground">
          Contacted by{' '}
          <span className="font-medium text-violet-400">
            {lead.contactedBy.name}
          </span>

          {lead.contactedAt && (
            <span>
              {' '}·{' '}
              {new Date(lead.contactedAt).toLocaleDateString('en-IN')}
            </span>
          )}
        </p>
      )}

      {/* NOTES */}

      {lead.notes && (
        <div className="mt-4 rounded-md border border-border bg-card p-3">
          <p className="text-sm text-muted-foreground">
            {lead.notes}
          </p>
        </div>
      )}

      {/* STATUS */}

      <div className="mt-5 flex items-center justify-between">
        <span
          className={`inline-flex rounded-md px-3 py-1 text-xs font-medium ${config?.className}`}
        >
          {config?.label}
        </span>

        {lead.status === 'CONVERTED' && (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <Flame className="h-3 w-3" />
            Joined
          </div>
        )}
      </div>
    </div>
  )
}