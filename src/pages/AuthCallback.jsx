import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        navigate(session?.user ? '/' : '/login', { replace: true })
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/login', { replace: true })
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-800">Confirming your account...</h1>
        <p className="mt-2 text-sm text-gray-500">You will be redirected to login in a moment.</p>
      </div>
    </div>
  )
}