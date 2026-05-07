import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Pencil, Trash2, RefreshCw, Check, X } from 'lucide-react'
import { useCurrency } from '../../hooks/useCurrency'

export function TransactionRow({ transaction: t, onDelete, onEdit }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting,   setDeleting]   = useState(false)
  const { fmt } = useCurrency()

  const isIncome = t.type === 'income'
  const letter   = (t.category?.name ?? t.type).charAt(0).toUpperCase()

  const handleConfirm = async () => {
    setDeleting(true)
    await onDelete(t.id, t.type)
    setDeleting(false)
    setConfirming(false)
  }

  return (
    <div className={`group bg-surface border rounded-2xl px-4 py-3.5 transition-all ${
      confirming ? 'border-accent-red/25 bg-red-900/[0.05]' : 'border-line/40'
    }`}>
      <div className="flex items-center gap-3.5">

        {/* Category avatar */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: t.category?.color ?? (isIncome ? '#22C55E' : '#EF4444') }}
        >
          {letter}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-ink leading-snug truncate">
              {t.description || t.category?.name || 'Transaction'}
            </p>
            <div className="flex items-center gap-0.5 shrink-0">
              <p className={`text-sm font-bold tabular-nums leading-snug ${isIncome ? 'text-accent-green' : 'text-accent-red'}`}>
                {isIncome ? '+' : '−'}{fmt.format(t.amount)}
              </p>
              {!confirming && (
                <div className="flex gap-0 ml-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <button onClick={() => onEdit(t)}
                      className="p-1.5 text-dim/25 hover:text-ink hover:bg-canvas rounded-lg transition-colors">
                      <Pencil size={11} />
                    </button>
                  )}
                  <button onClick={() => setConfirming(true)}
                    className="p-1.5 text-dim/25 hover:text-accent-red hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 size={11} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {t.category?.name && (
              <span className="text-[10px] font-medium text-dim/55 bg-canvas border border-line/40 px-2 py-0.5 rounded-full">
                {t.category.name}
              </span>
            )}
            {t.is_recurring && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-brand-400/80">
                <RefreshCw size={8} strokeWidth={3} /> recurring
              </span>
            )}
            <span className="text-[10px] text-dim/35">
              {format(parseISO(t.date), 'MMM d, yyyy')}
            </span>
          </div>
        </div>

      </div>

      {/* Delete confirm */}
      {confirming && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-accent-red/15">
          <span className="text-xs text-accent-red/70 flex-1">Delete this transaction?</span>
          <button onClick={() => setConfirming(false)}
            className="px-3 py-1.5 text-xs font-medium text-dim hover:text-ink rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={deleting}
            className="flex items-center gap-1 px-3 py-1.5 bg-accent-red hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
            {deleting
              ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><Check size={11} /> Delete</>
            }
          </button>
        </div>
      )}
    </div>
  )
}
