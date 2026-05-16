import Database from 'better-sqlite3'
import path from 'path'
import { Logger } from '../services/logger'

const logger = new Logger('DatabaseService')

export class DatabaseService {
  private static instance: DatabaseService
  private db: Database.Database

  private constructor() {
    const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'systemai.db')
    this.db = new Database(dbPath)
    this.initializeTables()
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  private initializeTables() {
    try {
      // Messages table for chat history
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          timestamp TEXT NOT NULL
        )
      `)

      // Settings table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `)

      // System events log
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          description TEXT,
          severity TEXT,
          timestamp TEXT NOT NULL,
          data TEXT
        )
      `)

      // Snapshots for rollback
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS snapshots (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `)

      // Actions history
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS actions (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          status TEXT,
          parameters TEXT,
          result TEXT,
          created_at TEXT NOT NULL,
          completed_at TEXT
        )
      `)

      logger.info('Database tables initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize database tables:', error)
      throw error
    }
  }

  getDb(): Database.Database {
    return this.db
  }

  close() {
    this.db.close()
  }
}
