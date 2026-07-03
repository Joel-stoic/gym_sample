import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'admin.jovifitx.online' }],
        destination: '/admin/:path*'
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<tenant>[^.]+)\\.jovifitx\\.online'
          }
        ],
        destination: '/:path*'
      }
    ]
  }
}

export default withSentryConfig(nextConfig, {
  org: 'joel-0z',
  project: 'jovifitx-frontend',

  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: false,

  sourcemaps: {
    deleteSourcemapsAfterUpload: true,  // hides source maps from browser
  },
})