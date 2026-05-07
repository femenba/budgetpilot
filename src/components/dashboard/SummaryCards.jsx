import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { useCurrency } from '../../hooks/useCurrency'

function Card({ label, amount, icon: Icon, valueClass, iconBg, iconColor, badge, accentBar }) {
  const { fmt } = useCurrency()
  const isNegative = amount < 0

  return (
    <div className="bg-surface rounded-2xl p-5 border border-line shadow-card overflow-hidden relative">
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentBar} opacity-70`} />

      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={18} className={iconColor} strokeWidth={2} />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${iconBg} ${iconColor}`}>
          {badge}
        </span>
      </div>

      <p className="text-[11px] font-semibold text-dim uppercase tracking-wider mb-2">{label}</p>
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
        valueClass="text-accent-green"
        iconBg="bg-emerald-900/25"
        iconColor="text-accent-green"
        accentBar="bg-accent-green"
        badge="IN"
      />
      <Card
        label="Total Expenses"
        amount={totalExpense}
        icon={TrendingDown}
        valueClass="text-accent-red"
        iconBg="bg-red-900/25"
        iconColor="text-accent-red"
        accentBar="bg-accent-red"
        badge="OUT"
      />
      <Card
        label="Balance"
        amount={balance}
        icon={Wallet}
        valueClass="text-ink"
        iconBg="bg-sky-900/20"
        iconColor="text-accent-blue"
        accentBar="bg-accent-blue"
        badge="NET"
      />
    </div>
  )
}
