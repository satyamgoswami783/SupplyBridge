import React, { createContext, useContext, useState } from 'react'
import type { UserRole, User } from '../types'
import { Lock, Mail, Shield, Zap, ArrowRight, CheckCircle2, UserCheck, Layers, RefreshCw, Globe, Database } from 'lucide-react'

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-mesh relative overflow-hidden">
        {/* Ambient background glow accents */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

        {/* 2-Column Responsive Card */}
        <div className="max-w-5xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
          
          {/* Left Column: FULL DISPLAY HERO IMAGE COVER */}
          <div className="lg:col-span-5 relative min-h-[450px] lg:min-h-full flex flex-col justify-between p-8 lg:p-10 text-white overflow-hidden">
            {/* Full Display Background Cover Image */}
            <img
              src="/login_hero.png"
              alt="SupplyBridge Middleware Architecture"
              className="absolute inset-0 w-full h-full object-cover z-0 scale-105"
            />
            {/* Dark Gradient Overlay for high text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-indigo-950/80 z-10" />

            {/* Top Brand Logo */}
            <div className="relative z-20">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black shadow-lg border border-white/20">
                  <Zap size={22} />
                </div>
                <div>
                  <h1 className="font-extrabold text-white text-lg tracking-tight">SupplyBridge</h1>
                  <p className="text-2xs text-cyan-300 font-bold uppercase tracking-wider">Enterprise Middleware & PIM</p>
                </div>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-white mb-3 leading-tight drop-shadow-md">
                Centralized Product & Supplier Hub
              </h2>
              <p className="text-xs text-slate-200 leading-relaxed mb-6 font-medium drop-shadow-sm">
                Automated multi-supplier normalization, inventory sync & Shift4Shop publishing engine.
              </p>

              {/* Feature Points */}
              <div className="space-y-2.5">
                {[
                  { icon: <Database size={14} />, text: 'Single Source of Truth Master Catalog' },
                  { icon: <RefreshCw size={14} />, text: 'Real-time Inventory & Pricing Pipeline' },
                  { icon: <Globe size={14} />, text: 'Multi-Storefront Validation & Sync' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-white font-bold bg-slate-900/60 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/20">
                    <span className="text-cyan-400">{f.icon}</span>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Status Indicator */}
            <div className="relative z-20 flex items-center justify-between pt-6 border-t border-white/20 mt-8">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-glow-emerald" />
                <span className="text-xs font-bold text-white">Live Data Middleware Active</span>
              </div>
              <span className="text-2xs text-slate-300 font-semibold">ISO 27001</span>
            </div>
          </div>

          {/* Right Column: Interactive Login Form & Role Selector */}
          <div className="lg:col-span-7 p-8 lg:p-10 bg-white flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In</h2>
                <p className="text-xs font-medium text-slate-500 mt-1">Enter your credentials or choose a quick demo role to autofill.</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                    <Mail size={13} className="text-slate-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@supplybridge.io"
                    className="input focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                    <Lock size={13} className="text-slate-400" /> Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="input focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                {/* Main Login Button */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="btn-primary w-full py-3 text-sm font-bold shadow-md shadow-indigo-500/20 mt-2"
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
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                <span className="relative px-3 bg-white text-2xs uppercase tracking-wider text-slate-400 font-bold">
                  Or Auto-fill Quick Role Preset
                </span>
              </div>

              {/* 5 Role Preset Buttons */}
              <div className="space-y-2">
                {ROLE_PRESETS.map(preset => {
                  const isSelected = selectedRole === preset.role && email === preset.email
                  return (
                    <button
                      key={preset.role}
                      type="button"
                      onClick={() => handleRoleSelect(preset)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group ${
                        isSelected
                          ? 'bg-primary-50/90 border-primary-500 ring-2 ring-primary-500/20'
                          : 'bg-slate-50/70 border-slate-200/90 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${preset.color} flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0`}>
                          {preset.label.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-primary-700 transition-colors">
                              {preset.label}
                            </p>
                            {isSelected && <span className="text-2xs bg-primary-600 text-white font-bold px-2 py-0.5 rounded-full">Selected</span>}
                          </div>
                          <p className="text-2xs text-slate-500 truncate">{preset.email}</p>
                        </div>
                      </div>

                      <span className="text-xs text-primary-600 font-bold opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
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
