'use client'

import { Inter } from 'next/font/google'
import { ArrowRight, Users, CheckCircle, CreditCard, Activity, BarChart, Smartphone } from 'lucide-react'

// Using only Inter for a clean, cohesive, professional look.
const inter = Inter({ subsets: ['latin'], variable: '--font-body' })

export default function HomePage() {
  return (
    <div className={`${inter.variable} min-h-screen bg-background text-foreground font-[family-name:var(--font-body)] relative selection:bg-black/10 dark:selection:bg-white/10`}>
      
      {/* ── Minimalist Background Pattern ── */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* ── Nav ── */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6 max-w-7xl mx-auto">
        <span className="font-bold text-xl tracking-tight">
          Jovifitx
        </span>

        <a
          href="/login"
          className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors border border-border"
        >
          Log in
        </a>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-20 sm:pt-32 pb-24 lg:pb-32 grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
        
        {/* Left: Text Content */}
        <div className="flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-secondary/50 border border-border text-muted-foreground text-xs font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Gym Management, Simplified
          </div>
          
          <h1 className="font-semibold leading-[1.1] text-5xl sm:text-6xl md:text-7xl tracking-tighter text-foreground mb-6">
            Run your gym. <br />
            Like clockwork.
          </h1>
          
          <p className="text-muted-foreground text-lg max-w-lg leading-relaxed mb-10">
            Members, attendance, and payments — tracked perfectly in one place. Focus on your floor, we'll handle the paperwork.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:opacity-90 transition-opacity shadow-sm"
            >
              Launch Dashboard 
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
            <a
              href="#features"
              className="w-full sm:w-auto text-center px-6 py-3.5 text-sm font-medium text-foreground bg-background hover:bg-accent border border-border rounded-md transition-colors shadow-sm"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Right: Crisp, Flat Mockup */}
        <div className="relative w-full aspect-square md:aspect-video lg:aspect-square flex items-center justify-center">
          <div className="relative w-full max-w-md bg-background border border-border rounded-xl shadow-2xl p-6">
            
            {/* Mock Window Controls */}
            <div className="flex items-center gap-1.5 mb-6 pb-4 border-b border-border/50">
              <div className="w-2.5 h-2.5 rounded-full bg-border" />
              <div className="w-2.5 h-2.5 rounded-full bg-border" />
              <div className="w-2.5 h-2.5 rounded-full bg-border" />
            </div>

            {/* Mock Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-sm font-semibold text-foreground">Live Dashboard</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Overview</div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary/50 border border-border text-[10px] font-medium text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Syncing
              </div>
            </div>

            {/* Mock Stats */}
            <div className="space-y-3">
              {[
                { title: 'Total Members', value: '312', trend: '+12 this week', icon: Users },
                { title: 'Today\'s Check-ins', value: '84', trend: 'Peak hour', icon: CheckCircle },
                { title: 'Revenue (MTD)', value: '₹2.1L', trend: '+8% vs last month', icon: CreditCard },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                      <stat.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">{stat.title}</div>
                      <div className="text-sm font-semibold text-foreground tracking-tight mt-0.5">{stat.value}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {stat.trend}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pb-32">
        <div className="mb-12">
          <h2 className="font-semibold text-2xl sm:text-3xl text-foreground tracking-tight">
            Everything you need.<br />
            <span className="text-muted-foreground">Nothing you don't.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              title: 'Members', 
              body: 'Add members, assign plans, and track who\'s active without digging through old registers.', 
              icon: Users,
            },
            { 
              title: 'Attendance', 
              body: 'A single QR at the door logs every check-in instantly — no manual sign-in sheets.', 
              icon: Smartphone,
            },
            { 
              title: 'Payments', 
              body: 'See exactly who\'s paid, who\'s due, and where your revenue stands in real-time.', 
              icon: BarChart,
            },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-xl border border-border bg-card">
              <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center mb-5">
                <f.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base tracking-tight mb-2 text-foreground">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-foreground">
              Jovifitx
            </span>
            <span className="text-xs text-muted-foreground">© {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built for gym owners.
          </p>
        </div>
      </footer>
    </div>
  )
}