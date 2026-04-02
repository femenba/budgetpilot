import { useEffect, useState, useCallback } from 'react'
import { endOfMonth, format as fmtDate } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import {
  fetchIncomes,
  fetchExpenses,
  createIncome,
  createExpense,
  updateIncome,
  updateExpense,
  deleteIncome,
  deleteExpense,
} from '../services/transactionService'

function dateRange(month, year) {
  const start = new Date(year, month - 1, 1)
  return {
    from: fmtDate(start, 'yyyy-MM-dd'),
    to:   fmtDate(endOfMonth(start), 'yyyy-MM-dd'),
  }
}

export function useTransactions(month, year) {
  const { user } = useAuth()
  const [incomes,  setIncomes]  = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const { from, to } = dateRange(month, year)

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    const [incRes, expRes] = await Promise.all([
      fetchIncomes(user.id, from, to),
      fetchExpenses(user.id, from, to),
    ])

    if (incRes.error || expRes.error) {
      setError((incRes.error ?? expRes.error).message)
    } else {
      setIncomes(incRes.data.map(r => ({ ...r, type: 'income' })))
      setExpenses(expRes.data.map(r => ({ ...r, type: 'expense' })))
    }
    setLoading(false)
  }, [user, from, to])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Create ─────────────────────────────────────────────────────
  const addTransaction = async ({ type, ...payload }) => {
    const fn = type === 'income' ? createIncome : createExpense
    const { error } = await fn(user.id, payload)
    if (error) return { error }
    await fetchAll()
    return {}
  }

  // ── Update ─────────────────────────────────────────────────────
  const updateTransaction = async (id, type, payload) => {
    const fn = type === 'income' ? updateIncome : updateExpense
    const { error } = await fn(id, user.id, payload)
    if (error) return { error }
    await fetchAll()
    return {}
  }

  // ── Delete ─────────────────────────────────────────────────────
  const deleteTransaction = async (id, type) => {
    const fn = type === 'income' ? deleteIncome : deleteExpense
    const { error } = await fn(id, user.id)
    if (!error) {
      if (type === 'income') setIncomes(prev => prev.filter(t => t.id !== id))
      else                   setExpenses(prev => prev.filter(t => t.id !== id))
    }
    return { error }
  }

  // ── Derived ────────────────────────────────────────────────────
  const transactions = [...incomes, ...expenses].sort(
    (a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at)
  )
  const totalIncome  = incomes.reduce( (s, t) => s + Number(t.amount), 0)
  const totalExpense = expenses.reduce((s, t) => s + Number(t.amount), 0)
  const balance      = totalIncome - totalExpense

  return {
    transactions, incomes, expenses,
    loading, error,
    totalIncome, totalExpense, balance,
    addTransaction, updateTransaction, deleteTransaction,
    refresh: fetchAll,
  }
}
