import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { useCurrency } from '../../hooks/useCurrency'

function Card({ label, amount, icon: Icon, valueClass, iconBg, iconColor, badge }) {
  const { fmt } = useCurrency()
  const isNegative = amount < 0

  return (
    <div className="bg-surface rounded-2xl p-5 border border-line shadow-card overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={17} className={iconColor} strokeWidth={2} />
        </div>
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${iconBg} ${iconColor}`}>
          {badge}
        </span>
      </div>

      <p className="text-xs font-medium text-dim uppercase tracking-wide mb-1.5">{label}</p>
      <p className={`text-2xl font-bold tracking-tight ${isNegative ? 'text-accent-red' : valueClass}`}>
        {fmt.format(amount)}
      </p>
    </div>
  )
}

export function SummaryCards({ totalIncome, totalExpense, balance }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card
        label="Total Income"
        amount={totalIncome}
        icon={TrendingUp}
        valueClass="text-green-600"
        iconBg="bg-green-50"
        iconColor="text-green-600"
        badge="IN"
      />
      <Card
        label="Total Expenses"
        amount={totalExpense}
        icon={TrendingDown}
        valueClass="text-accent-red"
        iconBg="bg-red-50"
        iconColor="text-accent-red"
        badge="OUT"
      />
      <Card
        label="Balance"
        amount={balance}
        icon={Wallet}
        valueClass="text-ink"
        iconBg="bg-canvas"
        iconColor="text-ink"
        badge="NET"
      />
    </div>
  )
}
