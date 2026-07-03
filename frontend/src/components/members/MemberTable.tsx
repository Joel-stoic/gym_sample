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
import { MoreHorizontal, Eye, Trash2, CreditCard } from 'lucide-react'

interface MemberTableProps {
  members: Member[]
  onDelete: (id: string) => void
}

const AVATAR_COLORS = [
  { bg: '#7c3aed30', color: '#a855f7' },
  { bg: '#10b98120', color: '#10b981' },
  { bg: '#3b82f620', color: '#3b82f6' },
  { bg: '#f59e0b20', color: '#f59e0b' },
  { bg: '#ef444420', color: '#ef4444' },
  { bg: '#ec489920', color: '#ec4899' },
]

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

export default function MemberTable({ members, onDelete }: MemberTableProps) {
  const router = useRouter()

  return (
    <Table>
      <TableHeader>
        <TableRow
          style={{
            background: '#0a0a0a',
            borderBottom: '1px solid #ffffff0a',
          }}
        >
          <TableHead className="text-[#6b6b80] text-[11px] font-semibold uppercase tracking-[0.12em]">
            Name
          </TableHead>

          <TableHead className="text-[#6b6b80] text-[11px] font-semibold uppercase tracking-[0.12em]">
            Phone
          </TableHead>

          <TableHead className="text-[#6b6b80] text-[11px] font-semibold uppercase tracking-[0.12em]">
            Plan
          </TableHead>

          <TableHead className="text-[#6b6b80] text-[11px] font-semibold uppercase tracking-[0.12em]">
            Expiry
          </TableHead>

          <TableHead className="text-[#6b6b80] text-[11px] font-semibold uppercase tracking-[0.12em]">
            Status
          </TableHead>

          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>

      <TableBody>
        {members.map((member) => {
          const avatar = getAvatarColor(member.name)
          return (
            <TableRow
              key={member.id}
              className="cursor-pointer"
              onClick={() => router.push(`/members/${member.id}`)}
            >
              {/* Name + avatar */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-[11px] font-semibold"
                    style={{ background: avatar.bg, color: avatar.color }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-white">
                      {member.name}
                    </p>
                    {member.email && (
                      <p className="text-[11px] text-[#6b6b80]">
                        {member.email}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>

              {/* Phone */}
              <TableCell>
                <span className="text-[13px] text-[#9898b0]">
                  {member.phone}
                </span>
              </TableCell>

              {/* Plan */}
              <TableCell>
                {member.plan?.name ? (
                  <span
                    className="rounded-lg px-2 py-1 text-[11px] font-medium"
                    style={{
                      background: '#7c3aed18',
                      color: '#a855f7',
                      border: '1px solid #7c3aed25',
                    }}
                  >
                    {member.plan.name}
                  </span>
                ) : (
                  <span className="text-[12px] text-[#3d3d52]">No plan</span>
                )}
              </TableCell>

              {/* Expiry */}
              <TableCell>
                {member.membershipExpiry ? (
                  <span className="text-[13px] text-[#9898b0]">
                    {formatDate(member.membershipExpiry)}
                  </span>
                ) : (
                  <span className="text-[12px] text-[#3d3d52]">—</span>
                )}
              </TableCell>

              {/* Status */}
              <TableCell>
                {(() => {
                  if (!member.membershipExpiry) {
                    return (
                      <span
                        className="rounded-lg px-2 py-1 text-[11px] font-medium"
                        style={{
                          background: '#ef444415',
                          color: '#ef4444',
                          border: '1px solid #ef444425',
                        }}
                      >
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
                      <span
                        className="rounded-lg px-2 py-1 text-[11px] font-medium"
                        style={{
                          background: '#ef444415',
                          color: '#ef4444',
                          border: '1px solid #ef444425',
                        }}
                      >
                        INACTIVE
                      </span>
                    )
                  }

                  if (daysLeft === 0) {
                    return (
                      <span
                        className="rounded-lg px-2 py-1 text-[11px] font-medium"
                        style={{
                          background: '#dc262615',
                          color: '#f87171',
                          border: '1px solid #dc262625',
                        }}
                      >
                        EXPIRES TODAY
                      </span>
                    )
                  }

                  if (daysLeft <= 3) {
                    return (
                      <span
                        className="rounded-lg px-2 py-1 text-[11px] font-medium"
                        style={{
                          background: '#f9731615',
                          color: '#fb923c',
                          border: '1px solid #f9731625',
                        }}
                      >
                        {daysLeft} DAYS LEFT
                      </span>
                    )
                  }

                  if (daysLeft <= 7) {
                    return (
                      <span
                        className="rounded-lg px-2 py-1 text-[11px] font-medium"
                        style={{
                          background: '#f59e0b15',
                          color: '#fbbf24',
                          border: '1px solid #f59e0b25',
                        }}
                      >
                        {daysLeft} DAYS LEFT
                      </span>
                    )
                  }

                  return (
                    <span
                      className="rounded-lg px-2 py-1 text-[11px] font-medium"
                      style={{
                        background: '#10b98115',
                        color: '#34d399',
                        border: '1px solid #10b98125',
                      }}
                    >
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
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150"
                      style={{
                        background: 'transparent',
                        border: '1px solid transparent',
                        color: '#6b6b80',
                      }}
                      onMouseEnter={(e) => {
                        ; (e.currentTarget as HTMLButtonElement).style.background = '#ffffff08'
                          ; (e.currentTarget as HTMLButtonElement).style.border = '1px solid #ffffff0f'
                          ; (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'
                      }}
                      onMouseLeave={(e) => {
                        ; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                          ; (e.currentTarget as HTMLButtonElement).style.border = '1px solid transparent'
                          ; (e.currentTarget as HTMLButtonElement).style.color = '#6b6b80'
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    style={{
                      background: '#0a0a0a',
                      border: '1px solid #ffffff0f',
                      borderRadius: '12px',
                      padding: '4px',
                      boxShadow: '0 16px 40px #00000060',
                    }}
                  >
                    <DropdownMenuItem
                      className="rounded-lg text-[13px] text-[#9898b0] focus:bg-white/5 focus:text-white"
                      onClick={() => router.push(`/members/${member.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="rounded-lg text-[13px] focus:bg-red-500/10 focus:text-red-400"
                      style={{ color: '#ef4444' }}
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