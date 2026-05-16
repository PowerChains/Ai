# NotificationService

## Overview

The `NotificationService` manages user notifications throughout the application lifecycle. It handles creation, storage, retrieval, and dismissal of system notifications with support for different severity levels and user actions.

## Purpose

Provide a centralized notification system that:
- Creates and stores notifications
- Categorizes by severity (info, warning, error, success)
- Persists to SQLite database
- Maintains in-memory queue for performance
- Prevents notification overflow
- Allows user interaction (dismiss, action)

## Core Architecture

```typescript
class NotificationService {
  // Create and store notifications
  async createNotification(input: CreateNotificationInput): Promise<NotificationData>
  
  // Query notifications
  async getNotifications(options?: FilterOptions): Promise<NotificationData[]>
  async getUnreadCount(): Promise<number>
  async getBySuccess(severity: NotificationSeverity): Promise<NotificationData[]>
  
  // User interaction
  async markAsRead(id: string): Promise<void>
  async dismissNotification(id: string): Promise<void>
  async clearAll(): Promise<void>
  
  // Analysis
  async getBottlenecks(): Promise<string[]>
  
  // Private
  private enforceLimit(): void
  private notificationQueue: Map<string, NotificationData>
}
```

## Data Structures

### NotificationData

```typescript
interface NotificationData {
  id: string                           // Unique identifier (nanoid)
  title: string                        // Notification title
  message: string                      // Main message
  severity: NotificationSeverity       // info | warning | error | success
  timestamp: Date                      // Creation time
  read: boolean                        // Read status
  action?: {                          // Optional action button
    label: string                      // Button text
    handler: string                    // Handler function name
  }
}

type NotificationSeverity = 'info' | 'warning' | 'error' | 'success'
```

### CreateNotificationInput

```typescript
interface CreateNotificationInput {
  title: string
  message: string
  severity?: NotificationSeverity    // Defaults to 'info'
  action?: {
    label: string
    handler: string
  }
}
```

## Usage

### Creating Notifications

```typescript
import { NotificationService } from '@backend/services/notifications/service'

const notifications = new NotificationService()

// Simple notification
await notifications.createNotification({
  title: 'System Update Available',
  message: 'A new version is ready to install',
  severity: 'info'
})

// Error notification
await notifications.createNotification({
  title: 'High Memory Usage',
  message: 'Memory is at 85% capacity',
  severity: 'error'
})

// Success notification with action
await notifications.createNotification({
  title: 'Cleanup Complete',
  message: 'Successfully freed 2GB of disk space',
  severity: 'success',
  action: {
    label: 'View Details',
    handler: 'showCleanupReport'
  }
})
```

### Retrieving Notifications

```typescript
// Get all notifications
const all = await notifications.getNotifications()

// Get unread only
const unread = await notifications.getNotifications({
  unreadOnly: true
})

// Get by severity
const errors = await notifications.getNotifications({
  severity: 'error'
})

// Get with limit
const recent = await notifications.getNotifications({
  limit: 10
})

// Combined filters
const unreadErrors = await notifications.getNotifications({
  unreadOnly: true,
  severity: 'error',
  limit: 5
})
```

### User Interaction

```typescript
// Mark as read
await notifications.markAsRead(notificationId)

// Dismiss (remove from queue)
await notifications.dismissNotification(notificationId)

// Clear all notifications
await notifications.clearAll()

// Get unread count
const count = await notifications.getUnreadCount()
console.log(`${count} unread notifications`)
```

## Storage Strategy

### In-Memory Queue

- Stores active notifications in a Map
- Fast read/write access
- Persists across renderer navigation
- Cleared on app restart

**Max Size**: 100 notifications (enforced)
**When Exceeded**: Oldest notifications automatically removed

### Database Persistence

- All notifications stored in `events` table
- Type: `'notification'`
- Severity level stored
- JSON metadata stored in `data` column

**Query Example**:
```sql
SELECT * FROM events 
WHERE type = 'notification' 
AND severity = 'error'
ORDER BY timestamp DESC 
LIMIT 10
```

## Severity Levels

| Level | Color | Icon | Usage |
|-------|-------|------|-------|
| **info** | Blue | ℹ️ | General information, status updates |
| **warning** | Yellow | ⚠️ | Cautionary messages, potential issues |
| **error** | Red | ❌ | Errors, critical failures |
| **success** | Green | ✅ | Completed tasks, achievements |

## Storage Limits

```typescript
private static readonly MAX_NOTIFICATIONS = 100
```

**Enforcement**:
- Checked after each creation
- Oldest notifications removed if exceeded
- Debug log created when limit enforced

**Example**:
```
[2024-05-16 14:30:42] [NotificationService] [DEBUG] Notification limit enforced { removed: 5 }
```

## Integration with AI Engine

```typescript
// AI can create notifications based on analysis
const analysis = await analyzer.analyzeSystem()

for (const issue of analysis.issues) {
  if (issue.severity === 'critical') {
    await notifications.createNotification({
      title: `⚠️ ${issue.title}`,
      message: issue.description,
      severity: issue.severity === 'critical' ? 'error' : 'warning',
      action: {
        label: 'View Recommendation',
        handler: `showIssue_${issue.id}`
      }
    })
  }
}
```

## Integration with SystemAnalyzer

```typescript
// Analyzer triggers notifications for detected issues
const issues = analysis.issues

const mapper = {
  low: 'info' as NotificationSeverity,
  medium: 'warning' as NotificationSeverity,
  high: 'error' as NotificationSeverity,
  critical: 'error' as NotificationSeverity
}

for (const issue of issues) {
  await notifications.createNotification({
    title: issue.title,
    message: issue.description,
    severity: mapper[issue.severity],
    action: {
      label: 'Fix',
      handler: `fix_${issue.id}`
    }
  })
}
```

## Frontend Integration (React)

```typescript
// Store integration
const useNotifications = () => {
  const { notifications, addNotification } = useAppStore()
  
  const notify = async (input: CreateNotificationInput) => {
    const n = await window.api.createNotification(input)
    addNotification(n)
  }
  
  return { notifications, notify }
}

// Usage in component
function MyComponent() {
  const { notify } = useNotifications()
  
  const handleError = (error: Error) => {
    notify({
      title: 'Operation Failed',
      message: error.message,
      severity: 'error'
    })
  }
  
  return <div>...</div>
}
```

## IPC Methods (Exposed)

These methods should be exposed in preload.ts:

```typescript
// Create notification
window.api.createNotification(input: CreateNotificationInput)

// Get notifications
window.api.getNotifications(options?: FilterOptions)

// Get unread count
window.api.getUnreadCount()

// Mark as read
window.api.markAsRead(id: string)

// Dismiss notification
window.api.dismissNotification(id: string)

// Clear all
window.api.clearAll()
```

## Error Handling

```typescript
try {
  await notifications.createNotification({
    title: 'Task Complete',
    message: 'Operation finished successfully',
    severity: 'success'
  })
} catch (error) {
  logger.error('Failed to create notification:', error)
  // Fallback: Show console error
}
```

## Logging

All operations are logged with context:

```
[2024-05-16 14:30:42] [NotificationService] [INFO] Notification created { id: 'abc123', severity: 'warning' }
[2024-05-16 14:30:43] [NotificationService] [DEBUG] Notification marked as read { id: 'abc123' }
[2024-05-16 14:30:44] [NotificationService] [DEBUG] Notification dismissed { id: 'abc123' }
[2024-05-16 14:30:45] [NotificationService] [INFO] All notifications cleared { count: 5 }
```

## Performance Considerations

- In-memory queue: O(1) access time
- Map-based storage: Fast lookup by ID
- Auto-cleanup: Prevents unbounded growth
- Lazy database access: Only on persistence

## Future Enhancements

- [ ] Notification sound/vibration
- [ ] Do Not Disturb mode
- [ ] Notification history archive
- [ ] Notification grouping (similar issues)
- [ ] Smart dismissal (auto-dismiss after timeout)
- [ ] Notification filtering preferences
- [ ] Batch notification operations
- [ ] Notification retry on failure
- [ ] Platform native notifications (Windows toast)
- [ ] Notification scheduling
- [ ] Smart severity detection

## Testing

```typescript
// Test creation
const n = await notifications.createNotification({
  title: 'Test',
  message: 'Test message',
  severity: 'info'
})
expect(n.id).toBeDefined()

// Test limit enforcement
for (let i = 0; i < 110; i++) {
  await notifications.createNotification({...})
}
const all = await notifications.getNotifications()
expect(all.length).toBeLessThanOrEqual(100)

// Test filtering
const errors = await notifications.getNotifications({
  severity: 'error'
})
expect(errors.every(n => n.severity === 'error')).toBe(true)
```

## Related Components

- `SystemAnalyzer.ts`: Creates critical notifications
- `AIEngine.ts`: AI-driven notification suggestions
- `Logger.ts`: Structured logging
- `DatabaseService.ts`: Persistence layer
- `appStore.ts` (React): Frontend state management
