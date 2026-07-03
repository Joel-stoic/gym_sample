import { ArrowRight, Activity, Users, CreditCard, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-black text-zinc-100 selection:bg-indigo-500/30 font-sans overflow-hidden">
      
      {/* ── Background Effects ── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* ── Nav ── */}
        <header className="flex items-center justify-between px-6 sm:px-12 py-8 max-w-7xl mx-auto w-full">
          <Link href="/" className="group flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <Activity className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">
              Jovifitx
            </span>
          </Link>

          <Link
            href="/login"
            className="group relative inline-flex items-center justify-center h-10 px-6 text-sm font-medium transition-all duration-300 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 overflow-hidden active:scale-95"
          >
            <span>Sign In</span>
          </Link>
        </header>

        {/* ── Hero ── */}
        <main className="flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto px-6 sm:px-12 pt-12 sm:pt-20 pb-24 w-full">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            Gym Management 2.0
          </div>

          <h1 className="text-center text-5xl sm:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60 max-w-4xl leading-[1.1] mb-8">
            Run your gym <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">like clockwork.</span>
          </h1>
          
          <p className="text-center text-zinc-400 text-lg sm:text-xl max-w-2xl leading-relaxed mb-12">
            Members, attendance, and payments — tracked intelligently in one unified platform. Free yourself from spreadsheets and focus on the floor.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/login"
              className="relative group w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 text-sm font-medium transition-all duration-300 rounded-full bg-white text-black hover:bg-zinc-100 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start managing now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
            
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 text-sm font-medium transition-all duration-300 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 active:scale-95 backdrop-blur-sm"
            >
              Explore features
            </Link>
          </div>

          {/* ── Dashboard Preview (Glassmorphic) ── */}
          <div className="w-full mt-24 relative perspective-[2000px]">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20 pointer-events-none" />
            <div className="relative z-10 rounded-2xl sm:rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-indigo-500/10 ring-1 ring-white/5 transform-gpu transition-transform duration-700 hover:rotate-x-2">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-zinc-400">Live Workspace</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
                {[
                  { label: 'Active Members', value: '312', trend: '+12%', icon: Users },
                  { label: 'Today\'s Check-ins', value: '84', trend: 'Peak hours', icon: Activity },
                  { label: 'Monthly Revenue', value: '$24.5k', trend: '+4.2%', icon: CreditCard },
                ].map((stat) => (
                  <div key={stat.label} className="p-8 group hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between mb-4 text-zinc-400">
                      <span className="text-sm font-medium">{stat.label}</span>
                      <stat.icon className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity text-indigo-400" />
                    </div>
                    <div className="flex items-baseline gap-3">
                      <p className="text-4xl font-bold tracking-tight text-white tabular-nums">
                        {stat.value}
                      </p>
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                        {stat.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* ── Features ── */}
        <section id="how-it-works" className="relative max-w-7xl mx-auto px-6 sm:px-12 py-24 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">Everything you need. Nothing you don&apos;t.</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Built precisely for the daily realities of running a modern fitness facility.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                title: 'Member Management', 
                body: 'Add members, assign tailored plans, and instantly track active status without digging through cumbersome registers.',
                icon: Users 
              },
              { 
                title: 'Frictionless Attendance', 
                body: 'A single QR scan at the front desk logs every check-in instantly. No more messy manual sign-in sheets.',
                icon: Activity
              },
              { 
                title: 'Revenue Tracking', 
                body: 'Get absolute clarity on who has paid, whose dues are pending, and exactly where your monthly revenue stands.',
                icon: CreditCard 
              },
            ].map((f, i) => (
              <div key={f.title} className="group relative p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900/80 hover:border-white/10 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-zinc-300 group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-300">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                    {f.body}
                  </p>
                  <div className="flex items-center text-sm font-medium text-indigo-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 cursor-pointer">
                    Learn more <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="mt-auto border-t border-white/5 bg-black/50 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span className="font-semibold text-zinc-300">Jovifitx</span>
            </div>
            <p>Designed for gym owners, not spreadsheets.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-zinc-300 transition-colors">Twitter</a>
              <a href="#" className="hover:text-zinc-300 transition-colors">Support</a>
              <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}