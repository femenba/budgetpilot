import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
  ArrowLeftRight, CreditCard, ArrowRight, BarChart2,
  FileText, Target, Pencil, Trash2, RefreshCw,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { useTransactions } from '../hooks/useTransactions'
import { useCurrency } from '../hooks/useCurrency'
import { Layout } from '../components/layout/Layout'
import { BalanceTrendChart } from '../components/dashboard/BalanceTrendChart'
import { SpendingByCategoryChart } from '../components/dashboard/SpendingByCategoryChart'
import { MonthlyChart } from '../components/dashboard/MonthlyChart'
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown'
import { EditTransactionModal } from '../components/transactions/EditTransactionModal'

const ACTIONS = [
  { to: '/income/add',   label: '+ Income',  color: '#22C55E', bg: 'rgba(34,197,94,0.10)'   },
  { to: '/expense/add',  label: '+ Expense', color: '#EF4444', bg: 'rgba(239,68,68,0.09)'   },
  { to: '/transactions', label: 'History',   color: '#38BDF8', bg: 'rgba(56,189,248,0.09)'  },
  { to: '/plans',        label: 'Plans',     color: '#A78BFA', bg: 'rgba(167,139,250,0.09)' },
]

/* ── Month nav ───────────────────────────────────────────── */
function MonthNav({ month, year, onChange }) {
  const now   = new Date()
  const isNow = month === now.getMonth() + 1 && year === now.getFullYear()
  const prev  = () => month === 1  ? onChange(12, year - 1) : onChange(month - 1, year)
  const next  = () => month === 12 ? onChange(1,  year + 1) : onChange(month + 1, year)
  return (
    <div className="flex items-center gap-0.5">
      <button onClick={prev} className="p-1.5 rounded-lg text-dim/35 hover:text-ink hover:bg-white/[0.06] transition-all active:scale-95">
        <ChevronLeft size={13} strokeWidth={2.5} />
      </button>
      <span className="text-[11px] font-semibold text-dim/45 px-2 min-w-[86px] text-center">
        {format(new Date(year, month - 1, 1), 'MMMM yyyy')}
      </span>
      <button onClick={next} disabled={isNow} className="p-1.5 rounded-lg text-dim/35 hover:text-ink hover:bg-white/[0.06] transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronRight size={13} strokeWidth={2.5} />
      </button>
    </div>
  )
}

/* ── Hero — full-bleed, balance as the visual star ────────── */
function HeroSection({ balance, totalIncome, totalExpense, month, year, onChangeMonth, greeting, firstName, loading }) {
  const { fmt } = useCurrency()
  const savedPct = totalIncome > 0 ? Math.max(0, Math.round((1 - totalExpense / totalIncome) * 100)) : null
  const spentPct = totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0

  return (
    <div className="relative overflow-hidden border-b border-line/12 px-5 sm:px-8 md:px-12 pt-8 pb-10">
      {/* Ambient — deeply subtle */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-0 w-[560px] h-[400px] rounded-full bg-accent-green/[0.035] blur-[90px]" />
        <div className="absolute bottom-0 left-1/3 w-[320px] h-[200px] rounded-full bg-accent-blue/[0.03] blur-[70px]" />
      </div>

      <div className="relative">
        {/* Greeting row */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-[10px] font-semibold text-dim/30 uppercase tracking-[0.22em]">
            {greeting}{firstName ? `, ${firstName}` : ''}
          </p>
          <MonthNav month={month} year={year} onChange={onChangeMonth} />
        </div>

        {/* THE BALANCE — dominant, cinematic */}
        <div className="mb-8">
          <p className="text-[9px] font-bold text-dim/22 uppercase tracking-[0.28em] mb-3">Net Balance</p>
          {loading ? (
            <div className="h-20 w-64 rounded-2xl bg-white/[0.03] animate-pulse" />
          ) : (
            <div className="flex items-end gap-4 flex-wrap">
              <h1
                className={`font-black tracking-tighter leading-none ${balance >= 0 ? 'text-ink' : 'text-accent-red'}`}
                style={{ fontSize: 'clamp(3.25rem, 7.5vw, 5.5rem)' }}
              >
                {fmt.format(balance)}
              </h1>
              {savedPct !== null && savedPct > 0 && (
                <span className="text-sm font-bold text-accent-green mb-1.5 opacity-80">+{savedPct}% saved</span>
              )}
            </div>
          )}
        </div>

        {/* Inline stats — NOT separate boxes */}
        {!loading && (
          <div className="flex flex-wrap items-start gap-6 sm:gap-10 mb-8">
            <div>
              <p className="text-[9px] font-bold text-dim/25 uppercase tracking-[0.2em] mb-1.5">Income</p>
              <p className="text-[1.35rem] font-bold text-accent-green leading-none">{fmt.format(totalIncome)}</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-line/15 mt-1" />
            <div>
              <p className="text-[9px] font-bold text-dim/25 uppercase tracking-[0.2em] mb-1.5">Expenses</p>
              <p className="text-[1.35rem] font-bold text-accent-red leading-none">{fmt.format(totalExpense)}</p>
            </div>
            {totalIncome > 0 && (
              <>
                <div className="hidden sm:block w-px h-10 bg-line/15 mt-1" />
                <div>
                  <p className="text-[9px] font-bold text-dim/25 uppercase tracking-[0.2em] mb-1.5">Budget used</p>
                  <div className="flex items-center gap-2.5 mt-1">
                    <div className="w-20 h-1 bg-line/15 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{
                        width: `${spentPct}%`,
                        background: spentPct > 90 ? '#EF4444' : spentPct > 70 ? '#F59E0B' : 'linear-gradient(90deg,#22C55E,#38BDF8)',
                      }} />
                    </div>
                    <span className="text-sm font-bold text-ink/70">{Math.round(spentPct)}%</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Slim action pills */}
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map(({ to, label, color, bg }) => (
            <Link key={to} to={to}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-[0.97]"
              style={{ backgroundColor: bg, color }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Transaction row — no card box, pure content ────────── */
function TxRow({ t, onDelete, onEdit }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting,   setDeleting]   = useState(false)
  const { fmt } = useCurrency()
  const isIncome = t.type === 'income'
  const letter   = (t.category?.name ?? t.type).charAt(0).toUpperCase()
  const color    = t.category?.color ?? (isIncome ? '#22C55E' : '#EF4444')

  const handleConfirm = async () => {
    setDeleting(true)
    await onDelete(t.id, t.type)
    setDeleting(false)
    setConfirming(false)
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3 py-3 px-3 rounded-xl bg-red-900/[0.07] border border-accent-red/12">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: color }}>{letter}</div>
        <p className="text-sm text-ink flex-1 truncate">{t.description || t.category?.name || 'Transaction'}</p>
        <button onClick={() => setConfirming(false)} className="px-2.5 py-1.5 text-xs text-dim/60 hover:text-ink rounded-lg transition-colors">Cancel</button>
        <button onClick={handleConfirm} disabled={deleting}
          className="px-3 py-1.5 bg-accent-red text-white text-xs font-semibold rounded-lg disabled:opacity-50">
          {deleting ? '…' : 'Delete'}
        </button>
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-4 py-3.5 -mx-2 px-2 rounded-xl hover:bg-white/[0.025] transition-colors">
      {/* Merchant avatar */}
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-bold shrink-0"
        style={{ backgroundColor: color }}>
        {letter}
      </div>

      {/* Description + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-ink/90 leading-snug truncate">
          {t.description || t.category?.name || 'Transaction'}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-dim/40">{t.category?.name ?? '—'}</span>
          {t.is_recurring && (
            <>
              <span className="text-dim/18 text-[10px]">·</span>
              <span className="flex items-center gap-0.5 text-[10px] text-brand-400/60 font-semibold">
                <RefreshCw size={8} strokeWidth={3} /> rec
              </span>
            </>
          )}
          <span className="text-dim/18 text-[10px]">·</span>
          <span className="text-[10px] text-dim/30">{format(parseISO(t.date), 'MMM d')}</span>
        </div>
      </div>

      {/* Amount + actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        <p className={`text-[14px] font-bold tabular-nums ${isIncome ? 'text-accent-green' : 'text-ink/75'}`}>
          {isIncome ? '+' : '−'}{fmt.format(t.amount)}
        </p>
        <div className="flex gap-0 ml-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button onClick={() => onEdit(t)} className="p-1.5 text-dim/22 hover:text-ink/70 hover:bg-white/[0.05] rounded-lg transition-colors">
              <Pencil size={11} />
            </button>
          )}
          <button onClick={() => setConfirming(true)} className="p-1.5 text-dim/22 hover:text-accent-red hover:bg-red-900/20 rounded-lg transition-colors">
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Insight panel — right column, minimal widgets ───────── */
function InsightPanel({ transactions, totalIncome, totalExpense }) {
  const { fmt } = useCurrency()

  const expenses       = transactions.filter(t => t.type === 'expense')
  const recurringExp   = expenses.filter(t => t.is_recurring)
  const recurringTotal = recurringExp.reduce((s, t) => s + Number(t.amount), 0)
  const savedPct       = totalIncome > 0 ? Math.max(0, Math.round((1 - totalExpense / totalIncome) * 100)) : null
  const cashFlow       = totalIncome - totalExpense

  const catMap = {}
  expenses.forEach(t => {
    const n = t.category?.name ?? 'Other'
    const c = t.category?.color ?? '#6b7280'
    if (!catMap[n]) catMap[n] = { name: n, amount: 0, color: c }
    catMap[n].amount += Number(t.amount)
  })
  const topCats  = Object.values(catMap).sort((a, b) => b.amount - a.amount).slice(0, 4)
  const topTotal = topCats.reduce((s, c) => s + c.amount, 0)

  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-3xl mb-3">📊</p>
        <p className="text-xs text-dim/35">Insights appear once you add transactions</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-9">

      {/* Savings rate */}
      {savedPct !== null && (
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-[9px] font-bold text-dim/30 uppercase tracking-[0.2em]">Savings Rate</p>
            <p className={`text-3xl font-black leading-none ${savedPct >= 20 ? 'text-accent-green' : savedPct >= 10 ? 'text-amber-400' : 'text-accent-red'}`}>
              {savedPct}%
            </p>
          </div>
          <div className="h-0.5 bg-line/12 rounded-full overflow-hidden mb-2">
            <div className="h-full rounded-full transition-all duration-700" style={{
              width: `${savedPct}%`,
              background: savedPct >= 20 ? 'linear-gradient(90deg,#22C55E,#38BDF8)' : savedPct >= 10 ? '#F59E0B' : '#EF4444',
            }} />
          </div>
          <p className="text-[10px] text-dim/28">{fmt.format(totalExpense)} of {fmt.format(totalIncome)} spent</p>
        </div>
      )}

      {/* Top spending */}
      {topCats.length > 0 && (
        <div>
          <p className="text-[9px] font-bold text-dim/30 uppercase tracking-[0.2em] mb-4">Top Spending</p>
          <div className="flex flex-col gap-4">
            {topCats.map(({ name, amount, color }) => {
              const pct = topTotal > 0 ? (amount / topTotal) * 100 : 0
              return (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: color }}>
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[12px] font-semibold text-ink/80 truncate">{name}</p>
                      <p className="text-[10px] text-dim/40 shrink-0 ml-2">{fmt.format(amount)}</p>
                    </div>
                    <div className="h-0.5 bg-line/12 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recurring */}
      {recurringExp.length > 0 && (
        <div>
          <p className="text-[9px] font-bold text-dim/30 uppercase tracking-[0.2em] mb-2">Recurring Bills</p>
          <p className="text-4xl font-black text-ink leading-none">{recurringExp.length}</p>
          <p className="text-[10px] text-dim/30 mt-1.5">{fmt.format(recurringTotal)} · this month</p>
        </div>
      )}

      {/* Cash flow */}
      <div className="border-t border-line/10 pt-7">
        <p className="text-[9px] font-bold text-dim/30 uppercase tracking-[0.2em] mb-2">Cash Flow</p>
        <p className={`text-2xl font-black leading-none ${cashFlow >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
          {cashFlow >= 0 ? '+' : ''}{fmt.format(cashFlow)}
        </p>
        <p className="text-[10px] text-dim/28 mt-1">{cashFlow >= 0 ? 'Positive' : 'Negative'} this month</p>
      </div>

    </div>
  )
}

/* ── Dashboard ───────────────────────────────────────────── */
export default function Dashboard() {
  const { user, profile } = useAuth()
  const now = new Date()
  const [month,     setMonth]     = useState(now.getMonth() + 1)
  const [year,      setYear]      = useState(now.getFullYear())
  const [editingTx, setEditingTx] = useState(null)

  const {
    transactions, loading, error,
    totalIncome, totalExpense, balance,
    updateTransaction, deleteTransaction,
  } = useTransactions(month, year)

  const hour     = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const isPro    = profile?.plan === 'pro'
  const firstName =
    profile?.full_name?.split(' ')[0] ??
    user?.user_metadata?.full_name?.split(' ')[0] ??
    user?.email?.split('@')[0] ?? ''

  const recent  = transactions.slice(0, 8)
  const hasData = transactions.length > 0

  return (
    <Layout>

      {/* ── Full-bleed hero — balance IS the UI ─── */}
      <HeroSection
        balance={balance} totalIncome={totalIncome} totalExpense={totalExpense}
        month={month} year={year}
        onChangeMonth={(m, y) => { setMonth(m); setYear(y) }}
        greeting={greeting} firstName={firstName} loading={loading}
      />

      {/* ── Asymmetric body ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_296px] min-h-[400px]">

        {/* Left: activity feed */}
        <div className="px-5 sm:px-8 md:px-12 py-8 border-b lg:border-b-0 border-line/10">

          <div className="flex items-center justify-between mb-6">
            <p className="text-[9px] font-bold text-dim/30 uppercase tracking-[0.22em]">Recent activity</p>
            {hasData && (
              <Link to="/transactions"
                className="flex items-center gap-1 text-[10px] text-dim/35 hover:text-ink/60 transition-colors font-medium">
                View all <ArrowRight size={10} strokeWidth={2.5} />
              </Link>
            )}
          </div>

          {error && (
            <p className="text-sm text-accent-red bg-red-900/15 border border-accent-red/15 rounded-xl px-4 py-3 mb-4">
              ⚠ {error}
            </p>
          )}

          {loading ? (
            <div className="flex flex-col gap-0.5 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-line/30 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-line/25 rounded-full w-2/5" />
                    <div className="h-2 bg-line/15 rounded-full w-1/4" />
                  </div>
                  <div className="h-3.5 bg-line/25 rounded-full w-16" />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="w-20 h-20 rounded-[28px] bg-surface/60 border border-line/30 flex items-center justify-center mb-6 text-4xl">
                💸
              </div>
              <p className="text-base font-bold text-ink/80 mb-2">No transactions this month</p>
              <p className="text-sm text-dim/40 mb-8 max-w-[220px] leading-relaxed">
                Start tracking your income and expenses to see them here
              </p>
              <div className="flex gap-3">
                <Link to="/income/add"
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-2xl transition-all active:scale-95 shadow-glow-sm">
                  + Add Income
                </Link>
                <Link to="/expense/add"
                  className="px-6 py-3 border border-line/50 hover:bg-white/[0.04] text-dim/60 text-sm font-semibold rounded-2xl transition-all active:scale-95">
                  + Expense
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {recent.map(t => (
                <TxRow key={t.id} t={t} onDelete={deleteTransaction} onEdit={setEditingTx} />
              ))}
            </div>
          )}
        </div>

        {/* Right: insight panel — desktop only column */}
        <div className="hidden lg:block border-l border-line/10 px-8 py-8">
          <p className="text-[9px] font-bold text-dim/30 uppercase tracking-[0.22em] mb-7">This Month</p>
          <InsightPanel transactions={transactions} totalIncome={totalIncome} totalExpense={totalExpense} />
        </div>

      </div>

      {/* Mobile insight panel */}
      {hasData && (
        <div className="lg:hidden border-t border-line/10 px-5 sm:px-8 py-8">
          <p className="text-[9px] font-bold text-dim/30 uppercase tracking-[0.22em] mb-7">This Month</p>
          <InsightPanel transactions={transactions} totalIncome={totalIncome} totalExpense={totalExpense} />
        </div>
      )}

      {/* ── Analytics — secondary, below the fold ─ */}
      {hasData && (
        <div className="border-t border-line/10 px-5 sm:px-8 md:px-12 py-10">
          <p className="text-[9px] font-bold text-dim/22 uppercase tracking-[0.28em] mb-8">Analytics</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <MonthlyChart transactions={transactions} />
            <CategoryBreakdown transactions={transactions} />
          </div>
          <div className="space-y-5">
            <SpendingByCategoryChart transactions={transactions} />
            <BalanceTrendChart />
          </div>
        </div>
      )}

      {/* ── Pro teaser ────────────────────────── */}
      {!isPro && (
        <div className="border-t border-line/10 px-5 sm:px-8 md:px-12 py-10">
          <p className="text-[9px] font-bold text-dim/22 uppercase tracking-[0.28em] mb-6">Unlock Pro</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { to: '/insights', Icon: BarChart2, label: 'Insights', desc: 'Spending patterns & trends'  },
              { to: '/reports',  Icon: FileText,  label: 'Reports',  desc: 'Monthly summaries & exports' },
              { to: '/budgets',  Icon: Target,    label: 'Budgets',  desc: 'Set limits & track spend'    },
            ].map(({ to, Icon, label, desc }) => (
              <Link key={to} to={to}
                className="group flex items-center gap-4 rounded-2xl p-4 border border-line/30 hover:border-brand-700/40 hover:bg-white/[0.015] transition-all">
                <div className="w-9 h-9 rounded-xl bg-white/[0.03] flex items-center justify-center shrink-0 group-hover:bg-brand-900/20 transition-colors">
                  <Icon size={15} className="text-dim/25 group-hover:text-brand-400 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-sm font-semibold text-dim/55">{label}</p>
                    <span className="text-[9px] font-bold bg-brand-900/40 text-brand-400 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Pro</span>
                  </div>
                  <p className="text-xs text-dim/30">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <EditTransactionModal
        open={!!editingTx} transaction={editingTx}
        onClose={() => setEditingTx(null)} onUpdate={updateTransaction}
      />
    </Layout>
  )
}
