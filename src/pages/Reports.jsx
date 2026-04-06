import { useState } from 'react'
import {
  FileText, ChevronLeft, ChevronRight,
  Download, TrendingUp, TrendingDown, Wallet, PiggyBank,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Layout }                    from '../components/layout/Layout'
import { MonthlyChart }              from '../components/dashboard/MonthlyChart'
import { CategoryBreakdown }         from '../components/dashboard/CategoryBreakdown'
import { SpendingByCategoryChart }   from '../components/dashboard/SpendingByCategoryChart'
import { useTransactions }           from '../hooks/useTransactions'
import { useCurrency }               from '../hooks/useCurrency'

// ── Month navigator ───────────────────────────────────────────────
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

// ── Summary stat card ─────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, colorClass, bgClass, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl shrink-0 ${bgClass}`}>
        <Icon size={20} className={colorClass} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className={`text-xl font-bold truncate ${colorClass}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── CSV export ────────────────────────────────────────────────────
function exportCsv(transactions, month, year, currency) {
  const monthLabel = format(new Date(year, month - 1, 1), 'MMMM_yyyy')
  const rows = [
    ['Date', 'Type', 'Category', 'Description', `Amount (${currency})`],
    ...transactions.map(t => [
      t.date,
      t.type,
      t.category?.name ?? 'Uncategorized',
      t.description ?? '',
      Number(t.amount).toFixed(2),
    ]),
  ]

  const csv = rows
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `BudgetPilot_${monthLabel}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Transaction table ─────────────────────────────────────────────
function TransactionTable({ transactions, loading }) {
  const { fmt } = useCurrency()

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-xl" />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm">
        No transactions for this month.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[480px]">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pl-1">Date</th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2">Type</th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2">Category</th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2">Description</th>
            <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-1">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {transactions.map(t => (
            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-2.5 pl-1 text-gray-500 whitespace-nowrap">
                {format(parseISO(t.date), 'MMM d')}
              </td>
              <td className="py-2.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  t.type === 'income'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-600'
                }`}>
                  {t.type === 'income' ? 'Income' : 'Expense'}
                </span>
              </td>
              <td className="py-2.5">
                <span className="flex items-center gap-1.5">
                  {t.category?.icon && <span className="text-base leading-none">{t.category.icon}</span>}
                  <span className="text-gray-700">{t.category?.name ?? 'Uncategorized'}</span>
                </span>
              </td>
              <td className="py-2.5 text-gray-500 max-w-[180px] truncate">
                {t.description || <span className="text-gray-300">—</span>}
              </td>
              <td className={`py-2.5 pr-1 text-right font-semibold tabular-nums ${
                t.type === 'income' ? 'text-emerald-600' : 'text-red-500'
              }`}>
                {t.type === 'income' ? '+' : '-'}{fmt.format(t.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────
export default function Reports() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year,  setYear]  = useState(now.getFullYear())

  const { transactions, loading, error, totalIncome, totalExpense, balance } =
    useTransactions(month, year)

  const { fmt, currency } = useCurrency()

  const savingsRate = totalIncome > 0
    ? `${Math.round((balance / totalIncome) * 100)}%`
    : '—'

  const handleExport = () => {
    exportCsv(transactions, month, year, currency)
  }

  const monthLabel = format(new Date(year, month - 1, 1), 'MMMM yyyy')

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
              <FileText size={18} className="text-brand-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Reports</h1>
              <p className="text-xs text-gray-400">Monthly summaries &amp; exports</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <MonthNav month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y) }} />
            <button
              onClick={handleExport}
              disabled={loading || transactions.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-sm"
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            ⚠ {error}
          </div>
        )}

        {/* Monthly summary cards */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {monthLabel} — Summary
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Income"
                value={fmt.format(totalIncome)}
                icon={TrendingUp}
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50"
              />
              <StatCard
                label="Total Expenses"
                value={fmt.format(totalExpense)}
                icon={TrendingDown}
                colorClass="text-red-500"
                bgClass="bg-red-50"
              />
              <StatCard
                label="Net Balance"
                value={fmt.format(balance)}
                icon={Wallet}
                colorClass={balance >= 0 ? 'text-brand-600' : 'text-orange-500'}
                bgClass={balance >= 0 ? 'bg-brand-50' : 'bg-orange-50'}
              />
              <StatCard
                label="Savings Rate"
                value={savingsRate}
                icon={PiggyBank}
                colorClass={balance >= 0 ? 'text-brand-600' : 'text-orange-500'}
                bgClass={balance >= 0 ? 'bg-brand-50' : 'bg-orange-50'}
                sub={totalIncome > 0 ? `of ${fmt.format(totalIncome)} income` : undefined}
              />
            </div>
          )}
        </section>

        {/* Income vs Expenses breakdown */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Income vs Expenses
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3 min-w-0">
              <MonthlyChart transactions={transactions} />
            </div>
            <div className="lg:col-span-2 min-w-0">
              <CategoryBreakdown transactions={transactions} />
            </div>
          </div>
        </section>

        {/* Spending by category */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Spending by Category
          </h2>
          <SpendingByCategoryChart transactions={transactions} />
        </section>

        {/* Transaction log */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Transaction Log
            {!loading && transactions.length > 0 && (
              <span className="ml-2 text-xs font-medium text-gray-400 normal-case">
                {transactions.length} {transactions.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </h2>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <TransactionTable transactions={transactions} loading={loading} />
          </div>
        </section>

      </div>
    </Layout>
  )
}
