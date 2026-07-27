import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Search, ChevronDown, Menu, Sun, Moon, Zap, User, LogOut, Settings, X, Package, Truck, Tag, Award, Briefcase, FileText, Layers, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils'
import type { UserRole } from '../../types'

const ROLE_LABELS: Record<UserRole, string> = {
  platform_owner:      'Platform Owner',
  administrator:       'Administrator',
  catalog_manager:     'Catalog Manager',
  read_only:           'Read Only',
  super_admin:         'Platform Owner',
  admin:               'Administrator',
  integration_manager: 'Catalog Manager',
  operations_staff:    'Read Only',
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
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCategory, setSearchCategory] = useState('all')

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // ⌘K Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearchModal(prev => !prev)
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
    <>
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

        {/* Search Bar Trigger */}
        <div
          className="relative flex-1 max-w-md hidden sm:block cursor-pointer"
          onClick={() => setShowSearchModal(true)}
        >
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            readOnly
            placeholder="Search products, suppliers, brands, SKUs, jobs..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-200 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 dark:text-slate-100 cursor-pointer"
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

      {/* Global Search Modal Overlay */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            {/* Modal Search Bar Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <Search size={18} className="text-primary-600 dark:text-primary-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Products, Suppliers, Manufacturers, Brands, Categories, SKUs, Jobs, Logs..."
                className="w-full text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="btn-icon text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Category Filter Pills */}
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-hide bg-slate-50/50 dark:bg-slate-950/40">
              {[
                { id: 'all', label: 'All Results' },
                { id: 'products', label: 'Products' },
                { id: 'suppliers', label: 'Suppliers' },
                { id: 'manufacturers', label: 'Manufacturers' },
                { id: 'brands', label: 'Brands' },
                { id: 'categories', label: 'Categories' },
                { id: 'skus', label: 'SKUs' },
                { id: 'jobs', label: 'Jobs' },
                { id: 'logs', label: 'Logs' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSearchCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-2xs font-bold whitespace-nowrap transition-all ${
                    searchCategory === cat.id
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Results List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {searchQuery.trim() === '' ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Type to search across SupplyBridge Master Catalog, Suppliers, SKUs, and Background Jobs.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Package size={16} className="text-primary-600 dark:text-primary-400" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{searchQuery} - Master Product SKU</p>
                        <p className="text-2xs text-slate-400">Master Catalog Product Result</p>
                      </div>
                    </div>
                    <span className="text-2xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">Product</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Truck size={16} className="text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">TechParts International Supplier</p>
                        <p className="text-2xs text-slate-400">REST API Connection Partner</p>
                      </div>
                    </div>
                    <span className="text-2xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">Supplier</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Briefcase size={16} className="text-cyan-600 dark:text-cyan-400" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Inventory Sync Execution Job</p>
                        <p className="text-2xs text-slate-400">Background Sync Job ID: job_84290</p>
                      </div>
                    </div>
                    <span className="text-2xs font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full">Job</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-2xs text-slate-400 font-semibold">
              <span>Press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono">ESC</kbd> to close</span>
              <span>SupplyBridge Enterprise Global Search</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
