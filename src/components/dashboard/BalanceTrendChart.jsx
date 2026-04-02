import {
  ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useBalanceTrend } from '../../hooks/useBalanceTrend'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtFull = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const income  = payload.find(p => p.dataKey === 'income')
  const expense = payload.find(p => p.dataKey === 'expense')
  const balance = payload.find(p => p.dataKey === 'balance')

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 text-sm min-w-[160px]">
      <p className="font-semibold text-gray-700 mb-2.5 text-xs uppercase tracking-wide">{label}</p>
      {income && (
        <div className="flex justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5 text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Income
          </span>
          <span className="font-semibold text-emerald-600">{fmtFull.format(income.value)}</span>
        </div>
      )}
      {expense && (
        <div className="flex justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5 text-gray-500">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Expenses
          </span>
          <span className="font-semibold text-red-500">{fmtFull.format(expense.value)}</span>
        </div>
      )}
      {balance && (
        <div className="flex justify-between gap-4 pt-2 mt-1 border-t border-gray-100">
          <span className="flex items-center gap-1.5 text-gray-500">
            <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />Balance
          </span>
          <span className={`font-bold ${balance.value >= 0 ? 'text-brand-600' : 'text-orange-500'}`}>
            {fmtFull.format(balance.value)}
          </span>
        </div>
      )}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-1/3 mb-6" />
      <div className="flex items-end gap-3 h-44">
        {[55, 75, 40, 90, 65, 80].map((h, i) => (
          <div key={i} className="flex-1 bg-gray-100 rounded-t-lg" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

export function BalanceTrendChart() {
  const { data, loading, error } = useBalanceTrend(6)

  const hasData = data.some(d => d.income > 0 || d.expense > 0)

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Balance Trend</h3>
          <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />Income</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" />Expenses</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 rounded-full bg-brand-500" />Balance</span>
        </div>
      </div>

      {loading ? (
        <Skeleton />
      ) : error ? (
        <p className="text-sm text-red-500 py-8 text-center">Failed to load trend data.</p>
      ) : !hasData ? (
        <div className="flex flex-col items-center justify-center h-44 text-gray-400 text-sm">
          <span className="text-3xl mb-2">📈</span>
          Add transactions to see your trend
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#22c55e" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.14} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0}    />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => fmt.format(v)}
              width={60}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />

            <Area
              type="monotone"
              dataKey="income"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#incomeGrad)"
              dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#22c55e', strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#expenseGrad)"
              dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#ef4444', strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#0ea5e9', strokeWidth: 0 }}
              strokeDasharray="5 3"
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
