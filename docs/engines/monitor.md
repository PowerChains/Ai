# SystemMonitor Engine

## Overview
The SystemMonitor engine provides real-time system telemetry collection for Windows. It continuously gathers metrics on CPU, memory, disk, network, processes, and security status.

**Location**: `src/backend/engines/monitor.ts`

## Exports

### Class: SystemMonitor

#### Constructor
```typescript
constructor()
```
- **Description**: Initializes system monitoring capabilities
- **Parameters**: None
- **Returns**: SystemMonitor instance

#### getCpuUsage(): Promise<CpuMetrics>
- **Description**: Retrieves current CPU usage and core-specific metrics
- **Parameters**: None
- **Returns**: Object with `current` (%), `cores` array, `uptime`, and `timestamp`
- **Throws**: Error if system information unavailable
- **Example**:
```typescript
const monitor = new SystemMonitor()
const cpu = await monitor.getCpuUsage()
console.log(`CPU: ${cpu.current}%`)
```

#### getMemoryUsage(): Promise<MemoryMetrics>
- **Description**: Gets current memory/RAM usage statistics
- **Parameters**: None
- **Returns**: Object with `total`, `used`, `available`, `free`, `percent`, `timestamp`
- **Throws**: Error if memory data unavailable
- **Example**:
```typescript
const memory = await monitor.getMemoryUsage()
console.log(`Memory: ${memory.percent.toFixed(1)}%`)
```

#### getDiskHealth(): Promise<DiskMetrics>
- **Description**: Analyzes disk space and health status
- **Parameters**: None
- **Returns**: Object with `drives` array and `health` array
- **Throws**: Error if disk information unavailable
- **Example**:
```typescript
const disk = await monitor.getDiskHealth()
disk.drives.forEach(d => {
  console.log(`${d.mount}: ${d.percent}% used`)
})
```

#### getNetworkStats(): Promise<NetworkMetrics>
- **Description**: Fetches network interface and traffic statistics
- **Parameters**: None
- **Returns**: Object with `interfaces` and `stats` arrays
- **Throws**: Error if network data unavailable
- **Example**:
```typescript
const network = await monitor.getNetworkStats()
network.stats.forEach(stat => {
  console.log(`Bytes sent: ${stat.tx_bytes}`)
})
```

#### getProcessList(): Promise<ProcessMetrics>
- **Description**: Gets list of running processes sorted by resource usage
- **Parameters**: None
- **Returns**: Object with `topByMemory`, `topByCpu`, and process counts
- **Throws**: Error if process data unavailable
- **Example**:
```typescript
const procs = await monitor.getProcessList()
procs.topByMemory.forEach(p => {
  console.log(`${p.name}: ${(p.mem / 1024 / 1024).toFixed(1)}MB`)
})
```

#### getSecurityStatus(): Promise<SecurityMetrics>
- **Description**: Retrieves system security status (antivirus, firewall, etc.)
- **Parameters**: None
- **Returns**: Object with security-related status fields
- **Throws**: Error if security data unavailable
- **Example**:
```typescript
const security = await monitor.getSecurityStatus()
console.log(`Defender: ${security.antivirusStatus}`)
```

#### getSystemInfo(): Promise<SystemInfo>
- **Description**: Gets comprehensive system information
- **Parameters**: None
- **Returns**: Object with OS, system, CPU, and memory info
- **Throws**: Error if system info unavailable
- **Example**:
```typescript
const info = await monitor.getSystemInfo()
console.log(`OS: ${info.os.platform} ${info.os.release}`)
```

#### startMonitoring(interval?: number): void
- **Description**: Starts background monitoring loop
- **Parameters**: `interval` (optional, default 2000ms)
- **Returns**: void
- **Throws**: None
- **Example**:
```typescript
monitor.startMonitoring(1000) // Update every second
```

#### stopMonitoring(): void
- **Description**: Stops background monitoring loop
- **Parameters**: None
- **Returns**: void
- **Throws**: None
- **Example**:
```typescript
monitor.stopMonitoring()
```

## Dependencies
- **systeminformation**: System metrics collection
- **Logger**: Event logging

## Internal Implementation

### Algorithm Overview
1. Uses `systeminformation` library for native Windows metrics
2. Caches last CPU usage for delta calculation
3. Implements 2-second default monitoring interval (user-configurable)
4. All operations logged via Logger service
5. Graceful error handling with detailed error messages

### Performance Considerations
- **CPU Impact**: < 1% idle (event-driven updates)
- **Memory**: Minimal caching, ~10MB footprint
- **Network**: No external calls, local-only monitoring
- **Disk I/O**: Minimal, cached queries

### Monitoring Frequency
- Default: Every 2 seconds
- Configurable per use case
- Can be adjusted for battery/performance constraints

## Type Definitions

```typescript
interface CpuMetrics {
  current: number
  cores: Array<{ load: number; speedMax: number }>
  uptime: number
  timestamp: string
}

interface MemoryMetrics {
  total: number
  used: number
  available: number
  free: number
  percent: number
  timestamp: string
}

interface DiskMetrics {
  drives: Array<{
    filesystem: string
    size: number
    used: number
    available: number
    percent: number
    mount: string
  }>
  health: Array<{
    device: string
    size: number
    type: string
    rpm?: number
  }>
  timestamp: string
}
```

## Error Handling
- All async operations wrapped in try-catch
- Errors logged with context
- Graceful degradation if specific metrics unavailable
- User-friendly error messages

## Usage Examples

### Basic Usage
```typescript
const monitor = new SystemMonitor()

// Get single metric
const cpu = await monitor.getCpuUsage()
const memory = await monitor.getMemoryUsage()

// Start continuous monitoring
monitor.startMonitoring(2000)

// Later, stop monitoring
monitor.stopMonitoring()
```

### Full System Status
```typescript
const monitor = new SystemMonitor()
const [cpu, memory, disk, network, processes, security] = await Promise.all([
  monitor.getCpuUsage(),
  monitor.getMemoryUsage(),
  monitor.getDiskHealth(),
  monitor.getNetworkStats(),
  monitor.getProcessList(),
  monitor.getSecurityStatus()
])

console.log('System Health Report:', {
  cpu: cpu.current,
  memory: memory.percent,
  processes: processes.running
})
```

### Error Handling Pattern
```typescript
try {
  const metrics = await monitor.getCpuUsage()
  console.log(`CPU: ${metrics.current}%`)
} catch (error) {
  console.error('Failed to get metrics:', error)
  // Fallback or retry logic
}
```

## Testing
- Unit tests in: `src/**/__tests__/monitor.test.ts`
- Coverage target: > 85%
- Test cases:
  - Metric collection success
  - Error handling
  - Timeout handling
  - Concurrent requests
  - Monitoring start/stop

## Future Improvements
- GPU metrics collection
- Thermal throttling detection
- Process-specific metrics (handles, threads)
- Network connection analysis
- Security scanning integration
- Machine learning anomaly detection
- Historical metrics trending
- Performance baseline establishment

## Related Documentation
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - System architecture
- [DEVELOPMENT.md](../../DEVELOPMENT.md) - Development guide
- [RULES.md](../../RULES.md) - Code discipline rules
