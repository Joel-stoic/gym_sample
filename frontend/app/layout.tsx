import type { Metadata } from 'next'
import { DM_Sans, Fraunces, Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const dmSans = DM_Sans({ variable: '--font-sans', subsets: ['latin'] })
const fraunces = Fraunces({ variable: '--font-heading', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jovifitx - Gym Management',
  description: 'Manage your gym members, attendance, and payments easily.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-cream text-ink">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}