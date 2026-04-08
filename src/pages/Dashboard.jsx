import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, ArrowRight, Plus, BarChart2, FileText, Target } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { useTransactions } from '../hooks/useTransactions'
import { Layout } from '../components/layout/Layout'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { BalanceTrendChart } from '../components/dashboard/BalanceTrendChart'
import { SpendingByCategoryChart } from '../components/dashboard/SpendingByCategoryChart'
import { MonthlyChart } from '../components/dashboard/MonthlyChart'
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown'
import { TransactionRow } from '../components/transactions/TransactionRow'
import { EditTransactionModal } from '../components/transactions/EditTransactionModal'

function MonthNav({ month, year, onChange }) {
  const now   = new Date()
  const isNow = month === now.getMonth() + 1 && year === now.getFullYear()
  const prev  = () => month === 1  ? onChange(12, year - 1) : onChange(month - 1, year)
  const next  = () => month === 12 ? onChange(1,  year + 1) : onChange(month + 1, year)

  return (
    <div className="flex items-center gap-1 bg-surface border border-line rounded-xl px-1 py-1 shadow-sm">
      <button
        onClick={prev}
        className="p-1.5 rounded-lg text-dim hover:text-ink hover:bg-canvas transition-all active:scale-95"
      >
        <ChevronLeft size={15} strokeWidth={2.5} />
      </button>
      <span className="text-sm font-semibold text-ink px-2 min-w-[116px] text-center">
        {format(new Date(year, month - 1, 1), 'MMMM yyyy')}
      </span>
      <button
        onClick={next}
        disabled={isNow}
        className="p-1.5 rounded-lg text-dim hover:text-ink hover:bg-canvas transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={15} strokeWidth={2.5} />
      </button>
    </div>
  )
}

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

  const greeting = () => {
    const h = now.getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const isPro = profile?.plan === 'pro'

  const firstName =
    profile?.full_name?.split(' ')[0] ??
    user?.user_metadata?.full_name?.split(' ')[0] ??
    user?.email?.split('@')[0] ?? ''

  const recent = transactions.slice(0, 5)

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

        {/* ── Page header ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-ink tracking-tight">
              {greeting()}{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="text-sm text-dim mt-0.5">Here's your financial overview</p>
          </div>
          <MonthNav month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y) }} />
        </div>

        {/* ── Mobile quick actions ─────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          <Link
            to="/income/add"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 active:scale-[0.97] text-white rounded-xl font-semibold text-sm transition-all shadow-sm"
          >
            <Plus size={15} strokeWidth={2.5} /> Add Income
          </Link>
          <Link
            to="/expense/add"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-accent-red hover:bg-red-600 active:scale-[0.97] text-white rounded-xl font-semibold text-sm transition-all shadow-sm"
          >
            <Plus size={15} strokeWidth={2.5} /> Add Expense
          </Link>
        </div>

        {/* ── Error ────────────────────────────────────────── */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-accent-red font-medium">
            ⚠ {error}
          </div>
        )}

        {/* ── Summary cards ────────────────────────────────── */}
        <SummaryCards totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} />

        {/* ── Balance Trend (6 months, full-width) ─────────── */}
        <BalanceTrendChart />

        {/* ── Monthly breakdown + category donut ───────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 min-w-0">
            <MonthlyChart transactions={transactions} />
          </div>
          <div className="lg:col-span-2 min-w-0">
            <CategoryBreakdown transactions={transactions} />
          </div>
        </div>

        {/* ── Spending by category (full-width) ────────────── */}
        <SpendingByCategoryChart transactions={transactions} />

        {/* ── Pro feature teasers (free users only) ────────── */}
        {!isPro && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Pro features</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { to: '/insights', Icon: BarChart2, label: 'Insights',  desc: 'Spending patterns & trends'  },
                { to: '/reports',  Icon: FileText,  label: 'Reports',   desc: 'Monthly summaries & exports' },
                { to: '/budgets',  Icon: Target,    label: 'Budgets',   desc: 'Set limits & track spend'    },
              ].map(({ to, Icon, label, desc }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex items-center gap-3.5 bg-white rounded-2xl p-4 border border-dashed border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-gray-100 transition-colors">
                    <Icon size={16} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-gray-400">{label}</p>
                      <span className="text-[9px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Pro</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-0.5 group-hover:text-gray-400 transition-colors">{desc}</p>
                  </div>
                  <ChevronRight size={13} className="text-gray-200 group-hover:text-gray-400 shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent transactions ──────────────────────────── */}
        <div className="bg-surface rounded-2xl border border-line shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <h2 className="text-sm font-semibold text-ink">Recent Transactions</h2>
            <Link
              to="/transactions"
              className="flex items-center gap-1 text-xs text-dim font-medium hover:text-ink transition-colors"
            >
              View all <ArrowRight size={12} strokeWidth={2.5} />
            </Link>
          </div>

          {loading ? (
            <div className="px-5 py-2 animate-pulse space-y-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 items-center py-3">
                  <div className="w-9 h-9 bg-line rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-line rounded w-2/5" />
                    <div className="h-2.5 bg-line rounded w-1/4" />
                  </div>
                  <div className="h-3 bg-line rounded w-16" />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center py-14 text-center px-5">
              <span className="text-4xl mb-4">💸</span>
              <p className="text-ink text-sm font-semibold">No transactions yet</p>
              <p className="text-dim text-xs mt-1">Add your first income or expense to get started</p>
              <div className="flex gap-3 mt-5">
                <Link to="/income/add"  className="px-4 py-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all">+ Income</Link>
                <Link to="/expense/add" className="px-4 py-2 bg-accent-red hover:bg-red-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all">+ Expense</Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {recent.map(t => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  onDelete={deleteTransaction}
                  onEdit={setEditingTx}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      <EditTransactionModal
        open={!!editingTx}
        transaction={editingTx}
        onClose={() => setEditingTx(null)}
        onUpdate={updateTransaction}
      />
    </Layout>
  )
}
