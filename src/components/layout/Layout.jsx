import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, TrendingDown,
  ArrowLeftRight, LogOut, CreditCard,
  BarChart2, FileText, Target, MoreHorizontal, Zap, X, Shield,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const INACTIVITY_MS = 10 * 60 * 1000 // 10 minutes
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']

const NAV_CORE = [
  { to: '/',             end: true, icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/transactions',            icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/income/add',              icon: TrendingUp,      label: 'Add Income',  accent: 'emerald' },
  { to: '/expense/add',             icon: TrendingDown,    label: 'Add Expense', accent: 'red'     },
]

const NAV_PRO = [
  { to: '/insights', icon: BarChart2, label: 'Insights' },
  { to: '/reports',  icon: FileText,  label: 'Reports'  },
  { to: '/budgets',  icon: Target,    label: 'Budgets'  },
]

const NAV_MOBILE_CORE = [
  { to: '/',             end: true, icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/transactions',            icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/income/add',              icon: TrendingUp,      label: 'Income',      accent: 'emerald' },
  { to: '/expense/add',             icon: TrendingDown,    label: 'Expense',     accent: 'red'     },
]

function LockedNavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          isActive ? 'bg-canvas text-dim' : 'text-gray-300 hover:text-dim hover:bg-canvas'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={17} className={isActive ? 'text-gray-400' : 'text-gray-300'} strokeWidth={2} />
          <span>{label}</span>
          <span className="ml-auto text-[9px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Pro</span>
        </>
      )}
    </NavLink>
  )
}

function NavItem({ to, end, icon: Icon, label, accent, onClick }) {
  const accentActive = accent === 'emerald'
    ? 'bg-green-50 text-green-700'
    : accent === 'red'
    ? 'bg-red-50 text-red-600'
    : 'bg-ink text-white'

  const accentIcon = accent === 'emerald'
    ? 'text-green-600'
    : accent === 'red'
    ? 'text-red-500'
    : 'text-white'

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          isActive
            ? `${accentActive} font-semibold`
            : 'text-dim hover:text-ink hover:bg-canvas'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={17} className={isActive ? accentIcon : 'text-gray-400'} strokeWidth={isActive ? 2.5 : 2} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

function MobileNavItem({ to, end, icon: Icon, label, accent }) {
  const accentColor = accent === 'emerald' ? 'text-green-600' : accent === 'red' ? 'text-red-500' : 'text-ink'

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-colors ${
          isActive ? accentColor : 'text-gray-400 hover:text-dim'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

// ── Mobile "More" sheet ───────────────────────────────────────────
function MobileMoreSheet({ open, onClose, isPro, isAdmin }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const proLinks = [
    { to: '/insights', icon: BarChart2, label: 'Insights',  sub: 'Spending patterns & trends'  },
    { to: '/reports',  icon: FileText,  label: 'Reports',   sub: 'Monthly summaries & exports'  },
    { to: '/budgets',  icon: Target,    label: 'Budgets',   sub: 'Set limits & track spend'     },
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-surface rounded-t-3xl shadow-2xl px-4 pt-4 pb-8 safe-bottom border-t border-line">
        {/* Handle */}
        <div className="w-10 h-1.5 bg-line rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-base font-semibold text-ink">
            {isPro ? 'Pro Features' : 'More'}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-dim hover:text-ink hover:bg-canvas transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {isPro ? (
          <div className="flex flex-col gap-1">
            {proLinks.map(({ to, icon: Icon, label, sub }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors ${
                    isActive ? 'bg-canvas' : 'hover:bg-canvas'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-ink' : 'bg-line'}`}>
                      <Icon size={18} className={isActive ? 'text-white' : 'text-dim'} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${isActive ? 'text-ink' : 'text-gray-800'}`}>{label}</p>
                      <p className="text-xs text-dim mt-0.5">{sub}</p>
                    </div>
                  </>
                )}
              </NavLink>
            ))}
            <NavLink
              to="/plans"
              onClick={onClose}
              className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-canvas transition-colors mt-1 border-t border-line pt-3"
            >
              <div className="w-10 h-10 rounded-xl bg-line flex items-center justify-center shrink-0">
                <CreditCard size={18} className="text-dim" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">Plans</p>
                <p className="text-xs text-dim mt-0.5">Manage your subscription</p>
              </div>
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors mt-1 border-t border-line pt-3 ${
                    isActive ? 'bg-canvas' : 'hover:bg-canvas'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-ink' : 'bg-line'}`}>
                      <Shield size={18} className={isActive ? 'text-white' : 'text-dim'} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${isActive ? 'text-ink' : 'text-gray-800'}`}>Admin</p>
                      <p className="text-xs text-dim mt-0.5">User management & settings</p>
                    </div>
                  </>
                )}
              </NavLink>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Upgrade card — dark monochrome */}
            <div className="rounded-2xl bg-ink p-5 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <Zap size={14} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-semibold text-white">Upgrade to Pro</span>
                <span className="ml-auto text-xs font-semibold text-white/60 bg-white/10 px-2 py-0.5 rounded-full">£5/mo</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                Unlock Insights, Reports, Budget tracking, multiple currencies, and more.
              </p>
              <NavLink
                to="/plans"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-ink text-sm font-semibold hover:bg-canvas transition-colors"
              >
                View plans
              </NavLink>
            </div>

            {/* Locked pro links — clickable, navigate to blurred gate */}
            <div className="flex flex-col gap-1">
              {proLinks.map(({ to, icon: Icon, label, sub }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors opacity-50 hover:opacity-70 ${
                      isActive ? 'bg-canvas' : 'hover:bg-canvas'
                    }`
                  }
                >
                  <div className="w-10 h-10 rounded-xl bg-line flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-dim" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-dim">{label}</p>
                      <span className="text-[9px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Pro</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                  </div>
                </NavLink>
              ))}
            </div>
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors border-t border-line pt-3 ${
                    isActive ? 'bg-canvas' : 'hover:bg-canvas'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-ink' : 'bg-line'}`}>
                      <Shield size={18} className={isActive ? 'text-white' : 'text-dim'} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${isActive ? 'text-ink' : 'text-gray-800'}`}>Admin</p>
                      <p className="text-xs text-dim mt-0.5">User management & settings</p>
                    </div>
                  </>
                )}
              </NavLink>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const CURRENCIES = [
  { code: 'USD', label: 'USD – US Dollar'        },
  { code: 'GBP', label: 'GBP – British Pound'    },
  { code: 'EUR', label: 'EUR – Euro'              },
  { code: 'CAD', label: 'CAD – Canadian Dollar'  },
  { code: 'AUD', label: 'AUD – Australian Dollar'},
  { code: 'JPY', label: 'JPY – Japanese Yen'     },
  { code: 'CHF', label: 'CHF – Swiss Franc'      },
  { code: 'INR', label: 'INR – Indian Rupee'     },
  { code: 'CNY', label: 'CNY – Chinese Yuan'     },
  { code: 'MXN', label: 'MXN – Mexican Peso'     },
  { code: 'BRL', label: 'BRL – Brazilian Real'   },
  { code: 'SGD', label: 'SGD – Singapore Dollar' },
]

export function Layout({ children }) {
  const { user, profile, signOut, updateProfile } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [showMore, setShowMore] = useState(false)

  useEffect(() => { setShowMore(false) }, [location.pathname])

  const signOutRef = useRef(signOut)
  const navigateRef = useRef(navigate)
  signOutRef.current = signOut
  navigateRef.current = navigate

  useEffect(() => {
    let timer

    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(async () => {
        await signOutRef.current()
        navigateRef.current('/login', { replace: true })
      }, INACTIVITY_MS)
    }

    reset()
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }))

    return () => {
      clearTimeout(timer)
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, reset))
    }
  }, [])

  const [showUpgradeMsg, setShowUpgradeMsg] = useState(false)
  const upgradeMsgTimer = useRef(null)

  const isPro    = profile?.plan === 'pro'
  const isAdmin  = profile?.role === 'admin'

  const handleCurrencyChange = async (e) => {
    const next = e.target.value
    if (!isPro && next !== (profile?.currency ?? 'USD')) {
      setShowUpgradeMsg(true)
      clearTimeout(upgradeMsgTimer.current)
      upgradeMsgTimer.current = setTimeout(() => setShowUpgradeMsg(false), 3500)
      return
    }
    setShowUpgradeMsg(false)
    await updateProfile({ currency: next })
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 bg-surface border-r border-line fixed inset-y-0 left-0 z-20">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-line shrink-0">
          <div className="w-8 h-8 rounded-xl bg-ink flex items-center justify-center shadow-sm shrink-0">
            <span className="text-white font-bold text-sm tracking-tight">B</span>
          </div>
          <div>
            <span className="font-bold text-ink text-base tracking-tight">BudgetPilot</span>
            {isPro && (
              <span className="ml-1.5 text-[9px] font-semibold bg-brand-100 text-dim px-1.5 py-0.5 rounded-full uppercase tracking-wide">Pro</span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_CORE.map(item => <NavItem key={item.to} {...item} />)}

          <div className="my-2 h-px bg-line" />

          <NavItem to="/plans" icon={CreditCard} label="Plans" />

          <>
            <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Pro</p>
            {isPro
              ? NAV_PRO.map(item => <NavItem key={item.to} {...item} />)
              : NAV_PRO.map(item => <LockedNavItem key={item.to} {...item} />)
            }
          </>

          {isAdmin && (
            <>
              <div className="my-2 h-px bg-line" />
              <NavItem to="/admin" icon={Shield} label="Admin" />
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="px-3 pb-4 border-t border-line pt-3 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 bg-canvas">
            <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-semibold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink truncate">{user?.email}</p>
              <p className="text-[10px] text-dim font-medium mt-0.5">
                {isPro ? 'Pro plan' : 'Free plan'}
              </p>
            </div>
          </div>
          <select
            value={profile?.currency ?? 'USD'}
            onChange={handleCurrencyChange}
            className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-xs text-dim focus:outline-none focus:ring-2 focus:ring-ink transition mb-1.5 hover:border-gray-300"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          {showUpgradeMsg && (
            <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-2 mb-1.5 leading-snug font-medium">
              Upgrade to Pro (£5/mo) to use multiple currencies
            </p>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-dim hover:text-accent-red hover:bg-red-50 transition-all duration-150"
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden bg-surface border-b border-line sticky top-0 z-10 shadow-sm">
          <div className="h-14 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-ink text-sm leading-tight truncate">BudgetPilot</span>
                <span className="text-[9px] leading-tight font-medium text-dim">
                  {isPro ? 'Pro plan' : 'Free plan'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <select
                value={profile?.currency ?? 'USD'}
                onChange={handleCurrencyChange}
                aria-label="Currency"
                className="text-xs font-medium text-dim bg-canvas border border-line rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ink transition"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
              <button
                onClick={handleSignOut}
                aria-label="Sign out"
                className="p-2 rounded-lg text-dim hover:text-accent-red hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
          {showUpgradeMsg && (
            <div className="px-4 pb-2">
              <p className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 leading-snug">
                Upgrade to Pro (£5/mo) to use multiple currencies
              </p>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Nav ────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-surface border-t border-line z-20 flex shadow-[0_-2px_8px_0_rgb(0,0,0,0.06)]">
        {NAV_MOBILE_CORE.map(item => <MobileNavItem key={item.to} {...item} />)}

        {/* More / Upgrade button */}
        <button
          onClick={() => setShowMore(true)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-colors ${
            showMore ? 'text-ink' : 'text-gray-400 hover:text-dim'
          }`}
        >
          {isPro ? (
            <>
              <MoreHorizontal size={20} strokeWidth={showMore ? 2.5 : 1.8} />
              <span>More</span>
            </>
          ) : (
            <>
              <Zap size={20} strokeWidth={showMore ? 2.5 : 1.8} />
              <span>Upgrade</span>
            </>
          )}
        </button>
      </nav>

      <MobileMoreSheet open={showMore} onClose={() => setShowMore(false)} isPro={isPro} isAdmin={isAdmin} />
    </div>
  )
}
