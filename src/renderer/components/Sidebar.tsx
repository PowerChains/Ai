import React from 'react'
import { useAppStore } from '../store/appStore'

interface SidebarProps {
  activeView: string
  setActiveView: (view: any) => void
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'monitoring', label: 'Monitoring', icon: '📈' },
    { id: 'repair', label: 'Repair', icon: '🔧' },
    { id: 'optimize', label: 'Optimize', icon: '⚡' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'localhost', label: 'Localhost', icon: '🖥️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-cyan-400">
          SYSTEMAI<span className="text-sm text-slate-400">.EXE</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Production System AI</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
              activeView === item.id
                ? 'bg-cyan-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
        <p>v0.1.0 - Phase 1</p>
      </div>
    </div>
  )
}
