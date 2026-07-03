'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--background)',
          color: 'var(--foreground)',
          fontFamily: 'sans-serif',
          gap: '16px',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
          Something went wrong
        </h2>
        <button
          onClick={reset}
          style={{
            background: '#7c3aed',
            color: 'var(--foreground)',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}