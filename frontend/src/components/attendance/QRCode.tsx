'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import {
  Download,
  QrCode
} from 'lucide-react'

import LoadingSpinner from '@/src/components/shared/LoadingSpinner'

interface QRCodeProps {
  qrCode: string | null
  loading: boolean
}

export default function GymQRCode({
  qrCode,
  loading
}: QRCodeProps) {

  const downloadQR = () => {
    if (!qrCode) return

    const link = document.createElement('a')

    link.href = qrCode
    link.download = 'gym-checkin-qr.png'

    link.click()
  }

  return (
    <Card className="border-border bg-background shadow-none">
      <CardContent className="p-6">
        {loading ? (
          <LoadingSpinner className="h-56" />
        ) : qrCode ? (
          <div className="flex flex-col items-center gap-5">
            {/* HEADER */}

            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl /15 text-violet-400 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground">
                <QrCode className="h-6 w-6" />
              </div>

              <h3 className="text-lg font-semibold text-foreground">
                Gym Check-in QR
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Members scan to check in instantly
              </p>
            </div>

            {/* QR */}

            <div className="rounded-3xl border border-border bg-white p-5 shadow-lg">
              <img
                src={qrCode}
                alt="Gym QR Code"
                className="h-52 w-52"
              />
            </div>

            {/* DESCRIPTION */}

            <div className="rounded-2xl border border-border bg-white/[0.02] p-4 text-center">
              <p className="text-sm leading-6 text-[#f9f9fd] font-extrabold">
                Print this QR and place it at the gym entrance.
                Members can scan it to mark attendance
                automatically.
              </p>
            </div>

            {/* BUTTON */}

            <Button
              variant="outline"
              className="h-11 w-full border-border bg-white/[0.03] text-green-500 hover:bg-white/[0.06]"
              onClick={downloadQR}
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
              <QrCode className="h-7 w-7 text-muted-foreground" />
            </div>

            <h3 className="text-base font-medium text-foreground">
              QR Not Available
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Unable to generate QR code right now
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}