# Logger Service

## Overview
The Logger service provides structured logging to both console and file system. All application events are logged with timestamps, module context, and severity levels.

**Location**: `src/backend/services/logger.ts`

## Exports

### Class: Logger

#### Constructor
```typescript
constructor(name: string)
```
- **Description**: Creates logger instance for a module
- **Parameters**: 
  - `name`: Module/component name for log context
- **Returns**: Logger instance
- **Example**:
```typescript
import { Logger } from '@backend/services/logger'
const logger = new Logger('SystemMonitor')
```

#### debug(message: string, data?: any): void
- **Description**: Logs debug-level message
- **Parameters**:
  - `message`: Log message text
  - `data`: Optional associated data object
- **Returns**: void
- **Severity**: DEBUG (lowest)
- **Example**:
```typescript
logger.debug('Starting CPU monitoring', { interval: 2000 })
```

#### info(message: string, data?: any): void
- **Description**: Logs informational message
- **Parameters**:
  - `message`: Log message text
  - `data`: Optional associated data object
- **Returns**: void
- **Severity**: INFO
- **Example**:
```typescript
logger.info('System optimization completed', { itemsCleaned: 45 })
```

#### warn(message: string, data?: any): void
- **Description**: Logs warning-level message
- **Parameters**:
  - `message`: Log message text
  - `data`: Optional associated data object
- **Returns**: void
- **Severity**: WARN
- **Example**:
```typescript
logger.warn('Memory usage above 80%', { current: 85.2 })
```

#### error(message: string, data?: any): void
- **Description**: Logs error-level message
- **Parameters**:
  - `message`: Log message text
  - `data`: Error object or details
- **Returns**: void
- **Severity**: ERROR (highest)
- **Example**:
```typescript
logger.error('Failed to execute repair', error)
```

## Configuration

### Environment Variables
- **LOG_DIR**: Directory for log files (default: `./logs`)
- **NODE_ENV**: Environment mode (affects verbosity)

### Log File Location
Logs stored in: `LOG_DIR/YYYY-MM-DD.log`

New log file created daily automatically.

## Log Format

### Console Output
```
[2026-05-16T14:30:45.123Z] [ModuleName] [LEVEL] Message optional_data
```

### File Output
Same format, appended to daily log file.

## Dependencies
- **fs**: File system operations
- **path**: File path handling

## Internal Implementation

### Log Directory Management
1. Checks if log directory exists
2. Creates if missing (recursive)
3. Uses environment variable or default path

### Log Message Formatting
1. Gets current ISO timestamp
2. Includes module name
3. Formats severity level
4. Appends message and optional data
5. Converts data to JSON string if provided

### File Writing
- Appends to file synchronously
- Creates new file for each day
- Graceful error handling if write fails
- Errors logged to console even if file write fails

## Usage Examples

### Module Initialization
```typescript
import { Logger } from '@backend/services/logger'

class MyService {
  private logger = new Logger('MyService')
  
  constructor() {
    this.logger.info('MyService initialized')
  }
}
```

### Operation Logging
```typescript
async function fetchData(id: string) {
  const logger = new Logger('DataFetch')
  
  try {
    logger.debug('Fetching data', { id })
    const data = await database.fetch(id)
    logger.info('Data fetched successfully', { size: data.length })
    return data
  } catch (error) {
    logger.error('Failed to fetch data', error)
    throw error
  }
}
```

### Debugging Sessions
```typescript
const logger = new Logger('DebugSession')

logger.debug('Starting operation', { timestamp: Date.now() })
logger.debug('Step 1: Initialization', { initialized: true })
logger.debug('Step 2: Processing', { itemsProcessed: 100 })
logger.info('Operation completed successfully')
```

### Error Tracking
```typescript
const logger = new Logger('ErrorHandler')

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    message: error.message,
    stack: error.stack,
    timestamp: Date.now()
  })
})
```

## Log Levels Guide

| Level | When to Use | Example |
|-------|------------|---------|
| DEBUG | Development, detailed flow | "Processing item 5 of 100" |
| INFO | Important events | "System optimization completed" |
| WARN | Unexpected but recoverable | "Memory usage above 80%" |
| ERROR | Failures and exceptions | "Operation failed: timeout" |

## Best Practices

### ✅ DO
```typescript
// Use module-specific logger
const logger = new Logger('SystemMonitor')

// Include relevant context
logger.info('Metrics collected', { cpu: 45, memory: 60 })

// Log errors with context
logger.error('Failed to monitor CPU', error)

// Log entry/exit of critical functions
logger.debug('Starting optimization')
// ... do work
logger.info('Optimization completed', { result })
```

### ❌ DON'T
```typescript
// Don't use console.log
console.log('Starting operation') // Use logger instead

// Don't ignore errors
try { operation() } catch (e) { } // Always log errors

// Don't log sensitive data
logger.info('User login', { password: '123456' }) // Never log secrets

// Don't use vague messages
logger.info('Done') // Use descriptive messages
```

## Log Analysis

### View Today's Logs
```bash
cat logs/2026-05-16.log
```

### View Error Messages
```bash
grep ERROR logs/*.log
```

### View Module-Specific Logs
```bash
grep "SystemMonitor" logs/*.log
```

### Count Log Entries
```bash
wc -l logs/*.log
```

## Performance Considerations
- Synchronous file writing (minimal overhead < 1ms)
- Only writes on first access of log directory
- Minimal memory usage (no buffering)
- Single logger instance per module recommended

## Testing
- Unit tests in: `src/**/__tests__/logger.test.ts`
- Coverage target: > 90%
- Test cases:
  - All log levels
  - File creation
  - Error handling
  - Data serialization

## Related Documentation
- [RULES.md](../../RULES.md) - Logging discipline rules
- [DEVELOPMENT.md](../../DEVELOPMENT.md) - Development guide
