import { useState, useEffect, useCallback } from 'react'
import { Users, Wifi, WifiOff, Zap, CalendarPlus, Search, Shield, TrendingUp, AlertCircle, RotateCcw, Loader } from 'lucide-react'
import { formatDistanceToNow, subDays } from 'date-fns'
import { Layout } from '../components/layout/Layout'
import { fetchAllProfiles } from '../services/profileService'
import { supabase } from '../lib/supabase'

const ONLINE_MS   = 5 * 60 * 1000  // 5 minutes
const PRO_PRICE   = 5               // £5/mo

function isOnline(lastSeenAt) {
  if (!lastSeenAt) return false
  return Date.now() - new Date(lastSeenAt).getTime() < ONLINE_MS
}

function formatRenewal(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function SubStatusBadge({ status }) {
  if (!status) return <span className="text-dim text-xs">—</span>
  const styles = {
    active:   'bg-green-50 text-green-700 border-green-200',
    past_due: 'bg-red-50 text-red-600 border-red-200',
    canceled: 'bg-gray-100 text-gray-500 border-gray-200',
    trialing: 'bg-blue-50 text-blue-600 border-blue-200',
  }
  const labels = {
    active:   'Active',
    past_due: 'Past due',
    canceled: 'Canceled',
    trialing: 'Trial',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${styles[status] ?? 'bg-canvas text-dim border-line'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-surface rounded-2xl p-5 border border-line shadow-card">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accent ? 'bg-ink' : 'bg-canvas'}`}>
          <Icon size={17} className={accent ? 'text-white' : 'text-dim'} strokeWidth={2} />
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
  const [profiles,    setProfiles]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [planFilter,  setPlanFilter]  = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating,    setUpdating]    = useState(null)
  const [genMonth,    setGenMonth]    = useState(new Date().getMonth() + 1)
  const [genYear,     setGenYear]     = useState(new Date().getFullYear())
  const [generating,  setGenerating]  = useState(false)
  const [genResult,   setGenResult]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await fetchAllProfiles()
    setProfiles(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleGenerateRecurring = async () => {
    setGenerating(true)
    setGenResult(null)
    const { data: { session } } = await supabase.auth.getSession()
    try {
      const res = await fetch('/api/generate-recurring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ month: genMonth, year: genYear }),
      })
      const data = await res.json()
      setGenResult(data.ok
        ? `Done: ${data.generated} entries generated, ${data.backfilled} rows backfilled across ${data.users} users.`
        : `Error: ${data.error}`)
    } catch (err) {
      setGenResult(`Network error: ${err.message}`)
    }
    setGenerating(false)
  }

  const handlePlanChange = async (userId, newPlan) => {
    setUpdating(userId)
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/admin-upgrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId, plan: newPlan }),
    })
    setProfiles(prev => prev.map(p => p.id === userId ? { ...p, plan: newPlan } : p))
    setUpdating(null)
  }

  // Derived stats
  const sevenDaysAgo = subDays(new Date(), 7)
  const total      = profiles.length
  const online     = profiles.filter(p => isOnline(p.last_seen_at)).length
  const free       = profiles.filter(p => p.plan === 'free').length
  const pro        = profiles.filter(p => p.plan === 'pro').length
  const pastDue    = profiles.filter(p => p.subscription_status === 'past_due').length
  const newUsers   = profiles.filter(p => new Date(p.created_at) > sevenDaysAgo).length
  const mrr        = pro * PRO_PRICE

  // Filtered rows
  const filtered = profiles.filter(p => {
    const name           = `${p.first_name ?? ''} ${p.last_name ?? ''} ${p.email ?? ''}`.toLowerCase()
    const matchesSearch  = !search || name.includes(search.toLowerCase())
    const matchesPlan    = planFilter   === 'all' || p.plan === planFilter
    const matchesStatus  = statusFilter === 'all' || p.subscription_status === statusFilter
    return matchesSearch && matchesPlan && matchesStatus
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
            <p className="text-xs text-dim">User management &amp; billing overview</p>
          </div>
        </div>

        {/* Generate Recurring */}
        <div className="bg-surface rounded-2xl border border-line p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <RotateCcw size={15} className="text-dim" />
            <span className="text-sm font-semibold text-ink">Generate recurring transactions</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={genMonth}
              onChange={e => setGenMonth(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-line bg-canvas text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            >
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <input
              type="number"
              value={genYear}
              onChange={e => setGenYear(Number(e.target.value))}
              min="2020" max="2030"
              className="w-20 px-3 py-1.5 rounded-xl border border-line bg-canvas text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
            <button
              onClick={handleGenerateRecurring}
              disabled={generating}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-ink text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {generating ? <Loader size={13} className="animate-spin" /> : <RotateCcw size={13} />}
              {generating ? 'Running…' : 'Run'}
            </button>
          </div>
          {genResult && (
            <p className={`text-xs font-medium mt-1 sm:mt-0 ${genResult.startsWith('Done') ? 'text-green-700' : 'text-red-600'}`}>
              {genResult}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {loading ? (
            Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard icon={Users}        label="Total"    value={total}       />
              <StatCard icon={Wifi}         label="Online"   value={online}      sub="last 5 min" />
              <StatCard icon={WifiOff}      label="Free"     value={free}        />
              <StatCard icon={Zap}          label="Pro"      value={pro}         accent />
              <StatCard icon={TrendingUp}   label="MRR"      value={`£${mrr}`}   sub={`${pro} × £${PRO_PRICE}`} accent />
              <StatCard icon={AlertCircle}  label="Past due" value={pastDue}     sub={pastDue > 0 ? 'needs attention' : 'all clear'} />
              <StatCard icon={CalendarPlus} label="New (7d)" value={newUsers}    />
            </>
          )}
        </div>

        {/* Filters */}
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
          <div className="flex gap-2 flex-wrap shrink-0">
            {['all', 'free', 'pro'].map(f => (
              <button
                key={f}
                onClick={() => setPlanFilter(f)}
                className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                  planFilter === f ? 'bg-ink text-white' : 'bg-surface border border-line text-dim hover:text-ink'
                }`}
              >
                {f === 'all' ? 'All plans' : f}
              </button>
            ))}
            {['all', 'active', 'past_due', 'canceled'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  statusFilter === s ? 'bg-ink text-white' : 'bg-surface border border-line text-dim hover:text-ink'
                }`}
              >
                {s === 'all' ? 'All statuses' : s === 'past_due' ? 'Past due' : s.charAt(0).toUpperCase() + s.slice(1)}
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
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="border-b border-line bg-canvas">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-dim uppercase tracking-wide">User</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-dim uppercase tracking-wide">Plan</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-dim uppercase tracking-wide">Sub status</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-dim uppercase tracking-wide">Renewal</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-dim uppercase tracking-wide">Online</th>
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
                      <tr key={p.id} className={`hover:bg-canvas transition-colors ${p.subscription_status === 'past_due' ? 'bg-red-50/30' : ''}`}>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="font-medium text-ink">{name}</p>
                          <p className="text-xs text-dim mt-0.5">{p.email}</p>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            p.plan === 'pro' ? 'bg-ink text-white' : 'bg-canvas text-dim border border-line'
                          }`}>
                            {p.plan === 'pro' ? 'Pro' : 'Free'}
                          </span>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <SubStatusBadge status={p.subscription_status} />
                        </td>

                        <td className="px-5 py-4 text-xs text-dim whitespace-nowrap">
                          {formatRenewal(p.subscription_renewal_at)}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${online ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className={`text-xs font-medium ${online ? 'text-green-700' : 'text-dim'}`}>
                              {online ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-dim text-xs whitespace-nowrap">
                          {p.last_seen_at
                            ? formatDistanceToNow(new Date(p.last_seen_at), { addSuffix: true })
                            : '—'}
                        </td>

                        <td className="px-5 py-4 text-dim text-xs whitespace-nowrap">
                          {p.created_at
                            ? formatDistanceToNow(new Date(p.created_at), { addSuffix: true })
                            : '—'}
                        </td>

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
