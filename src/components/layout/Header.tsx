import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
  const { currentUser, role, logout, openCurrentUserProfile } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const notifications = [
    { id: 1, message: 'QuickShip sync failed — 256 items', time: '1 min ago', type: 'error' },
    { id: 2, message: 'AcmeDistributors FTP connection error', time: '23 min ago', type: 'warning' },
    { id: 3, message: 'Inventory sync completed — PrimeSup', time: '32 min ago', type: 'success' },
    { id: 4, message: '5 products pending validation review', time: '1 hr ago', type: 'info' },
  ]

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-14 flex items-center px-3 sm:px-4 gap-3 sm:gap-4 transition-colors duration-200">
      {/* Mobile menu & Glowing Brand Badge */}
      <div className="flex items-center gap-2 lg:hidden">
        <button onClick={onMenuClick} className="btn-icon text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-violet-600 to-cyan-400 p-[1.5px] shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center text-white">
              <Zap size={15} className="text-amber-400 fill-amber-400/20 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-black text-slate-900 dark:text-white text-sm tracking-tight">SupplyBridge</span>
              <span className="text-[8px] font-black bg-amber-500 text-white px-1 py-0.2 rounded-full uppercase">PRO</span>
            </div>
            <span className="text-[9px] font-black text-amber-600 dark:text-cyan-400 uppercase tracking-wider block leading-none">Enterprise PIM</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Search products, suppliers, jobs..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-200 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 dark:text-slate-100"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-block px-1.5 py-0.5 text-2xs font-medium text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-700/80 rounded">⌘K</kbd>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className={`btn-icon transition-colors ${darkMode ? 'text-amber-400 bg-slate-800 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn-icon relative dark:text-slate-300 dark:hover:bg-slate-800"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>
          {showNotifications && (
            <div className="fixed inset-x-3 top-14 sm:absolute sm:inset-x-auto sm:right-0 sm:top-10 sm:w-80 card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notifications</span>
                <span className="badge-danger">4 new</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <Link
                    key={n.id}
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer block text-left"
                  >
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-snug">{n.message}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{n.time}</p>
                  </Link>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 block w-full py-1"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative ml-1" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="User Profile & Account"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-primary-500/20">
              {getInitials(currentUser.name)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">{currentUser.name}</p>
              <p className="text-2xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{ROLE_LABELS[role]}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 dark:text-slate-500 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="fixed right-3 top-14 sm:absolute sm:inset-x-auto sm:right-0 sm:top-11 w-60 card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card-lg z-50 p-2 overflow-hidden">
              {/* User info preview header */}
              <div
                onClick={() => { setShowProfileMenu(false); openCurrentUserProfile(); }}
                className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl mb-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 border border-slate-100 dark:border-slate-750"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center text-sm font-bold text-white">
                  {getInitials(currentUser.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{currentUser.name}</p>
                  <p className="text-2xs text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                </div>
              </div>

              {/* View Profile Action */}
              <button
                onClick={() => { setShowProfileMenu(false); openCurrentUserProfile(); }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <User size={14} className="text-slate-500 dark:text-slate-400" />
                View Full Profile
              </button>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5" />

              {/* Logout Action */}
              <button
                onClick={() => { setShowProfileMenu(false); logout(); }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
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
