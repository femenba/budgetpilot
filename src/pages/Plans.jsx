import { Check, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/layout/Layout'

const FREE_FEATURES = [
  'Track income & expenses',
  'Monthly overview & charts',
  'Default categories',
  'Transaction history',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Multiple currencies',
  'Custom categories',
  'Insights & spending analytics',
  'Monthly reports',
  'Budget tracking',
]

export default function Plans() {
  const { profile } = useAuth()
  const isPro = profile?.plan === 'pro'

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Plans</h1>
        <p className="text-sm text-gray-500 mb-8">
          You are currently on the{' '}
          <span className={`font-semibold ${isPro ? 'text-brand-600' : 'text-gray-700'}`}>
            {isPro ? 'Pro' : 'Free'}
          </span>{' '}
          plan.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Free */}
          <div className={`rounded-2xl border p-6 ${!isPro ? 'border-brand-200 bg-brand-50/30' : 'border-gray-100 bg-white'}`}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-gray-900">Free</h2>
              {!isPro && (
                <span className="text-[10px] font-semibold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                  Current plan
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-4">
              $0<span className="text-sm font-normal text-gray-400">/mo</span>
            </p>
            <ul className="space-y-2.5">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className={`rounded-2xl border p-6 ${isPro ? 'border-brand-200 bg-brand-50/30' : 'border-gray-100 bg-white'}`}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-gray-900">Pro</h2>
              {isPro ? (
                <span className="text-[10px] font-semibold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                  Current plan
                </span>
              ) : (
                <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  Upgrade
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-4">
              $9<span className="text-sm font-normal text-gray-400">/mo</span>
            </p>
            <ul className="space-y-2.5">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {!isPro && (
              <button className="mt-5 w-full py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2">
                <Zap size={14} />
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
