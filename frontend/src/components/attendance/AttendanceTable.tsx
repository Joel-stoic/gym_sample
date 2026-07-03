import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AttendanceTableProps {
  attendance: any[]
  count: number
}

export default function AttendanceTable({
  attendance,
  count
}: AttendanceTableProps) {

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="pb-3 border-b border-border/50 mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
          Today's Check-ins
        </h3>
        <Badge className="px-3 py-1 text-xs bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground">
          {count} present
        </Badge>
      </div>

      <div className="p-0">
        {attendance.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground">
            <p className="text-sm">No check-ins yet today</p>
          </div>
        ) : (
          <Table>
            {/* Header */}
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium">Member</TableHead>
                <TableHead className="text-muted-foreground font-medium">Time</TableHead>
                <TableHead className="text-muted-foreground font-medium">Method</TableHead>
                <TableHead className="text-muted-foreground font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>

            {/* Body */}
            <TableBody>
              {attendance.map((record) => (
                <TableRow
                  key={record.id}
                  className="border-border hover:bg-muted/50 transition-colors"
                >
                  {/* Member */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 flex-shrink-0 flex items-center justify-center text-sm font-semibold text-violet-500 bg-violet-500/10 rounded-full">
                        {record.member?.name?.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {record.member?.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {record.member?.phone}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Time */}
                  <TableCell className="text-sm text-muted-foreground">
                    {formatTime(record.checkInAt)}
                  </TableCell>

                  {/* Method */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-[11px] border-border text-muted-foreground font-medium"
                    >
                      {record.markedBy === 'QR_SCAN'
                        ? 'QR Scan'
                        : 'Manual'}
                    </Badge>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      className="text-[11px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-none hover:bg-emerald-500/20"
                    >
                      {record.member?.status}
                    </Badge>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}