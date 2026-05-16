import { Logger } from '../logger'
import { DatabaseService } from '../database/service'
import { nanoid } from 'nanoid'

const logger = new Logger('NotificationService')
const db = DatabaseService.getInstance()

/**
 * NotificationService - User notification management
 * 
 * Handles creation, storage, retrieval, and dismissal of system notifications.
 * Supports different severity levels and automatic categorization.
 * 
 * @example
 * const notifications = new NotificationService()
 * await notifications.createNotification({
 *   title: 'High Memory Usage',
 *   message: 'Memory is at 85%',
 *   severity: 'warning'
 * })
 */

export type NotificationSeverity = 'info' | 'warning' | 'error' | 'success'

export interface NotificationData {
  id: string
  title: string
  message: string
  severity: NotificationSeverity
  timestamp: Date
  read: boolean
  action?: {
    label: string
    handler: string
  }
}

interface CreateNotificationInput {
  title: string
  message: string
  severity?: NotificationSeverity
  action?: {
    label: string
    handler: string
  }
}

export class NotificationService {
  private static readonly MAX_NOTIFICATIONS = 100
  private notificationQueue: Map<string, NotificationData> = new Map()

  /**
   * Creates a new notification
   * @param {CreateNotificationInput} input Notification details
   * @returns {Promise<NotificationData>} Created notification
   * @throws {Error} If creation fails
   */
  async createNotification(input: CreateNotificationInput): Promise<NotificationData> {
    try {
      const notification: NotificationData = {
        id: nanoid(),
        title: input.title,
        message: input.message,
        severity: input.severity || 'info',
        timestamp: new Date(),
        read: false,
        action: input.action
      }

      // Store in memory queue
      this.notificationQueue.set(notification.id, notification)

      // Persist to database
      const stmt = db
        .getDb()
        .prepare(
          `INSERT INTO events (type, description, severity, timestamp, data) 
           VALUES (?, ?, ?, ?, ?)`
        )
      stmt.run(
        'notification',
        input.message,
        input.severity || 'info',
        new Date().toISOString(),
        JSON.stringify({
          title: input.title,
          action: input.action
        })
      )

      logger.info('Notification created', { id: notification.id, severity: notification.severity })
      return notification
    } catch (error) {
      logger.error('Failed to create notification:', error)
      throw error
    }
  }

  /**
   * Gets all notifications with optional filtering
   * @param {Object} options Filter options
   * @returns {Promise<NotificationData[]>} Array of notifications
   */
  async getNotifications(options?: {
    unreadOnly?: boolean
    severity?: NotificationSeverity
    limit?: number
  }): Promise<NotificationData[]> {
    try {
      let notifications = Array.from(this.notificationQueue.values())

      if (options?.unreadOnly) {
        notifications = notifications.filter((n) => !n.read)
      }

      if (options?.severity) {
        notifications = notifications.filter((n) => n.severity === options.severity)
      }

      const limit = options?.limit || 50
      return notifications.slice(-limit).reverse()
    } catch (error) {
      logger.error('Failed to get notifications:', error)
      throw error
    }
  }

  /**
   * Marks notification as read
   * @param {string} id Notification ID
   * @returns {Promise<void>}
   */
  async markAsRead(id: string): Promise<void> {
    try {
      const notification = this.notificationQueue.get(id)
      if (notification) {
        notification.read = true
        logger.debug('Notification marked as read', { id })
      }
    } catch (error) {
      logger.error('Failed to mark notification as read:', error)
      throw error
    }
  }

  /**
   * Dismisses a notification
   * @param {string} id Notification ID
   * @returns {Promise<void>}
   */
  async dismissNotification(id: string): Promise<void> {
    try {
      this.notificationQueue.delete(id)
      logger.debug('Notification dismissed', { id })
    } catch (error) {
      logger.error('Failed to dismiss notification:', error)
      throw error
    }
  }

  /**
   * Clears all notifications
   * @returns {Promise<void>}
   */
  async clearAll(): Promise<void> {
    try {
      const count = this.notificationQueue.size
      this.notificationQueue.clear()
      logger.info('All notifications cleared', { count })
    } catch (error) {
      logger.error('Failed to clear notifications:', error)
      throw error
    }
  }

  /**
   * Gets unread notification count
   * @returns {Promise<number>} Number of unread notifications
   */
  async getUnreadCount(): Promise<number> {
    const notifications = Array.from(this.notificationQueue.values())
    return notifications.filter((n) => !n.read).length
  }

  /**
   * Gets notifications by severity
   * @param {NotificationSeverity} severity Notification severity
   * @returns {Promise<NotificationData[]>} Notifications with specified severity
   */
  async getBySuccess(severity: NotificationSeverity): Promise<NotificationData[]> {
    const notifications = Array.from(this.notificationQueue.values())
    return notifications.filter((n) => n.severity === severity)
  }

  /**
   * Enforces maximum notification limit
   * @private
   */
  private enforceLimit(): void {
    if (this.notificationQueue.size > NotificationService.MAX_NOTIFICATIONS) {
      const entries = Array.from(this.notificationQueue.entries()).sort(
        (a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime()
      )

      const toRemove =
        this.notificationQueue.size - NotificationService.MAX_NOTIFICATIONS
      for (let i = 0; i < toRemove; i++) {
        this.notificationQueue.delete(entries[i][0])
      }
      logger.debug('Notification limit enforced', { removed: toRemove })
    }
  }
}
