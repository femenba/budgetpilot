import {
  ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useBalanceTrend } from '../../hooks/useBalanceTrend'
import { useCurrency } from '../../hooks/useCurrency'

function CustomTooltip({ active, payload, label }) {
  const { fmt: fmtFull } = useCurrency()
  if (!active || !payload?.length) return null
  const income  = payload.find(p => p.dataKey === 'income')
  const expense = payload.find(p => p.dataKey === 'expense')
  const balance = payload.find(p => p.dataKey === 'balance')

  return (
    <div className="bg-surface border border-line rounded-xl shadow-card-md p-4 text-sm min-w-[160px]">
      <p className="font-medium text-dim mb-2.5 text-xs uppercase tracking-wide">{label}</p>
      {income && (
        <div className="flex justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5 text-dim">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Income
          </span>
          <span className="font-semibold text-green-600">{fmtFull.format(income.value)}</span>
        </div>
      )}
      {expense && (
        <div className="flex justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5 text-dim">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Expenses
          </span>
          <span className="font-semibold text-accent-red">{fmtFull.format(expense.value)}</span>
        </div>
      )}
      {balance && (
        <div className="flex justify-between gap-4 pt-2 mt-1 border-t border-line">
          <span className="flex items-center gap-1.5 text-dim">
            <span className="w-2 h-2 rounded-full bg-ink inline-block" />Balance
          </span>
          <span className={`font-bold ${balance.value >= 0 ? 'text-ink' : 'text-accent-red'}`}>
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
      <div className="h-4 bg-line rounded w-1/3 mb-6" />
      <div className="flex items-end gap-3 h-44">
        {[55, 75, 40, 90, 65, 80].map((h, i) => (
          <div key={i} className="flex-1 bg-line rounded-t-lg" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

export function BalanceTrendChart() {
  const { fmtShort: fmt } = useCurrency()
  const { data, loading, error } = useBalanceTrend(6)

  const hasData = data.some(d => d.income > 0 || d.expense > 0)

  return (
    <div className="bg-surface rounded-2xl p-5 shadow-card border border-line">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-ink">Balance Trend</h3>
          <p className="text-xs text-dim mt-0.5">Last 6 months</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-dim">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />Income</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" />Expenses</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 rounded-full bg-ink" />Balance</span>
        </div>
      </div>

      {loading ? (
        <Skeleton />
      ) : error ? (
        <p className="text-sm text-accent-red py-8 text-center">Failed to load trend data.</p>
      ) : !hasData ? (
        <div className="flex flex-col items-center justify-center h-44 text-dim text-sm">
          <span className="text-3xl mb-2">📈</span>
          Add transactions to see your trend
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#22c55e" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#FF3B3B" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#FF3B3B" stopOpacity={0}    />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E2E2E2" vertical={false} />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#6B6B6B' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B6B6B' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => fmt.format(v)}
              width={48}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E2E2', strokeWidth: 1 }} />

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
              stroke="#FF3B3B"
              strokeWidth={2}
              fill="url(#expenseGrad)"
              dot={{ r: 3, fill: '#FF3B3B', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#FF3B3B', strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#111111"
              strokeWidth={2}
              dot={{ r: 3, fill: '#111111', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#111111', strokeWidth: 0 }}
              strokeDasharray="5 3"
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
