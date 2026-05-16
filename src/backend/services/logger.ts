import fs from 'fs'
import path from 'path'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export class Logger {
  private name: string
  private logDir: string

  constructor(name: string) {
    this.name = name
    this.logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs')
    this.ensureLogDir()
  }

  private ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const dataStr = data ? ` ${JSON.stringify(data)}` : ''
    return `[${timestamp}] [${this.name}] [${level.toUpperCase()}] ${message}${dataStr}`
  }

  private writeLog(level: LogLevel, message: string, data?: any) {
    const formattedMessage = this.formatMessage(level, message, data)
    console.log(formattedMessage)

    // Write to file
    const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`)
    try {
      fs.appendFileSync(logFile, formattedMessage + '\n')
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  }

  debug(message: string, data?: any) {
    this.writeLog('debug', message, data)
  }

  info(message: string, data?: any) {
    this.writeLog('info', message, data)
  }

  warn(message: string, data?: any) {
    this.writeLog('warn', message, data)
  }

  error(message: string, data?: any) {
    this.writeLog('error', message, data)
  }
}
