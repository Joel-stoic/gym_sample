import { Oswald, Inter } from 'next/font/google'

const oswald = Oswald({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display' })
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' })

export default function HomePage() {
  return (
    <div className={`${oswald.variable} ${inter.variable} min-h-screen bg-background text-[#F4F2EC] font-[family-name:var(--font-body)]`}>

      {/* ── Nav ── */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-6 max-w-6xl mx-auto">
        <span className="font-[family-name:var(--font-display)] font-semibold text-lg tracking-tight uppercase">
          Jovifitx
        </span>

          <a
          href="/login"
          className="px-5 py-2 text-sm font-medium rounded-full text-foreground transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a855f7]"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
        >
          Log in
        </a>
      </header>

      {/* ── Hero ── */}
      <main className="max-w-6xl mx-auto px-6 sm:px-10 pt-16 sm:pt-24 pb-20">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#a855f7] mb-5">
          Gym management, simplified
        </p>
        <h1 className="font-[family-name:var(--font-display)] font-semibold uppercase leading-[0.95] text-5xl sm:text-7xl tracking-tight max-w-3xl">
          Run your gym
          <br />
          like clockwork.
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg mt-7 max-w-md leading-relaxed">
          Members, attendance, and payments — tracked in one place, so the only thing you have to think about on the floor is the floor.
        </p>

        <div className="flex items-center gap-5 mt-9">
          <a
            href="/login"
            className="px-7 py-3 text-sm font-semibold rounded-full text-foreground transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a855f7]"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              boxShadow: '0 4px 20px #7c3aed35',
            }}
          >
            Log in to your gym
          </a>
            <a
            href="#how-it-works"
            className="text-sm font-medium text-[#F4F2EC]/70 hover:text-[#F4F2EC] underline underline-offset-4 decoration-[#26263a] transition-colors"
          >
            See how it works
          </a>
        </div>

        {/* ── Scoreboard — signature element ── */}
        <div className="mt-20 rounded-2xl border border-[#26263a] bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-[#26263a] flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Sample dashboard</span>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FBF3F]" />
              Live
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#26263a]">
            {[
              { label: 'Members tracked', value: '312' },
              { label: 'Check-ins today', value: '84' },
              { label: 'On-time collections', value: '₹2.1L' },
            ].map((stat) => (
              <div key={stat.label} className="px-6 py-7">
                <p className="font-[family-name:var(--font-display)] text-4xl font-semibold tabular-nums tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Features ── */}
        <div id="how-it-works" className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#26263a] mt-20 rounded-2xl overflow-hidden">
          {[
            { title: 'Members', body: 'Add members, assign plans, and track who\u2019s active without digging through registers.' },
            { title: 'Attendance', body: 'A single QR at the door logs every check-in — no manual sign-in sheets.' },
            { title: 'Payments', body: 'See who\u2019s paid, who\u2019s due, and where your revenue actually stands.' },
          ].map((f) => (
            <div key={f.title} className="bg-background p-7">
              <h3 className="font-[family-name:var(--font-display)] uppercase font-semibold text-lg tracking-tight mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 sm:px-10 py-8 border-t border-[#26263a] text-xs text-muted-foreground">
        Jovifitx — built for gym owners, not spreadsheets.
      </footer>
    </div>
  )
}