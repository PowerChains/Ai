import { Logger } from '../services/logger'
import { Database } from 'better-sqlite3'
import { DatabaseService } from './service'

export class SettingsService {
  private db: Database
  private logger = new Logger('SettingsService')

  constructor() {
    this.db = DatabaseService.getInstance().getDb()
  }

  async getSettings(): Promise<Record<string, any>> {
    try {
      const stmt = this.db.prepare('SELECT key, value FROM settings')
      const rows = stmt.all() as Array<{ key: string; value: string }>

      const settings: Record<string, any> = {}
      rows.forEach((row) => {
        try {
          settings[row.key] = JSON.parse(row.value)
        } catch {
          settings[row.key] = row.value
        }
      })

      return settings
    } catch (error) {
      this.logger.error('Failed to get settings:', error)
      return {}
    }
  }

  async getSetting(key: string): Promise<any> {
    try {
      const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?')
      const result = stmt.get(key) as { value: string } | undefined

      if (!result) return null

      try {
        return JSON.parse(result.value)
      } catch {
        return result.value
      }
    } catch (error) {
      this.logger.error(`Failed to get setting ${key}:`, error)
      return null
    }
  }

  async saveSettings(settings: Record<string, any>): Promise<void> {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, ?)
      `)

      for (const [key, value] of Object.entries(settings)) {
        const jsonValue = typeof value === 'string' ? value : JSON.stringify(value)
        stmt.run(key, jsonValue, new Date().toISOString())
      }

      this.logger.info('Settings saved successfully')
    } catch (error) {
      this.logger.error('Failed to save settings:', error)
      throw error
    }
  }

  async setSetting(key: string, value: any): Promise<void> {
    try {
      const jsonValue = typeof value === 'string' ? value : JSON.stringify(value)
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, ?)
      `)
      stmt.run(key, jsonValue, new Date().toISOString())
      this.logger.info(`Setting ${key} saved successfully`)
    } catch (error) {
      this.logger.error(`Failed to save setting ${key}:`, error)
      throw error
    }
  }

  async setMode(mode: 'guided' | 'auto'): Promise<void> {
    await this.setSetting('mode', mode)
  }

  async getMode(): Promise<'guided' | 'auto'> {
    const mode = await this.getSetting('mode')
    return mode || 'guided'
  }
}
