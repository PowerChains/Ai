import React, { useState, useEffect } from 'react'

/**
 * ProcessManager - System process management and monitoring interface
 * 
 * Displays running processes sorted by resource usage, allows process
 * termination (non-critical only), and provides real-time process list.
 * 
 * @component
 * @example
 * <ProcessManager refreshInterval={2000} />
 */
interface ProcessInfo {
  pid: number
  name: string
  mem: number
  pcpu: number
}

interface ProcessManagerProps {
  refreshInterval?: number
  maxProcesses?: number
}

type SortBy = 'memory' | 'cpu' | 'name'
type FilterBy = 'all' | 'high-memory' | 'high-cpu'

export default function ProcessManager({
  refreshInterval = 2000,
  maxProcesses = 20
}: ProcessManagerProps) {
  const [processes, setProcesses] = useState<ProcessInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortBy>('memory')
  const [filterBy, setFilterBy] = useState<FilterBy>('all')
  const [selectedProcess, setSelectedProcess] = useState<number | null>(null)

  useEffect(() => {
    /**
     * Fetches process list from system
     */
    const fetchProcesses = async () => {
      try {
        setIsLoading(true)
        const data = await (window as any).api.getProcessList()
        
        let sorted = [...data.topByMemory]
        
        if (sortBy === 'cpu') {
          sorted = [...data.topByCpu]
        } else if (sortBy === 'name') {
          sorted.sort((a, b) => a.name.localeCompare(b.name))
        }

        // Apply filters
        let filtered = sorted
        if (filterBy === 'high-memory') {
          filtered = sorted.filter((p) => (p.mem / 1024 / 1024 / 1024) > 0.5)
        } else if (filterBy === 'high-cpu') {
          filtered = sorted.filter((p) => (p.pcpu || 0) > 10)
        }

        setProcesses(filtered.slice(0, maxProcesses))
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch processes:', error)
        setIsLoading(false)
      }
    }

    fetchProcesses()
    const interval = setInterval(fetchProcesses, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval, maxProcesses, sortBy, filterBy])

  const handleTerminate = async (pid: number, name: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to terminate "${name}" (PID: ${pid})?\n\nThis action cannot be undone.`
    )
    if (confirmed) {
      try {
        // TODO: Implement process termination via backend
        console.log(`Terminating process: ${pid}`)
      } catch (error) {
        console.error('Failed to terminate process:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-800 rounded-lg border border-slate-700">
        <p className="text-slate-400">Loading processes...</p>
      </div>
    )
  }

  const criticalProcesses = [
    'explorer.exe',
    'svchost.exe',
    'csrss.exe',
    'lsass.exe',
    'services.exe',
    'winlogon.exe',
    'smss.exe'
  ]

  const isCritical = (name: string) =>
    criticalProcesses.some((cp) => name.toLowerCase().includes(cp.toLowerCase()))

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="text-sm text-slate-400 block mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="bg-slate-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="memory">Memory Usage</option>
            <option value="cpu">CPU Usage</option>
            <option value="name">Process Name</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-400 block mb-1">Filter</label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterBy)}
            className="bg-slate-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Processes</option>
            <option value="high-memory">High Memory (&gt;500MB)</option>
            <option value="high-cpu">High CPU (&gt;10%)</option>
          </select>
        </div>

        <div className="flex-1" />

        <div className="text-sm text-slate-400 py-2">
          {processes.length} of {maxProcesses} processes shown
        </div>
      </div>

      {/* Process Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700 border-b border-slate-600">
                <th className="text-left px-4 py-3 text-cyan-400">Process Name</th>
                <th className="text-right px-4 py-3 text-cyan-400">PID</th>
                <th className="text-right px-4 py-3 text-cyan-400">Memory</th>
                <th className="text-right px-4 py-3 text-cyan-400">CPU %</th>
                <th className="text-center px-4 py-3 text-cyan-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process, idx) => (
                <ProcessRow
                  key={process.pid}
                  process={process}
                  isCritical={isCritical(process.name)}
                  isSelected={selectedProcess === process.pid}
                  onSelect={() => setSelectedProcess(process.pid)}
                  onTerminate={() => handleTerminate(process.pid, process.name)}
                  alternateRow={idx % 2 === 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="text-xs text-slate-400 space-y-1">
        <p>💡 Critical processes cannot be terminated for safety</p>
        <p>🔴 Red background indicates high resource usage</p>
      </div>
    </div>
  )
}

/**
 * ProcessRow - Individual process display
 * @private
 */
function ProcessRow({
  process,
  isCritical,
  isSelected,
  onSelect,
  onTerminate,
  alternateRow
}: {
  process: ProcessInfo
  isCritical: boolean
  isSelected: boolean
  onSelect: () => void
  onTerminate: () => void
  alternateRow: boolean
}) {
  const memoryGB = process.mem / 1024 / 1024 / 1024
  const isHighMemory = memoryGB > 1
  const isHighCpu = (process.pcpu || 0) > 50

  return (
    <tr
      onClick={onSelect}
      className={`border-b border-slate-700 cursor-pointer transition-colors ${
        alternateRow ? 'bg-slate-800/50' : 'bg-slate-800'
      } ${isSelected ? 'bg-slate-700' : 'hover:bg-slate-700/50'} ${
        (isHighMemory || isHighCpu) && !isCritical ? 'bg-red-900/20' : ''
      }`}
    >
      <td className="px-4 py-3 font-mono text-sm text-slate-200">
        {process.name}
        {isCritical && <span className="text-yellow-400 ml-2">🔒</span>}
      </td>
      <td className="px-4 py-3 text-right font-mono text-slate-300">
        {process.pid}
      </td>
      <td className="px-4 py-3 text-right">
        <MemoryBadge value={memoryGB} isHigh={isHighMemory} />
      </td>
      <td className="px-4 py-3 text-right">
        <CpuBadge value={process.pcpu || 0} isHigh={isHighCpu} />
      </td>
      <td className="px-4 py-3 text-center">
        {!isCritical && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTerminate()
            }}
            className="text-xs px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded transition-colors"
          >
            Terminate
          </button>
        )}
        {isCritical && (
          <span className="text-xs text-yellow-400">Protected</span>
        )}
      </td>
    </tr>
  )
}

/**
 * MemoryBadge - Format and display memory usage
 * @private
 */
function MemoryBadge({ value, isHigh }: { value: number; isHigh: boolean }) {
  const color = isHigh ? 'bg-red-900/30 text-red-300' : 'bg-slate-700 text-slate-300'
  return (
    <span className={`px-2 py-1 rounded text-xs ${color}`}>
      {value.toFixed(2)} GB
    </span>
  )
}

/**
 * CpuBadge - Format and display CPU usage
 * @private
 */
function CpuBadge({ value, isHigh }: { value: number; isHigh: boolean }) {
  const color = isHigh ? 'bg-orange-900/30 text-orange-300' : 'bg-slate-700 text-slate-300'
  return (
    <span className={`px-2 py-1 rounded text-xs ${color}`}>
      {value.toFixed(1)}%
    </span>
  )
}
