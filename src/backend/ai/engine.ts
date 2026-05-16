import { Database } from 'better-sqlite3'
import { DatabaseService } from '../database/service'
import { Logger } from '../services/logger'

const logger = new Logger('AIEngine')

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  systemContext?: Record<string, any>
}

export interface AIResponse {
  message: string
  action?: string
  parameters?: Record<string, any>
  confidence: number
  requiresApproval: boolean
  riskLevel: 'low' | 'medium' | 'high'
}

export class AIEngine {
  private db: Database
  private conversationHistory: ChatMessage[] = []
  private mode: 'guided' | 'auto' = 'guided'

  constructor() {
    this.db = DatabaseService.getInstance().getDb()
    this.loadConversationHistory()
  }

  async processMessage(userMessage: string): Promise<AIResponse> {
    try {
      logger.info(`Processing message: ${userMessage}`)

      // Store user message
      const userMsg: ChatMessage = {
        id: this.generateId(),
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      }
      this.conversationHistory.push(userMsg)

      // Process with AI logic (simple rule-based for Phase 1)
      const response = this.parseUserIntent(userMessage)

      // Store assistant response
      const assistantMsg: ChatMessage = {
        id: this.generateId(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      }
      this.conversationHistory.push(assistantMsg)

      // Save to database
      this.saveMessage(userMsg)
      this.saveMessage(assistantMsg)

      return response
    } catch (error) {
      logger.error('Error processing message:', error)
      return {
        message: 'I encountered an error processing your request. Please try again.',
        confidence: 0,
        requiresApproval: false,
        riskLevel: 'low'
      }
    }
  }

  private parseUserIntent(message: string): AIResponse {
    const lowerMessage = message.toLowerCase()

    // System monitoring queries
    if (lowerMessage.includes('cpu') || lowerMessage.includes('processor')) {
      return {
        message: 'I can check your CPU usage, temperature, and performance metrics. Let me gather the latest data.',
        action: 'get-cpu-info',
        confidence: 0.9,
        requiresApproval: false,
        riskLevel: 'low'
      }
    }

    if (lowerMessage.includes('memory') || lowerMessage.includes('ram')) {
      return {
        message: 'I can analyze your memory usage and suggest optimizations. Would you like me to check memory status?',
        action: 'get-memory-info',
        confidence: 0.9,
        requiresApproval: false,
        riskLevel: 'low'
      }
    }

    if (
      lowerMessage.includes('disk') ||
      lowerMessage.includes('storage') ||
      lowerMessage.includes('cleanup')
    ) {
      return {
        message: 'I can analyze disk usage and safely clean up unnecessary files. This would require your approval.',
        action: 'analyze-disk',
        confidence: 0.85,
        requiresApproval: true,
        riskLevel: 'medium'
      }
    }

    if (
      lowerMessage.includes('optimize') ||
      lowerMessage.includes('speed') ||
      lowerMessage.includes('performance')
    ) {
      return {
        message:
          'I can optimize your system performance by tuning memory, processes, and startup items. What would you like me to focus on?',
        action: 'optimize-system',
        confidence: 0.8,
        requiresApproval: true,
        riskLevel: 'medium'
      }
    }

    if (lowerMessage.includes('repair') || lowerMessage.includes('fix')) {
      return {
        message:
          'I can run system repair tools like SFC and DISM. These require administrator privileges and will create a system restore point first.',
        action: 'repair-system',
        confidence: 0.85,
        requiresApproval: true,
        riskLevel: 'high'
      }
    }

    if (
      lowerMessage.includes('auto mode') ||
      lowerMessage.includes('autonomous') ||
      lowerMessage.includes('swarm')
    ) {
      return {
        message:
          'I can enable Auto Mode to autonomously monitor and optimize your system. In this mode, I will automatically repair issues, optimize performance, and manage localhost workflows while keeping you informed.',
        action: 'enable-auto-mode',
        confidence: 0.9,
        requiresApproval: true,
        riskLevel: 'medium'
      }
    }

    if (lowerMessage.includes('guided mode') || lowerMessage.includes('manual')) {
      return {
        message:
          'I will return to Guided Mode. In this mode, I will explain each action and wait for your approval before executing anything.',
        action: 'enable-guided-mode',
        confidence: 0.9,
        requiresApproval: false,
        riskLevel: 'low'
      }
    }

    if (lowerMessage.includes('status') || lowerMessage.includes('health')) {
      return {
        message:
          'Let me analyze your system health across all dimensions: CPU, memory, disk, network, security, and running processes.',
        action: 'get-full-status',
        confidence: 0.95,
        requiresApproval: false,
        riskLevel: 'low'
      }
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('what can')) {
      return {
        message: `I'm SYSTEMAI, your AI-powered Windows system optimizer. I can help you with:

• **System Monitoring** - Check CPU, memory, disk, network, and process status
• **Performance Optimization** - Optimize memory, startup items, and background processes
• **System Repair** - Run SFC, DISM, and fix broken Windows components
• **Security** - Harden firewall, analyze vulnerabilities, and check security status
• **Localhost Management** - Monitor and manage Docker, WSL, databases, and APIs
• **Autonomous Mode** - Enable me to proactively optimize and repair your system
• **Guided Mode** - Get explanations and approvals before each action

What would you like help with?`,
        confidence: 0.95,
        requiresApproval: false,
        riskLevel: 'low'
      }
    }

    // Default response
    return {
      message: `I'm not entirely sure what you're asking. I can help with system monitoring, optimization, repair, security hardening, and localhost management. Type "help" or "what can you do" for more details.`,
      confidence: 0.5,
      requiresApproval: false,
      riskLevel: 'low'
    }
  }

  private loadConversationHistory() {
    try {
      const stmt = this.db.prepare(
        'SELECT * FROM messages ORDER BY timestamp ASC LIMIT 100'
      )
      const messages = stmt.all() as ChatMessage[]
      this.conversationHistory = messages
    } catch (error) {
      logger.warn('Could not load conversation history:', error)
    }
  }

  private saveMessage(message: ChatMessage) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO messages (id, role, content, timestamp)
        VALUES (?, ?, ?, ?)
      `)
      stmt.run(message.id, message.role, message.content, message.timestamp.toISOString())
    } catch (error) {
      logger.error('Error saving message:', error)
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory
  }

  clearConversationHistory() {
    this.conversationHistory = []
    try {
      const stmt = this.db.prepare('DELETE FROM messages')
      stmt.run()
    } catch (error) {
      logger.error('Error clearing conversation history:', error)
    }
  }

  setMode(mode: 'guided' | 'auto') {
    this.mode = mode
  }

  getMode() {
    return this.mode
  }
}
