'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle, XCircle, QrCode,
  ArrowLeft, Camera, Clock
} from 'lucide-react'
import memberApi from '@/src/lib/memberApi'

type ScanState = 'idle' | 'scanning' | 'loading' | 'success' | 'error'

interface CheckInData {
  checkInAt: string
  daysUntilExpiry: number | null
  expiryWarning: string | null
  membershipExpiry: string | null
}

export default function CheckInPage() {
  const router = useRouter()
  const scannerRef = useRef<any>(null)
  const isProcessing = useRef(false)
  const [state, setState] = useState<ScanState>('idle')
  const [memberName, setMemberName] = useState('')
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [checkedInTime, setCheckedInTime] = useState('')

  // ─── Safe stop helper ─────────────────────────────
  const safeStop = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop()
        scannerRef.current = null
      }
    } catch {
      scannerRef.current = null
    }
  }

  // ─── Start back camera ────────────────────────────
  const startScanner = async () => {
    setState('scanning')
    isProcessing.current = false

    const { Html5Qrcode } = await import('html5-qrcode')
    scannerRef.current = new Html5Qrcode('qr-reader')

    try {
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          if (isProcessing.current) return
          isProcessing.current = true

          await safeStop()

          // ── Validate it's a gymflow QR ──
          const isValid =
            decodedText.includes('jovifitx.online') &&
            decodedText.includes('/checkin')

          if (!isValid) {
            setState('error')
            setErrorMsg("That doesn't look like a gym QR code. Please scan the QR at your gym entrance.")
            isProcessing.current = false
            return
          }

          // ── Parse URL and extract slug ──
          let scannedSlug: string
          try {
            const scannedUrl = new URL(decodedText)
            // e.g. https://powerfit.jovifitx.online/checkin → "powerfit"
            scannedSlug = scannedUrl.hostname.split('.')[0]

            if (!scannedSlug) {
              throw new Error('Could not extract gym slug')
            }
          } catch {
            setState('error')
            setErrorMsg("Invalid QR code. Please scan the QR at your gym entrance.")
            isProcessing.current = false
            return
          }

          setState('loading')
          await handleCheckIn(scannedSlug)
        },
        () => { }
      )
    } catch {
      setState('error')
      setErrorMsg('Camera access denied. Please allow camera permission and try again.')
    }
  }

  // ─── Call backend ─────────────────────────────────
  // scannedSlug tells the backend which gym's QR was physically scanned
  // so it can verify it matches the member's home gym
  const handleCheckIn = async (scannedSlug: string) => {
    try {
      const res = await memberApi.post('/api/attendance/checkin', {
        scannedSlug
      })
      setMemberName(res.data.message)
      setCheckInData(res.data.data)
      setCheckedInTime(
        new Date(res.data.data.checkInAt).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        })
      )
      setState('success')
    } catch (err: any) {
      setState('error')
      setErrorMsg(
        err.response?.data?.message || 'Check-in failed. Please try again.'
      )
    } finally {
      isProcessing.current = false
    }
  }

  // ─── Reset ────────────────────────────────────────
  const reset = async () => {
    await safeStop()
    isProcessing.current = false
    setState('idle')
    setMemberName('')
    setCheckInData(null)
    setErrorMsg('')
    setCheckedInTime('')
  }

  // ─── Cleanup on unmount ───────────────────────────
  useEffect(() => {
    return () => {
      safeStop()
    }
  }, [])

  // ─── Stop camera when tab hidden ──────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && state === 'scanning') {
        safeStop()
        setState('idle')
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [state])

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 border-b border-border p-5">
        <button
          onClick={() => { reset(); router.back() }}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-foreground transition-all hover:bg-white/[0.10] active:scale-95"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-base font-bold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
            Check In
          </h1>
          <p className="text-[12px] text-muted-foreground">Scan the QR code at gym entrance</p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">

        {/* IDLE */}
        {state === 'idle' && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-violet-600/10">
              <span className="absolute left-3 top-3 h-4 w-4 rounded-tl-lg border-l-2 border-t-2 border-violet-500/50" />
              <span className="absolute right-3 top-3 h-4 w-4 rounded-tr-lg border-r-2 border-t-2 border-violet-500/50" />
              <span className="absolute bottom-3 left-3 h-4 w-4 rounded-bl-lg border-b-2 border-l-2 border-violet-500/50" />
              <span className="absolute bottom-3 right-3 h-4 w-4 rounded-br-lg border-b-2 border-r-2 border-violet-500/50" />
              <QrCode size={44} className="text-violet-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
                Ready to check in?
              </p>
              <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
                Point your camera at the QR code at your gym entrance to mark attendance.
              </p>
            </div>
            <button
              onClick={startScanner}
              className="flex items-center gap-2.5 rounded-2xl bg-violet-600 px-8 py-3.5 text-[14px] font-semibold text-foreground transition-all hover:bg-violet-500 active:scale-95"
            >
              <Camera size={16} />
              Open Camera
            </button>
          </div>
        )}

        {/* SCANNING */}
        {state === 'scanning' && (
          <div className="flex w-full flex-col items-center gap-4">
            <p className="text-[13px] text-muted-foreground">Point at the QR code</p>
            <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-violet-500/20">
              <div id="qr-reader" className="w-full" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-52 w-52">
                  <span className="absolute left-0 top-0 h-6 w-6 rounded-tl-lg border-l-2 border-t-2 border-violet-400" />
                  <span className="absolute right-0 top-0 h-6 w-6 rounded-tr-lg border-r-2 border-t-2 border-violet-400" />
                  <span className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-lg border-b-2 border-l-2 border-violet-400" />
                  <span className="absolute bottom-0 right-0 h-6 w-6 rounded-br-lg border-b-2 border-r-2 border-violet-400" />
                </div>
              </div>
            </div>
            <button
              onClick={reset}
              className="text-[12px] text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* LOADING */}
        {state === 'loading' && (
          <div className="flex flex-col items-center gap-5">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            <p className="text-[13px] text-muted-foreground">Marking your attendance…</p>
          </div>
        )}

        {/* SUCCESS */}
        {state === 'success' && (
          <div className="flex w-full max-w-xs flex-col items-center gap-5 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/10">
              <CheckCircle size={44} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
                {memberName}
              </p>
              <p className="mt-1 text-[13px] text-emerald-400">Attendance marked successfully</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
              <Clock size={12} className="text-muted-foreground" />
              <span className="text-[12px] text-muted-foreground">Checked in at {checkedInTime}</span>
            </div>
            {checkInData?.expiryWarning && (
              <div className="w-full rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-[12px] text-amber-400">
                ⚠️ {checkInData.expiryWarning}
              </div>
            )}
            <button
              onClick={() => router.push('/member')}
              className="w-full rounded-2xl border border-white/[0.10] py-3 text-[13px] font-medium text-foreground transition-all hover:bg-muted active:scale-95"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* ERROR */}
        {state === 'error' && (
          <div className="flex w-full max-w-xs flex-col items-center gap-5 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-red-500/10">
              <XCircle size={44} className="text-red-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
                Check-in Failed
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{errorMsg}</p>
            </div>
            <button
              onClick={reset}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3 text-[13px] font-semibold text-foreground transition-all hover:bg-violet-500 active:scale-95"
            >
              <Camera size={14} />
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}