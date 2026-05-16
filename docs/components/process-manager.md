# ProcessManager Component

## Overview

The `ProcessManager` component provides a comprehensive interface for monitoring and managing system processes. It displays running processes with real-time resource usage, sorting, filtering, and safe termination capabilities with critical process protection.

## Features

- **Real-time Process List**: Auto-updates with latest process information
- **Multi-Sort Options**: Sort by memory, CPU usage, or process name
- **Smart Filtering**: All processes, high memory, or high CPU consumers
- **Critical Process Protection**: Prevents accidental termination of system processes
- **Safe Termination**: Confirmation dialogs before process termination
- **Color-Coded Alerts**: Visual indicators for high resource usage
- **Responsive Table**: Sortable, selectable, scrollable process list

## Component Structure

```typescript
interface ProcessInfo {
  pid: number          // Process ID
  name: string         // Process executable name
  mem: number          // Memory usage in bytes
  pcpu: number         // CPU usage percentage
}

interface ProcessManagerProps {
  refreshInterval?: number  // Update interval in ms (default: 2000)
  maxProcesses?: number     // Maximum processes to display (default: 20)
}

type SortBy = 'memory' | 'cpu' | 'name'
type FilterBy = 'all' | 'high-memory' | 'high-cpu'
```

## Usage

### Basic Usage

```tsx
import ProcessManager from '@/renderer/components/ProcessManager'

export function SystemTools() {
  return (
    <div>
      <ProcessManager 
        refreshInterval={2000}
        maxProcesses={20}
      />
    </div>
  )
}
```

### Custom Configuration

```tsx
// More frequent updates
<ProcessManager refreshInterval={1000} />

// Show more processes
<ProcessManager maxProcesses={50} />

// Both customized
<ProcessManager 
  refreshInterval={1000}
  maxProcesses={50}
/>
```

## Data Flow

1. Component mounts → Fetch process list
2. Set up interval → Fetch every N ms
3. Apply sorting → By memory, CPU, or name
4. Apply filters → Show all, high-memory, or high-CPU
5. Update state → Display top N processes
6. User interaction → Terminate or select process

## API Requirements

The component requires this IPC method from `window.api`:

```typescript
getProcessList() -> {
  topByMemory: ProcessInfo[],
  topByCpu: ProcessInfo[],
  totalProcesses: number,
  running: number,
  blocked: number,
  sleeping: number
}
```

## Table Columns

| Column | Description | Format |
|--------|-------------|--------|
| Process Name | Executable name (with 🔒 for critical) | Text |
| PID | Process identifier | Number |
| Memory | Memory usage | XX.XX GB |
| CPU % | CPU usage percentage | XX.X% |
| Action | Terminate button (disabled for critical) | Button |

## Sort Options

- **Memory Usage** (default): Top processes by RAM consumption
- **CPU Usage**: Top processes by CPU percentage
- **Process Name**: Alphabetical order

## Filter Options

- **All Processes**: Show all tracked processes
- **High Memory** (>500MB): Memory hogs only
- **High CPU** (>10%): CPU intensive processes

## Critical Process Protection

Protected processes include:
- `explorer.exe` - Windows Explorer (file system)
- `svchost.exe` - Windows service host
- `csrss.exe` - Client/server runtime subsystem
- `lsass.exe` - Local security authority
- `services.exe` - Windows Service Manager
- `winlogon.exe` - Windows login manager
- `smss.exe` - Session manager subsystem

**Status Icon**: 🔒 indicates protected process

## Visual Indicators

### Color Coding

| Condition | Background | Text Color |
|-----------|-----------|-----------|
| High Memory (>1GB) | Red/20% | Default |
| High CPU (>50%) | Default | Default |
| Selected Row | Slate-700 | White |
| Alternate Row | Slate-800/50% | Default |
| Hover State | Slate-700/50% | White |

### Badges

- **Memory**: Shows GB value, red highlight if >1GB
- **CPU**: Shows % value, orange highlight if >50%
- **Protected**: Yellow "🔒 Protected" indicator

## Termination Workflow

1. User clicks "Terminate" button
2. Confirmation dialog appears with process name and PID
3. If confirmed → Send termination request to backend
4. Backend process.kill() called
5. Process list refreshes
6. Success/error notification sent

## Error Handling

```typescript
// Process fetch failure
try {
  const processes = await window.api.getProcessList()
} catch (error) {
  console.error('Failed to fetch processes:', error)
  // Component shows loading state
}

// Termination failure
try {
  await terminateProcess(pid)
} catch (error) {
  console.error('Failed to terminate:', error)
  // Show error toast notification
}
```

## Performance Notes

- Displays top 20 processes by default (configurable)
- Updates every 2 seconds (configurable)
- Table virtualization recommended for large process lists
- No animation during updates (performance)

## Safety Features

1. **Critical Process Lock**: Cannot terminate system processes
2. **Confirmation Dialog**: Requires user confirmation before termination
3. **PID Display**: Shows process ID for verification
4. **Protected Indicator**: Visual cue for system-critical processes
5. **Non-Destructive Sort**: Original order available if needed

## Styling

Uses Tailwind CSS:
- Background: `bg-slate-800` (dark theme)
- Text: `text-slate-400`, `text-cyan-400` (color-coded)
- Borders: `border-slate-700` (subtle)
- Buttons: `bg-red-700` with hover effects
- Tables: Responsive with scrolling

## Future Enhancements

- [ ] Process termination implementation
- [ ] Process priority adjustment
- [ ] Process affinity management
- [ ] Process dependency visualization
- [ ] Service management (start/stop/restart)
- [ ] Process tree view (parent/child relationships)
- [ ] Export process list as CSV
- [ ] Memory snapshot comparison

## Dependencies

- React hooks: useState, useEffect
- Tailwind CSS: 3.4.1 (styling)
- No external UI libraries required

## Related Components

- `MonitoringPanel.tsx`: Often displayed alongside process manager
- `PerformanceChart.tsx`: Shows overall system metrics
- `SystemMonitor` (backend): Data source via IPC
- `ProcessManager.tsx` (backend): Implements termination logic (TODO)

## Accessibility

- Keyboard navigation: Tab through processes
- Screen reader: Column headers properly labeled
- Color not sole indicator: Icons used alongside colors (e.g., 🔒)
- Focus indicators: Clear on interactive elements
