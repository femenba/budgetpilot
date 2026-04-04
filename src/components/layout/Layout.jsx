import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, TrendingDown,
  ArrowLeftRight, LogOut, CreditCard,
  BarChart2, FileText, Target,
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

// Mobile bottom nav: fixed 5 items regardless of plan
const NAV_MOBILE = [
  { to: '/',             end: true, icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/transactions',            icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/plans',                   icon: CreditCard,      label: 'Plans'        },
  { to: '/income/add',              icon: TrendingUp,      label: 'Add Income',  accent: 'emerald' },
  { to: '/expense/add',             icon: TrendingDown,    label: 'Add Expense', accent: 'red'     },
]

function NavItem({ to, end, icon: Icon, label, accent, onClick }) {
  const accentActive = accent === 'emerald'
    ? 'bg-emerald-50 text-emerald-700'
    : accent === 'red'
    ? 'bg-red-50 text-red-600'
    : 'bg-brand-50 text-brand-700'

  const accentIcon = accent === 'emerald'
    ? 'text-emerald-500'
    : accent === 'red'
    ? 'text-red-500'
    : 'text-brand-600'

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          isActive
            ? `${accentActive} font-semibold`
            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} className={isActive ? accentIcon : ''} strokeWidth={isActive ? 2.5 : 2} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

function MobileNavItem({ to, end, icon: Icon, label, accent }) {
  const accentColor = accent === 'emerald' ? 'text-emerald-500' : accent === 'red' ? 'text-red-500' : 'text-brand-600'

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors ${
          isActive ? accentColor : 'text-gray-400 hover:text-gray-600'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
          <span>{label.replace('Add ', '')}</span>
        </>
      )}
    </NavLink>
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
  const navigate = useNavigate()

  // Keep refs so the inactivity callback always uses the latest versions
  // without causing the effect to re-run (and reset the timer) on re-renders.
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
  }, []) // intentionally empty — refs keep callbacks current without restarting the timer

  const [showUpgradeMsg, setShowUpgradeMsg] = useState(false)
  const upgradeMsgTimer = useRef(null)

  const isPro = profile?.plan === 'pro'

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
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-20">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">BudgetPilot</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_CORE.map(item => <NavItem key={item.to} {...item} />)}

          <hr className="my-2 border-gray-100" />

          <NavItem to="/plans" icon={CreditCard} label="Plans" />

          {isPro && (
            <>
              <p className="px-3 pt-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pro</p>
              {NAV_PRO.map(item => <NavItem key={item.to} {...item} />)}
            </>
          )}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.email}</p>
              <p className="text-[10px] text-gray-400">{isPro ? 'Pro plan' : 'Free plan'}</p>
            </div>
          </div>
          <select
            value={profile?.currency ?? 'USD'}
            onChange={handleCurrencyChange}
            className="w-full px-3 py-2 rounded-xl border border-gray-100 bg-gray-50 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition mb-1"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          {showUpgradeMsg && (
            <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mb-1 leading-snug">
              Upgrade to Pro to use multiple currencies
            </p>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="h-14 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-gray-900 text-sm leading-tight truncate">BudgetPilot</span>
                <span className="text-[9px] leading-tight text-gray-400">{isPro ? 'Pro plan' : 'Free plan'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <select
                value={profile?.currency ?? 'USD'}
                onChange={handleCurrencyChange}
                aria-label="Currency"
                className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
              <button
                onClick={handleSignOut}
                aria-label="Sign out"
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
          {showUpgradeMsg && (
            <div className="px-4 pb-2">
              <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 leading-snug">
                Upgrade to Pro to use multiple currencies
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
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-20 flex">
        {NAV_MOBILE.map(item => <MobileNavItem key={item.to} {...item} />)}
      </nav>
    </div>
  )
}
