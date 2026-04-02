import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

function Card({ label, amount, icon: Icon, colorClass, bgClass }) {
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bgClass}`}>
        <Icon size={22} className={colorClass} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className={`text-xl font-bold ${colorClass}`}>{fmt.format(amount)}</p>
      </div>
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
        colorClass="text-emerald-600"
        bgClass="bg-emerald-50"
      />
      <Card
        label="Total Expenses"
        amount={totalExpense}
        icon={TrendingDown}
        colorClass="text-red-500"
        bgClass="bg-red-50"
      />
      <Card
        label="Balance"
        amount={balance}
        icon={Wallet}
        colorClass={balance >= 0 ? 'text-brand-600' : 'text-orange-500'}
        bgClass={balance >= 0 ? 'bg-brand-50' : 'bg-orange-50'}
      />
    </div>
  )
}
