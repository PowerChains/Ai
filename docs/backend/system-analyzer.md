# SystemAnalyzer Engine

## Overview

The `SystemAnalyzer` is a backend engine that performs comprehensive system health analysis. It evaluates system metrics, identifies issues, and generates actionable recommendations for optimization and repair.

## Purpose

Provide intelligent system diagnostics that:
- Calculate overall system health score (0-100)
- Identify performance bottlenecks
- Detect security concerns
- Generate prioritized recommendations
- Assess risk factors
- Track performance trends

## Core Architecture

```typescript
class SystemAnalyzer {
  // Main analysis method
  async analyzeSystem(): Promise<SystemAnalysis>
  
  // Trend analysis
  async getPerformanceTrend(): Promise<TrendMetrics>
  
  // Bottleneck detection
  async getBottlenecks(): Promise<string[]>
  
  // Private analysis methods
  private identifyIssues(metrics: HealthMetrics): HealthIssue[]
  private generateRecommendations(...): string[]
  private calculateHealthScore(metrics: HealthMetrics): number
  private getStatus(score: number): HealthStatus
  private identifyRisks(metrics: HealthMetrics): string[]
}
```

## Data Structures

### HealthMetrics

```typescript
interface HealthMetrics {
  cpu: number        // CPU usage percentage (0-100)
  memory: number     // Memory usage percentage (0-100)
  disk: number       // Disk usage percentage (0-100)
  network: number    // Network utilization (0-100)
  processes: number  // Number of running processes
  security: number   // Security score (0-100)
}
```

### HealthIssue

```typescript
interface HealthIssue {
  id: string                               // Unique identifier
  severity: 'low' | 'medium' | 'high' | 'critical'
  component: string                        // CPU, Memory, Disk, etc.
  title: string                            // Issue name
  description: string                      // Detailed description
  recommendation: string                   // Fix recommendation
  autoFixable: boolean                     // Can be auto-repaired
}
```

### SystemAnalysis (Result)

```typescript
interface SystemAnalysis {
  timestamp: Date                    // Analysis timestamp
  healthScore: number                // 0-100 overall score
  status: 'healthy' | 'warning' | 'critical'
  metrics: HealthMetrics             // Current metrics
  issues: HealthIssue[]              // Identified problems
  recommendations: string[]          // Actionable suggestions
  riskFactors: string[]             // Potential risks
}
```

## Usage

### Basic Analysis

```typescript
import { SystemAnalyzer } from '@backend/engines/analyzer/system'

const analyzer = new SystemAnalyzer()
const analysis = await analyzer.analyzeSystem()

console.log(`Health Score: ${analysis.healthScore}%`)
console.log(`Status: ${analysis.status}`)
console.log(`Issues: ${analysis.issues.length}`)
```

### Issue Handling

```typescript
const analysis = await analyzer.analyzeSystem()

// Filter by severity
const critical = analysis.issues.filter(i => i.severity === 'critical')

// Get auto-fixable issues
const autoFixable = analysis.issues.filter(i => i.autoFixable)

// Process recommendations
analysis.recommendations.forEach(rec => {
  console.log(`📋 ${rec}`)
})
```

### Trend Analysis

```typescript
// Get performance over time
const trend = await analyzer.getPerformanceTrend()
console.log(`Average CPU: ${trend.avgCpu}%`)
console.log(`Peak Memory: ${trend.peakMemory}%`)

// Bottleneck detection
const bottlenecks = await analyzer.getBottlenecks()
bottlenecks.forEach(b => console.log(`⚠️ ${b}`))
```

## Analysis Rules

### CPU Analysis

| Usage | Severity | Recommendation |
|-------|----------|-----------------|
| <60% | Healthy | - |
| 60-80% | Medium | Close unnecessary apps |
| 80-95% | High | Optimize services |
| >95% | Critical | Immediate intervention |

### Memory Analysis

| Usage | Severity | Recommendation |
|-------|----------|-----------------|
| <70% | Healthy | - |
| 70-85% | Medium | Monitor processes |
| 85-95% | High | Close applications |
| >95% | Critical | Increase RAM/Virtual memory |

### Disk Analysis

| Usage | Severity | Recommendation |
|-------|----------|-----------------|
| <70% | Healthy | - |
| 70-75% | Medium | Cleanup recommended |
| 75-90% | High | Cleanup required |
| >90% | Critical | Delete files immediately |

### Process Analysis

| Count | Severity | Recommendation |
|-------|----------|-----------------|
| <100 | Healthy | - |
| 100-150 | Low | Review startup |
| 150-200 | Medium | Disable services |
| >200 | High | Aggressive optimization |

### Security Analysis

| Score | Severity | Recommendation |
|-------|----------|-----------------|
| >80 | Healthy | - |
| 70-80 | Low | Review settings |
| 60-70 | High | Run security scan |
| <60 | Critical | Update system |

## Health Score Calculation

The health score uses weighted metrics:

```
Score = (CPU × 0.20) + (Memory × 0.25) + (Disk × 0.25) + 
         (Network × 0.10) + (Processes × 0.10) + (Security × 0.10)

Where each metric score = 100 - usage_percentage
(Processes uses: 100 - (count / 2))
```

Health Status:
- **80-100**: Healthy (Green)
- **60-79**: Warning (Yellow)
- **0-59**: Critical (Red)

## Issue Identification

Issues are detected based on:

1. **CPU Issues**: >80% usage
2. **Memory Issues**: >85% usage
3. **Disk Issues**: >75% usage (high) or >90% (critical)
4. **Process Issues**: >200 processes
5. **Security Issues**: Score <70

Each issue includes:
- Unique ID for tracking
- Severity level
- Component affected
- Human-readable title
- Technical description
- Actionable recommendation
- Auto-fix capability flag

## Recommendations Generation

Recommendations are generated based on:

- CPU load (if >60%)
- Memory pressure (if >70%)
- Disk space (if >70%)
- Process count (if >150)
- Overall health (if no issues, returns success message)

## Risk Assessment

Risk factors identify potential future problems:

- High CPU usage patterns
- Memory pressure approaching limit
- Disk space criticality
- Security vulnerabilities
- Service health
- Driver issues

## Integration Points

### With SystemMonitor

```typescript
const monitor = new SystemMonitor()
const metrics = {
  cpu: (await monitor.getCpuUsage()).current,
  memory: (await monitor.getMemoryUsage()).percent,
  disk: (await monitor.getDiskHealth()).drives[0].percent,
  network: 0, // TODO: Add network monitoring
  processes: (await monitor.getProcessList()).totalProcesses,
  security: 85 // TODO: Add security scanning
}
```

### With AIEngine

```typescript
const analysis = await analyzer.analyzeSystem()

// AI can use analysis for smart recommendations
if (analysis.status === 'critical') {
  const response = await aiEngine.processMessage(
    `Please help with these issues: ${analysis.issues.map(i => i.title).join(', ')}`
  )
}
```

### With NotificationService

```typescript
const analysis = await analyzer.analyzeSystem()

// Create notifications for critical issues
for (const issue of analysis.issues) {
  if (issue.severity === 'critical') {
    await notifications.createNotification({
      title: issue.title,
      message: issue.description,
      severity: 'error'
    })
  }
}
```

## Future Enhancements

- [ ] Predictive analysis using historical data
- [ ] Machine learning for anomaly detection
- [ ] Custom threshold configuration
- [ ] Comparative analysis (before/after optimization)
- [ ] Performance benchmarking
- [ ] Driver health monitoring
- [ ] Temperature monitoring
- [ ] Power usage analysis
- [ ] Network performance analysis
- [ ] Service dependency analysis

## Performance Considerations

- Analysis completes in <500ms
- Leverages cached system data where possible
- Incremental analysis for large process lists
- Lazy loading of historical trend data

## Error Handling

```typescript
try {
  const analysis = await analyzer.analyzeSystem()
} catch (error) {
  logger.error('Analysis failed:', error)
  // Return default healthy state
  return defaultHealthyAnalysis()
}
```

## Logging

All analyzer operations are logged:

- `SystemAnalyzer:info` - Analysis started/completed
- `SystemAnalyzer:debug` - Bottleneck calculation
- `SystemAnalyzer:error` - Analysis failures

## Testing

```typescript
// Test issue detection
const analyzer = new SystemAnalyzer()
const testMetrics = { cpu: 95, memory: 90, ... }
const issues = analyzer.identifyIssues(testMetrics)
expect(issues.some(i => i.severity === 'critical')).toBe(true)

// Test health score
const score = analyzer.calculateHealthScore(testMetrics)
expect(score).toBeLessThan(60)
```

## Related Components

- `SystemMonitor.ts`: Data source for metrics
- `NotificationService.ts`: Delivers issue alerts
- `AIEngine.ts`: Uses analysis for recommendations
- `Logger.ts`: Structured logging
