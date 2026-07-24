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
  admin:               ['dashboard', 'suppliers', 'catalog', 'products', 'categories', 'brands', 'variants', 'mapping', 'validation', 'inventory_sync', 'pricing_sync', 'image_sync', 'store_management', 'website_sync', 'sync_jobs', 'import_queue', 'logs', 'reports'],
  catalog_manager:     ['dashboard', 'catalog', 'products', 'categories', 'brands', 'variants', 'mapping', 'validation', 'reports'],
  integration_manager: ['dashboard', 'suppliers', 'integrations', 'import_queue', 'sync_jobs', 'inventory_sync', 'pricing_sync', 'image_sync', 'logs', 'monitoring', 'reports'],
  operations_staff:    ['dashboard', 'validation', 'monitoring', 'reports', 'logs', 'sync_jobs'],
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

  const hasPermission = (module: string): boolean => {
    const perms = rolePermissions[role]
    return perms.includes('*') || perms.includes(module)
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
              <div className="space-y-3 pt-2">
                {[
                  { icon: <Database size={15} className="text-cyan-400" />, text: 'PIM Master Catalog Normalization' },
                  { icon: <RefreshCw size={15} className="text-emerald-400" />, text: 'Real-time Stock & Price Sync Engine' },
                  { icon: <Globe size={15} className="text-indigo-400" />, text: 'Multi-Storefront Shift4Shop Automation' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200 font-semibold bg-slate-900/40 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
                    {item.icon}
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Tagline */}
            <div className="relative z-20 pt-8 text-2xs text-slate-300 font-medium">
              Enterprise Integration Engine v2.4 · Multi-Tenant Architecture
            </div>
          </div>

          {/* Right Column: LOGIN FORM & ROLE SELECTOR */}
          <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Account Authentication</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Select a role profile or enter enterprise credentials</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                  <Shield size={13} strokeWidth={2.5} />
                  <span>2FA Active</span>
                </div>
              </div>

              {/* Quick Role Selector Chips */}
              <div className="mb-6">
                <label className="text-2xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Select Role Persona (Demo Mode)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ROLE_PRESETS.map((preset) => {
                    const isSelected = selectedRole === preset.role
                    return (
                      <button
                        key={preset.role}
                        type="button"
                        onClick={() => handleRoleSelect(preset)}
                        className={`p-2.5 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20 scale-[1.02]'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <p className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                            {preset.label}
                          </p>
                          <p className={`text-3xs mt-0.5 font-medium line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {preset.desc}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex justify-end mt-1">
                            <CheckCircle2 size={12} className="text-cyan-400" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    User Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input pl-10 h-11 text-sm bg-slate-50 border-slate-200 focus:bg-white"
                      placeholder="user@supplybridge.io"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">Password</label>
                    <span className="text-2xs text-primary-600 font-bold hover:underline cursor-pointer">
                      Forgot Password?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pl-10 h-11 text-sm bg-slate-50 border-slate-200 focus:bg-white"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full h-11 btn-primary text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30 transition-all rounded-2xl mt-2"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Footer Security Info */}
            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Shield size={12} className="text-emerald-500" /> TLS 1.3 Encrypted Session
              </span>
              <span>SupplyBridge Enterprise PIM v2.4</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        setRole,
        hasPermission,
        logout,
        viewProfileUser,
        setViewProfileUser,
        openCurrentUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
