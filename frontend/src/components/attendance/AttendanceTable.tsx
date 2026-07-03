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
    <Card className="bg-slate-900 border border-slate-700">
      {/* Header */}
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center justify-between text-foreground">
          Today&apos;s Check-ins

          <Badge className="text-foreground px-3 py-1 text-xs bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground">
            {count} present
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {attendance.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            <p className="text-sm">No check-ins yet today</p>
          </div>
        ) : (
          <Table>
            {/* Header */}
            <TableHeader>
              <TableRow className="border-slate-700 bg-slate-800/50">
                <TableHead className="text-foreground">Member</TableHead>
                <TableHead className="text-foreground">Time</TableHead>
                <TableHead className="text-foreground">Method</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>

            {/* Body */}
            <TableBody>
              {attendance.map((record) => (
                <TableRow
                  key={record.id}
                  className="border-slate-800 hover:bg-slate-800/50 transition"
                >
                  {/* Member */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full /20 flex items-center justify-center text-sm font-semibold text-violet-400 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground">
                        {record.member?.name?.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {record.member?.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {record.member?.phone}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Time */}
                  <TableCell className="text-sm text-slate-300">
                    {formatTime(record.checkInAt)}
                  </TableCell>

                  {/* Method */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-xs border-slate-600 text-slate-300"
                    >
                      {record.markedBy === 'QR_SCAN'
                        ? 'QR Scan'
                        : 'Manual'}
                    </Badge>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      className="text-xs bg-green-600/20 text-green-400 border border-green-500/30"
                    >
                      {record.member?.status}
                    </Badge>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}