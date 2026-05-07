import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, TrendingDown,
  ArrowLeftRight, LogOut, CreditCard,
  BarChart2, FileText, Target, MoreHorizontal, Zap, X, Shield, User, HelpCircle, Lock,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const INACTIVITY_MS = 10 * 60 * 1000
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']

const NAV_CORE = [
  { to: '/',             end: true, icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/transactions',            icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/income/add',              icon: TrendingUp,      label: 'Add Income',  accent: 'emerald' },
  { to: '/expense/add',             icon: TrendingDown,    label: 'Add Expense', accent: 'red'     },
]

const NAV_ACCOUNT = [
  { to: '/plans',   icon: CreditCard,  label: 'Plans'   },
  { to: '/account', icon: User,        label: 'Account' },
  { to: '/support', icon: HelpCircle,  label: 'Support' },
]

const NAV_PRO = [
  { to: '/insights', icon: BarChart2, label: 'Insights' },
  { to: '/reports',  icon: FileText,  label: 'Reports'  },
  { to: '/budgets',  icon: Target,    label: 'Budgets'  },
]

const NAV_MOBILE_CORE = [
  { to: '/',             end: true, icon: LayoutDashboard, label: 'Home'    },
  { to: '/transactions',            icon: ArrowLeftRight,  label: 'History' },
  { to: '/income/add',              icon: TrendingUp,      label: 'Income',  accent: 'emerald' },
  { to: '/expense/add',             icon: TrendingDown,    label: 'Expense', accent: 'red'     },
]

/* ── Desktop icon-only NavItem ─────────────────────────── */
function IconNavItem({ to, end, icon: Icon, label, accent }) {
  const accentActive = accent === 'emerald' ? 'text-emerald-400 bg-emerald-900/20'
    : accent === 'red' ? 'text-red-400 bg-red-900/20'
    : 'text-ink bg-surface'
  const accentIcon = accent === 'emerald' ? 'text-emerald-400'
    : accent === 'red' ? 'text-red-400' : 'text-ink'

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-150 ${
          isActive ? accentActive : 'text-dim/50 hover:text-ink hover:bg-surface/60'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={17} className={isActive ? accentIcon : 'text-dim/50'} strokeWidth={isActive ? 2.5 : 1.8} />
          {/* Tooltip */}
          <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-surface border border-line rounded-xl text-xs font-medium text-ink whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-card">
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

function IconNavItemLocked({ icon: Icon, label }) {
  return (
    <div className="group relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl opacity-30 cursor-not-allowed">
      <Icon size={17} className="text-dim/40" strokeWidth={1.8} />
      <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-surface border border-line rounded-xl text-xs font-medium text-ink whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-card flex items-center gap-1.5">
        <Lock size={9} className="text-brand-400" />
        {label} <span className="text-brand-400 font-bold">Pro</span>
      </span>
    </div>
  )
}

/* ── Mobile NavItem ────────────────────────────────────── */
function MobileNavItem({ to, end, icon: Icon, label, accent }) {
  const activeColor = accent === 'emerald' ? 'text-emerald-400' : accent === 'red' ? 'text-red-400' : 'text-brand-400'
  const activeDot   = accent === 'emerald' ? 'bg-emerald-400' : accent === 'red' ? 'bg-red-400' : 'bg-brand-400'

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold transition-colors relative ${
          isActive ? activeColor : 'text-dim/40 hover:text-dim'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full ${activeDot}`} />
          )}
          <Icon size={20} strokeWidth={isActive ? 2.5 : 1.6} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

/* ── Mobile More Sheet ─────────────────────────────────── */
function MobileMoreSheet({ open, onClose, isPro, isAdmin }) {
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null

  const proLinks = [
    { to: '/insights', icon: BarChart2, label: 'Insights', sub: 'Spending patterns & trends' },
    { to: '/reports',  icon: FileText,  label: 'Reports',  sub: 'Monthly summaries & exports' },
    { to: '/budgets',  icon: Target,    label: 'Budgets',  sub: 'Set limits & track spend' },
  ]

  const SheetLink = ({ to, icon: Icon, label, sub, locked = false, divider = false }) => (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors ${locked ? 'opacity-40 pointer-events-none' : ''} ${
          divider ? 'mt-1 border-t border-line pt-3' : ''
        } ${isActive ? 'bg-surface' : 'hover:bg-surface'}`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-brand-600' : 'bg-surface border border-line/60'}`}>
            <Icon size={18} className={isActive ? 'text-white' : 'text-dim'} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className={`text-sm font-semibold ${isActive ? 'text-ink' : 'text-ink/80'}`}>{label}</p>
              {locked && <span className="text-[9px] font-bold bg-brand-900/40 text-brand-400 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Pro</span>}
            </div>
            <p className="text-xs text-dim mt-0.5">{sub}</p>
          </div>
        </>
      )}
    </NavLink>
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-canvas rounded-t-3xl shadow-2xl px-4 pt-4 pb-8 border-t border-line/50">
        <div className="w-10 h-1 bg-line rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-base font-semibold text-ink">{isPro ? 'Pro Features' : 'More'}</span>
          <button onClick={onClose} className="p-1.5 rounded-lg text-dim hover:text-ink hover:bg-surface transition-colors">
            <X size={16} />
          </button>
        </div>

        {isPro ? (
          <div className="flex flex-col gap-1">
            {proLinks.map(({ to, icon, label, sub }) => (
              <SheetLink key={to} to={to} icon={icon} label={label} sub={sub} />
            ))}
            <SheetLink to="/plans"   icon={CreditCard} label="Plans"   sub="Manage your subscription" divider />
            <SheetLink to="/account" icon={User}       label="Account" sub="Profile & settings" />
            <SheetLink to="/support" icon={HelpCircle} label="Support" sub="Help & FAQs" />
            {isAdmin && <SheetLink to="/admin" icon={Shield} label="Admin" sub="User management" divider />}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 border border-brand-600/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <Zap size={14} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-semibold text-white">Upgrade to Pro</span>
                <span className="ml-auto text-xs font-semibold text-white/50 bg-white/10 px-2 py-0.5 rounded-full">£5/mo</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                Unlock Insights, Reports, Budget tracking, multi-currency, and more.
              </p>
              <NavLink to="/plans" onClick={onClose}
                className="flex items-center justify-center w-full py-3 rounded-xl bg-white text-brand-700 text-sm font-semibold hover:bg-brand-50 transition-colors">
                View plans
              </NavLink>
            </div>

            <div className="flex flex-col gap-1">
              {proLinks.map(({ to, icon, label, sub }) => (
                <SheetLink key={to} to={to} icon={icon} label={label} sub={sub} locked />
              ))}
            </div>

            <SheetLink to="/account" icon={User}       label="Account" sub="Profile & settings" />
            <SheetLink to="/support" icon={HelpCircle} label="Support" sub="Help & FAQs" />
            {isAdmin && <SheetLink to="/admin" icon={Shield} label="Admin" sub="User management" divider />}
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

  const signOutRef  = useRef(signOut)
  const navigateRef = useRef(navigate)
  signOutRef.current  = signOut
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

  const isPro   = profile?.plan === 'pro'
  const isAdmin = profile?.role === 'admin'

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

      {/* ── Desktop Icon-Only Sidebar ─────────────────── */}
      <aside className="hidden md:flex flex-col w-16 bg-canvas border-r border-line/30 fixed inset-y-0 left-0 z-20">

        {/* Logo mark */}
        <div className="flex items-center justify-center h-14 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-glow-sm">
            <span className="text-white font-bold text-sm">B</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col py-3 gap-1 overflow-y-auto">
          {NAV_CORE.map(item => <IconNavItem key={item.to} {...item} />)}

          <div className="my-2 mx-4 h-px bg-line/30" />

          {NAV_ACCOUNT.map(item => <IconNavItem key={item.to} {...item} />)}

          <div className="my-2 mx-4 h-px bg-line/30" />

          {isPro
            ? NAV_PRO.map(item => <IconNavItem key={item.to} {...item} />)
            : NAV_PRO.map(item => <IconNavItemLocked key={item.to} {...item} />)
          }

          {isAdmin && (
            <>
              <div className="my-2 mx-4 h-px bg-line/30" />
              <IconNavItem to="/admin" icon={Shield} label="Admin" />
            </>
          )}
        </nav>

        {/* Footer: upgrade nudge + avatar + signout */}
        <div className="flex flex-col items-center gap-2 pb-4 pt-3 border-t border-line/30 shrink-0">
          {!isPro && (
            <NavLink to="/plans" title="Upgrade to Pro"
              className="group relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl text-brand-400 hover:bg-brand-900/30 transition-all">
              <Zap size={16} strokeWidth={2.5} />
              <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-surface border border-line rounded-xl text-xs font-medium text-ink whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-card">
                Upgrade to Pro
              </span>
            </NavLink>
          )}
          <div className="group relative flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-surface border border-line/60 flex items-center justify-center cursor-default">
              <span className="text-ink text-[11px] font-bold">{initials}</span>
            </div>
            <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-surface border border-line rounded-xl text-xs font-medium text-ink whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-card">
              {user?.email}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="group relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl text-dim/40 hover:text-accent-red hover:bg-red-900/20 transition-all"
          >
            <LogOut size={15} />
            <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-surface border border-line rounded-xl text-xs font-medium text-ink whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-card">
              Sign out
            </span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────── */}
      <div className="flex-1 md:ml-16 flex flex-col min-h-screen overflow-x-hidden">

        {/* Mobile top bar */}
        <header className="md:hidden bg-canvas/90 backdrop-blur-md border-b border-line/40 sticky top-0 z-10">
          <div className="h-14 flex items-center justify-between px-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-ink text-sm leading-tight truncate">BudgetPilot</span>
                <span className="text-[9px] leading-tight font-medium text-dim/50">
                  {isPro ? 'Pro plan' : 'Free plan'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={profile?.currency ?? 'USD'}
                onChange={handleCurrencyChange}
                aria-label="Currency"
                className="text-xs font-medium text-dim bg-surface border border-line/60 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 transition"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
              <button
                onClick={handleSignOut}
                aria-label="Sign out"
                className="p-2 rounded-lg text-dim/50 hover:text-accent-red hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
          {showUpgradeMsg && (
            <div className="px-4 pb-2">
              <p className="text-[11px] font-medium text-amber-400 bg-amber-900/20 border border-amber-700/30 rounded-xl px-3 py-2 leading-snug">
                Upgrade to Pro (£5/mo) to use multiple currencies
              </p>
            </div>
          )}
        </header>

        <main className="flex-1 pb-24 md:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Nav ────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="w-full bg-canvas/88 backdrop-blur-xl border-t border-line/40 flex shadow-[0_-8px_40px_rgba(0,0,0,0.3)]">
          {NAV_MOBILE_CORE.map(item => <MobileNavItem key={item.to} {...item} />)}
          <button
            onClick={() => setShowMore(true)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold transition-colors relative ${
              showMore ? 'text-brand-400' : 'text-dim/40 hover:text-dim'
            }`}
          >
            {showMore && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-brand-400" />}
            {isPro
              ? <><MoreHorizontal size={20} strokeWidth={showMore ? 2.5 : 1.6} /><span>More</span></>
              : <><Zap size={20} strokeWidth={showMore ? 2.5 : 1.6} /><span>Upgrade</span></>
            }
          </button>
        </div>
      </nav>

      <MobileMoreSheet open={showMore} onClose={() => setShowMore(false)} isPro={isPro} isAdmin={isAdmin} />
    </div>
  )
}
