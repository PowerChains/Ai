import React, { useEffect } from 'react'
import { useAppStore } from './store/appStore'
import Dashboard from './pages/Dashboard'
import './styles/globals.css'

export default function App() {
  const { initializeApp } = useAppStore()

  useEffect(() => {
    initializeApp()
  }, [])

  return (
    <div className="h-screen w-screen bg-slate-950 text-white overflow-hidden">
      <Dashboard />
    </div>
  )
}
