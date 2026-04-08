import { Navigate, Link, useLocation } from 'react-router-dom'
import { Check, BarChart2, FileText, Target, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from './Layout'
import { isNative } from '../../lib/platform'

const FEATURE_INFO = {
  '/insights': {
    Icon: BarChart2,
    title: 'Unlock Insights',
    desc: 'See exactly where your money goes every month.',
    bullets: ['Savings rate tracking', 'Top spending categories', '6-month balance trend'],
  },
  '/reports': {
    Icon: FileText,
    title: 'Unlock Reports',
    desc: 'Deep-dive into your monthly finances.',
    bullets: ['Income vs expense breakdown', 'Category analysis charts', 'Export transactions to CSV'],
  },
  '/budgets': {
    Icon: Target,
    title: 'Unlock Budgets',
    desc: 'Set limits per category and stay on track.',
    bullets: ['Per-category monthly limits', 'Visual progress tracking', 'Over-budget alerts'],
  },
}

const DEFAULT_FEATURE = {
  Icon: Zap,
  title: 'Upgrade to Pro',
  desc: 'Unlock the full BudgetPilot experience.',
  bullets: ['Insights & spending analytics', 'Monthly reports + CSV export', 'Budget tracking per category'],
}

export function ProRoute({ children }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (profile?.plan !== 'pro') {
    const feature = FEATURE_INFO[location.pathname] ?? DEFAULT_FEATURE
    const { Icon, title, desc, bullets } = feature
    const onNative = isNative()

    return (
      <Layout>
        <div className="relative min-h-[80vh]">
          {/* Blurred placeholder — mimics a data page to create curiosity */}
          <div
            className="blur-sm opacity-25 pointer-events-none select-none max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6"
            aria-hidden="true"
          >
            {/* Page header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-200" />
                <div className="space-y-1.5">
                  <div className="h-5 w-20 bg-gray-200 rounded" />
                  <div className="h-3 w-36 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="h-9 w-32 bg-gray-100 rounded-xl" />
            </div>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-20" />
              ))}
            </div>
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 h-52" />
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 h-52" />
            </div>
            {/* Lower cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 h-28" />
              <div className="bg-white rounded-2xl border border-gray-100 h-28" />
            </div>
          </div>

          {/* Floating upgrade overlay */}
          <div className="absolute inset-0 flex items-start justify-center px-4 pt-16 pb-8">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 w-full max-w-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-4">
                <Icon size={22} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">{desc}</p>
              <ul className="text-left mb-6 space-y-2.5">
                {bullets.map(b => (
                  <li key={b} className="flex items-center gap-2.5 text-sm text-gray-600 font-medium">
                    <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <Check size={10} className="text-gray-600" strokeWidth={3} />
                    </div>
                    {b}
                  </li>
                ))}
              </ul>
              {onNative ? (
                <p className="text-sm text-gray-500 text-center mt-2 leading-relaxed">
                  Manage your subscription at{' '}
                  <span className="font-semibold text-gray-700">budgetpilotapp.com</span>
                </p>
              ) : (
                <>
                  <Link
                    to="/plans"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 active:scale-[0.98] transition-all"
                  >
                    <Zap size={14} fill="currentColor" />
                    Upgrade to Pro · £5/mo
                  </Link>
                  <p className="text-xs text-gray-400 mt-3">Cancel anytime · no commitments</p>
                </>
              )}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return children
}
