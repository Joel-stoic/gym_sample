import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from './providers'

// Geist Mono remains from Google Fonts (used for code/mono snippets only)
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

// Orbitron and Aspekta are self-hosted via @font-face in globals.css
// CSS variables --font-heading and --font-sans are set directly in globals.css

export const metadata: Metadata = {
  title: 'Jovifitx - Gym Management',
  description: 'Manage your gym members, attendance, and payments easily.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}