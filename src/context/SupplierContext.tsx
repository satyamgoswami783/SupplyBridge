import React, { createContext, useContext, useState } from 'react'
import { mockSuppliers } from '../data/mockData'
import type { Supplier } from '../types'

interface SupplierContextType {
  suppliersList: Supplier[]
  setSuppliersList: React.Dispatch<React.SetStateAction<Supplier[]>>
}

const SupplierContext = createContext<SupplierContextType | null>(null)

export const SupplierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suppliersList, setSuppliersList] = useState<Supplier[]>(mockSuppliers)
  return (
    <SupplierContext.Provider value={{ suppliersList, setSuppliersList }}>
      {children}
    </SupplierContext.Provider>
  )
}

export const useSuppliers = () => {
  const ctx = useContext(SupplierContext)
  if (!ctx) throw new Error('useSuppliers must be used inside SupplierProvider')
  return ctx
}
