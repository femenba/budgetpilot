import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, PieChart, Shield, Target, Zap,
  ArrowRight, Check, BarChart2, ArrowLeftRight, Wallet, RefreshCw,
} from 'lucide-react'

const features = [
  {
    icon: TrendingUp,
    title: 'Track every penny',
    desc: 'Log income and expenses in seconds. See exactly where your money goes each month.',
    color: 'text-accent-green',
    bg: 'bg-emerald-900/25',
    border: 'hover:border-emerald-800/40',
  },
  {
    icon: PieChart,
    title: 'Visual breakdowns',
    desc: 'Category-level insights and spending trends that make sense at a glance.',
    color: 'text-accent-blue',
    bg: 'bg-sky-900/20',
    border: 'hover:border-sky-800/40',
  },
  {
    icon: Shield,
    title: 'Private by design',
    desc: 'Your data lives encrypted in Supabase — row-level secure, only visible to you.',
    color: 'text-brand-400',
    bg: 'bg-brand-900/30',
    border: 'hover:border-brand-800/40',
  },
  {
    icon: Target,
    title: 'Budget goals',
    desc: 'Set monthly caps per category and track your progress in real time.',
    color: 'text-amber-400',
    bg: 'bg-amber-900/20',
    border: 'hover:border-amber-800/40',
    pro: true,
  },
]

const proFeatures = [
  { label: 'AI spending insights',     icon: BarChart2 },
  { label: 'Monthly PDF reports',      icon: ArrowRight },
  { label: 'Budget limits & alerts',   icon: Target },
  { label: 'Multi-currency support',   icon: Wallet },
  { label: 'Data export (CSV)',         icon: ArrowLeftRight },
]

/* Phone mockup — renders a fake BudgetPilot dashboard screen */
function PhoneMockup() {
  const txns = [
    { label: 'Rent',       cat: 'Housing',   color: '#3B82F6', amount: '-£1,200', income: false },
    { label: 'Salary',     cat: 'Income',    color: '#22C55E', amount: '+£3,400', income: true  },
    { label: 'Groceries',  cat: 'Food',      color: '#F59E0B', amount: '-£92',    income: false },
    { label: 'Netflix',    cat: 'Lifestyle', color: '#EF4444', amount: '-£18',    income: false },
  ]

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Glow behind phone */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-56 h-56 rounded-full bg-accent-green/10 blur-3xl" />
        <div className="absolute w-40 h-40 rounded-full bg-accent-blue/10 blur-2xl translate-x-10" />
      </div>

      {/* Phone shell */}
      <div
        className="relative z-10 rounded-[44px] shadow-[0_32px_80px_rgba(0,0,0,0.55)] border border-white/10 overflow-hidden"
        style={{
          width: 240,
          background: 'linear-gradient(160deg, #0d1f3c 0%, #091628 100%)',
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <span className="text-[9px] font-bold text-white/50">9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="w-3 h-1.5 rounded-sm border border-white/30 overflow-hidden">
              <div className="h-full w-2/3 bg-accent-green rounded-sm" />
            </div>
          </div>
        </div>

        {/* Screen content */}
        <div className="px-3 pb-5">

          {/* Hero wallet card */}
          <div
            className="rounded-2xl p-4 mb-3 relative overflow-hidden"
            style={{ background: 'linear-gradient(140deg, #0F2743 0%, #0D1F3C 60%, #091628 100%)' }}
          >
            {/* Ambient blob */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)' }} />

            <p className="text-[9px] text-white/40 font-semibold uppercase tracking-widest mb-1">Total Balance</p>
            <p className="text-2xl font-bold text-white tracking-tight mb-3">£2,108.00</p>

            {/* Progress bar */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] text-white/40">Savings goal</span>
              <span className="text-[8px] text-accent-green font-semibold">62%</span>
            </div>
            <div className="h-1 rounded-full bg-white/10 mb-4 overflow-hidden">
              <div className="h-full rounded-full w-[62%]"
                style={{ background: 'linear-gradient(90deg, #22C55E, #38BDF8)' }} />
            </div>

            {/* Income / Expense mini stats */}
            <div className="flex gap-2">
              <div className="flex-1 bg-white/5 rounded-xl p-2">
                <p className="text-[8px] text-white/40 mb-0.5">Income</p>
                <p className="text-[11px] font-bold text-accent-green">£3,400</p>
              </div>
              <div className="flex-1 bg-white/5 rounded-xl p-2">
                <p className="text-[8px] text-white/40 mb-0.5">Expenses</p>
                <p className="text-[11px] font-bold text-accent-red">£1,292</p>
              </div>
            </div>
          </div>

          {/* Insight pills */}
          <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-none">
            {[
              { label: 'Recurring', val: '5 txns',  color: '#38BDF8' },
              { label: 'Savings',   val: '62%',      color: '#22C55E' },
              { label: 'Top Spend', val: 'Housing',  color: '#F59E0B' },
            ].map(({ label, val, color }) => (
              <div key={label} className="shrink-0 bg-white/5 border border-white/8 rounded-xl px-2.5 py-1.5 text-center">
                <p className="text-[8px] text-white/40">{label}</p>
                <p className="text-[10px] font-bold" style={{ color }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Recent transactions */}
          <p className="text-[9px] text-white/40 font-semibold uppercase tracking-widest mb-2 px-0.5">Recent</p>
          <div className="flex flex-col gap-1">
            {txns.map(({ label, cat, color, amount, income }) => (
              <div key={label} className="flex items-center gap-2 bg-white/[0.03] rounded-xl px-2.5 py-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white font-bold"
                  style={{ fontSize: 8, backgroundColor: color }}
                >
                  {label.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-semibold text-white/80 truncate">{label}</p>
                  <p className="text-[7px] text-white/30">{cat}</p>
                </div>
                <p className={`text-[9px] font-bold shrink-0 ${income ? 'text-accent-green' : 'text-accent-red'}`}>
                  {amount}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom nav bar (decorative) */}
        <div className="flex items-center justify-around py-3 border-t border-white/5 px-4">
          {[BarChart2, ArrowLeftRight, TrendingUp, TrendingDown].map((Icon, i) => (
            <div key={i} className={`${i === 0 ? 'text-accent-green' : 'text-white/20'}`}>
              <Icon size={14} strokeWidth={i === 0 ? 2.5 : 1.5} />
            </div>
          ))}
        </div>
      </div>

      {/* Floating card: top-right */}
      <div
        className="absolute -right-4 top-10 z-20 bg-surface border border-line rounded-2xl px-3 py-2.5 shadow-card-md"
        style={{ minWidth: 110 }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-4 h-4 rounded-md bg-emerald-900/40 flex items-center justify-center">
            <TrendingUp size={8} className="text-accent-green" />
          </div>
          <span className="text-[9px] font-semibold text-dim/70 uppercase tracking-wide">Savings Rate</span>
        </div>
        <p className="text-base font-bold text-accent-green">62%</p>
        <p className="text-[8px] text-dim/50">this month</p>
      </div>

      {/* Floating card: bottom-left */}
      <div
        className="absolute -left-6 bottom-20 z-20 bg-surface border border-line rounded-2xl px-3 py-2.5 shadow-card-md"
        style={{ minWidth: 120 }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <RefreshCw size={9} className="text-brand-400" />
          <span className="text-[9px] font-semibold text-dim/70 uppercase tracking-wide">Recurring</span>
        </div>
        <p className="text-base font-bold text-ink">5 bills</p>
        <p className="text-[8px] text-dim/50">£1,482/mo</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink overflow-x-hidden">

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent-blue/[0.06] blur-3xl" />
        <div className="absolute top-1/3 -right-60 w-[500px] h-[500px] rounded-full bg-accent-green/[0.05] blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] rounded-full bg-surface/40 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-glow-sm">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-ink">BudgetPilot</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-dim hover:text-ink transition-colors px-3 py-2"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl transition-colors shadow-glow-sm"
          >
            Get started free
          </Link>
        </div>
      </header>

      {/* Hero — split layout */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left copy */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-900/30 border border-brand-800/40 rounded-full text-xs text-brand-300 font-medium mb-8">
            <Zap size={11} className="text-brand-400" strokeWidth={2.5} />
            Free forever · No credit card needed
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.06] mb-6">
            Your money,
            <span className="block bg-gradient-to-r from-brand-400 via-accent-green to-accent-blue bg-clip-text text-transparent">
              finally clear.
            </span>
          </h1>

          <p className="text-lg text-dim leading-relaxed mb-10 max-w-md">
            BudgetPilot helps you track income, manage expenses, and understand
            where your money goes — with a clean interface built for real life.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-3 mb-10">
            <Link
              to="/register"
              className="flex items-center gap-2 px-7 py-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-2xl transition-all shadow-glow-sm text-base"
            >
              Start for free <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-7 py-4 bg-surface hover:bg-line text-ink font-medium rounded-2xl transition-all border border-line text-base"
            >
              Sign in
            </Link>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-dim">
            {['£0 to start', '2-min setup', 'No ads, ever'].map(t => (
              <div key={t} className="flex items-center gap-2">
                <Check size={13} className="text-accent-green" strokeWidth={2.5} />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — phone mockup */}
        <div className="flex items-center justify-center lg:justify-end">
          <PhoneMockup />
        </div>
      </section>

      {/* Stats bar */}
      <div className="relative z-10 border-y border-line/50 bg-surface/40 backdrop-blur-sm py-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { val: '10,000+', label: 'Users'              },
            { val: '£50M+',   label: 'Tracked'            },
            { val: '99.9%',   label: 'Uptime'             },
            { val: 'Free',    label: 'To get started'     },
          ].map(({ val, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-ink mb-1">{val}</p>
              <p className="text-xs text-dim uppercase tracking-wider font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">What you get</p>
          <h2 className="text-3xl font-bold text-ink">Everything you need. Nothing you don't.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc, color, bg, border, pro }) => (
            <div
              key={title}
              className={`bg-surface border border-line ${border} rounded-2xl p-6 transition-all`}
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon size={18} className={color} strokeWidth={2} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-ink">{title}</h3>
                {pro && (
                  <span className="text-[9px] font-bold bg-brand-900/40 text-brand-400 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                    Pro
                  </span>
                )}
              </div>
              <p className="text-xs text-dim leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* App preview — wider section with UI teaser */}
      <section className="relative z-10 px-6 pb-24 max-w-6xl mx-auto">
        <div className="bg-surface border border-line rounded-3xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left: copy */}
            <div className="p-10 flex flex-col justify-center">
              <p className="text-xs font-semibold text-accent-blue uppercase tracking-widest mb-3">Built for clarity</p>
              <h2 className="text-3xl font-bold text-ink mb-4 leading-snug">
                See the full picture,<br />month by month
              </h2>
              <p className="text-sm text-dim leading-relaxed mb-8">
                Charts, category breakdowns, recurring transaction detection, and
                6-month balance trends — all in one dashboard that loads instantly.
              </p>
              <ul className="flex flex-col gap-3 mb-8">
                {[
                  'Weekly income vs. expense breakdown',
                  'Category-level donut chart',
                  'Horizontal insight cards',
                  'Recurring transaction detection',
                ].map(f => (
                  <li key={f} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-accent-green/20 flex items-center justify-center shrink-0">
                      <Check size={9} className="text-accent-green" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-ink/80">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="self-start flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all shadow-glow-sm text-sm"
              >
                Try it free <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </div>

            {/* Right: mini dashboard preview */}
            <div className="relative bg-canvas/60 p-8 flex flex-col gap-3 border-l border-line/50 min-h-[340px]">
              {/* Ambient */}
              <div className="absolute top-8 right-8 w-32 h-32 rounded-full bg-accent-green/10 blur-2xl pointer-events-none" />

              {/* Mini summary cards */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Income',   val: '£3,400', color: 'text-accent-green', top: 'bg-accent-green' },
                  { label: 'Expenses', val: '£1,292', color: 'text-accent-red',   top: 'bg-accent-red'   },
                  { label: 'Balance',  val: '£2,108', color: 'text-ink',          top: 'bg-accent-blue'  },
                ].map(({ label, val, color, top }) => (
                  <div key={label} className="bg-surface border border-line rounded-xl p-3 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-0.5 ${top} opacity-60`} />
                    <p className="text-[9px] text-dim/70 uppercase tracking-wider font-semibold mb-1">{label}</p>
                    <p className={`text-sm font-bold ${color}`}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Mini chart bars */}
              <div className="bg-surface border border-line rounded-xl p-3">
                <p className="text-[9px] text-dim/60 uppercase tracking-wider font-semibold mb-3">Weekly Breakdown</p>
                <div className="flex items-end justify-around gap-1 h-14">
                  {[
                    [60, 40], [80, 55], [45, 30], [70, 48],
                  ].map(([inc, exp], i) => (
                    <div key={i} className="flex items-end gap-0.5">
                      <div className="w-4 rounded-sm bg-accent-green/70" style={{ height: inc * 0.6 }} />
                      <div className="w-4 rounded-sm bg-accent-red/70"   style={{ height: exp * 0.6 }} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-around mt-1">
                  {['W1','W2','W3','W4'].map(w => (
                    <span key={w} className="text-[8px] text-dim/40">{w}</span>
                  ))}
                </div>
              </div>

              {/* Mini recent transactions */}
              <div className="bg-surface border border-line rounded-xl p-3 flex flex-col gap-2">
                <p className="text-[9px] text-dim/60 uppercase tracking-wider font-semibold">Recent</p>
                {[
                  { label: 'Rent',      color: '#3B82F6', amount: '-£1,200', inc: false },
                  { label: 'Salary',    color: '#22C55E', amount: '+£3,400', inc: true  },
                  { label: 'Groceries', color: '#F59E0B', amount: '-£92',    inc: false },
                ].map(({ label, color, amount, inc }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg shrink-0 flex items-center justify-center text-white font-bold"
                      style={{ fontSize: 8, backgroundColor: color }}>
                      {label[0]}
                    </div>
                    <span className="text-[10px] text-dim flex-1">{label}</span>
                    <span className={`text-[10px] font-bold ${inc ? 'text-accent-green' : 'text-accent-red'}`}>{amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pro CTA */}
      <section className="relative z-10 px-6 pb-24 max-w-4xl mx-auto">
        <div className="bg-surface border border-line rounded-3xl p-10 sm:p-14 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent-green/10 blur-3xl pointer-events-none" />
          <div className="grid sm:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-900/40 border border-brand-800/40 rounded-full text-xs text-brand-300 font-semibold mb-4">
                <Zap size={10} strokeWidth={3} /> Pro plan — £5/mo
              </div>
              <h2 className="text-3xl font-bold text-ink mb-3">Everything, unlocked</h2>
              <p className="text-sm text-dim leading-relaxed mb-6">
                Upgrade to Pro for the full picture — AI insights, reports, budgets,
                and multi-currency. Start free, upgrade whenever.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all shadow-glow-sm text-sm"
              >
                Start free, upgrade anytime <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
            </div>
            <ul className="flex flex-col gap-3.5">
              {proFeatures.map(({ label }) => (
                <li key={label} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-accent-green" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-ink">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-line/50 px-6 py-8 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-dim">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">B</span>
          </div>
          <span className="font-semibold text-ink">BudgetPilot</span>
          <span className="text-dim/50">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-ink transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-ink transition-colors">Terms</Link>
          <Link to="/login" className="hover:text-ink transition-colors">Sign in</Link>
        </div>
      </footer>
    </div>
  )
}
