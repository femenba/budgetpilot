import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, TrendingDown,
  ArrowLeftRight, LogOut, User,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const NAV = [
  { to: '/',             end: true, icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/transactions',            icon: ArrowLeftRight,  label: 'Transactions' },
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
        `flex flex-col items-center gap-1 px-3 py-2 text-[10px] font-medium transition-colors ${
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

export function Layout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-20">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">BudgetPilot</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV.map(item => <NavItem key={item.to} {...item} />)}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.email}</p>
              <p className="text-[10px] text-gray-400">Free plan</p>
            </div>
          </div>
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
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden bg-white border-b border-gray-100 h-14 flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <span className="font-bold text-gray-900">BudgetPilot</span>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Nav ────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-20 flex">
        {NAV.map(item => <MobileNavItem key={item.to} {...item} />)}
      </nav>
    </div>
  )
}
