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
    <Table className="bg-cream-50">
      <TableHeader className="bg-cream-50">
        <TableRow className="border-b border-cream-200 hover:bg-transparent">
          <TableHead className="text-cream-400 text-xs font-semibold uppercase tracking-wider py-4">
            Name
          </TableHead>

          <TableHead className="text-cream-400 text-xs font-semibold uppercase tracking-wider">
            Phone
          </TableHead>

          <TableHead className="text-cream-400 text-xs font-semibold uppercase tracking-wider">
            Plan
          </TableHead>

          <TableHead className="text-cream-400 text-xs font-semibold uppercase tracking-wider">
            Expiry
          </TableHead>

          <TableHead className="text-cream-400 text-xs font-semibold uppercase tracking-wider">
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
              className="cursor-pointer border-b border-cream-200 last:border-0 hover:bg-cream-200 transition-colors group"
              onClick={() => router.push(`/members/${member.id}`)}
            >
              {/* Name + avatar */}
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-cream-200 text-[13px] font-semibold text-ink">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-ink">
                      {member.name}
                    </p>
                    {member.email && (
                      <p className="text-[13px] text-cream-400">
                        {member.email}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>

              {/* Phone */}
              <TableCell>
                <span className="text-[14px] font-medium text-cream-400">
                  {member.phone}
                </span>
              </TableCell>

              {/* Plan */}
              <TableCell>
                {member.plan?.name ? (
                  <span className="rounded-md bg-cream-200 px-2 py-1 text-[13px] font-semibold text-ink-600">
                    {member.plan.name}
                  </span>
                ) : (
                  <span className="text-[13px] text-cream-400">No plan</span>
                )}
              </TableCell>

              {/* Expiry */}
              <TableCell>
                {member.membershipExpiry ? (
                  <span className="text-[14px] text-cream-400 font-medium">
                    {formatDate(member.membershipExpiry)}
                  </span>
                ) : (
                  <span className="text-[13px] text-cream-400">—</span>
                )}
              </TableCell>

              {/* Status */}
              <TableCell>
                {(() => {
                  if (!member.membershipExpiry) {
                    return (
                      <span className="rounded-md bg-cream-200 px-2 py-1 text-[12px] font-semibold text-ink-600">
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
                      <span className="rounded-md bg-cream-200 px-2 py-1 text-[12px] font-semibold text-ink-600">
                        INACTIVE
                      </span>
                    )
                  }

                  if (daysLeft === 0) {
                    return (
                      <span className="rounded-md bg-cream-200 px-2 py-1 text-[12px] font-semibold text-ink-600">
                        EXPIRES TODAY
                      </span>
                    )
                  }

                  if (daysLeft <= 3) {
                    return (
                      <span className="rounded-md bg-cream-200 px-2 py-1 text-[12px] font-semibold text-ink-600">
                        {daysLeft} DAYS LEFT
                      </span>
                    )
                  }

                  if (daysLeft <= 7) {
                    return (
                      <span className="rounded-md bg-cream-200 px-2 py-1 text-[12px] font-semibold text-ink-600">
                        {daysLeft} DAYS LEFT
                      </span>
                    )
                  }

                  return (
                    <span className="rounded-md bg-cola-100 border border-cola-100 px-2 py-1 text-[12px] font-semibold text-cola">
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
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors bg-transparent text-cream-400 hover:bg-cream-200 hover:text-ink"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="bg-cream-50 border-cream-200 rounded-xl p-1 shadow-sm"
                  >
                    <DropdownMenuItem
                      className="rounded-lg text-[14px] text-ink-600 focus:bg-cream-200 focus:text-ink cursor-pointer py-2"
                      onClick={() => router.push(`/members/${member.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="rounded-lg text-[14px] text-cola focus:bg-cola-100 focus:text-cola cursor-pointer py-2"
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