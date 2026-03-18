import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, Store, UtensilsCrossed,
  ShoppingBag, CreditCard, LogOut, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/customers',    icon: Users,            label: 'Customers'   },
  { to: '/restaurants',  icon: Store,            label: 'Restaurants' },
  { to: '/menu-items',   icon: UtensilsCrossed,  label: 'Menu Items'  },
  { to: '/orders',       icon: ShoppingBag,      label: 'Orders'      },
  { to: '/payments',     icon: CreditCard,       label: 'Payments'    },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-surface-800 border-r border-surface-600
                      flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-600">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">FoodDesk</span>
        </div>
        <p className="text-surface-300 text-xs mt-2 font-body">Delivery Management</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} className="flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-surface-600">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-700/50 mb-2">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30
                          flex items-center justify-center flex-shrink-0">
            <span className="text-brand-400 font-display font-bold text-sm">
              {user?.username?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-display font-medium truncate">{user?.username}</p>
            <p className="text-surface-300 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
