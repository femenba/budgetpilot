import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { format, parseISO, getDate } from 'date-fns'
import { useCurrency } from '../../hooks/useCurrency'

function buildWeeklyData(transactions) {
  const weeks = [
    { week: 'Wk 1', income: 0, expense: 0 },
    { week: 'Wk 2', income: 0, expense: 0 },
    { week: 'Wk 3', income: 0, expense: 0 },
    { week: 'Wk 4', income: 0, expense: 0 },
  ]
  transactions.forEach(t => {
    const day = getDate(parseISO(t.date))
    const idx = day <= 7 ? 0 : day <= 14 ? 1 : day <= 21 ? 2 : 3
    weeks[idx][t.type] += Number(t.amount)
  })
  return weeks.map(w => ({ ...w, balance: w.income - w.expense }))
}

function CustomTooltip({ active, payload, label }) {
  const { fmt } = useCurrency()
  if (!active || !payload?.length) return null
  const get = key => payload.find(p => p.dataKey === key)?.value ?? 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3.5 text-sm min-w-[148px]">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <div className="flex justify-between gap-3 mb-1">
        <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block" />Income</span>
        <span className="font-semibold text-emerald-600">{fmt.format(get('income'))}</span>
      </div>
      <div className="flex justify-between gap-3 mb-1">
        <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2 h-2 rounded-sm bg-red-400 inline-block" />Expenses</span>
        <span className="font-semibold text-red-500">{fmt.format(get('expense'))}</span>
      </div>
      <div className="flex justify-between gap-3 pt-2 mt-1 border-t border-gray-100">
        <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2 h-0.5 bg-brand-500 inline-block" />Net</span>
        <span className={`font-bold ${get('balance') >= 0 ? 'text-brand-600' : 'text-orange-500'}`}>
          {fmt.format(get('balance'))}
        </span>
      </div>
    </div>
  )
}

export function MonthlyChart({ transactions }) {
  const { symbol } = useCurrency()
  const data = buildWeeklyData(transactions)
  const hasData = transactions.length > 0

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-2">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Weekly Breakdown</h3>
          <p className="text-xs text-gray-400 mt-0.5">Income vs. expenses this month</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />Income</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400" />Expenses</span>
          <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-brand-500" />Net</span>
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-44 text-gray-400 text-sm">
          <span className="text-3xl mb-2">📊</span>
          No data this month
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={data} barGap={3} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />

            <Bar dataKey="income"  fill="#22c55e" fillOpacity={0.85} radius={[5, 5, 0, 0]} name="income" />
            <Bar dataKey="expense" fill="#ef4444" fillOpacity={0.85} radius={[5, 5, 0, 0]} name="expense" />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#0ea5e9', strokeWidth: 0 }}
              strokeDasharray="5 3"
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
