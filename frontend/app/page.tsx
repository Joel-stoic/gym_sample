'use client'

import { Oswald, Inter } from 'next/font/google'
import { ArrowRight, Users, CheckCircle, CreditCard, Activity, BarChart, Smartphone } from 'lucide-react'

const oswald = Oswald({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display' })
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' })

export default function HomePage() {
  return (
    <div className={`${oswald.variable} ${inter.variable} min-h-screen bg-background text-foreground font-[family-name:var(--font-body)] relative overflow-hidden`}>
      
      {/* ── Dynamic Background Orbs ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/30 dark:bg-violet-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/30 dark:bg-fuchsia-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />

      {/* ── Nav ── */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6 max-w-7xl mx-auto backdrop-blur-sm">
        <span className="font-[family-name:var(--font-display)] font-semibold text-2xl tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
          Jovifitx
        </span>

        <a
          href="/login"
          className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 overflow-hidden shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-105"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-violet-600 group-hover:from-fuchsia-600 group-hover:to-violet-600 transition-all duration-500 ease-out" />
          <span className="relative flex items-center gap-2">
            Log in <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
        </a>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-20 sm:pt-32 pb-24 lg:pb-32 grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
        
        {/* Left: Text Content */}
        <div className="flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold tracking-widest uppercase mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            Gym Management, Simplified
          </div>
          
          <h1 className="font-[family-name:var(--font-display)] font-bold uppercase leading-[1.05] text-5xl sm:text-6xl md:text-7xl lg:text-7xl tracking-tighter text-foreground mb-6">
            Run your gym <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 animate-gradient-x">
              Like Clockwork.
            </span>
          </h1>
          
          <p className="text-muted-foreground text-lg sm:text-xl max-w-lg leading-relaxed mb-10">
            Members, attendance, and payments — tracked perfectly in one place, so the only thing you have to think about on the floor is the floor.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
            <a
              href="/login"
              className="w-full sm:w-auto group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white rounded-xl transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 overflow-hidden shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-1"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-600 to-fuchsia-600" />
              <span className="relative flex items-center gap-2">
                Launch Dashboard 
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
            <a
              href="#features"
              className="w-full sm:w-auto text-center px-8 py-4 text-base font-semibold text-foreground bg-card/50 hover:bg-accent border border-border backdrop-blur-md rounded-xl transition-all hover:-translate-y-1 shadow-sm"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Right: 3D Floating Mockup */}
        <div className="relative w-full aspect-square md:aspect-video lg:aspect-square flex items-center justify-center perspective-[1500px]">
          {/* Decorative rings behind mockup */}
          <div className="absolute inset-0 border border-violet-500/20 rounded-full animate-[spin_40s_linear_infinite]" />
          <div className="absolute inset-4 border border-fuchsia-500/20 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
          
          <div 
            className="relative w-full max-w-md bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-2xl shadow-2xl p-6 transform transition-transform duration-1000 hover:rotate-x-0 hover:rotate-y-0"
            style={{
              transform: 'rotateX(10deg) rotateY(-15deg)',
              boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.25)',
            }}
          >
            {/* Mock Header */}
            <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Live Dashboard</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Syncing
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Mock Stats */}
            <div className="space-y-4">
              {[
                { title: 'Total Members', value: '312', trend: '+12 this week', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { title: 'Today\'s Check-ins', value: '84', trend: 'Peak hour now', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { title: 'Revenue (MTD)', value: '₹2.1L', trend: '+8% vs last month', icon: CreditCard, color: 'text-violet-500', bg: 'bg-violet-500/10' },
              ].map((stat, i) => (
                <div key={i} className="group flex items-center gap-4 p-3 rounded-xl bg-background/50 border border-border/50 hover:bg-accent/50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">{stat.title}</div>
                    <div className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground tracking-tight">{stat.value}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground text-right">
                    {stat.trend}
                  </div>
                </div>
              ))}
            </div>

            {/* Mock Chart Area */}
            <div className="mt-6 h-24 rounded-xl bg-gradient-to-t from-violet-500/10 to-transparent border border-border/30 flex items-end overflow-hidden px-2 gap-1 pt-4 relative">
               <div className="absolute top-2 left-3 text-[10px] text-muted-foreground font-medium">Activity Curve</div>
               {[40, 65, 45, 80, 55, 90, 70, 100, 85].map((h, i) => (
                 <div key={i} className="flex-1 bg-gradient-to-t from-violet-500/50 to-violet-500/20 rounded-t-sm transition-all duration-1000 animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
               ))}
            </div>

          </div>
        </div>
      </main>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pb-32">
        <div className="text-center mb-16">
          <h2 className="font-[family-name:var(--font-display)] font-semibold uppercase text-3xl sm:text-4xl text-foreground tracking-tight">
            Everything you need. <br className="sm:hidden" />
            <span className="text-muted-foreground">Nothing you don't.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            { 
              title: 'Members', 
              body: 'Add members, assign plans, and track who\'s active without digging through old registers or excel sheets.', 
              icon: Users,
              color: 'from-blue-500/20 to-blue-500/0' 
            },
            { 
              title: 'Attendance', 
              body: 'A single QR at the door logs every check-in instantly — no manual sign-in sheets or fingerprint scanner headaches.', 
              icon: Smartphone,
              color: 'from-emerald-500/20 to-emerald-500/0' 
            },
            { 
              title: 'Payments', 
              body: 'See exactly who\'s paid, who\'s due, and where your revenue actually stands in real-time.', 
              icon: BarChart,
              color: 'from-fuchsia-500/20 to-fuchsia-500/0' 
            },
          ].map((f) => (
            <div key={f.title} className="group relative p-[1px] rounded-2xl overflow-hidden bg-gradient-to-b from-border to-transparent hover:from-violet-500/50 transition-colors duration-500">
              <div className="relative h-full bg-card/60 backdrop-blur-md p-8 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-b ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:border-violet-500/50 transition-all duration-300">
                    <f.icon className="w-6 h-6 text-foreground group-hover:text-violet-500 transition-colors" />
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] uppercase font-semibold text-xl tracking-tight mb-3 text-foreground">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-border bg-card/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-display)] font-semibold text-lg uppercase bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
              Jovifitx
            </span>
            <span className="text-xs text-muted-foreground">© {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            Built for gym owners, not spreadsheets.
          </p>
        </div>
      </footer>
      
      {/* Required for the background gradient animation text */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 6s ease infinite;
        }
      `}</style>
    </div>
  )
}