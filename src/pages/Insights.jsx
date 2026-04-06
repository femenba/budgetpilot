import { useState } from 'react'
import { BarChart2, ChevronLeft, ChevronRight, PiggyBank, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { Layout } from '../components/layout/Layout'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { BalanceTrendChart } from '../components/dashboard/BalanceTrendChart'
import { useTransactions } from '../hooks/useTransactions'
import { useCurrency } from '../hooks/useCurrency'

// ── Month navigator (mirrors Dashboard) ──────────────────────────
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

// ── Savings rate card ─────────────────────────────────────────────
function SavingsRateCard({ totalIncome, balance }) {
  const rate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : null
  const isPositive = rate !== null && rate >= 0

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${isPositive ? 'bg-brand-50' : 'bg-orange-50'}`}>
        <PiggyBank size={22} className={isPositive ? 'text-brand-600' : 'text-orange-500'} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">Savings Rate</p>
        {rate === null ? (
          <p className="text-xl font-bold text-gray-300">—</p>
        ) : (
          <p className={`text-xl font-bold ${isPositive ? 'text-brand-600' : 'text-orange-500'}`}>
            {rate}%
          </p>
        )}
      </div>
    </div>
  )
}

// ── Top spending category card ────────────────────────────────────
function TopCategoryCard({ expenses }) {
  const { fmt } = useCurrency()

  // Aggregate expense amounts by category name
  const totals = {}
  for (const exp of expenses) {
    const name = exp.category?.name ?? 'Uncategorized'
    const icon = exp.category?.icon ?? '📦'
    totals[name] = totals[name] ?? { name, icon, amount: 0 }
    totals[name].amount += Number(exp.amount)
  }

  const top = Object.values(totals).sort((a, b) => b.amount - a.amount)[0] ?? null

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className="p-3 rounded-xl bg-purple-50">
        <Tag size={22} className="text-purple-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">Top Spending Category</p>
        {top ? (
          <p className="text-xl font-bold text-gray-800 flex items-center gap-1.5">
            <span>{top.icon}</span>
            <span>{top.name}</span>
            <span className="text-sm font-medium text-gray-400 ml-1">{fmt.format(top.amount)}</span>
          </p>
        ) : (
          <p className="text-xl font-bold text-gray-300">—</p>
        )}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────
export default function Insights() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year,  setYear]  = useState(now.getFullYear())

  const { expenses, loading, error, totalIncome, totalExpense, balance } =
    useTransactions(month, year)

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
              <BarChart2 size={18} className="text-brand-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Insights</h1>
              <p className="text-xs text-gray-400">Spending patterns &amp; trends</p>
            </div>
          </div>
          <MonthNav month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y) }} />
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            ⚠ {error}
          </div>
        )}

        {/* Summary cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-20" />
            ))}
          </div>
        ) : (
          <SummaryCards totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} />
        )}

        {/* Savings rate + top category */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 h-20" />
            <div className="bg-white rounded-2xl p-5 border border-gray-100 h-20" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SavingsRateCard totalIncome={totalIncome} balance={balance} />
            <TopCategoryCard expenses={expenses} />
          </div>
        )}

        {/* Monthly trend (6 months, always current) */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Monthly Trend
          </h2>
          <BalanceTrendChart />
        </div>

      </div>
    </Layout>
  )
}
