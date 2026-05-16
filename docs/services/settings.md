# Settings Service

## Overview
The Settings Service manages application configuration and user preferences. All settings are persisted to the SQLite database for consistency across sessions.

**Location**: `src/backend/services/settings.ts`

## Exports

### Class: SettingsService

#### Constructor
```typescript
constructor()
```
- **Description**: Initializes settings service
- **Parameters**: None
- **Returns**: SettingsService instance
- **Example**:
```typescript
import { SettingsService } from '@backend/services/settings'

const settings = new SettingsService()
const mode = await settings.getMode()
```

#### getSettings(): Promise<Record<string, any>>
- **Description**: Retrieves all settings
- **Parameters**: None
- **Returns**: Promise resolving to settings object
- **Throws**: None (returns empty object on error)
- **Example**:
```typescript
const allSettings = await settings.getSettings()
console.log(allSettings)
// Output: { mode: 'guided', darkMode: true, ... }
```

#### getSetting(key: string): Promise<any>
- **Description**: Gets specific setting value
- **Parameters**: 
  - `key`: Setting name
- **Returns**: Promise resolving to setting value or null
- **Throws**: None
- **Example**:
```typescript
const darkMode = await settings.getSetting('darkMode')
console.log(darkMode) // true or false or null
```

#### saveSettings(settings: Record<string, any>): Promise<void>
- **Description**: Saves multiple settings at once
- **Parameters**: 
  - `settings`: Object with key-value pairs
- **Returns**: Promise that resolves when saved
- **Throws**: Error if save fails
- **Example**:
```typescript
await settings.saveSettings({
  mode: 'auto',
  darkMode: true,
  refreshInterval: 2000
})
```

#### setSetting(key: string, value: any): Promise<void>
- **Description**: Sets single setting value
- **Parameters**: 
  - `key`: Setting name
  - `value`: Setting value (any type)
- **Returns**: Promise that resolves when saved
- **Throws**: Error if save fails
- **Example**:
```typescript
await settings.setSetting('mode', 'auto')
await settings.setSetting('monitoringInterval', 2000)
```

#### setMode(mode: 'guided' | 'auto'): Promise<void>
- **Description**: Sets operational mode
- **Parameters**: 
  - `mode`: 'guided' or 'auto'
- **Returns**: Promise that resolves when saved
- **Throws**: Error if save fails
- **Example**:
```typescript
await settings.setMode('auto')
```

#### getMode(): Promise<'guided' | 'auto'>
- **Description**: Gets current operational mode
- **Parameters**: None
- **Returns**: Promise resolving to mode string
- **Throws**: None (defaults to 'guided')
- **Example**:
```typescript
const mode = await settings.getMode()
console.log(`Current mode: ${mode}`)
```

## Dependencies
- **DatabaseService**: For persistent storage
- **Logger**: For operation logging

## Configuration

### Default Settings
```typescript
{
  mode: 'guided',
  darkMode: true,
  monitoringInterval: 2000,
  loggingLevel: 'info',
  autoBackup: true
}
```

### Setting Types

```typescript
interface AppSettings {
  // Core settings
  mode: 'guided' | 'auto'
  darkMode: boolean
  
  // Monitoring
  monitoringInterval: number
  enableNetworkMonitoring: boolean
  enableSecurityScanning: boolean
  
  // UI
  enableNotifications: boolean
  enableSoundAlerts: boolean
  
  // Advanced
  loggingLevel: 'debug' | 'info' | 'warn' | 'error'
  autoBackup: boolean
  backupInterval: number
}
```

## Usage Examples

### Getting Settings
```typescript
const settings = new SettingsService()

// Get all settings
const all = await settings.getSettings()

// Get specific setting
const mode = await settings.getMode()
const interval = await settings.getSetting('monitoringInterval')

// Get with default
const theme = await settings.getSetting('theme') || 'dark'
```

### Updating Settings
```typescript
const settings = new SettingsService()

// Update single setting
await settings.setSetting('darkMode', false)

// Update mode
await settings.setMode('auto')

// Update multiple settings
await settings.saveSettings({
  mode: 'auto',
  darkMode: true,
  monitoringInterval: 1000
})
```

### Settings in Components
```typescript
import { SettingsService } from '@backend/services/settings'

export default function Settings() {
  const [settings, setSettings] = useState({})
  const settingsService = new SettingsService()
  
  useEffect(() => {
    settingsService.getSettings().then(setSettings)
  }, [])
  
  const handleModeChange = async (newMode) => {
    await settingsService.setMode(newMode)
    setSettings(prev => ({ ...prev, mode: newMode }))
  }
  
  return (
    <div>
      <button onClick={() => handleModeChange('guided')}>
        Guided Mode
      </button>
      <button onClick={() => handleModeChange('auto')}>
        Auto Mode
      </button>
    </div>
  )
}
```

### Persistence Example
```typescript
class MonitoringService {
  private settings: SettingsService
  
  async startMonitoring() {
    const interval = await this.settings.getSetting('monitoringInterval')
    
    setInterval(async () => {
      const metrics = await this.collectMetrics()
      // Use metrics
    }, interval || 2000)
  }
}
```

## Best Practices

### ✅ DO
```typescript
// Check setting exists before use
const interval = await settings.getSetting('interval') || 2000

// Use proper types for settings
await settings.setSetting('mode', 'auto') // ✅ Correct type

// Group related settings when saving
await settings.saveSettings({
  monitoringInterval: 2000,
  enableNetworkMonitoring: true
})

// Log setting changes
logger.info('Setting updated', { key: 'mode', value: 'auto' })
```

### ❌ DON'T
```typescript
// Don't assume setting exists
const interval = await settings.getSetting('interval') // May be null

// Don't use wrong types
await settings.setSetting('mode', 123) // ❌ Wrong type

// Don't store sensitive data
await settings.setSetting('password', 'secret123') // ❌ Security risk

// Don't hardcode values in code
const interval = 2000 // ❌ Should use settings
```

## Performance Considerations
- Settings cached in memory (avoid repeated database hits)
- JSON serialization for complex values
- Minimal database overhead
- No blocking operations

## Testing
- Unit tests in: `src/**/__tests__/settings.test.ts`
- Coverage target: > 90%
- Test cases:
  - Get/set single settings
  - Get/set multiple settings
  - Mode switching
  - Default value handling
  - Error cases

## Future Improvements
- Settings validation schema
- Settings migration system
- Per-user settings (multi-user support)
- Cloud sync capability
- Encrypted sensitive settings
- Settings versioning
- Preset configurations

## Related Documentation
- [DEVELOPMENT.md](../../DEVELOPMENT.md) - Development guide
- [DATABASE.md](./database.md) - Database service
- [RULES.md](../../RULES.md) - Code discipline rules
