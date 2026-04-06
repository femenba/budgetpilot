import { useState, useEffect, useCallback } from 'react'
import { Users, Wifi, WifiOff, Zap, CalendarPlus, Search, Shield } from 'lucide-react'
import { formatDistanceToNow, subDays } from 'date-fns'
import { Layout } from '../components/layout/Layout'
import { fetchAllProfiles, updateUserPlan } from '../services/profileService'

const ONLINE_MS = 5 * 60 * 1000 // 5 minutes

function isOnline(lastSeenAt) {
  if (!lastSeenAt) return false
  return Date.now() - new Date(lastSeenAt).getTime() < ONLINE_MS
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-surface rounded-2xl p-5 border border-line shadow-card">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-canvas flex items-center justify-center shrink-0">
          <Icon size={17} className="text-dim" strokeWidth={2} />
        </div>
        <p className="text-xs font-medium text-dim uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-bold text-ink tracking-tight">{value}</p>
      {sub && <p className="text-xs text-dim mt-1">{sub}</p>}
    </div>
  )
}

function SkeletonCard() {
  return <div className="bg-surface rounded-2xl p-5 border border-line h-28 animate-pulse" />
}

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [updating, setUpdating] = useState(null) // userId currently being updated

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await fetchAllProfiles()
    setProfiles(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handlePlanChange = async (userId, newPlan) => {
    setUpdating(userId)
    await updateUserPlan(userId, newPlan)
    setProfiles(prev => prev.map(p => p.id === userId ? { ...p, plan: newPlan } : p))
    setUpdating(null)
  }

  // Derived stats
  const sevenDaysAgo = subDays(new Date(), 7)
  const total    = profiles.length
  const online   = profiles.filter(p => isOnline(p.last_seen_at)).length
  const free     = profiles.filter(p => p.plan === 'free').length
  const pro      = profiles.filter(p => p.plan === 'pro').length
  const newUsers = profiles.filter(p => new Date(p.created_at) > sevenDaysAgo).length

  // Filtered rows
  const filtered = profiles.filter(p => {
    const name = `${p.first_name ?? ''} ${p.last_name ?? ''} ${p.email ?? ''}`.toLowerCase()
    const matchesSearch = !search || name.includes(search.toLowerCase())
    const matchesPlan   = planFilter === 'all' || p.plan === planFilter
    return matchesSearch && matchesPlan
  })

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-ink flex items-center justify-center shrink-0">
            <Shield size={17} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink tracking-tight">Admin</h1>
            <p className="text-xs text-dim">User management &amp; overview</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard icon={Users}       label="Total users"  value={total}    />
              <StatCard icon={Wifi}        label="Online"       value={online}   sub="last 5 min" />
              <StatCard icon={WifiOff}     label="Free"         value={free}     />
              <StatCard icon={Zap}         label="Pro"          value={pro}      />
              <StatCard icon={CalendarPlus} label="New (7d)"   value={newUsers} />
            </>
          )}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ink transition"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            {[
              { value: 'all',  label: 'All'  },
              { value: 'free', label: 'Free' },
              { value: 'pro',  label: 'Pro'  },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setPlanFilter(f.value)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  planFilter === f.value
                    ? 'bg-ink text-white'
                    : 'bg-surface border border-line text-dim hover:text-ink hover:border-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Users table */}
        <div className="bg-surface rounded-2xl border border-line shadow-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-7 h-7 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-dim gap-2">
              <Users size={32} className="opacity-20" />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-line bg-canvas">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-dim uppercase tracking-wide">User</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-dim uppercase tracking-wide">Phone</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-dim uppercase tracking-wide">Plan</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-dim uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-dim uppercase tracking-wide">Last seen</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-dim uppercase tracking-wide">Joined</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map(p => {
                    const online = isOnline(p.last_seen_at)
                    const name   = [p.first_name, p.last_name].filter(Boolean).join(' ') || '—'
                    const busy   = updating === p.id
                    return (
                      <tr key={p.id} className="hover:bg-canvas transition-colors">
                        {/* Name + email */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="font-medium text-ink">{name}</p>
                          <p className="text-xs text-dim mt-0.5">{p.email}</p>
                        </td>

                        {/* Phone */}
                        <td className="px-5 py-4 text-dim whitespace-nowrap">{p.phone || '—'}</td>

                        {/* Plan badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            p.plan === 'pro'
                              ? 'bg-ink text-white'
                              : 'bg-canvas text-dim border border-line'
                          }`}>
                            {p.plan === 'pro' ? 'Pro' : 'Free'}
                          </span>
                        </td>

                        {/* Online status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${
                              online ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span className={`text-xs font-medium ${
                              online ? 'text-green-700' : 'text-dim'
                            }`}>
                              {online ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </td>

                        {/* Last seen */}
                        <td className="px-5 py-4 text-dim text-xs whitespace-nowrap">
                          {p.last_seen_at
                            ? formatDistanceToNow(new Date(p.last_seen_at), { addSuffix: true })
                            : '—'}
                        </td>

                        {/* Joined */}
                        <td className="px-5 py-4 text-dim text-xs whitespace-nowrap">
                          {p.created_at
                            ? formatDistanceToNow(new Date(p.created_at), { addSuffix: true })
                            : '—'}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex justify-end">
                            {p.plan === 'free' ? (
                              <button
                                onClick={() => handlePlanChange(p.id, 'pro')}
                                disabled={busy}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-ink text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                              >
                                {busy ? '…' : 'Make Pro'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePlanChange(p.id, 'free')}
                                disabled={busy}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-line text-dim hover:text-accent-red hover:border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                {busy ? '…' : 'Remove Pro'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </Layout>
  )
}
