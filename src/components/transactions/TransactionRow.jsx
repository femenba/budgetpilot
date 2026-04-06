import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { useCurrency } from '../../hooks/useCurrency'

export function TransactionRow({ transaction: t, onDelete, onEdit }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  const { fmt } = useCurrency()
  const isIncome = t.type === 'income'
  const letter   = (t.category?.name ?? t.type).charAt(0).toUpperCase()

  const handleDeleteClick = () => setConfirming(true)

  const handleConfirm = async () => {
    setDeleting(true)
    await onDelete(t.id, t.type)
    setDeleting(false)
    setConfirming(false)
  }

  const handleCancel = () => setConfirming(false)

  return (
    <div className={`flex items-center gap-3 px-5 py-3.5 group transition-colors ${confirming ? 'bg-red-50' : 'hover:bg-canvas'}`}>
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-semibold"
        style={{ backgroundColor: t.category?.color ?? (isIncome ? '#22c55e' : '#FF3B3B') }}
      >
        {letter}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">
          {t.description || t.category?.name || 'Transaction'}
        </p>
        <p className="text-xs text-dim mt-0.5">
          {t.category?.name ?? '—'} &middot; {format(parseISO(t.date), 'MMM d, yyyy')}
          {t.is_recurring && (
            <span className="ml-2 text-dim font-medium">↻ recurring</span>
          )}
        </p>
      </div>

      {/* Amount */}
      <span className={`text-sm font-semibold tabular-nums shrink-0 ${isIncome ? 'text-green-600' : 'text-accent-red'}`}>
        {isIncome ? '+' : '−'}{fmt.format(t.amount)}
      </span>

      {/* Actions */}
      {confirming ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-accent-red font-medium hidden sm:inline">Delete?</span>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            title="Confirm delete"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-accent-red hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {deleting
              ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><Check size={12} /> Yes</>
            }
          </button>
          <button
            onClick={handleCancel}
            title="Cancel"
            className="p-1.5 text-dim hover:text-ink hover:bg-canvas rounded-lg transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-0.5 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(t)}
              title="Edit"
              className="p-1.5 text-gray-300 hover:text-ink hover:bg-canvas rounded-lg transition-colors"
            >
              <Pencil size={14} />
            </button>
          )}
          <button
            onClick={handleDeleteClick}
            title="Delete"
            className="p-1.5 text-gray-300 hover:text-accent-red hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
