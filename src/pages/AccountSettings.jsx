import { useState } from 'react'
import { User, Mail, Phone, Check, Loader } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../contexts/AuthContext'

export default function AccountSettings() {
  const { user, profile, updateProfile } = useAuth()

  const [form, setForm] = useState({
    first_name: profile?.first_name ?? '',
    last_name:  profile?.last_name  ?? '',
    phone:      profile?.phone      ?? '',
  })
  const [saving, setSaving]   = useState(false)
  const [saved,  setSaved]    = useState(false)
  const [error,  setError]    = useState(null)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error: err } = await updateProfile(form)
    if (err) {
      setError(err.message)
    } else {
      setSaved(true)
    }
    setSaving(false)
  }

  const isPro   = profile?.plan === 'pro'
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-ink flex items-center justify-center shrink-0">
            <User size={17} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink tracking-tight">Account Settings</h1>
            <p className="text-xs text-dim">Manage your profile information</p>
          </div>
        </div>

        {/* Avatar + plan pill */}
        <div className="bg-surface rounded-2xl border border-line p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-ink flex items-center justify-center shrink-0">
            <span className="text-white text-xl font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                isPro ? 'bg-ink text-white' : 'bg-canvas text-dim border border-line'
              }`}>
                {isPro ? 'Pro' : 'Free'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile form */}
        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-line p-5 space-y-4">
          <p className="text-sm font-semibold text-ink mb-1">Personal Information</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">First name</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="First name"
                className="w-full px-3 py-2.5 rounded-xl border border-line bg-canvas text-sm text-ink placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ink transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">Last name</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Last name"
                className="w-full px-3 py-2.5 rounded-xl border border-line bg-canvas text-sm text-ink placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ink transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Email address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
              <input
                value={user?.email ?? ''}
                readOnly
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-line bg-canvas text-sm text-dim cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-dim mt-1">Email cannot be changed here. Contact support if needed.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Phone number</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+44 7700 900000"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-line bg-canvas text-sm text-ink placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ink transition"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-ink text-white text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] disabled:opacity-60 transition-all"
          >
            {saving ? (
              <Loader size={14} className="animate-spin" />
            ) : saved ? (
              <><Check size={14} /> Saved</>
            ) : (
              'Save changes'
            )}
          </button>
        </form>

        {/* Subscription */}
        <div className="bg-surface rounded-2xl border border-line p-5">
          <p className="text-sm font-semibold text-ink mb-3">Subscription</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">{isPro ? 'Pro plan' : 'Free plan'}</p>
              {isPro && profile?.subscription_renewal_at && (
                <p className="text-xs text-dim mt-0.5">
                  Renews {new Date(profile.subscription_renewal_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}
            </div>
            <a
              href="/plans"
              className="text-xs font-semibold text-ink underline underline-offset-2 hover:text-dim transition"
            >
              {isPro ? 'Manage' : 'Upgrade'}
            </a>
          </div>
        </div>

      </div>
    </Layout>
  )
}
