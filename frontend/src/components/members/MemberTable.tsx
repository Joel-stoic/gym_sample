'use client'

import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Member } from '@/src/types'
import { formatDate } from '@/src/lib/utils'
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react'

interface MemberTableProps {
  members: Member[]
  onDelete: (id: string) => void
}

export default function MemberTable({ members, onDelete }: MemberTableProps) {
  const router = useRouter()

  return (
    <Table className="bg-card">
      <TableHeader className="bg-card">
        <TableRow className="border-b border-border hover:bg-transparent">
          <TableHead className="text-muted-foreground text-[11px] font-semibold uppercase tracking-widest py-4">
            Name
          </TableHead>
          <TableHead className="text-muted-foreground text-[11px] font-semibold uppercase tracking-widest">
            Phone
          </TableHead>
          <TableHead className="text-muted-foreground text-[11px] font-semibold uppercase tracking-widest">
            Plan
          </TableHead>
          <TableHead className="text-muted-foreground text-[11px] font-semibold uppercase tracking-widest">
            Expiry
          </TableHead>
          <TableHead className="text-muted-foreground text-[11px] font-semibold uppercase tracking-widest">
            Status
          </TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>

      <TableBody>
        {members.map((member) => {
          return (
            <TableRow
              key={member.id}
              className="cursor-pointer border-b border-border last:border-0 hover:bg-secondary transition-colors group"
              onClick={() => router.push(`/members/${member.id}`)}
            >
              {/* Name + avatar */}
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[13px] font-bold text-foreground">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-foreground">
                      {member.name}
                    </p>
                    {member.email && (
                      <p className="text-[13px] text-muted-foreground">
                        {member.email}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>

              {/* Phone */}
              <TableCell>
                <span className="text-[14px] font-medium text-muted-foreground tabular-nums">
                  {member.phone}
                </span>
              </TableCell>

              {/* Plan */}
              <TableCell>
                {member.plan?.name ? (
                  <span className="rounded-md bg-secondary border border-border px-2 py-1 text-[12px] font-semibold text-foreground">
                    {member.plan.name}
                  </span>
                ) : (
                  <span className="text-[13px] text-muted-foreground">No plan</span>
                )}
              </TableCell>

              {/* Expiry */}
              <TableCell>
                {member.membershipExpiry ? (
                  <span className="text-[14px] text-muted-foreground font-medium tabular-nums">
                    {formatDate(member.membershipExpiry)}
                  </span>
                ) : (
                  <span className="text-[13px] text-muted-foreground">—</span>
                )}
              </TableCell>

              {/* Status — orange = active, muted = inactive/expired, no third hue */}
              <TableCell>
                {(() => {
                  if (!member.membershipExpiry) {
                    return (
                      <span className="rounded-md bg-muted border border-border px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                        INACTIVE
                      </span>
                    )
                  }

                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const expiry = new Date(member.membershipExpiry)
                  expiry.setHours(0, 0, 0, 0)

                  const daysLeft = Math.ceil(
                    (expiry.getTime() - today.getTime()) /
                    (1000 * 60 * 60 * 24)
                  )

                  if (daysLeft < 0) {
                    return (
                      <span className="rounded-md bg-muted border border-border px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                        EXPIRED
                      </span>
                    )
                  }

                  if (daysLeft === 0) {
                    return (
                      <span className="rounded-md bg-accent border border-border px-2 py-1 text-[11px] font-semibold text-primary">
                        TODAY
                      </span>
                    )
                  }

                  if (daysLeft <= 7) {
                    return (
                      <span className="rounded-md bg-accent border border-border px-2 py-1 text-[11px] font-semibold text-primary">
                        {daysLeft}d LEFT
                      </span>
                    )
                  }

                  return (
                    <span className="rounded-md bg-accent border border-border px-2 py-1 text-[11px] font-semibold text-primary">
                      ACTIVE
                    </span>
                  )
                })()}
              </TableCell>

              {/* Actions */}
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="bg-card border-border rounded-xl p-1 shadow-lg"
                  >
                    <DropdownMenuItem
                      className="rounded-lg text-[14px] text-foreground focus:bg-secondary focus:text-foreground cursor-pointer py-2"
                      onClick={() => router.push(`/members/${member.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="rounded-lg text-[14px] text-primary focus:bg-accent focus:text-primary cursor-pointer py-2"
                      onClick={() => onDelete(member.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}