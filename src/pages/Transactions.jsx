import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Search, X,
  TrendingUp, TrendingDown, SlidersHorizontal,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { Layout } from '../components/layout/Layout'
import { TransactionRow } from '../components/transactions/TransactionRow'
import { EditTransactionModal } from '../components/transactions/EditTransactionModal'

const TYPE_OPTS = [
  { value: 'all',     label: 'All'      },
  { value: 'income',  label: 'Income'   },
  { value: 'expense', label: 'Expenses' },
]

function MonthNav({ month, year, onChange }) {
  const now   = new Date()
  const isNow = month === now.getMonth() + 1 && year === now.getFullYear()
  const prev  = () => month === 1  ? onChange(12, year - 1) : onChange(month - 1, year)
  const next  = () => month === 12 ? onChange(1,  year + 1) : onChange(month + 1, year)

  return (
    <div className="flex items-center gap-1">
      <button onClick={prev} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><ChevronLeft size={15} /></button>
      <span className="text-sm font-semibold text-gray-700 px-1 min-w-[110px] text-center">
        {format(new Date(year, month - 1, 1), 'MMMM yyyy')}
      </span>
      <button onClick={next} disabled={isNow} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={15} /></button>
    </div>
  )
}

function groupByDate(txns) {
  const map = {}
  for (const t of txns) {
    if (!map[t.date]) map[t.date] = []
    map[t.date].push(t)
  }
  return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
}

function labelDate(dateStr) {
  const today     = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (dateStr === today)     return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  return format(parseISO(dateStr), 'EEEE, MMMM d')
}

export default function Transactions() {
  const now = new Date()
  const [month,      setMonth]      = useState(now.getMonth() + 1)
  const [year,       setYear]       = useState(now.getFullYear())
  const [typeFilter, setType]       = useState('all')
  const [catFilter,  setCat]        = useState('')
  const [search,     setSearch]     = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [editingTx,  setEditingTx]  = useState(null)

  const {
    transactions, loading, error,
    totalIncome, totalExpense, balance,
    updateTransaction, deleteTransaction,
  } = useTransactions(month, year)

  const { categories } = useCategories()

  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (typeFilter !== 'all' && t.type !== typeFilter)        return false
      if (catFilter  && t.category_id !== catFilter)           return false
      if (search) {
        const q = search.toLowerCase()
        if (!(t.description ?? '').toLowerCase().includes(q) &&
            !(t.category?.name ?? '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [transactions, typeFilter, catFilter, search])

  const grouped    = groupByDate(filtered)
  const hasFilters = typeFilter !== 'all' || catFilter || search

  const clearFilters = () => { setType('all'); setCat(''); setSearch('') }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">

        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
              {hasFilters && <span className="text-brand-500"> · filtered</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MonthNav month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y) }} />
            <button
              onClick={() => setShowFilter(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                showFilter || hasFilters
                  ? 'bg-brand-50 border-brand-200 text-brand-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Filter</span>
              {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
            </button>
          </div>
        </div>

        {/* ── Error ────────────────────────────────────────── */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">⚠ {error}</div>
        )}

        {/* ── Summary strip ────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Income',   val: totalIncome,  color: 'text-emerald-600', bg: 'bg-emerald-50', icon: TrendingUp   },
            { label: 'Expenses', val: totalExpense, color: 'text-red-500',     bg: 'bg-red-50',     icon: TrendingDown },
            { label: 'Balance',  val: balance,      color: balance >= 0 ? 'text-brand-600' : 'text-orange-500',
              bg: balance >= 0 ? 'bg-brand-50' : 'bg-orange-50' },
          ].map(({ label, val, color, bg, icon: Icon }) => (
            <div key={label} className={`${bg} rounded-2xl px-4 py-3`}>
              <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
              <p className={`text-base font-bold ${color} tabular-nums`}>{fmt.format(val)}</p>
            </div>
          ))}
        </div>

        {/* ── Filter panel ─────────────────────────────────── */}
        {showFilter && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search description or category…"
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white placeholder:text-gray-300 transition"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Type toggle */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-1 gap-0.5 shrink-0">
              {TYPE_OPTS.map(o => (
                <button
                  key={o.value}
                  onClick={() => setType(o.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    typeFilter === o.value ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            {/* Category */}
            <select
              value={catFilter}
              onChange={e => setCat(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white shrink-0 transition"
            >
              <option value="">All categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 border border-red-100 transition-colors shrink-0"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        )}

        {/* ── Transaction list ─────────────────────────────── */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-3 items-center py-3.5 border-b border-gray-50 last:border-0">
                <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-2/5" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-3 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-600 font-medium text-sm">
              {hasFilters ? 'No transactions match your filters' : 'No transactions this month'}
            </p>
            {hasFilters ? (
              <button onClick={clearFilters} className="mt-4 text-sm text-brand-600 font-medium hover:underline">
                Clear filters
              </button>
            ) : (
              <div className="flex justify-center gap-3 mt-5">
                <Link to="/income/add"  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors">+ Income</Link>
                <Link to="/expense/add" className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors">+ Expense</Link>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {grouped.map(([date, txns]) => (
              <div key={date}>
                {/* Date group header */}
                <div className="flex items-center gap-3 mb-2 px-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {labelDate(date)}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className={`text-xs font-bold tabular-nums ${
                    txns.reduce((s, t) => t.type === 'income' ? s + Number(t.amount) : s - Number(t.amount), 0) >= 0
                      ? 'text-emerald-500' : 'text-red-400'
                  }`}>
                    {fmt.format(txns.reduce((s, t) => t.type === 'income' ? s + Number(t.amount) : s - Number(t.amount), 0))}
                  </span>
                </div>

                {/* Rows */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                  {txns.map(t => (
                    <TransactionRow
                      key={t.id}
                      transaction={t}
                      onDelete={deleteTransaction}
                      onEdit={setEditingTx}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

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
