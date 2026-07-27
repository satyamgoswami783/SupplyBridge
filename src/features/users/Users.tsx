import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, MoreVertical, Edit, Ban, CheckCircle2, Mail, Eye, Shield, Users as UsersIcon } from 'lucide-react'
import { SectionHeader, FilterBar, ConfirmDialog } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockUsers } from '../../data/mockData'
import { statusToVariant, formatDate, getInitials, timeAgo } from '../../utils'
import { useAuth } from '../../context/AuthContext'
import type { User, UserRole } from '../../types'

const ROLE_LABELS: Record<UserRole, string> = {
  platform_owner:      'Platform Owner',
  administrator:       'Administrator',
  super_admin:         'Super Admin',
  admin:               'Admin',
  catalog_manager:     'Catalog Manager',
  integration_manager: 'Integration Manager',
  operations_staff:    'Operations Staff',
  read_only:           'Read Only',
}

const ROLE_COLORS: Record<UserRole, string> = {
  platform_owner:      'purple',
  administrator:       'primary',
  super_admin:         'purple',
  admin:               'primary',
  catalog_manager:     'info',
  integration_manager: 'warning',
  operations_staff:    'neutral',
  read_only:           'neutral',
} as any

export const Users: React.FC = () => {
  const { setViewProfileUser } = useAuth()
  const [usersList, setUsersList] = useState<User[]>(mockUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Invite Form States
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('catalog_manager')
  const [inviteDept, setInviteDept] = useState('Catalog & Merchandising')

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteName.trim() || !inviteEmail.trim()) return

    const newUser: User = {
      id: `u_${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'invited',
      createdAt: new Date().toISOString(),
      department: inviteDept.trim() || 'Operations',
    }

    setUsersList(prev => [newUser, ...prev])
    setInviteOpen(false)
    setInviteName('')
    setInviteEmail('')
    showNotification(`Invitation sent to ${newUser.email}! User added with role ${ROLE_LABELS[inviteRole]}.`)
  }

  const toggleUserStatus = (user: User) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active'
    setUsersList(prev =>
      prev.map(u => (u.id === user.id ? { ...u, status: nextStatus } : u))
    )
    showNotification(`User ${user.name} is now ${nextStatus.toUpperCase()}`)
  }

  const filtered = usersList.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold border border-slate-700"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader
        title="User Management & Access Control"
        subtitle={`${usersList.length} total team members — ${usersList.filter(u => u.status === 'active').length} active, ${usersList.filter(u => u.status === 'invited').length} pending invitation`}
        actions={
          <button onClick={() => setInviteOpen(true)} className="btn-primary btn-sm flex items-center gap-1.5 shadow-md shadow-indigo-500/20">
            <UserPlus size={14} /> Invite New User
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: usersList.length, color: 'text-slate-800 dark:text-slate-100' },
          { label: 'Active Sessions', value: usersList.filter(u => u.status === 'active').length, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Pending Invites', value: usersList.filter(u => u.status === 'invited').length, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Inactive / Suspended', value: usersList.filter(u => u.status === 'inactive').length, color: 'text-slate-400' },
        ].map(s => (
          <div key={s.label} className="card px-4 py-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <FilterBar search={search} onSearch={setSearch} placeholder="Search team members by name or email...">
        <select className="select input-sm w-auto min-w-[140px]" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="select input-sm w-auto min-w-[130px]" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="inactive">Inactive</option>
        </select>
      </FilterBar>

      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User & Account</th>
                <th>Assigned Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors" onClick={() => setViewProfileUser(user)}>
                  <td data-label="User">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-aurora flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-glow-primary">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm hover:text-primary-600 transition-colors">{user.name}</p>
                        <p className="text-2xs text-slate-400 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td data-label="Role">
                    <Badge variant={(ROLE_COLORS[user.role] as any) || 'neutral'}>{ROLE_LABELS[user.role]}</Badge>
                  </td>
                  <td data-label="Department"><span className="text-xs font-medium text-slate-600 dark:text-slate-300">{user.department || '—'}</span></td>
                  <td data-label="Status">
                    <Badge variant={statusToVariant(user.status)} dot>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                  </td>
                  <td data-label="Last Login"><span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user.lastLogin ? timeAgo(user.lastLogin) : '—'}</span></td>
                  <td data-label="Joined"><span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{formatDate(user.createdAt)}</span></td>
                  <td data-label="Actions" className="text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button className="btn-icon" onClick={() => setViewProfileUser(user)} title="View User Profile"><Eye size={14} /></button>
                      {user.status === 'active' ? (
                        <button className="btn-icon text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60" onClick={() => toggleUserStatus(user)} title="Suspend User Account">
                          <Ban size={14} />
                        </button>
                      ) : (
                        <button className="btn-icon text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/60" onClick={() => toggleUserStatus(user)} title="Activate User Account">
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INVITE USER MODAL */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite New Team Member"
        subtitle="Provision platform access and send an activation email"
        size="md"
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. David Miller"
              className="input"
              value={inviteName}
              onChange={e => setInviteName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Email Address *</label>
            <input
              type="email"
              required
              placeholder="david@supplybridge.io"
              className="input"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Assign Platform Role *</label>
            <select
              className="select"
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value as UserRole)}
            >
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Department</label>
            <input
              type="text"
              placeholder="e.g. Supplier Integration / Merchandising"
              className="input"
              value={inviteDept}
              onChange={e => setInviteDept(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setInviteOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-1.5 shadow-md shadow-indigo-500/20">
              <Mail size={14} /> Send Invitation Email
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
