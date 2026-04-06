import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { useCurrency } from '../../hooks/useCurrency'

function Card({ label, amount, icon: Icon, valueClass, iconBg, iconColor, accent }) {
  const { fmt } = useCurrency()
  const isNegative = amount < 0

  return (
    <div className={`bg-white rounded-2xl p-5 border shadow-card overflow-hidden relative ${accent}`}>
      {/* Subtle top accent stripe */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${iconBg.replace('bg-', 'bg-').replace('-100', '-400').replace('-50', '-400')}`} />

      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={20} className={iconColor} strokeWidth={2} />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${iconBg} ${iconColor} opacity-70`}>
          {label === 'Total Income' ? 'IN' : label === 'Total Expenses' ? 'OUT' : 'NET'}
        </span>
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-black tracking-tight ${isNegative ? 'text-red-500' : valueClass}`}>
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
        accent="border-gray-100"
      />
      <Card
        label="Total Expenses"
        amount={totalExpense}
        icon={TrendingDown}
        valueClass="text-red-500"
        iconBg="bg-red-50"
        iconColor="text-red-500"
        accent="border-gray-100"
      />
      <Card
        label="Balance"
        amount={balance}
        icon={Wallet}
        valueClass={balance >= 0 ? 'text-brand-600' : 'text-orange-500'}
        iconBg={balance >= 0 ? 'bg-brand-50' : 'bg-orange-50'}
        iconColor={balance >= 0 ? 'text-brand-600' : 'text-orange-500'}
        accent="border-gray-100"
      />
    </div>
  )
}
