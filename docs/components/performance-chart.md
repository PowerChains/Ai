# PerformanceChart Component

## Overview

The `PerformanceChart` component provides real-time visualization of system metrics using interactive line and area charts. It displays CPU, memory, and disk usage trends over a configurable time window.

## Features

- **Real-time Updates**: Fetches system metrics at configurable intervals
- **Historical Data**: Maintains up to 5 minutes of historical data points
- **Interactive Charts**: Powered by Recharts library for responsive visualization
- **Multiple Chart Types**: Line charts for trends, area charts for disk usage
- **Current Stats**: Displays latest metric values with color-coded cards

## Component Structure

```typescript
interface PerformanceDataPoint {
  timestamp: string      // HH:mm:ss format
  cpu: number            // CPU usage percentage
  memory: number         // Memory usage percentage
  disk: number           // Disk usage percentage
}

interface PerformanceChartProps {
  refreshInterval?: number    // Update interval in ms (default: 2000)
  dataRetentionMinutes?: number // Historical data window (default: 5)
}
```

## Usage

### Basic Usage

```tsx
import PerformanceChart from '@/renderer/components/PerformanceChart'

export function Dashboard() {
  return (
    <div>
      <PerformanceChart 
        refreshInterval={2000}
        dataRetentionMinutes={5}
      />
    </div>
  )
}
```

### Custom Configuration

```tsx
// Update more frequently
<PerformanceChart refreshInterval={1000} />

// Keep more historical data
<PerformanceChart dataRetentionMinutes={10} />

// Both
<PerformanceChart 
  refreshInterval={1000}
  dataRetentionMinutes={10}
/>
```

## Data Flow

1. Component mounts → Fetch initial metrics
2. Set up interval → Fetch metrics every N ms
3. Process data → Format with timestamp
4. Update state → Trigger chart re-render
5. Clean up → Clear interval on unmount

## API Requirements

The component requires these IPC methods from `window.api`:

- `getCpuUsage()` - Returns: `{current: number, cores: [], uptime, timestamp}`
- `getMemoryUsage()` - Returns: `{total, used, available, free, percent, timestamp}`
- `getDiskHealth()` - Returns: `{drives: [{filesystem, size, used, available, percent}], ...}`

## Charts Explained

### CPU & Memory Trends
- **Line Chart**: Dual-axis display
- **CPU Line**: Cyan color (#06b6d4)
- **Memory Line**: Purple color (#a855f7)
- **Y-Axis**: 0-100% scale
- **X-Axis**: Timestamp labels (HH:mm:ss)

### Disk Usage Trend
- **Area Chart**: Filled area visualization
- **Color**: Red (#ef4444 with 30% opacity fill)
- **Y-Axis**: 0-100% scale
- **Shows**: Primary drive usage pattern

### Current Stats Cards
- **CPU**: Cyan background, latest CPU %
- **Memory**: Purple background, latest memory %
- **Disk**: Red background, latest disk %
- **Format**: `XX.X%` with unit label

## Performance Considerations

- Data points capped at 60 maximum (1-minute history at 1-second intervals)
- No animation during real-time updates (improves performance)
- Charts re-render only on data change, not on props change
- Old data points automatically pruned based on retention setting

## Error Handling

```typescript
// Failed metric fetch
try {
  const cpu = await window.api.getCpuUsage()
} catch (error) {
  console.error('Failed to fetch metrics:', error)
  // Chart shows loading state
}
```

## Styling

Uses Tailwind CSS classes:
- Background: `bg-slate-800` (dark theme)
- Borders: `border-slate-700` (subtle borders)
- Text: `text-cyan-400`, `text-slate-400` (color coding)
- Layout: `space-y-6` (vertical spacing)

## Future Enhancements

- [ ] Custom date range selection
- [ ] Export chart data as CSV
- [ ] Threshold-based alerts
- [ ] Comparison mode (before/after optimization)
- [ ] Predictive trend indicators
- [ ] Network performance overlay

## Dependencies

- `recharts`: ^2.10.3 (charting library)
- `date-fns`: ^2.30.0 (date formatting)
- React hooks: useState, useEffect
- Tailwind CSS: 3.4.1 (styling)

## Related Components

- `MonitoringPanel.tsx`: Parent component using charts
- `SystemMonitor` (backend): Data source via IPC
- `Header.tsx`: Uses similar metric fetching patterns
