import React, { createContext, useContext, useState } from 'react'
import type { UserRole, User } from '../types'
import { Lock, Mail, Shield, Zap, ArrowRight, CheckCircle2, UserCheck } from 'lucide-react'

interface AuthContextType {
  currentUser: User
  role: UserRole
  setRole: (role: UserRole) => void
  hasPermission: (module: string) => boolean
  logout: () => void
  viewProfileUser: User | null
  setViewProfileUser: (user: User | null) => void
  openCurrentUserProfile: () => void
}

const rolePermissions: Record<UserRole, string[]> = {
  super_admin:         ['*'],
  admin:               ['dashboard', 'suppliers', 'integrations', 'catalog', 'products', 'categories', 'brands', 'variants', 'mapping', 'validation', 'inventory_sync', 'pricing_sync', 'image_sync', 'store_management', 'website_sync', 'sync_jobs', 'import_queue', 'logs', 'monitoring', 'reports', 'users', 'roles', 'permissions', 'settings'],
  catalog_manager:     ['dashboard', 'catalog', 'products', 'categories', 'brands', 'variants', 'mapping', 'validation'],
  integration_manager: ['dashboard', 'suppliers', 'integrations', 'mapping', 'inventory_sync', 'pricing_sync', 'image_sync', 'website_sync', 'sync_jobs', 'import_queue', 'logs'],
  operations_staff:    ['dashboard', 'validation', 'monitoring', 'reports', 'logs'],
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
  const [role, setRole] = useState<UserRole>('super_admin')
  const [viewProfileUser, setViewProfileUser] = useState<User | null>(null)
  const [isLoggedOut, setIsLoggedOut] = useState(false)

  // Login form states
  const [email, setEmail] = useState('alex@supplybridge.io')
  const [password, setPassword] = useState('••••••••••••')
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const currentUser = demoUsers[role]

  const hasPermission = (module: string): boolean => {
    const perms = rolePermissions[role]
    return perms.includes('*') || perms.includes(module)
  }

  const logout = () => {
    setIsLoggedOut(true)
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
      setIsLoggedOut(false)
      setIsLoggingIn(false)
    }, 400)
  }

  if (isLoggedOut) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />

        <div className="card max-w-lg w-full p-8 bg-slate-900/90 border-slate-800 text-white shadow-2xl backdrop-blur-xl relative z-10 rounded-3xl">
          {/* Header Branding */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-3 shadow-glow-primary text-white">
              <Zap size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">SupplyBridge Enterprise</h1>
            <p className="text-xs text-slate-400 mt-1">Middleware + PIM + Supplier Integration Platform</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Lock size={13} className="text-slate-400" /> Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            {/* Main Login Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 rounded-xl bg-gradient-primary hover:opacity-95 text-white font-bold text-sm shadow-glow-primary flex items-center justify-center gap-2 transition-all duration-200"
            >
              {isLoggingIn ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Dashboard <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
            <span className="relative px-3 bg-slate-900 text-2xs uppercase tracking-wider text-slate-500 font-semibold">
              Or Auto-fill Quick Role Preset
            </span>
          </div>

          {/* 5 Quick Role Preset Buttons */}
          <div className="space-y-2">
            {ROLE_PRESETS.map(preset => {
              const isSelected = selectedRole === preset.role && email === preset.email
              return (
                <button
                  key={preset.role}
                  type="button"
                  onClick={() => handleRoleSelect(preset)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group ${
                    isSelected
                      ? 'bg-slate-800 border-primary-500 ring-2 ring-primary-500/30'
                      : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${preset.color} flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0`}>
                      {preset.label.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white group-hover:text-primary-300 transition-colors">
                          {preset.label}
                        </p>
                        {isSelected && <span className="text-2xs bg-primary-500/20 text-primary-300 font-semibold px-2 py-0.5 rounded-full">Selected</span>}
                      </div>
                      <p className="text-2xs text-slate-400 truncate">{preset.email}</p>
                    </div>
                  </div>

                  <span className="text-xs text-slate-500 group-hover:text-slate-300 font-medium transition-colors">
                    Click to fill →
                  </span>
                </button>
              )
            })}
          </div>

          {/* Footer note */}
          <p className="text-2xs text-slate-500 text-center mt-6">
            SupplyBridge Enterprise Middleware & Platform Security System © 2026
          </p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      role,
      setRole,
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
