import { TransactionRow } from './TransactionRow'

export function TransactionList({ transactions, onDelete, onEdit, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 animate-pulse">
        {[...Array(4)].map((_, i) => (
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
    )
  }

  if (!transactions.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-12 text-center">
        <p className="text-4xl mb-2">💸</p>
        <p className="text-gray-500 text-sm">No transactions this month.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Transactions</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {transactions.map(t => (
          <TransactionRow key={t.id} transaction={t} onDelete={onDelete} onEdit={onEdit} />
        ))}
      </div>
    </div>
  )
}
