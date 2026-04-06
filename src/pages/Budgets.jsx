import { useState, useEffect } from 'react'
import {
  Target, ChevronLeft, ChevronRight,
  Plus, Pencil, Trash2, AlertTriangle,
} from 'lucide-react'
import { format } from 'date-fns'
import { Layout }        from '../components/layout/Layout'
import { Modal }         from '../components/ui/Modal'
import { Input, Select } from '../components/ui/Input'
import { Button }        from '../components/ui/Button'
import { useBudgets }    from '../hooks/useBudgets'
import { useCategories } from '../hooks/useCategories'
import { useCurrency }   from '../hooks/useCurrency'

// ── Month navigator ───────────────────────────────────────────────
function MonthNav({ month, year, onChange }) {
  const now   = new Date()
  const isNow = month === now.getMonth() + 1 && year === now.getFullYear()
  const prev  = () => month === 1  ? onChange(12, year - 1) : onChange(month - 1, year)
  const next  = () => month === 12 ? onChange(1,  year + 1) : onChange(month + 1, year)

  return (
    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-1 py-1 shadow-sm">
      <button onClick={prev} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-semibold text-gray-700 px-2 min-w-[112px] text-center">
        {format(new Date(year, month - 1, 1), 'MMMM yyyy')}
      </span>
      <button onClick={next} disabled={isNow} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

// ── Progress bar ──────────────────────────────────────────────────
function ProgressBar({ pct, over }) {
  const capped = Math.min(pct, 100)
  return (
    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${over ? 'bg-red-500' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-500'}`}
        style={{ width: `${capped}%` }}
      />
    </div>
  )
}

// ── Budget card ───────────────────────────────────────────────────
function BudgetCard({ budget, onEdit, onDelete }) {
  const { fmt } = useCurrency()
  const { category, amount, spent, remaining, overBudget } = budget
  const pct = amount > 0 ? Math.round((spent / amount) * 100) : 0

  return (
    <div className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col gap-3 ${overBudget ? 'border-red-200' : 'border-gray-100'}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-2xl shrink-0">{category?.icon ?? '📦'}</span>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 truncate">{category?.name ?? 'Unknown'}</p>
            <p className="text-xs text-gray-400">
              {fmt.format(spent)} spent of {fmt.format(amount)}
            </p>
          </div>
        </div>

        {overBudget && (
          <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full shrink-0">
            <AlertTriangle size={11} /> Over
          </span>
        )}
      </div>

      {/* Progress bar */}
      <ProgressBar pct={pct} over={overBudget} />

      {/* Stats row */}
      <div className="flex items-center justify-between text-sm">
        <span className={`font-semibold ${overBudget ? 'text-red-500' : 'text-emerald-600'}`}>
          {overBudget
            ? `Over by ${fmt.format(Math.abs(remaining))}`
            : `${fmt.format(remaining)} left`}
        </span>
        <span className={`text-xs font-medium ${pct >= 100 ? 'text-red-500' : pct >= 80 ? 'text-amber-500' : 'text-gray-400'}`}>
          {pct}%
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
        <button
          onClick={() => onEdit(budget)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-600 transition-colors px-2 py-1 rounded-lg hover:bg-brand-50"
        >
          <Pencil size={12} /> Edit
        </button>
        <button
          onClick={() => onDelete(budget.id)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  )
}

// ── Set budget modal ──────────────────────────────────────────────
function BudgetModal({ open, onClose, onSave, existingBudget, existingCategoryIds }) {
  const { categories } = useCategories('expense')
  const { symbol }     = useCurrency()

  const isEdit = !!existingBudget
  const [categoryId, setCategoryId] = useState('')
  const [amount,     setAmount]     = useState('')
  const [saving,     setSaving]     = useState(false)
  const [err,        setErr]        = useState(null)

  // Sync form when the modal opens or the target budget changes
  useEffect(() => {
    if (open) {
      setCategoryId(existingBudget?.category_id ?? '')
      setAmount(existingBudget?.amount ? String(existingBudget.amount) : '')
      setErr(null)
    }
  }, [open, existingBudget])

  // Key forces the form DOM to remount when switching between add/edit
  const formKey = open ? (existingBudget?.id ?? 'new') : 'closed'

  const available = categories.filter(
    c => !existingCategoryIds.includes(c.id) || c.id === existingBudget?.category_id
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!categoryId) return setErr('Please choose a category.')
    const num = parseFloat(amount)
    if (!num || num <= 0) return setErr('Enter a valid amount.')
    setSaving(true)
    const { error } = await onSave({ category_id: categoryId, amount: num })
    setSaving(false)
    if (error) return setErr(error.message)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit budget' : 'Add budget'}
    >
      <form key={formKey} onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isEdit && (
          <Select
            label="Category"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            required
          >
            <option value="">Select a category…</option>
            {available.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </Select>
        )}

        {isEdit && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-xl">{existingBudget.category?.icon}</span>
            <span className="text-sm font-medium text-gray-700">{existingBudget.category?.name}</span>
          </div>
        )}

        <Input
          label={`Monthly limit (${symbol})`}
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />

        {err && <p className="text-sm text-red-500">{err}</p>}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update' : 'Add budget'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ── Page ─────────────────────────────────────────────────────────
export default function Budgets() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year,  setYear]  = useState(now.getFullYear())
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [deletingId,  setDeletingId]  = useState(null)

  const { budgets, loading, error, saveBudget, removeBudget } = useBudgets(month, year)

  const existingCategoryIds = budgets.map(b => b.category_id)

  const handleSave = async (payload) => {
    return saveBudget(payload)
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    await removeBudget(id)
    setDeletingId(null)
  }

  const openAdd = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit = (budget) => { setEditTarget(budget); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  const overBudgetCount = budgets.filter(b => b.overBudget).length

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
              <Target size={18} className="text-brand-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Budgets</h1>
              <p className="text-xs text-gray-400">Set limits &amp; track spend</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MonthNav month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y) }} />
            <Button onClick={openAdd} size="sm" className="shrink-0">
              <Plus size={15} /> Add budget
            </Button>
          </div>
        </div>

        {/* Over-budget banner */}
        {overBudgetCount > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
            <AlertTriangle size={16} className="shrink-0 text-red-500" />
            <span>
              <span className="font-semibold">{overBudgetCount} {overBudgetCount === 1 ? 'category is' : 'categories are'} over budget</span>
              {' '}this month.
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            ⚠ {error}
          </div>
        )}

        {/* Budget grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-36" />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-5xl mb-4">🎯</span>
            <p className="text-gray-700 font-semibold mb-1">No budgets yet</p>
            <p className="text-gray-400 text-sm mb-6">
              Set a monthly limit for each spending category<br />to stay on track.
            </p>
            <Button onClick={openAdd} size="sm">
              <Plus size={15} /> Add your first budget
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map(b => (
              <BudgetCard
                key={b.id}
                budget={b}
                onEdit={openEdit}
                onDelete={handleDelete}
                deleting={deletingId === b.id}
              />
            ))}
          </div>
        )}

      </div>

      <BudgetModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        existingBudget={editTarget}
        existingCategoryIds={existingCategoryIds}
      />
    </Layout>
  )
}
