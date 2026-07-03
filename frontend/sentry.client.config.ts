import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'production',

  // ✅ errors always 1.0 — sampling only affects performance traces
  tracesSampleRate: 1.0,

  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  enabled: true,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: false,
    }),
  ],
})