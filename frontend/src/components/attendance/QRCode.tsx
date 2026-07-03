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
    <Card className="border-white/[0.06] bg-[#0f0f18] shadow-none">
      <CardContent className="p-6">
        {loading ? (
          <LoadingSpinner className="h-56" />
        ) : qrCode ? (
          <div className="flex flex-col items-center gap-5">
            {/* HEADER */}

            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-crayola/15 text-crayola">
                <QrCode className="h-6 w-6" />
              </div>

              <h3 className="text-lg font-semibold text-white">
                Gym Check-in QR
              </h3>

              <p className="mt-1 text-sm text-[#6b6b80]">
                Members scan to check in instantly
              </p>
            </div>

            {/* QR */}

            <div className="rounded-3xl border border-white/[0.08] bg-white p-5 shadow-lg">
              <img
                src={qrCode}
                alt="Gym QR Code"
                className="h-52 w-52"
              />
            </div>

            {/* DESCRIPTION */}

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
              <p className="text-sm leading-6 text-[#f9f9fd] font-extrabold">
                Print this QR and place it at the gym entrance.
                Members can scan it to mark attendance
                automatically.
              </p>
            </div>

            {/* BUTTON */}

            <Button
              variant="outline"
              className="h-11 w-full border-white/[0.08] bg-white/[0.03] text-green-500 hover:bg-white/[0.06]"
              onClick={downloadQR}
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
              <QrCode className="h-7 w-7 text-[#6b6b80]" />
            </div>

            <h3 className="text-base font-medium text-white">
              QR Not Available
            </h3>

            <p className="mt-1 text-sm text-[#6b6b80]">
              Unable to generate QR code right now
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}