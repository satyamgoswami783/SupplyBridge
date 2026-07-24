import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Truck, Plug, Database, Package, Tag, Award,
  Layers, ArrowLeftRight, ShieldCheck, RefreshCw, DollarSign,
  Image, Store, Globe, Briefcase, Download, FileText, Activity,
  BarChart3, Users, UserCog, Lock, Settings, ChevronDown,
  ChevronRight, Zap, X, Menu, User, LogOut, Sliders
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn, getInitials } from '../../utils'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  path?: string
  module?: string
  children?: NavItem[]
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',          icon: <LayoutDashboard size={18} />, path: '/',           module: 'dashboard' },
  { id: 'suppliers',    label: 'Suppliers',           icon: <Truck size={18} />,           path: '/suppliers',  module: 'suppliers' },
  { id: 'integrations', label: 'Integrations',        icon: <Plug size={18} />,            path: '/integrations', module: 'integrations' },
  {
    id: 'catalog', label: 'Master Catalog (PIM)', icon: <Database size={18} />, module: 'catalog',
    children: [
      { id: 'products',   label: 'Products',    icon: <Package size={17} />,  path: '/catalog/products',   module: 'products' },
      { id: 'categories', label: 'Categories',  icon: <Tag size={17} />,      path: '/catalog/categories', module: 'categories' },
      { id: 'brands',     label: 'Brands',      icon: <Award size={17} />,    path: '/catalog/brands',     module: 'brands' },
      { id: 'variants',   label: 'Variants',    icon: <Layers size={17} />,   path: '/catalog/variants',   module: 'variants' },
    ],
  },
  {
    id: 'mapping', label: 'Product Mapping', icon: <ArrowLeftRight size={18} />, module: 'mapping',
    children: [
      { id: 'product-mapping',   label: 'Product Mapping',   icon: <Package size={16} />,       path: '/mapping/products',   module: 'mapping' },
      { id: 'category-mapping',  label: 'Category Mapping',  icon: <Tag size={16} />,           path: '/mapping/categories', module: 'mapping' },
      { id: 'variant-mapping',   label: 'Variant Mapping',   icon: <Layers size={16} />,        path: '/mapping/variants',   module: 'mapping' },
      { id: 'attribute-mapping', label: 'Attribute Mapping', icon: <Sliders size={16} />,      path: '/mapping/attributes', module: 'mapping' },
      { id: 'supplier-mapping',  label: 'Supplier Mapping',  icon: <Truck size={16} />,         path: '/mapping/suppliers',  module: 'mapping' },
    ],
  },
  { id: 'validation',     label: 'Validation Center',       icon: <ShieldCheck size={18} />,  path: '/validation',      module: 'validation' },
  { id: 'inventory-sync', label: 'Inventory Sync',          icon: <RefreshCw size={18} />,    path: '/sync/inventory',  module: 'inventory_sync' },
  { id: 'pricing-sync',   label: 'Pricing Sync',            icon: <DollarSign size={18} />,   path: '/sync/pricing',    module: 'pricing_sync' },
  { id: 'image-sync',     label: 'Image Sync',              icon: <Image size={18} />,        path: '/sync/images',     module: 'image_sync' },
  { id: 'stores',         label: 'Store Management',        icon: <Store size={18} />,        path: '/stores',          module: 'store_management' },
  { id: 'website-sync',   label: 'Website Sync',            icon: <Globe size={18} />,        path: '/sync/website',    module: 'website_sync' },
  { id: 'sync-jobs',      label: 'Sync Jobs',               icon: <Briefcase size={18} />,    path: '/sync/jobs',       module: 'sync_jobs' },
  { id: 'import-queue',   label: 'Import Queue',            icon: <Download size={18} />,     path: '/import-queue',    module: 'import_queue' },
  { id: 'logs',           label: 'Logs',                    icon: <FileText size={18} />,     path: '/logs',            module: 'logs' },
  { id: 'monitoring',     label: 'Monitoring',              icon: <Activity size={18} />,     path: '/monitoring',      module: 'monitoring' },
  { id: 'reports',        label: 'Reports',                 icon: <BarChart3 size={18} />,    path: '/reports',         module: 'reports' },
  {
    id: 'access', label: 'User Management', icon: <Users size={18} />, module: 'users',
    children: [
      { id: 'users',       label: 'Users',       icon: <Users size={16} />,   path: '/users',       module: 'users' },
      { id: 'roles',       label: 'Roles',       icon: <UserCog size={16} />, path: '/roles',       module: 'roles' },
      { id: 'permissions', label: 'Permissions', icon: <Lock size={16} />,    path: '/permissions', module: 'permissions' },
    ],
  },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} />, path: '/settings', module: 'settings' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const NavGroup: React.FC<{ item: NavItem; onClose: () => void }> = ({ item, onClose }) => {
  const [expanded, setExpanded] = useState(true)
  const location = useLocation()
  const { hasPermission } = useAuth()
  
  const visibleChildren = item.children?.filter(c => !c.module || hasPermission(c.module)) || []
  if (visibleChildren.length === 0) return null

  const isChildActive = visibleChildren.some(c => c.path && location.pathname.startsWith(c.path))

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn('sidebar-item w-full justify-between', isChildActive && 'text-primary-300 font-bold bg-slate-800/40')}
      >
        <span className="flex items-center gap-3">
          <span className="opacity-80">{item.icon}</span>
          {item.label}
        </span>
        <motion.span
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight size={14} className="opacity-50" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-3.5 pl-3 border-l border-slate-800/80 mt-0.5 mb-0.5 space-y-0.5">
              {visibleChildren.map(child => (
                <NavLink
                  key={child.id}
                  to={child.path!}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn('sidebar-item text-xs', isActive && 'sidebar-item-active')
                  }
                >
                  <span className="opacity-70">{child.icon}</span>
                  {child.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { hasPermission, currentUser, logout, openCurrentUserProfile } = useAuth()

  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.module && !hasPermission(item.module)) return false
    if (item.children) {
      const validChildren = item.children.filter(c => !c.module || hasPermission(c.module))
      return validChildren.length > 0
    }
    return true
  })

  return (
    <div className="flex flex-col h-full bg-gradient-sidebar border-r border-slate-800/80">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-aurora flex items-center justify-center shadow-glow-primary text-white font-black">
            <Zap size={18} />
          </div>
          <div>
            <span className="font-extrabold text-white text-sm tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              SupplyBridge
            </span>
            <span className="block text-2xs text-cyan-400 font-semibold tracking-wider uppercase">Enterprise PIM</span>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden btn-icon text-slate-400 hover:text-white hover:bg-slate-800">
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scrollbar-hide">
        {visibleItems.map(item => {
          if (item.children) {
            return <NavGroup key={item.id} item={item} onClose={onClose} />
          }
          return (
            <NavLink
              key={item.id}
              to={item.path!}
              end={item.path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn('sidebar-item', isActive && 'sidebar-item-active')
              }
            >
              <span className="opacity-80">{item.icon}</span>
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      {/* User Profile Footer Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 space-y-2 backdrop-blur-md">
        <div
          onClick={openCurrentUserProfile}
          className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-primary-500/40 hover:bg-slate-850 transition-all duration-200 cursor-pointer group"
          title="Click to view profile"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-aurora flex items-center justify-center text-xs font-black text-white shadow-glow-primary flex-shrink-0 group-hover:scale-105 transition-transform">
            {getInitials(currentUser.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">{currentUser.name}</p>
            <p className="text-2xs text-slate-400 truncate font-medium capitalize">{currentUser.role.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-2xs text-slate-500 font-semibold uppercase tracking-wider">System Status</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow shadow-glow-emerald" />
            <span className="text-2xs text-emerald-400 font-bold">Operational</span>
          </div>
        </div>
      </div>
    </div>
  )
}
