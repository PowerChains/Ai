# Database Service

## Overview
The DatabaseService provides a singleton SQLite connection with schema initialization. All persistent data is stored in a local SQLite database for resilience and offline capability.

**Location**: `src/backend/database/service.ts`

## Exports

### Class: DatabaseService

#### getInstance(): DatabaseService (static)
- **Description**: Gets singleton instance of DatabaseService
- **Parameters**: None
- **Returns**: DatabaseService instance
- **Throws**: Error if database initialization fails
- **Example**:
```typescript
import { DatabaseService } from '@backend/database/service'

const db = DatabaseService.getInstance()
const data = db.getDb()
```

#### Constructor (private)
- **Description**: Private constructor for singleton pattern
- **Parameters**: None
- **Side Effects**: Initializes database file and tables

#### getDb(): Database.Database
- **Description**: Gets the underlying better-sqlite3 Database instance
- **Parameters**: None
- **Returns**: SQLite database object for queries
- **Example**:
```typescript
const db = DatabaseService.getInstance().getDb()
const stmt = db.prepare('SELECT * FROM messages')
const rows = stmt.all()
```

#### close(): void
- **Description**: Closes database connection
- **Parameters**: None
- **Returns**: void
- **Example**:
```typescript
DatabaseService.getInstance().close()
```

## Database Schema

### messages Table
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL
)
```
- **Purpose**: Stores conversation history
- **Fields**:
  - `id`: Unique message identifier
  - `role`: 'user' or 'assistant'
  - `content`: Message text
  - `timestamp`: ISO format timestamp

### settings Table
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```
- **Purpose**: Stores application settings
- **Fields**:
  - `key`: Setting name
  - `value`: JSON-serialized value
  - `updated_at`: Last update timestamp

### events Table
```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT,
  severity TEXT,
  timestamp TEXT NOT NULL,
  data TEXT
)
```
- **Purpose**: Logs system events
- **Fields**:
  - `id`: Unique event ID
  - `type`: Event category
  - `description`: Event details
  - `severity`: 'low', 'medium', 'high'
  - `timestamp`: When event occurred
  - `data`: Additional JSON data

### actions Table
```sql
CREATE TABLE actions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT,
  parameters TEXT,
  result TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT
)
```
- **Purpose**: Tracks executed actions
- **Fields**:
  - `id`: Action ID
  - `name`: Action name
  - `status`: 'pending', 'executing', 'completed', 'failed'
  - `parameters`: JSON of execution parameters
  - `result`: JSON result of action
  - `created_at`: When action was created
  - `completed_at`: When action finished

### snapshots Table
```sql
CREATE TABLE snapshots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL
)
```
- **Purpose**: Stores system state snapshots for rollback
- **Fields**:
  - `id`: Snapshot ID
  - `name`: Human-readable name
  - `description`: Snapshot purpose
  - `data`: JSON of system state
  - `created_at`: When snapshot was taken

## Dependencies
- **better-sqlite3**: Embedded SQL database
- **Logger**: For initialization logging

## Configuration

### Environment Variables
- **DB_PATH**: Database file location (default: `./systemai.db`)

### Database Location
Default: `./systemai.db` (project root)

## Usage Examples

### Basic Query
```typescript
import { DatabaseService } from '@backend/database/service'

const db = DatabaseService.getInstance().getDb()

// Read data
const stmt = db.prepare('SELECT * FROM messages WHERE role = ?')
const userMessages = stmt.all('user')

// Insert data
const insert = db.prepare(
  'INSERT INTO messages (id, role, content, timestamp) VALUES (?, ?, ?, ?)'
)
insert.run('msg-1', 'user', 'Hello', '2026-05-16T00:00:00Z')

// Update data
const update = db.prepare(
  'UPDATE settings SET value = ? WHERE key = ?'
)
update.run('true', 'darkMode')

// Delete data
const del = db.prepare('DELETE FROM messages WHERE id = ?')
del.run('msg-1')
```

### Transaction Example
```typescript
const db = DatabaseService.getInstance().getDb()

const transaction = db.transaction(() => {
  const insert1 = db.prepare(
    'INSERT INTO messages (id, role, content, timestamp) VALUES (?, ?, ?, ?)'
  )
  insert1.run('msg-1', 'user', 'Question', '2026-05-16T00:00:00Z')
  
  const insert2 = db.prepare(
    'INSERT INTO messages (id, role, content, timestamp) VALUES (?, ?, ?, ?)'
  )
  insert2.run('msg-2', 'assistant', 'Answer', '2026-05-16T00:01:00Z')
})

transaction() // Executes atomically
```

### Using in Services
```typescript
import { DatabaseService } from '@backend/database/service'
import { Logger } from '@backend/services/logger'

class MyService {
  private db = DatabaseService.getInstance().getDb()
  private logger = new Logger('MyService')
  
  async fetchData(id: string) {
    try {
      const stmt = this.db.prepare(
        'SELECT * FROM events WHERE id = ?'
      )
      const result = stmt.get(id)
      this.logger.info('Data fetched', { id })
      return result
    } catch (error) {
      this.logger.error('Failed to fetch data', error)
      throw error
    }
  }
}
```

## Performance Considerations

### Optimization Tips
1. Use prepared statements (avoid SQL injection)
2. Use transactions for multiple operations
3. Add indexes on frequently-queried columns
4. Use limits to reduce memory usage
5. Backup database regularly

### Benchmarks
- **Query speed**: < 10ms for typical operations
- **Insert speed**: < 5ms per record
- **Transaction overhead**: < 1ms per atomic operation

### Index Recommendations
```sql
-- Add for performance
CREATE INDEX idx_messages_timestamp 
  ON messages(timestamp)

CREATE INDEX idx_events_severity 
  ON events(severity)

CREATE INDEX idx_actions_status 
  ON actions(status)
```

## Backup and Recovery

### Manual Backup
```bash
cp systemai.db systemai.db.backup-$(date +%Y%m%d)
```

### Restore from Backup
```bash
cp systemai.db.backup-20260516 systemai.db
```

### Scheduled Backups (recommended)
Implement in cron job or scheduled task:
```bash
# Daily backup at 2 AM
0 2 * * * cp /path/to/systemai.db /backups/systemai.db.$(date +\%Y\%m\%d)
```

## Testing
- Unit tests in: `src/**/__tests__/database.test.ts`
- Coverage target: > 85%
- Test cases:
  - Table creation
  - CRUD operations
  - Transaction handling
  - Error conditions
  - Singleton pattern

## Future Improvements
- Database encryption
- Replication support
- Compression for large datasets
- Automatic maintenance tasks
- Query performance profiling
- Automated backups
- Migration system

## Related Documentation
- [DEVELOPMENT.md](../../DEVELOPMENT.md) - Development guide
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - System architecture
- [RULES.md](../../RULES.md) - Code discipline rules
