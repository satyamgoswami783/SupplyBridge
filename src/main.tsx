import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { SupplierProvider } from './context/SupplierContext'
import { AppRouter } from './router'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <SupplierProvider>
        <AppRouter />
      </SupplierProvider>
    </AuthProvider>
  </React.StrictMode>,
)
