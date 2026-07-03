import type { Metadata } from 'next'
import { Open_Sans, Orbitron, Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const openSans = Open_Sans({ variable: '--font-sans', subsets: ['latin'] })
const orbitron = Orbitron({ variable: '--font-heading', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jovifitx - Gym Management',
  description: 'Manage your gym members, attendance, and payments easily.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${openSans.variable} ${orbitron.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}