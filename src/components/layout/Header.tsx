import React, { useState } from 'react'
import { Bell, Search, ChevronDown, Menu, Sun, Moon, Zap, User, LogOut, Settings } from 'lucide-react'
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
  const { currentUser, role, setRole, logout, openCurrentUserProfile } = useAuth()
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
        <button onClick={onToggleDark} className="btn-icon" title="Toggle theme">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn-icon relative"
            title="Notifications"
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
                  <div key={n.id} className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                    <p className="text-sm text-slate-700">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                <button className="text-xs text-primary-600 font-medium hover:text-primary-700">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile & Role switcher */}
        <div className="relative ml-1">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            title="User Profile & Settings"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-primary-500/20">
              {getInitials(currentUser.name)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</p>
              <p className="text-2xs text-slate-500 font-medium mt-0.5">{ROLE_LABELS[role]}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-11 w-64 card shadow-card-lg z-50 p-2 overflow-hidden border border-slate-200">
              {/* User info preview header */}
              <div
                onClick={() => { setShowRoleMenu(false); openCurrentUserProfile(); }}
                className="p-3 bg-slate-50 rounded-xl mb-2 cursor-pointer hover:bg-slate-100 transition-colors flex items-center gap-3 border border-slate-100"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center text-sm font-bold text-white">
                  {getInitials(currentUser.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                </div>
                <User size={16} className="text-slate-400" />
              </div>

              {/* View Profile Action */}
              <button
                onClick={() => { setShowRoleMenu(false); openCurrentUserProfile(); }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 mb-1"
              >
                <User size={14} className="text-slate-500" />
                View Full Profile
              </button>

              <div className="h-px bg-slate-100 my-1.5" />

              {/* Role Switcher */}
              <div className="px-3 py-1 mb-1">
                <p className="text-2xs text-slate-400 font-semibold uppercase tracking-wider">Switch Role (RBAC Demo)</p>
              </div>
              <div className="space-y-0.5">
                {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
                  <button
                    key={r}
                    onClick={() => { setRole(r); setShowRoleMenu(false) }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${r === role ? 'bg-primary-50 text-primary-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <span>{ROLE_LABELS[r]}</span>
                    {r === role && <Zap size={12} className="text-primary-600" />}
                  </button>
                ))}
              </div>

              <div className="h-px bg-slate-100 my-2" />

              {/* Logout Action */}
              <button
                onClick={() => { setShowRoleMenu(false); logout(); }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <LogOut size={14} className="text-rose-500" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
