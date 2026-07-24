import React, { createContext, useContext, useState } from 'react'
import type { UserRole, User } from '../types'

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

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('super_admin')
  const [viewProfileUser, setViewProfileUser] = useState<User | null>(null)
  const [isLoggedOut, setIsLoggedOut] = useState(false)

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

  const handleLogin = (selectedRole: UserRole = 'super_admin') => {
    setRole(selectedRole)
    setIsLoggedOut(false)
  }

  if (isLoggedOut) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center bg-slate-800 border-slate-700 text-white shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 text-2xl shadow-glow-primary">
            ⚡
          </div>
          <h2 className="text-2xl font-bold mb-2">Logged Out</h2>
          <p className="text-slate-400 text-sm mb-6">You have been logged out of SupplyBridge Enterprise PIM platform.</p>
          <div className="space-y-3">
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Log back in as:</p>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(demoUsers) as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => handleLogin(r)}
                  className="btn-secondary w-full justify-between py-2.5 px-4 bg-slate-700/60 border-slate-600 hover:bg-slate-700 text-slate-200"
                >
                  <span className="font-semibold text-sm">{demoUsers[r].name}</span>
                  <span className="text-xs text-slate-400 capitalize">{r.replace('_', ' ')}</span>
                </button>
              ))}
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
