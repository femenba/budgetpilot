import { useEffect, useState, useCallback } from 'react'
import { endOfMonth, format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { fetchBudgets, upsertBudget, deleteBudget } from '../services/budgetService'
import { fetchExpenses } from '../services/transactionService'

export function useBudgets(month, year) {
  const { user } = useAuth()
  const [budgets,  setBudgets]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    const start = new Date(year, month - 1, 1)
    const from  = format(start, 'yyyy-MM-dd')
    const to    = format(endOfMonth(start), 'yyyy-MM-dd')

    const [budgetRes, expenseRes] = await Promise.all([
      fetchBudgets(user.id, month, year),
      fetchExpenses(user.id, from, to),
    ])

    if (budgetRes.error || expenseRes.error) {
      setError((budgetRes.error ?? expenseRes.error).message)
      setLoading(false)
      return
    }

    // Aggregate expenses by category_id
    const spentMap = {}
    for (const exp of expenseRes.data) {
      const key = exp.category_id ?? '__none__'
      spentMap[key] = (spentMap[key] ?? 0) + Number(exp.amount)
    }

    // Merge spent into budgets
    const merged = budgetRes.data.map(b => {
      const spent     = spentMap[b.category_id] ?? 0
      const remaining = Number(b.amount) - spent
      return { ...b, spent, remaining, overBudget: remaining < 0 }
    })

    setBudgets(merged)
    setLoading(false)
  }, [user, month, year])

  useEffect(() => { load() }, [load])

  const saveBudget = async (payload) => {
    const { data, error } = await upsertBudget(user.id, { ...payload, month, year })
    if (error) return { error }
    await load()
    return { data }
  }

  const removeBudget = async (id) => {
    const { error } = await deleteBudget(id, user.id)
    if (!error) setBudgets(prev => prev.filter(b => b.id !== id))
    return { error }
  }

  return { budgets, loading, error, saveBudget, removeBudget, refresh: load }
}
