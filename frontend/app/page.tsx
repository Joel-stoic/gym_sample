'use client'

import { Inter } from 'next/font/google'
import { ArrowRight, Users, CheckCircle, CreditCard, Activity, BarChart, Smartphone, ShieldCheck, ChevronRight, Search, Plus } from 'lucide-react'
import LightRays from '@/src/components/ui/LightRays'

const inter = Inter({ subsets: ['latin'], variable: '--font-body' })

export default function HomePage() {
  return (
    <div className={`${inter.variable} min-h-screen bg-background text-foreground font-[family-name:var(--font-body)] relative overflow-x-hidden selection:bg-primary/10`}>
      
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Light Rays Background */}
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 0 0 0)' }}>
          <LightRays 
            raysOrigin="top-center" 
            raysColor="#ffffff" 
            raysSpeed={1.5}
            rayLength={2.5}
            lightSpread={2.0}
            saturation={1.5}
            className="opacity-100 dark:opacity-80 mix-blend-plus-lighter"
          />
        </div>
        {/* Dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />
        {/* Subtle grid lines */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute top-0 bottom-0 left-[10%] w-[1px] bg-foreground" />
          <div className="absolute top-0 bottom-0 left-[50%] w-[1px] bg-foreground hidden md:block" />
          <div className="absolute top-0 bottom-0 right-[10%] w-[1px] bg-foreground" />
          <div className="absolute left-0 right-0 top-[20%] h-[1px] bg-foreground" />
          <div className="absolute left-0 right-0 top-[60%] h-[1px] bg-foreground hidden md:block" />
        </div>
      </div>

      {/* ── Header (Pill Glassy Navbar) ── */}
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="flex items-center justify-between px-6 py-3 w-full max-w-4xl bg-background/60 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
              Jovifitx
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hidden sm:inline-block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/95 rounded-full transition-all shadow-sm"
            >
              Sign up
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-20 sm:pt-28 pb-28 lg:pb-36 grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
        
        {/* Left: Text Content */}
        <div className="flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border/80 text-muted-foreground text-xs font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            The operating system for your gym
          </div>
          
          <h1 className="font-bold leading-[1.05] text-4xl sm:text-6xl md:text-7xl tracking-tighter text-foreground mb-6">
            Run your gym. <br />
            <span className="text-muted-foreground">Like clockwork.</span>
          </h1>
          
          <p className="text-muted-foreground text-base sm:text-lg max-w-lg leading-relaxed mb-10">
            Automate members tracking, attendance logs, and payment collections. Jovifitx puts your operations on autopilot so you can focus on the floor.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/95 rounded-md transition-all shadow-sm"
            >
              Launch Dashboard 
              <ChevronRight className="w-4 h-4 ml-1" />
            </a>
            <a
              href="#features"
              className="w-full sm:w-auto text-center px-6 py-3.5 text-xs font-semibold text-foreground bg-background hover:bg-accent border border-border rounded-md transition-colors shadow-sm"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Right: High-Fidelity Mockup (Real Gym Software Preview) */}
        <div className="relative w-full aspect-square md:aspect-video lg:aspect-square flex items-center justify-center">
          <div className="relative w-full max-w-md bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
            
            {/* Window bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border/50">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
              </div>
              <div className="text-[10px] font-medium text-muted-foreground select-none hidden sm:block">app.jovifitx.com</div>
              <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Mock Dashboard Area */}
            <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
              
              {/* Header inside Mock */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Active Gym</div>
                  <div className="text-[11px] sm:text-xs font-semibold text-foreground">Jovifitx Fitness Club</div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] sm:text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </div>
              </div>

              {/* Stats Grid inside Mock */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { label: 'Members', val: '312', change: '+12' },
                  { label: 'Check-ins', val: '84', change: 'Live' },
                  { label: 'Revenue', val: '₹2.1L', change: '84%' },
                ].map((stat, i) => (
                  <div key={i} className="p-2 sm:p-3 rounded-lg border border-border bg-card">
                    <div className="text-[8px] sm:text-[9px] text-muted-foreground font-medium uppercase truncate">{stat.label}</div>
                    <div className="text-sm font-semibold tracking-tight text-foreground mt-1">{stat.val}</div>
                    <div className="text-[8px] text-muted-foreground mt-0.5">{stat.change}</div>
                  </div>
                ))}
              </div>

              {/* Recent Check-ins List inside Mock */}
              <div className="space-y-2.5">
                <div className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Recent Check-ins</div>
                <div className="space-y-1.5">
                  {[
                    { initials: 'JD', name: 'John Doe', time: '10:45 AM', plan: 'Premium Yearly', status: 'Active', statusBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
                    { initials: 'AS', name: 'Alice Smith', time: '10:30 AM', plan: 'Monthly Strength', status: 'Active', statusBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
                    { initials: 'MR', name: 'Mike Ross', time: '10:15 AM', plan: 'Quarterly Cardio', status: 'Expired', statusBg: 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' },
                  ].map((user, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded border border-border bg-card/50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-[9px] font-semibold text-muted-foreground border border-border">
                          {user.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] sm:text-[10px] font-semibold text-foreground truncate">{user.name}</div>
                          <div className="text-[7px] sm:text-[8px] text-muted-foreground truncate">{user.plan}</div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2">
                        <span className="text-[7px] sm:text-[8px] text-muted-foreground">{user.time}</span>
                        <span className={`text-[7px] sm:text-[8px] px-1 sm:px-1.5 py-0.5 rounded border ${user.statusBg} font-medium`}>
                          {user.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pb-32">
        <div className="mb-16 text-left">
          <h2 className="font-bold text-3xl sm:text-4xl text-foreground tracking-tight">
            Designed for operations.<br />
            <span className="text-muted-foreground">Built for growth.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            { 
              title: 'Members Management', 
              body: 'Assign plans, track active status, and search easily. Skip the spreadsheet stress.', 
              icon: Users,
              preview: (
                <div className="mt-4 p-3 rounded-lg border border-border bg-background space-y-2">
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground font-semibold">
                    <span>NAME</span>
                    <span>PLAN</span>
                    <span>STATUS</span>
                  </div>
                  <div className="h-[1px] bg-border/50" />
                  <div className="flex items-center justify-between text-[9px] font-medium">
                    <span className="text-foreground">Alex Carter</span>
                    <span className="text-muted-foreground">Monthly Pro</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-medium">
                    <span className="text-foreground">David Miller</span>
                    <span className="text-muted-foreground">Cardio Basic</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">Pending</span>
                  </div>
                </div>
              )
            },
            { 
              title: 'QR Attendance', 
              body: 'Generate a unique QR for your gym entrance. Members scan at the door to check in automatically.', 
              icon: Smartphone,
              preview: (
                <div className="mt-4 p-3 rounded-lg border border-border bg-background flex flex-col items-center gap-2">
                  {/* Mock QR Representation */}
                  <div className="w-16 h-16 border-2 border-border p-1 rounded bg-secondary flex items-center justify-center">
                    <div className="w-full h-full bg-foreground opacity-80" style={{ clipPath: 'polygon(0 0, 40% 0, 40% 40%, 0 40%, 0 0, 60% 0, 100% 0, 100% 40%, 60% 40%, 60% 0, 0 60%, 40% 60%, 40% 100%, 0 100%, 0 60%, 60% 60%, 100% 60%, 100% 100%, 60% 100%, 60% 60%)' }} />
                  </div>
                  <span className="text-[8px] text-muted-foreground font-medium">Scan to Check-in</span>
                </div>
              )
            },
            { 
              title: 'Revenue Metrics', 
              body: 'Gain transparent insights into payments collected, outstanding due balances, and monthly growth.', 
              icon: BarChart,
              preview: (
                <div className="mt-4 p-3 rounded-lg border border-border bg-background space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase">Collection Rate</span>
                    <span className="text-[9px] font-bold text-foreground">94.2%</span>
                  </div>
                  <div className="w-full h-2 rounded bg-secondary overflow-hidden border border-border">
                    <div className="h-full bg-primary w-[94.2%] rounded-r" />
                  </div>
                  <div className="flex justify-between text-[8px] text-muted-foreground">
                    <span>Collected: ₹2.1L</span>
                    <span>Due: ₹12k</span>
                  </div>
                </div>
              )
            },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-xl border border-border bg-card flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center mb-5">
                  <f.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-base tracking-tight mb-2 text-foreground">
                  {f.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {f.body}
                </p>
              </div>
              {f.preview}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-foreground">
              Jovifitx
            </span>
            <span className="text-xs text-muted-foreground">© {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Operating system for modern gyms.
          </p>
        </div>
      </footer>
    </div>
  )
}