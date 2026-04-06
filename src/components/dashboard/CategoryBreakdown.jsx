import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useCurrency } from '../../hooks/useCurrency'

function buildData(transactions, type) {
  const map = {}
  transactions.filter(t => t.type === type).forEach(t => {
    const name  = t.category?.name  ?? 'Uncategorized'
    const color = t.category?.color ?? '#6b7280'
    if (!map[name]) map[name] = { name, value: 0, color }
    map[name].value += Number(t.amount)
  })
  return Object.values(map).sort((a, b) => b.value - a.value)
}

function CustomTooltip({ active, payload }) {
  const { fmt } = useCurrency()
  if (!active || !payload?.length) return null
  const { name, value, color } = payload[0].payload
  return (
    <div className="bg-surface border border-line rounded-xl shadow-card-md px-3 py-2.5 text-sm">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="font-medium text-ink">{name}</span>
      </div>
      <span className="text-dim text-xs">{fmt.format(value)}</span>
    </div>
  )
}

function CenterLabel({ cx, cy, total, type }) {
  const { fmtCompact } = useCurrency()
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-6" fontSize="15" fontWeight="700" fill="#111111">
        {fmtCompact.format(total)}
      </tspan>
      <tspan x={cx} dy="18" fontSize="10" fill="#6B6B6B">
        total {type}
      </tspan>
    </text>
  )
}

export function CategoryBreakdown({ transactions }) {
  const [activeType, setActiveType] = useState('expense')
  const { fmt } = useCurrency()

  const data  = buildData(transactions, activeType)
  const total = data.reduce((s, d) => s + d.value, 0)

  const topItems = data.slice(0, 5)
  const otherSum = data.slice(5).reduce((s, d) => s + d.value, 0)
  const legendItems = otherSum > 0
    ? [...topItems, { name: 'Other', value: otherSum, color: '#d1d5db' }]
    : topItems

  return (
    <div className="bg-surface rounded-2xl p-5 shadow-card border border-line flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ink">By Category</h3>
        <div className="flex rounded-xl overflow-hidden border border-line bg-canvas p-0.5 gap-0.5">
          {[
            { val: 'expense', label: 'Spent',  activeClass: 'bg-ink text-white' },
            { val: 'income',  label: 'Earned', activeClass: 'bg-green-600 text-white' },
          ].map(o => (
            <button
              key={o.val}
              onClick={() => setActiveType(o.val)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeType === o.val ? o.activeClass : 'text-dim hover:text-ink'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Donut */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 min-h-[160px] text-dim text-sm">
          <span className="text-3xl mb-2">{activeType === 'expense' ? '🛒' : '💰'}</span>
          No data yet
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={2}
                strokeWidth={0}
                label={({ cx, cy }) => (
                  <CenterLabel cx={cx} cy={cy} total={total} type={activeType} />
                )}
                labelLine={false}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="mt-3 flex flex-col gap-2">
            {legendItems.map(item => {
              const pct = total > 0 ? (item.value / total) * 100 : 0
              return (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-dim flex-1 truncate">{item.name}</span>
                  <span className="text-xs font-medium text-ink tabular-nums">{fmt.format(item.value)}</span>
                  <span className="text-xs text-dim w-8 text-right">{pct.toFixed(0)}%</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
