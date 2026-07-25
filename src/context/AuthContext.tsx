import React, { createContext, useContext, useState } from 'react'
import type { UserRole, User } from '../types'
import { Lock, Mail, Shield, Zap, ArrowRight, CheckCircle2, UserCheck, Layers, RefreshCw, Globe, Database } from 'lucide-react'

interface AuthContextType {
  currentUser: User
  role: UserRole
  setRole: (role: UserRole) => void
  permissionsConfig: Record<UserRole, string[]>
  updateRolePermission: (targetRole: UserRole, module: string, hasAccess: boolean) => void
  setBulkRolePermissions: (targetRole: UserRole, modules: string[]) => void
  resetPermissionsToDefault: () => void
  hasPermission: (module: string) => boolean
  logout: () => void
  viewProfileUser: User | null
  setViewProfileUser: (user: User | null) => void
  openCurrentUserProfile: () => void
}

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin:         ['*'],
  admin:               ['dashboard', 'suppliers', 'catalog', 'products', 'categories', 'brands', 'variants', 'mapping', 'validation', 'inventory_sync', 'pricing_sync', 'image_sync', 'store_management', 'website_sync', 'sync_jobs', 'import_queue', 'logs', 'monitoring', 'reports'],
  catalog_manager:     ['dashboard', 'catalog', 'products', 'categories', 'brands', 'variants', 'mapping', 'validation', 'reports'],
  integration_manager: ['dashboard', 'suppliers', 'integrations', 'mapping', 'inventory_sync', 'pricing_sync', 'image_sync', 'website_sync', 'sync_jobs', 'import_queue', 'logs', 'monitoring', 'reports'],
  operations_staff:    ['dashboard', 'validation', 'monitoring', 'reports', 'logs', 'sync_jobs', 'import_queue'],
}

const demoUsers: Record<UserRole, User> = {
  super_admin:         { id: 'u1', name: 'Alex Morrison', email: 'alex@supplybridge.io', role: 'super_admin', status: 'active', createdAt: '2024-01-01T00:00:00Z', department: 'Executive Management' },
  admin:               { id: 'u2', name: 'Sarah Kim', email: 'sarah@supplybridge.io', role: 'admin', status: 'active', createdAt: '2024-02-15T00:00:00Z', department: 'Platform Operations' },
  catalog_manager:     { id: 'u3', name: 'James Patel', email: 'jpatel@supplybridge.io', role: 'catalog_manager', status: 'active', createdAt: '2024-04-01T00:00:00Z', department: 'Catalog & Merchandising' },
  integration_manager: { id: 'u4', name: 'Emily Chen', email: 'echen@supplybridge.io', role: 'integration_manager', status: 'active', createdAt: '2024-05-10T00:00:00Z', department: 'Supplier Integration' },
  operations_staff:    { id: 'u5', name: 'Marcus Johnson', email: 'mjohnson@supplybridge.io', role: 'operations_staff', status: 'active', createdAt: '2024-07-20T00:00:00Z', department: 'System Monitoring' },
}

const ROLE_PRESETS: { role: UserRole; label: string; email: string; desc: string; color: string }[] = [
  { role: 'super_admin',         label: 'Super Admin',         email: 'alex@supplybridge.io',     desc: 'Full Platform Access & Control',   color: 'from-purple-600 to-indigo-600' },
  { role: 'admin',               label: 'Admin',               email: 'sarah@supplybridge.io',    desc: 'Daily Platform Operations',        color: 'from-indigo-600 to-blue-600' },
  { role: 'catalog_manager',     label: 'Catalog Manager',     email: 'jpatel@supplybridge.io',   desc: 'PIM, Products & Validation',       color: 'from-blue-600 to-cyan-600' },
  { role: 'integration_manager', label: 'Integration Manager', email: 'echen@supplybridge.io',    desc: 'Suppliers, FTP/API & Sync Jobs',    color: 'from-cyan-600 to-teal-600' },
  { role: 'operations_staff',    label: 'Operations Staff',    email: 'mjohnson@supplybridge.io', desc: 'Monitoring, Logs & Reports',       color: 'from-emerald-600 to-slate-700' },
]

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('supplybridge_role') as UserRole
    return (savedRole && demoUsers[savedRole]) ? savedRole : 'super_admin'
  })

  const [permissionsConfig, setPermissionsConfig] = useState<Record<UserRole, string[]>>(() => {
    const saved = localStorage.getItem('supplybridge_permissions_config')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        return DEFAULT_ROLE_PERMISSIONS
      }
    }
    return DEFAULT_ROLE_PERMISSIONS
  })

  const [viewProfileUser, setViewProfileUser] = useState<User | null>(null)
  const [isLoggedOut, setIsLoggedOutState] = useState<boolean>(() => {
    return localStorage.getItem('supplybridge_is_logged_out') === 'true'
  })

  // Login form states
  const [email, setEmail] = useState('alex@supplybridge.io')
  const [password, setPassword] = useState('••••••••••••')
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const currentUser = demoUsers[role]

  const setRole = (newRole: UserRole) => {
    localStorage.setItem('supplybridge_role', newRole)
    setRoleState(newRole)
  }

  const updateRolePermission = (targetRole: UserRole, moduleKey: string, hasAccess: boolean) => {
    setPermissionsConfig(prev => {
      const currentList = prev[targetRole] || []
      let updated: string[] = []
      if (hasAccess) {
        updated = currentList.includes(moduleKey) ? currentList : [...currentList, moduleKey]
      } else {
        updated = currentList.filter(m => m !== moduleKey)
      }
      const nextConfig = { ...prev, [targetRole]: updated }
      localStorage.setItem('supplybridge_permissions_config', JSON.stringify(nextConfig))
      return nextConfig
    })
  }

  const setBulkRolePermissions = (targetRole: UserRole, modules: string[]) => {
    setPermissionsConfig(prev => {
      const nextConfig = { ...prev, [targetRole]: modules }
      localStorage.setItem('supplybridge_permissions_config', JSON.stringify(nextConfig))
      return nextConfig
    })
  }

  const resetPermissionsToDefault = () => {
    setPermissionsConfig(DEFAULT_ROLE_PERMISSIONS)
    localStorage.setItem('supplybridge_permissions_config', JSON.stringify(DEFAULT_ROLE_PERMISSIONS))
  }

  const hasPermission = (moduleKey: string): boolean => {
    const perms = permissionsConfig[role] || []
    return perms.includes('*') || perms.includes(moduleKey)
  }

  const logout = () => {
    localStorage.setItem('supplybridge_is_logged_out', 'true')
    setIsLoggedOutState(true)
  }

  const openCurrentUserProfile = () => {
    setViewProfileUser(currentUser)
  }

  const handleRoleSelect = (preset: typeof ROLE_PRESETS[0]) => {
    setSelectedRole(preset.role)
    setEmail(preset.email)
    setPassword('••••••••••••')
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)

    // Find role matching email if entered manually
    const matchedRole = (Object.keys(demoUsers) as UserRole[]).find(
      r => demoUsers[r].email.toLowerCase() === email.toLowerCase()
    ) || selectedRole

    setTimeout(() => {
      setRole(matchedRole)
      localStorage.setItem('supplybridge_is_logged_out', 'false')
      setIsLoggedOutState(false)
      setIsLoggingIn(false)
    }, 400)
  }

  if (isLoggedOut) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-2.5 sm:p-6 lg:p-8 bg-gradient-mesh relative overflow-y-auto">
        {/* Ambient background glow accents */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl" />

        {/* 2-Column Responsive Card */}
        <div className="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 my-auto">
          
          {/* Left Column: FULL DISPLAY GOLDEN HERO IMAGE COVER */}
          <div className="hidden lg:flex lg:col-span-5 relative min-h-0 flex-col justify-between p-6 lg:p-8 text-white overflow-hidden">
            {/* Full Display Background Cover Image */}
            <img
              src="/login_hero_golden.png"
              alt="SupplyBridge Middleware Architecture"
              className="absolute inset-0 w-full h-full object-cover z-0 scale-105"
            />
            {/* Dark Golden Gradient Overlay for high text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-amber-950/40 z-10" />

            {/* Top Brand Logo */}
            <div className="relative z-20">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 rounded-xl bg-amber-500/30 backdrop-blur-md flex items-center justify-center text-white font-black shadow-lg border border-amber-400/40">
                  <Zap size={20} className="text-amber-400 fill-amber-400/20 animate-pulse" />
                </div>
                <div>
                  <h1 className="font-extrabold text-white text-base tracking-tight">SupplyBridge</h1>
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Enterprise Middleware & PIM</p>
                </div>
              </div>

              <h2 className="text-2xl font-black tracking-tight text-white mb-2 leading-tight drop-shadow-md">
                Centralized Product & Supplier Hub
              </h2>
              <p className="text-xs text-slate-200 leading-relaxed mb-4 font-medium drop-shadow-sm">
                Automated multi-supplier normalization, inventory sync & Shift4Shop publishing engine.
              </p>

              {/* Feature Points */}
              <div className="space-y-2">
                {[
                  { icon: <Database size={13} />, text: 'Single Source of Truth Master Catalog' },
                  { icon: <RefreshCw size={13} />, text: 'Real-time Inventory & Pricing Pipeline' },
                  { icon: <Globe size={13} />, text: 'Multi-Storefront Validation & Sync' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-2xs text-white font-bold bg-slate-950/70 backdrop-blur-md px-3 py-2 rounded-lg border border-amber-500/30">
                    <span className="text-amber-400">{f.icon}</span>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Status Indicator */}
            <div className="relative z-20 flex items-center justify-between pt-4 border-t border-white/20 mt-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-glow-emerald" />
                <span className="text-2xs font-bold text-white">Live Data Middleware Active</span>
              </div>
              <span className="text-[10px] text-slate-300 font-semibold">ISO 27001</span>
            </div>
          </div>

          {/* Right Column: Interactive Login Form & Role Selector */}
          <div className="lg:col-span-7 p-3.5 sm:p-6 lg:p-8 bg-white dark:bg-slate-900 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-3">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Sign In</h2>
                <p className="text-2xs sm:text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Enter your credentials or choose a quick demo role to autofill.</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                    <Mail size={12} className="text-slate-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@supplybridge.io"
                    className="input py-1.5 px-3 text-xs focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                    <Lock size={12} className="text-slate-400" /> Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="input py-1.5 px-3 text-xs focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                {/* Main Login Button */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="btn-primary w-full py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-amber-500/25 mt-1"
                >
                  {isLoggingIn ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In to Dashboard <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
                <span className="relative px-2 bg-white dark:bg-slate-900 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
                  Or Auto-fill Quick Role Preset
                </span>
              </div>

              {/* 5 Role Preset Buttons */}
              <div className="space-y-1.5">
                {ROLE_PRESETS.map(preset => {
                  const isSelected = selectedRole === preset.role && email === preset.email
                  return (
                    <button
                      key={preset.role}
                      type="button"
                      onClick={() => handleRoleSelect(preset)}
                      className={`w-full p-1.5 px-2.5 rounded-lg border text-left transition-all duration-150 flex items-center justify-between gap-2 group ${
                        isSelected
                          ? 'bg-amber-50/90 dark:bg-amber-950/80 border-amber-500 dark:border-amber-500 ring-1 ring-amber-500/20'
                          : 'bg-slate-50/70 dark:bg-slate-800/80 border-slate-200/90 dark:border-slate-700/80 hover:bg-amber-50/50 dark:hover:bg-slate-800 hover:border-amber-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${preset.color} flex items-center justify-center text-white text-[10px] font-bold shadow-2xs flex-shrink-0`}>
                          {preset.label.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                              {preset.label}
                            </p>
                            {isSelected && <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-full flex-shrink-0">Selected</span>}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{preset.email}</p>
                        </div>
                      </div>

                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold opacity-80 group-hover:opacity-100 transition-all flex-shrink-0">
                        Fill →
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      role,
      setRole,
      permissionsConfig,
      updateRolePermission,
      setBulkRolePermissions,
      resetPermissionsToDefault,
      hasPermission,
      logout,
      viewProfileUser,
      setViewProfileUser,
      openCurrentUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
