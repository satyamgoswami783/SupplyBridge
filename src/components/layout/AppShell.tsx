import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export const AppShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const toggleDark = () => {
    setDarkMode(!darkMode)
    document.body.classList.toggle('dark', !darkMode)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          darkMode={darkMode}
          onToggleDark={toggleDark}
        />
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="p-6 max-w-screen-2xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
