import { Navigate, useNavigate } from 'react-router-dom'
import { Lock, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from './Layout'

export function ProRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (profile?.plan !== 'pro') {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Lock size={22} className="text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pro feature</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            This page is available on the Pro plan.<br />
            Upgrade to unlock Insights, Reports, and Budgets.
          </p>
          <a
            href="/plans"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            <Zap size={14} />
            View plans
          </a>
        </div>
      </Layout>
    )
  }

  return children
}
