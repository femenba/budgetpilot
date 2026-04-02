import { useEffect, useState } from 'react'
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { fetchTrendAmounts } from '../services/transactionService'

export function useBalanceTrend(numMonths = 6) {
  const { user } = useAuth()
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!user) return

    const now = new Date()
    const months = Array.from({ length: numMonths }, (_, i) => {
      const d = subMonths(now, numMonths - 1 - i)
      return { key: format(d, 'yyyy-MM'), label: format(d, 'MMM yy') }
    })

    const from = format(startOfMonth(subMonths(now, numMonths - 1)), 'yyyy-MM-dd')
    const to   = format(endOfMonth(now), 'yyyy-MM-dd')

    fetchTrendAmounts(user.id, from, to).then(([incRes, expRes]) => {
      if (incRes.error || expRes.error) {
        setError((incRes.error ?? expRes.error).message)
        setLoading(false)
        return
      }

      const buckets = Object.fromEntries(
        months.map(m => [m.key, { month: m.label, income: 0, expense: 0, balance: 0 }])
      )

      incRes.data.forEach(r => {
        const key = r.date.slice(0, 7)
        if (buckets[key]) buckets[key].income += Number(r.amount)
      })
      expRes.data.forEach(r => {
        const key = r.date.slice(0, 7)
        if (buckets[key]) buckets[key].expense += Number(r.amount)
      })

      Object.values(buckets).forEach(b => { b.balance = b.income - b.expense })
      setData(months.map(m => buckets[m.key]))
      setLoading(false)
    })
  }, [user, numMonths])

  return { data, loading, error }
}
