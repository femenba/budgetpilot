import { useState, useEffect } from 'react'
import { fetchCategories } from '../services/categoryService'

export function useCategories(type = null) {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    fetchCategories(type).then(({ data, error }) => {
      if (error) setError(error.message)
      else setCategories(data ?? [])
      setLoading(false)
    })
  }, [type])

  return { categories, loading, error }
}
