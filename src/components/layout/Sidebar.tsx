import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Truck, Plug, Database, Package, Tag, Award,
  Layers, ArrowLeftRight, ShieldCheck, RefreshCw, DollarSign,
  Image, Store, Globe, Briefcase, Download, FileText, Activity,
  BarChart3, Users, UserCog, Lock, Settings, ChevronDown,
  ChevronRight, Zap, X, Menu
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils'

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
      { id: 'product-mapping',  label: 'Product Mapping',  icon: <Package size={16} />,       path: '/mapping/products',   module: 'mapping' },
      { id: 'category-mapping', label: 'Category Mapping', icon: <Tag size={16} />,           path: '/mapping/categories', module: 'mapping' },
      { id: 'variant-mapping',  label: 'Variant Mapping',  icon: <Layers size={16} />,        path: '/mapping/variants',   module: 'mapping' },
      { id: 'supplier-mapping', label: 'Supplier Mapping', icon: <Truck size={16} />,         path: '/mapping/suppliers',  module: 'mapping' },
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
  const isChildActive = item.children?.some(c => c.path && location.pathname.startsWith(c.path))

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn('sidebar-item w-full justify-between', isChildActive && 'sidebar-item-active')}
      >
        <span className="flex items-center gap-3">
          <span className="opacity-70">{item.icon}</span>
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
            <div className="ml-3 pl-3 border-l border-slate-700/60 mt-0.5 mb-0.5 space-y-0.5">
              {item.children?.map(child => (
                <NavLink
                  key={child.id}
                  to={child.path!}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn('sidebar-item text-xs', isActive && 'sidebar-item-active')
                  }
                >
                  <span className="opacity-60">{child.icon}</span>
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
  const { hasPermission } = useAuth()

  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.module && !hasPermission(item.module)) return false
    return true
  })

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow-primary">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm tracking-tight">SupplyBridge</span>
            <span className="block text-2xs text-slate-500 font-medium">Enterprise PIM</span>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden btn-icon text-slate-400 hover:text-white hover:bg-slate-800">
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-hide">
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
              <span className="opacity-70">{item.icon}</span>
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-800">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow" />
          <span className="text-xs text-slate-500">All Systems Operational</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-sidebar-bg h-screen sticky top-0 flex-shrink-0 border-r border-sidebar-border z-30">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 w-72 bg-sidebar-bg flex flex-col z-50 lg:hidden"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
