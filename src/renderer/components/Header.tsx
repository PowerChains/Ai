import React, { useState, useEffect } from 'react'
import { useAppStore } from '../store/appStore'

export default function Header({ mode }: { mode: 'guided' | 'auto' }) {
  const { setMode } = useAppStore()
  const [systemHealth, setSystemHealth] = useState<number>(0)

  useEffect(() => {
    // Fetch system health score
    const calculateHealth = async () => {
      try {
        const cpu = await (window as any).api.getCpuUsage()
        const memory = await (window as any).api.getMemoryUsage()
        const health = Math.max(0, 100 - (cpu.current + memory.percent) / 2)
        setSystemHealth(Math.round(health))
      } catch (error) {
        console.error('Failed to calculate system health:', error)
      }
    }

    calculateHealth()
    const interval = setInterval(calculateHealth, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">System Status</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            systemHealth > 70
              ? 'bg-green-900 text-green-200'
              : systemHealth > 40
                ? 'bg-yellow-900 text-yellow-200'
                : 'bg-red-900 text-red-200'
          }`}>
            Health: {systemHealth}%
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Mode Toggle */}
          <div className="flex gap-2 bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setMode('guided')}
              className={`px-4 py-2 rounded transition-colors ${
                mode === 'guided'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Guided Mode
            </button>
            <button
              onClick={() => setMode('auto')}
              className={`px-4 py-2 rounded transition-colors ${
                mode === 'auto'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Auto Mode
            </button>
          </div>

          {/* Notification Badge */}
          <button className="relative p-2 text-slate-300 hover:text-white">
            🔔
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-slate-300 hover:text-white">⚙️</button>
        </div>
      </div>
    </div>
  )
}
