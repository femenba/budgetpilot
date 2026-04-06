import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, RotateCcw, Plus, X } from 'lucide-react'
import { createIncome } from '../services/transactionService'
import { createCategory } from '../services/categoryService'
import { useAuth } from '../contexts/AuthContext'
import { useCategories } from '../hooks/useCategories'
import { useCurrency } from '../hooks/useCurrency'
import { Layout } from '../components/layout/Layout'

const CAT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
]

export default function AddIncome() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { categories: fetchedCategories, loading: catLoading } = useCategories('income')
  const { symbol, fmt } = useCurrency()

  const [amount,      setAmount]      = useState('')
  const [categoryId,  setCategoryId]  = useState('')
  const [description, setDescription] = useState('')
  const [date,        setDate]        = useState(new Date().toISOString().slice(0, 10))
  const [recurring,   setRecurring]   = useState(false)
  const [error,       setError]       = useState('')
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)

  // Local category list — seeded from hook, extended by custom additions
  const [categories,   setCategories]   = useState([])
  const [showNewCat,   setShowNewCat]   = useState(false)
  const [newCatName,   setNewCatName]   = useState('')
  const [newCatColor,  setNewCatColor]  = useState(CAT_COLORS[3]) // default emerald
  const [newCatSaving, setNewCatSaving] = useState(false)

  useEffect(() => { setCategories(fetchedCategories) }, [fetchedCategories])

  const handleCreateCategory = async () => {
    const name = newCatName.trim()
    if (!name) return
    setNewCatSaving(true)
    const { data, error: catErr } = await createCategory(user.id, {
      name, type: 'income', color: newCatColor,
    })
    setNewCatSaving(false)
    if (catErr) { setError(catErr.message); return }
    const created = data ?? { id: String(Date.now()), name, color: newCatColor, type: 'income' }
    setCategories(prev => [...prev, created])
    setCategoryId(created.id)
    setShowNewCat(false)
    setNewCatName('')
    setNewCatColor(CAT_COLORS[3])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const num = parseFloat(amount)
    if (isNaN(num) || num <= 0) { setError('Enter a valid amount greater than 0.'); return }

    setSaving(true)
    const { error } = await createIncome(user.id, {
      amount:       num,
      category_id:  categoryId,
      description:  description.trim(),
      date,
      is_recurring: recurring,
    })
    setSaving(false)

    if (error) { setError(error.message); return }
    setSaved(true)
    setTimeout(() => navigate('/'), 1200)
  }

  const selectedCat = categories.find(c => c.id === categoryId)

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Add Income</h1>
            <p className="text-sm text-gray-400 font-medium">Record a new income entry</p>
          </div>
        </div>

        {saved ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 size={34} className="text-emerald-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Income saved!</h2>
            <p className="text-gray-500 text-sm mt-1">Redirecting to dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Amount */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Amount</label>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-300">{symbol}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="flex-1 text-4xl font-bold text-emerald-600 bg-transparent border-none outline-none placeholder:text-gray-200 w-full"
                  autoFocus
                />
              </div>
              <div className="mt-3 h-px bg-gradient-to-r from-emerald-200 via-emerald-100 to-transparent" />
            </div>

            {/* Category */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
              {catLoading ? (
                <div className="flex gap-2 flex-wrap animate-pulse">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-9 w-24 bg-gray-100 rounded-xl" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => {
                      const active = categoryId === cat.id
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategoryId(active ? '' : cat.id)}
                          className={`
                            flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border-2 transition-all
                            ${active
                              ? 'text-white border-transparent shadow-sm scale-105'
                              : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 hover:bg-gray-100'
                            }
                          `}
                          style={active ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: active ? 'white' : cat.color }}
                          />
                          {cat.name}
                        </button>
                      )
                    })}
                    {!showNewCat && (
                      <button
                        type="button"
                        onClick={() => setShowNewCat(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border-2 border-dashed border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-600 transition-all"
                      >
                        <Plus size={14} />
                        New
                      </button>
                    )}
                  </div>

                  {/* Inline new-category form */}
                  {showNewCat && (
                    <div className="mt-3 p-3 rounded-xl border border-gray-200 bg-gray-50 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newCatName}
                          onChange={e => setNewCatName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                          placeholder="Category name"
                          maxLength={40}
                          autoFocus
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent placeholder:text-gray-300 transition"
                        />
                        <button
                          type="button"
                          onClick={() => { setShowNewCat(false); setNewCatName(''); setNewCatColor(CAT_COLORS[3]) }}
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 shrink-0">Color:</span>
                        <div className="flex gap-1.5 flex-wrap">
                          {CAT_COLORS.map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setNewCatColor(c)}
                              className={`w-6 h-6 rounded-full transition-transform ${newCatColor === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={!newCatName.trim() || newCatSaving}
                        className="self-start px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
                      >
                        {newCatSaving ? 'Saving…' : 'Add category'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Description + Date */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Monthly salary from Acme Inc."
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent focus:bg-white placeholder:text-gray-300 transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent focus:bg-white transition"
                />
              </div>

              {/* Recurring toggle */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2.5">
                  <RotateCcw size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Recurring income</p>
                    <p className="text-xs text-gray-400">Mark as a repeating entry</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRecurring(v => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${recurring ? 'bg-emerald-500' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${recurring ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Summary bar */}
            {amount && parseFloat(amount) > 0 && (
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="text-sm text-emerald-700">
                  <span className="font-semibold">{selectedCat?.name ?? 'Uncategorized'}</span>
                  {description && <span className="text-emerald-600 ml-1">· {description}</span>}
                </div>
                <span className="text-emerald-700 font-bold text-sm">
                  +{fmt.format(parseFloat(amount))}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pb-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-sm"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : 'Save Income'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  )
}
