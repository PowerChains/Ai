import React, { useState, useEffect } from 'react'

interface MetricCard {
  label: string
  value: number
  unit: string
  threshold: { warning: number; critical: number }
  icon: string
}

export default function MonitoringPanel() {
  const [metrics, setMetrics] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [cpu, memory, disk, network] = await Promise.all([
          (window as any).api.getCpuUsage(),
          (window as any).api.getMemoryUsage(),
          (window as any).api.getDiskHealth(),
          (window as any).api.getNetworkStats()
        ])

        setMetrics({
          cpu,
          memory,
          disk,
          network
        })
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 2000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (value: number, warning: number, critical: number) => {
    if (value >= critical) return 'text-red-400 bg-red-900/20'
    if (value >= warning) return 'text-yellow-400 bg-yellow-900/20'
    return 'text-green-400 bg-green-900/20'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">Loading system metrics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCardComponent
          label="CPU Usage"
          value={metrics.cpu?.current || 0}
          unit="%"
          icon="🔥"
          status={
            (metrics.cpu?.current || 0) > 80
              ? 'critical'
              : (metrics.cpu?.current || 0) > 60
                ? 'warning'
                : 'healthy'
          }
        />
        <MetricCardComponent
          label="Memory Usage"
          value={metrics.memory?.percent || 0}
          unit="%"
          icon="💾"
          status={
            (metrics.memory?.percent || 0) > 85
              ? 'critical'
              : (metrics.memory?.percent || 0) > 70
                ? 'warning'
                : 'healthy'
          }
        />
        <MetricCardComponent
          label="Disk Usage"
          value={
            metrics.disk?.drives?.[0]?.percent || 0
          }
          unit="%"
          icon="💿"
          status={
            (metrics.disk?.drives?.[0]?.percent || 0) > 90
              ? 'critical'
              : (metrics.disk?.drives?.[0]?.percent || 0) > 75
                ? 'warning'
                : 'healthy'
          }
        />
        <MetricCardComponent
          label="Network"
          value={0}
          unit="Mbps"
          icon="🌐"
          status="healthy"
        />
      </div>

      {/* Detailed Panels */}
      <div className="grid grid-cols-2 gap-6">
        {/* CPU Details */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-cyan-400">CPU Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Current Load</span>
              <span className="text-white font-semibold">{Math.round(metrics.cpu?.current || 0)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all"
                style={{ width: `${metrics.cpu?.current || 0}%` }}
              ></div>
            </div>
            {metrics.cpu?.cores && (
              <div className="mt-4">
                <p className="text-sm text-slate-400 mb-2">Core Usage</p>
                <div className="grid grid-cols-4 gap-2">
                  {metrics.cpu.cores.slice(0, 4).map((core: any, idx: number) => (
                    <div key={idx} className="text-center">
                      <div className="bg-slate-700 rounded h-12 flex items-end justify-center p-1">
                        <div
                          className="bg-cyan-500 w-full rounded transition-all"
                          style={{ height: `${(core.load / 100) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Core {idx}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Memory Details */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-cyan-400">Memory Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Used / Total</span>
              <span className="text-white font-semibold">
                {Math.round((metrics.memory?.used || 0) / 1024 / 1024 / 1024)} /{' '}
                {Math.round((metrics.memory?.total || 0) / 1024 / 1024 / 1024)} GB
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${metrics.memory?.percent || 0}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mt-4">
              <div className="bg-slate-700/50 rounded p-2">
                <p className="text-slate-400">Available</p>
                <p className="text-white font-semibold">
                  {Math.round((metrics.memory?.available || 0) / 1024 / 1024 / 1024)} GB
                </p>
              </div>
              <div className="bg-slate-700/50 rounded p-2">
                <p className="text-slate-400">Free</p>
                <p className="text-white font-semibold">
                  {Math.round((metrics.memory?.free || 0) / 1024 / 1024 / 1024)} GB
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCardComponent({
  label,
  value,
  unit,
  icon,
  status
}: {
  label: string
  value: number
  unit: string
  icon: string
  status: 'healthy' | 'warning' | 'critical'
}) {
  const colors = {
    healthy: 'border-green-700 bg-green-900/10',
    warning: 'border-yellow-700 bg-yellow-900/10',
    critical: 'border-red-700 bg-red-900/10'
  }

  return (
    <div className={`bg-slate-800 rounded-lg p-4 border ${colors[status]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">
            {value.toFixed(1)}{unit}
          </p>
        </div>
        <div className="text-4xl opacity-50">{icon}</div>
      </div>
    </div>
  )
}
