import { useState, useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useCategories } from '../../hooks/useCategories'
import { useCurrency } from '../../hooks/useCurrency'

export function EditTransactionModal({ open, transaction, onClose, onUpdate }) {
  const isIncome = transaction?.type === 'income'
  const { categories } = useCategories(transaction?.type)
  const { symbol } = useCurrency()

  const [amount,      setAmount]      = useState('')
  const [categoryId,  setCategoryId]  = useState('')
  const [description, setDescription] = useState('')
  const [date,        setDate]        = useState('')
  const [recurring,   setRecurring]   = useState(false)
  const [error,       setError]       = useState('')
  const [saving,      setSaving]      = useState(false)

  useEffect(() => {
    if (!transaction) return
    setAmount(String(transaction.amount))
    setCategoryId(transaction.category_id ?? '')
    setDescription(transaction.description ?? '')
    setDate(transaction.date)
    setRecurring(transaction.is_recurring ?? false)
    setError('')
  }, [transaction])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const num = parseFloat(amount)
    if (isNaN(num) || num <= 0) { setError('Enter a valid amount greater than 0.'); return }

    setSaving(true)
    const { error } = await onUpdate(transaction.id, transaction.type, {
      amount:       num,
      description:  description.trim() || null,
      category_id:  categoryId || null,
      date,
      is_recurring: recurring,
    })
    setSaving(false)

    if (error) { setError(error.message); return }
    onClose()
  }

  const focusRing = isIncome ? 'focus:ring-green-500' : 'focus:ring-accent-red'
  const badge  = isIncome
    ? 'bg-green-50 text-green-700'
    : 'bg-red-50 text-accent-red'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          Edit transaction
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${badge}`}>
            {transaction?.type}
          </span>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Amount */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dim font-medium text-sm">{symbol}</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              autoFocus
              className={`w-full pl-7 pr-4 py-3 rounded-xl border border-line bg-surface text-sm font-semibold focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent transition`}
            />
          </div>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const active = categoryId === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(active ? '' : cat.id)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all
                    ${active ? 'text-white border-transparent scale-105' : 'border-line bg-canvas text-dim hover:border-gray-300'}
                  `}
                  style={active ? { backgroundColor: cat.color } : {}}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: active ? 'white' : cat.color }} />
                  {cat.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">
            Description <span className="text-dim font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What was this for?"
            maxLength={200}
            className="w-full px-4 py-3 rounded-xl border border-line bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent focus:bg-surface placeholder:text-gray-400 transition"
          />
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-line bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent focus:bg-surface transition"
          />
        </div>

        {/* Recurring */}
        <div className="flex items-center justify-between py-1 px-1">
          <div className="flex items-center gap-2.5">
            <RotateCcw size={15} className="text-dim" />
            <span className="text-sm font-medium text-ink">Recurring</span>
          </div>
          <button
            type="button"
            onClick={() => setRecurring(v => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors ${recurring ? (isIncome ? 'bg-green-500' : 'bg-accent-red') : 'bg-line'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${recurring ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-accent-red">
            <span className="mt-0.5 shrink-0">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1 justify-center" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className={`flex-1 justify-center ${isIncome ? 'bg-green-600 hover:bg-green-700' : 'bg-accent-red hover:bg-red-600'}`}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
