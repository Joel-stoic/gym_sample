'use client'

import { Inter } from 'next/font/google'
import { ChevronRight, Users, Smartphone, BarChart2, CreditCard, Bell, Search, ArrowRight } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export default function HomePage() {
  return (
    <div className={`${inter.className} min-h-screen bg-[#09090f] text-white overflow-x-hidden`}>

      {/* ── Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-[10%] right-[-100px] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
      </div>

      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
        <div className="flex items-center justify-between w-full max-w-4xl px-5 py-2.5 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-full shadow-lg">
          <span className="font-bold text-base tracking-tight text-white">Jovifitx</span>

          <nav className="hidden sm:flex items-center gap-7">
            <a href="#features" className="text-sm font-medium text-white/50 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-white/50 hover:text-white transition-colors">How it works</a>
          </nav>

          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-[#09090f] bg-white hover:bg-white/90 rounded-full transition-all"
          >
            Launch Dashboard
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-32 sm:pt-40 pb-24 grid lg:grid-cols-2 gap-14 lg:gap-10 items-center">

        {/* Left */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
            </span>
            The operating system for your gym
          </div>

          <h1 className="font-extrabold leading-[1.04] text-4xl sm:text-5xl lg:text-[60px] tracking-[-1.5px] text-white mb-5">
            Run your gym.<br />
            <span className="text-white/35">Like clockwork.</span>
          </h1>

          <p className="text-white/60 text-base sm:text-lg max-w-md leading-relaxed mb-10">
            Automate member tracking, attendance logs, and payment collections. Jovifitx puts your operations on autopilot so you can focus on the floor.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-[#09090f] bg-white hover:bg-white/90 rounded-lg transition-all"
            >
              Launch Dashboard <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white/70 border border-white/10 hover:bg-white/[0.04] hover:border-white/20 rounded-lg transition-all"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Right — Dashboard Mockup */}
        <div className="relative w-full">
          <div className="absolute inset-0 -m-8 bg-violet-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative bg-[#111118] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-violet-500/10">

            {/* Window bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                {[0,1,2].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-white/10" />)}
              </div>
              <span className="text-[11px] text-white/30 font-medium">app.jovifitx.com</span>
              <div className="w-16" />
            </div>

            {/* Dashboard body */}
            <div className="p-4 sm:p-5 space-y-4">

              {/* Gym header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/30 font-semibold mb-0.5">Active Gym</p>
                  <p className="text-xs font-bold text-white">Jovifitx Fitness Club</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Members', val: '312', sub: '+12 this month', green: true },
                  { label: 'Check-ins', val: '84', sub: 'Live today', green: false },
                  { label: 'Revenue', val: '₹2.1L', sub: '94% collected', green: false },
                ].map((s) => (
                  <div key={s.label} className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <p className="text-[8px] uppercase tracking-wider text-white/30 font-semibold">{s.label}</p>
                    <p className="text-base font-extrabold text-white mt-1 tracking-tight">{s.val}</p>
                    <p className={`text-[8px] mt-0.5 ${s.green ? 'text-emerald-400' : 'text-white/30'}`}>{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-wider text-white/30 font-semibold">Monthly collection rate</span>
                  <span className="text-[9px] font-bold text-white">94.2%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400" style={{ width: '94.2%' }} />
                </div>
              </div>

              {/* Check-ins */}
              <div className="space-y-1.5">
                <p className="text-[9px] uppercase tracking-wider text-white/30 font-semibold">Recent Check-ins</p>
                {[
                  { init: 'JD', name: 'John Doe', plan: 'Premium Yearly', time: '10:45 AM', status: 'Active', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                  { init: 'AS', name: 'Alice Smith', plan: 'Monthly Strength', time: '10:30 AM', status: 'Active', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                  { init: 'MR', name: 'Mike Ross', plan: 'Quarterly Cardio', time: '10:15 AM', status: 'Expired', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
                ].map((u) => (
                  <div key={u.name} className="flex items-center justify-between p-2 rounded-lg border border-white/[0.05] bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-[8px] font-bold text-violet-300 flex-shrink-0">
                        {u.init}
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-white leading-none">{u.name}</p>
                        <p className="text-[8px] text-white/30 mt-0.5">{u.plan}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-white/30">{u.time}</span>
                      <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded border ${u.color}`}>{u.status}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* ── Stats Band ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
          {[
            { num: '500+', label: 'Gyms on Jovifitx' },
            { num: '1.2L+', label: 'Members managed' },
            { num: '98%', label: 'Uptime guarantee' },
            { num: '3s', label: 'Avg. check-in time' },
          ].map((s) => (
            <div key={s.label} className="bg-[#09090f] px-8 py-8 text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1.5">{s.num}</p>
              <p className="text-sm text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pb-28">
        <p className="text-xs font-semibold uppercase tracking-[1.2px] text-violet-400 mb-4">Features</p>
        <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-4 leading-[1.08]">
          Designed for operations.<br />
          <span className="text-white/30">Built for growth.</span>
        </h2>
        <p className="text-white/50 text-base sm:text-lg max-w-lg leading-relaxed mb-14">
          Everything a gym needs — member management, QR attendance, and real-time revenue — in one place.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Members */}
          <FeatureCard icon={<Users className="w-5 h-5 stroke-violet-400" />} title="Member Management" body="Assign plans, track active status, and search instantly. No spreadsheet stress.">
            <div className="space-y-0">
              <div className="flex items-center justify-between text-[9px] text-white/30 uppercase tracking-wider font-semibold pb-2 border-b border-white/[0.05]">
                <span>Name</span><span>Plan</span><span>Status</span>
              </div>
              {[
                { name: 'Alex Carter', plan: 'Monthly Pro', status: 'Active', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                { name: 'David Miller', plan: 'Cardio Basic', status: 'Pending', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                { name: 'Sara Nair', plan: 'Yearly Premium', status: 'Active', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              ].map((m) => (
                <div key={m.name} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <span className="text-[10px] font-semibold text-white w-20 truncate">{m.name}</span>
                  <span className="text-[9px] text-white/40">{m.plan}</span>
                  <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded border ${m.cls}`}>{m.status}</span>
                </div>
              ))}
            </div>
          </FeatureCard>

          {/* QR */}
          <FeatureCard icon={<Smartphone className="w-5 h-5 stroke-violet-400" />} title="QR Attendance" body="Generate a unique QR for your entrance. Members scan to check in automatically.">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <rect x="8" y="8" width="24" height="24" rx="3" fill="rgba(255,255,255,0.75)" />
                  <rect x="14" y="14" width="12" height="12" rx="1.5" fill="#09090f" />
                  <rect x="17" y="17" width="6" height="6" rx="0.5" fill="rgba(255,255,255,0.75)" />
                  <rect x="48" y="8" width="24" height="24" rx="3" fill="rgba(255,255,255,0.75)" />
                  <rect x="54" y="14" width="12" height="12" rx="1.5" fill="#09090f" />
                  <rect x="57" y="17" width="6" height="6" rx="0.5" fill="rgba(255,255,255,0.75)" />
                  <rect x="8" y="48" width="24" height="24" rx="3" fill="rgba(255,255,255,0.75)" />
                  <rect x="14" y="54" width="12" height="12" rx="1.5" fill="#09090f" />
                  <rect x="17" y="57" width="6" height="6" rx="0.5" fill="rgba(255,255,255,0.75)" />
                  {[[36,8,8,8],[46,8,6,6],[36,18,6,6],[44,18,8,8],[36,32,8,6],[46,30,6,8],
                    [8,36,8,6],[18,34,6,8],[26,36,6,6],[36,40,6,6],[44,38,8,8],[54,36,6,8],[62,36,8,6],[70,36,8,8],
                    [36,50,8,6],[46,50,6,8],[54,48,6,6],[62,48,8,8],[70,50,6,6],
                    [36,60,6,6],[44,60,8,6],[54,58,8,8],[64,60,6,8],[70,60,6,6]].map(([x,y,w,h], i) => (
                    <rect key={i} x={x} y={y} width={w} height={h} rx="1" fill={`rgba(255,255,255,${0.3 + (i % 3) * 0.12})`} />
                  ))}
                </svg>
              </div>
              <p className="text-[10px] text-white/35 font-medium">Scan to check in · Jovifitx</p>
            </div>
          </FeatureCard>

          {/* Revenue */}
          <FeatureCard icon={<BarChart2 className="w-5 h-5 stroke-violet-400" />} title="Revenue Metrics" body="Clear insight into payments collected, outstanding dues, and monthly growth.">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-white/30 font-semibold">Collection rate</span>
                  <span className="text-[10px] font-bold text-white">94.2%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: '94.2%' }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[8px] text-white/30">Collected: ₹2.1L</span>
                  <span className="text-[8px] text-white/30">Due: ₹12k</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-white/30 font-semibold">Member growth</span>
                  <span className="text-[10px] font-bold text-emerald-400">+12 this month</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: '68%' }} />
                </div>
              </div>
            </div>
          </FeatureCard>

          {/* Plans */}
          <FeatureCard icon={<CreditCard className="w-5 h-5 stroke-violet-400" />} title="Flexible Plans" body="Create monthly, quarterly, or yearly plans. Assign and switch for any member in seconds.">
            <div className="space-y-2">
              {[
                { name: 'Premium Yearly', price: '₹8,000/yr', active: true },
                { name: 'Monthly Pro', price: '₹1,200/mo', active: false },
                { name: 'Cardio Basic', price: '₹800/mo', active: false },
              ].map((p) => (
                <div key={p.name} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${p.active ? 'bg-violet-500/10 border-violet-500/20' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                  <span className={`text-[10px] font-semibold ${p.active ? 'text-violet-300' : 'text-white/40'}`}>{p.name}</span>
                  <span className="text-[10px] font-bold text-white">{p.price}</span>
                </div>
              ))}
            </div>
          </FeatureCard>

          {/* Expiry Alerts */}
          <FeatureCard icon={<Bell className="w-5 h-5 stroke-violet-400" />} title="Expiry Alerts" body="Automatically flag members with expiring or expired plans so you never miss a renewal.">
            <div className="space-y-2">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <p className="text-[10px] font-semibold text-amber-400">3 plans expiring in 7 days</p>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <p className="text-[10px] font-semibold text-red-400">1 member expired today</p>
              </div>
            </div>
          </FeatureCard>

          {/* Search */}
          <FeatureCard icon={<Search className="w-5 h-5 stroke-violet-400" />} title="Instant Search" body="Find any member by name, phone, or plan in milliseconds. No delay, no friction.">
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                <Search className="w-3 h-3 text-white/25" />
                <span className="text-[10px] text-white/25">Search members…</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <div className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center text-[8px] font-bold text-violet-300 flex-shrink-0">JD</div>
                <span className="text-[10px] font-semibold text-white">John Doe</span>
                <span className="text-[9px] text-white/30 ml-auto">Premium</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg">
                <div className="w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center text-[8px] font-bold text-white/30 flex-shrink-0">JP</div>
                <span className="text-[10px] text-white/40">James Patel</span>
                <span className="text-[9px] text-white/20 ml-auto">Monthly</span>
              </div>
            </div>
          </FeatureCard>

        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pb-28">
        <p className="text-xs font-semibold uppercase tracking-[1.2px] text-violet-400 mb-4">How it works</p>
        <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-4 leading-[1.08]">
          Set up in minutes.<br />
          <span className="text-white/30">Run forever.</span>
        </h2>
        <p className="text-white/50 text-base sm:text-lg max-w-lg leading-relaxed mb-14">
          Three steps from sign-up to a fully automated gym.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              n: '01',
              icon: <Users className="w-4 h-4 stroke-violet-400" />,
              title: 'Add your members',
              body: 'Import your existing list or add one by one. Assign a plan and set the start date.',
            },
            {
              n: '02',
              icon: <Smartphone className="w-4 h-4 stroke-violet-400" />,
              title: 'Print your QR code',
              body: "Generate and print your gym's unique QR. Stick it at the entrance — members scan to check in.",
            },
            {
              n: '03',
              icon: <BarChart2 className="w-4 h-4 stroke-violet-400" />,
              title: 'Watch it run itself',
              body: 'Attendance logs fill automatically. Expired plans surface as alerts. You focus on coaching.',
            },
          ].map((s) => (
            <div key={s.n} className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden hover:border-white/10 hover:-translate-y-0.5 transition-all">
              <span className="absolute top-4 right-5 text-5xl font-extrabold text-white/[0.04] tracking-tighter leading-none select-none">{s.n}</span>
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                {s.icon}
              </div>
              <h3 className="font-bold text-sm text-white mb-2 tracking-tight">{s.title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pb-28">
        <div className="relative rounded-3xl bg-white/[0.03] border border-white/[0.07] px-8 sm:px-16 py-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(124,58,237,0.15),transparent_60%)] pointer-events-none" />
          <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-4 leading-[1.08]">
            Your gym deserves<br />better than a spreadsheet.
          </h2>
          <p className="text-white/50 text-base sm:text-lg mb-10">Join 500+ gyms already running on Jovifitx.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-[#09090f] bg-white hover:bg-white/90 rounded-lg transition-all"
            >
              Launch Dashboard <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-white/60 border border-white/10 hover:bg-white/[0.04] rounded-lg transition-all"
            >
              See features
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.06] max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-extrabold text-base text-white tracking-tight">Jovifitx</span>
        <p className="text-sm text-white/30">Operating system for modern gyms &nbsp;·&nbsp; © {new Date().getFullYear()}</p>
      </footer>

    </div>
  )
}

/* ── Feature Card Component ── */
function FeatureCard({
  icon,
  title,
  body,
  children,
}: {
  icon: React.ReactNode
  title: string
  body: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 hover:-translate-y-0.5 transition-all">
      <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5 flex-shrink-0">
        {icon}
      </div>
      <h3 className="font-bold text-sm text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-xs text-white/40 leading-relaxed mb-5">{body}</p>
      {children && (
        <div className="mt-auto pt-4 border-t border-white/[0.05]">
          {children}
        </div>
      )}
    </div>
  )
}