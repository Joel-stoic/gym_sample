import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const statusConfig: Record<
  string,
  {
    label: string
    dot: string
    ping?: boolean
    className: string
  }
> = {
  ACTIVE: {
    label: 'Active',
    dot: 'bg-green-400',
    ping: true,
    className: 'bg-green-500/10 text-green-400 ring-green-500/20',
  },
  EXPIRED: {
    label: 'Expired',
    dot: 'bg-red-400',
    className: 'bg-red-500/10 text-red-400 ring-red-500/20',
  },
  SUSPENDED: {
    label: 'Suspended',
    dot: 'bg-yellow-400',
    className: 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20',
  },
  INACTIVE: {
    label: 'Inactive',
    dot: 'bg-zinc-500',
    className: 'bg-zinc-500/10 text-gunmetal-400 ring-zinc-500/20',
  },
  PAID: {
    label: 'Paid',
    dot: 'bg-emerald-400',
    className: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  },
  PENDING: {
    label: 'Pending',
    dot: 'bg-orange-400',
    className: 'bg-orange-500/10 text-orange-400 ring-orange-500/20',
  },
  PARTIAL: {
    label: 'Partial',
    dot: 'bg-amber-400',
    className: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  },
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    dot: 'bg-zinc-500',
    className: 'bg-zinc-500/10 text-gunmetal-400 ring-zinc-500/20',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-medium ring-1 ring-inset',
        config.className,
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'
      )}
    >
      {config.ping ? (
        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              config.dot
            )}
          />
          <span
            className={cn(
              'relative inline-flex h-1.5 w-1.5 rounded-full',
              config.dot
            )}
          />
        </span>
      ) : (
        <span className={cn('rounded-full flex-shrink-0 h-1.5 w-1.5', config.dot)} />
      )}
      {config.label}
    </span>
  )
}