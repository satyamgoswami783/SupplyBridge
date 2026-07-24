import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Search, ChevronDown, Menu, Sun, Moon, Zap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils'
import type { UserRole } from '../../types'

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin:         'Super Admin',
  admin:               'Admin',
  catalog_manager:     'Catalog Manager',
  integration_manager: 'Integration Manager',
  operations_staff:    'Operations Staff',
}

interface HeaderProps {
  onMenuClick: () => void
  darkMode: boolean
  onToggleDark: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, darkMode, onToggleDark }) => {
  const { currentUser, role, setRole } = useAuth()
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const notifications = [
    { id: 1, message: 'QuickShip sync failed — 256 items', time: '1 min ago', type: 'error' },
    { id: 2, message: 'AcmeDistributors FTP connection error', time: '23 min ago', type: 'warning' },
    { id: 3, message: 'Inventory sync completed — PrimeSup', time: '32 min ago', type: 'success' },
    { id: 4, message: '5 products pending validation review', time: '1 hr ago', type: 'info' },
  ]

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 h-14 flex items-center px-4 gap-4">
      {/* Mobile menu */}
      <button onClick={onMenuClick} className="lg:hidden btn-icon">
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search products, suppliers, jobs..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-100 border border-transparent focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder-slate-400"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-block px-1.5 py-0.5 text-2xs font-medium text-slate-400 bg-slate-200 rounded">⌘K</kbd>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Dark mode toggle */}
        <button onClick={onToggleDark} className="btn-icon">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn-icon relative"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 card shadow-card-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-sm">Notifications</span>
                <span className="badge-danger">4 new</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <Link
                    key={n.id}
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer block text-left"
                  >
                    <p className="text-sm text-slate-700">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                  </Link>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-primary-600 font-medium hover:text-primary-700 block w-full py-1"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Role switcher (demo) */}
        <div className="relative ml-1">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center text-xs font-bold text-white">
              {getInitials(currentUser.name)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-none">{currentUser.name}</p>
              <p className="text-2xs text-slate-500 mt-0.5">{ROLE_LABELS[role]}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-10 w-56 card shadow-card-lg z-50 p-1.5 overflow-hidden">
              <div className="px-3 py-2 mb-1">
                <p className="text-2xs text-slate-400 font-medium uppercase tracking-wider">Switch Role (Demo)</p>
              </div>
              {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setShowRoleMenu(false) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-slate-50 flex items-center gap-2 ${r === role ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-700'}`}
                >
                  {r === role && <Zap size={12} className="text-primary-600" />}
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
