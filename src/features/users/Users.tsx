import React, { useState } from 'react'
import { UserPlus, MoreVertical, Edit, Ban, CheckCircle2, Mail } from 'lucide-react'
import { SectionHeader, FilterBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockUsers } from '../../data/mockData'
import { statusToVariant, formatDate, getInitials, timeAgo } from '../../utils'
import type { UserRole } from '../../types'

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin:         'Super Admin',
  admin:               'Admin',
  catalog_manager:     'Catalog Manager',
  integration_manager: 'Integration Manager',
  operations_staff:    'Operations Staff',
}

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin:         'purple',
  admin:               'primary',
  catalog_manager:     'info',
  integration_manager: 'warning',
  operations_staff:    'neutral',
} as any

export const Users: React.FC = () => {
  const [search, setSearch] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)

  const filtered = mockUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <SectionHeader
        title="Users"
        subtitle={`${mockUsers.length} users — ${mockUsers.filter(u => u.status === 'active').length} active`}
        actions={
          <button onClick={() => setInviteOpen(true)} className="btn-primary btn-sm"><UserPlus size={14} /> Invite User</button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: mockUsers.length, color: 'text-slate-800' },
          { label: 'Active',      value: mockUsers.filter(u => u.status === 'active').length, color: 'text-emerald-600' },
          { label: 'Invited',     value: mockUsers.filter(u => u.status === 'invited').length, color: 'text-amber-600' },
          { label: 'Inactive',    value: mockUsers.filter(u => u.status === 'inactive').length, color: 'text-slate-400' },
        ].map(s => (
          <div key={s.label} className="card px-4 py-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <FilterBar search={search} onSearch={setSearch} placeholder="Search users...">
        <select className="select input-sm w-auto">
          <option>All Roles</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="select input-sm w-auto">
          <option>All Status</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="inactive">Inactive</option>
        </select>
      </FilterBar>

      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>User</th><th>Role</th><th>Department</th><th>Status</th><th>Last Login</th><th>Joined</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant={(ROLE_COLORS[user.role] as any) || 'neutral'}>{ROLE_LABELS[user.role]}</Badge>
                  </td>
                  <td><span className="text-sm text-slate-600">{user.department || '—'}</span></td>
                  <td>
                    <Badge variant={statusToVariant(user.status)} dot>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                  </td>
                  <td><span className="text-xs text-slate-400">{user.lastLogin ? timeAgo(user.lastLogin) : '—'}</span></td>
                  <td><span className="text-xs text-slate-400">{formatDate(user.createdAt)}</span></td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn-icon"><Edit size={14} /></button>
                      {user.status === 'active'
                        ? <button className="btn-icon text-rose-500 hover:bg-rose-50"><Ban size={14} /></button>
                        : <button className="btn-icon text-emerald-500 hover:bg-emerald-50"><CheckCircle2 size={14} /></button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite New User"
        subtitle="Send an email invitation to join SupplyBridge"
        footer={<><button onClick={() => setInviteOpen(false)} className="btn-secondary">Cancel</button><button className="btn-primary"><Mail size={14} /> Send Invitation</button></>}
      >
        <div className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-600 block mb-1.5">Full Name *</label><input className="input" placeholder="John Doe" /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1.5">Email Address *</label><input className="input" type="email" placeholder="john@company.com" /></div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Assign Role *</label>
            <select className="select">
              {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1.5">Department</label><input className="input" placeholder="e.g. Catalog, Operations" /></div>
        </div>
      </Modal>
    </div>
  )
}
