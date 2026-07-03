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
        <CardTitle className="text-base font-semibold flex items-center justify-between text-white">
          Today&apos;s Check-ins

          <Badge className="bg-crayola text-white px-3 py-1 text-xs">
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
                <TableHead className="text-white">Member</TableHead>
                <TableHead className="text-white">Time</TableHead>
                <TableHead className="text-white">Method</TableHead>
                <TableHead className="text-white">Status</TableHead>
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
                      <div className="h-9 w-9 rounded-full bg-crayola-100 flex items-center justify-center text-sm font-semibold text-crayola">
                        {record.member?.name?.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-white">
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