import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Cell,
  Tooltip, ResponsiveContainer, LabelList,
} from 'recharts'

const fmt     = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const fmtShort = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function buildData(transactions, type) {
  const map = {}
  transactions
    .filter(t => t.type === type)
    .forEach(t => {
      const name  = t.category?.name  ?? 'Uncategorized'
      const color = t.category?.color ?? '#6b7280'
      if (!map[name]) map[name] = { name, amount: 0, color }
      map[name].amount += Number(t.amount)
    })
  return Object.values(map)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8)
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, amount, color } = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="font-semibold text-gray-700">{name}</span>
      </div>
      <span className="text-gray-500">{fmt.format(amount)}</span>
    </div>
  )
}

function CustomLabel({ x, y, width, height, value, viewBox }) {
  if (!value) return null
  return (
    <text
      x={(viewBox?.x ?? x) + (viewBox?.width ?? width) + 8}
      y={(viewBox?.y ?? y) + (viewBox?.height ?? height) / 2 + 4}
      fontSize={11}
      fill="#6b7280"
    >
      {fmtShort.format(value)}
    </text>
  )
}

export function SpendingByCategoryChart({ transactions }) {
  const [activeType, setActiveType] = useState('expense')

  const data  = useMemo(() => buildData(transactions, activeType), [transactions, activeType])
  const total = useMemo(() => data.reduce((s, d) => s + d.amount, 0), [data])

  const chartHeight = Math.max(180, data.length * 42 + 24)

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Spending by Category</h3>
          {total > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {activeType === 'expense' ? 'Total spent' : 'Total earned'}: <span className="font-semibold text-gray-600">{fmt.format(total)}</span>
            </p>
          )}
        </div>
        {/* Type toggle */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-0.5 gap-0.5">
          {[
            { val: 'expense', label: 'Expenses', activeClass: 'bg-red-500 text-white' },
            { val: 'income',  label: 'Income',   activeClass: 'bg-emerald-500 text-white' },
          ].map(o => (
            <button
              key={o.val}
              onClick={() => setActiveType(o.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeType === o.val ? o.activeClass : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-36 text-gray-400 text-sm">
          <span className="text-3xl mb-2">{activeType === 'expense' ? '🛒' : '💰'}</span>
          No {activeType === 'expense' ? 'expenses' : 'income'} this month
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 70, left: 0, bottom: 0 }}
            barCategoryGap="20%"
          >
            <XAxis type="number" hide domain={[0, 'dataMax']} />
            <YAxis
              type="category"
              dataKey="name"
              width={88}
              tick={{ fontSize: 12, fill: '#4b5563' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
            <Bar dataKey="amount" radius={[0, 6, 6, 0]} maxBarSize={22}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} fillOpacity={0.9} />
              ))}
              <LabelList dataKey="amount" content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Ranked legend with percentages */}
      {data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col gap-2">
          {data.map((d, i) => {
            const pct = total > 0 ? (d.amount / total) * 100 : 0
            return (
              <div key={d.name} className="flex items-center gap-2.5">
                <span className="text-xs text-gray-400 w-4 text-right shrink-0">{i + 1}</span>
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-gray-600 flex-1 truncate">{d.name}</span>
                <div className="flex items-center gap-2">
                  {/* Mini progress bar */}
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: d.color }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">{pct.toFixed(0)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
