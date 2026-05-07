import { TransactionRow } from './TransactionRow'

export function TransactionList({ transactions, onDelete, onEdit, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2.5 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-surface border border-line/40 rounded-2xl px-4 py-3.5 flex gap-3.5 items-center">
            <div className="w-11 h-11 bg-line/50 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="h-3 bg-line/50 rounded-full w-2/5" />
              <div className="h-2.5 bg-line/30 rounded-full w-1/4" />
            </div>
            <div className="h-4 bg-line/50 rounded-full w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <div className="bg-surface border border-line/40 rounded-2xl py-16 text-center px-5">
        <p className="text-4xl mb-3">💸</p>
        <p className="text-sm font-semibold text-ink mb-1">No transactions yet</p>
        <p className="text-xs text-dim/60">Add your first income or expense to get started</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {transactions.map(t => (
        <TransactionRow key={t.id} transaction={t} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </div>
  )
}
