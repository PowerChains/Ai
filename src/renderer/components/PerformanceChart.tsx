import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { format } from 'date-fns'

/**
 * PerformanceChart - Real-time system performance visualization
 * 
 * Displays CPU, memory, and disk usage as interactive line charts
 * with 1-minute history window and real-time updates.
 * 
 * @component
 * @example
 * <PerformanceChart refreshInterval={2000} />
 */
interface PerformanceDataPoint {
  timestamp: string
  cpu: number
  memory: number
  disk: number
}

interface PerformanceChartProps {
  refreshInterval?: number
  dataRetentionMinutes?: number
}

export default function PerformanceChart({
  refreshInterval = 2000,
  dataRetentionMinutes = 5
}: PerformanceChartProps) {
  const [data, setData] = useState<PerformanceDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    /**
     * Fetches system metrics and updates chart data
     */
    const fetchMetrics = async () => {
      try {
        setIsLoading(true)
        const [cpu, memory, disk] = await Promise.all([
          (window as any).api.getCpuUsage(),
          (window as any).api.getMemoryUsage(),
          (window as any).api.getDiskHealth()
        ])

        const newDataPoint: PerformanceDataPoint = {
          timestamp: format(new Date(), 'HH:mm:ss'),
          cpu: cpu.current,
          memory: memory.percent,
          disk: disk.drives[0]?.percent || 0
        }

        setData((prevData) => {
          // Keep only last N minutes of data
          const cutoffTime = new Date(Date.now() - dataRetentionMinutes * 60 * 1000)
          const filtered = prevData.filter((point) => {
            const pointTime = new Date(point.timestamp)
            return pointTime >= cutoffTime
          })
          return [...filtered, newDataPoint].slice(-60) // Max 60 data points
        })
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
        setIsLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval, dataRetentionMinutes])

  if (isLoading || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-800 rounded-lg border border-slate-700">
        <p className="text-slate-400">Loading performance data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* CPU & Memory Chart */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-cyan-400">CPU & Memory Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="timestamp"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#94a3b8"
              label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="cpu"
              stroke="#06b6d4"
              dot={false}
              strokeWidth={2}
              name="CPU Usage (%)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="memory"
              stroke="#a855f7"
              dot={false}
              strokeWidth={2}
              name="Memory Usage (%)"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Disk Usage Area Chart */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-cyan-400">Disk Usage Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="timestamp"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#94a3b8"
              label={{ value: 'Usage (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Area
              type="monotone"
              dataKey="disk"
              stroke="#ef4444"
              fill="#dc2626"
              fillOpacity={0.3}
              name="Disk Usage (%)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-3 gap-4">
        {data.length > 0 && (
          <>
            <StatCard
              label="Current CPU"
              value={data[data.length - 1].cpu}
              unit="%"
              color="cyan"
            />
            <StatCard
              label="Current Memory"
              value={data[data.length - 1].memory}
              unit="%"
              color="purple"
            />
            <StatCard
              label="Current Disk"
              value={data[data.length - 1].disk}
              unit="%"
              color="red"
            />
          </>
        )}
      </div>
    </div>
  )
}

/**
 * StatCard - Display single metric value
 * @private
 */
function StatCard({
  label,
  value,
  unit,
  color
}: {
  label: string
  value: number
  unit: string
  color: 'cyan' | 'purple' | 'red'
}) {
  const colorClasses = {
    cyan: 'text-cyan-400 bg-cyan-900/20 border-cyan-700',
    purple: 'text-purple-400 bg-purple-900/20 border-purple-700',
    red: 'text-red-400 bg-red-900/20 border-red-700'
  }

  return (
    <div className={`rounded-lg p-3 border ${colorClasses[color]}`}>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-2xl font-bold mt-1">
        {value.toFixed(1)}{unit}
      </p>
    </div>
  )
}
