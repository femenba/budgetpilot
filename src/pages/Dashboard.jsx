import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
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
    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-1 py-1 shadow-sm">
      <button onClick={prev} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-semibold text-gray-700 px-2 min-w-[112px] text-center">
        {format(new Date(year, month - 1, 1), 'MMMM yyyy')}
      </span>
      <button onClick={next} disabled={isNow} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronRight size={16} />
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
            <h1 className="text-xl font-bold text-gray-900">
              {greeting()}{firstName ? `, ${firstName}` : ''} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Here's your financial overview</p>
          </div>
          <MonthNav month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y) }} />
        </div>

        {/* ── Mobile quick actions ─────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          <Link to="/income/add"  className="flex items-center gap-2 px-4 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold text-sm transition-colors shadow-sm">
            <TrendingUp size={18} /> Add Income
          </Link>
          <Link to="/expense/add" className="flex items-center gap-2 px-4 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-semibold text-sm transition-colors shadow-sm">
            <TrendingDown size={18} /> Add Expense
          </Link>
        </div>

        {/* ── Error ────────────────────────────────────────── */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
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

        {/* ── Recent transactions ──────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">Recent Transactions</h2>
            <Link to="/transactions" className="flex items-center gap-1 text-sm text-brand-600 font-medium hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="px-5 py-2 animate-pulse space-y-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 items-center py-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-2/5" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-16" />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center px-5">
              <span className="text-4xl mb-3">💸</span>
              <p className="text-gray-500 text-sm font-medium">No transactions yet</p>
              <p className="text-gray-400 text-xs mt-1">Add your first income or expense to get started</p>
              <div className="flex gap-3 mt-5">
                <Link to="/income/add"  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors">+ Income</Link>
                <Link to="/expense/add" className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors">+ Expense</Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
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
