import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { SystemMonitor } from '../backend/engines/monitor'
import { AIEngine } from '../backend/ai/engine'

const app = express()
app.use(cors())
app.use(express.json())

const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*' }
})

const systemMonitor = new SystemMonitor()
const aiEngine = new AIEngine()

export const initializeBackendServer = async () => {
  // REST API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() })
  })

  app.get('/api/system/info', async (req, res) => {
    try {
      const info = await systemMonitor.getSystemInfo()
      res.json(info)
    } catch (error) {
      res.status(500).json({ error: 'Failed to get system info' })
    }
  })

  app.get('/api/system/monitoring', async (req, res) => {
    try {
      const monitoring = {
        cpu: await systemMonitor.getCpuUsage(),
        memory: await systemMonitor.getMemoryUsage(),
        disk: await systemMonitor.getDiskHealth(),
        network: await systemMonitor.getNetworkStats(),
        processes: await systemMonitor.getProcessList(),
        security: await systemMonitor.getSecurityStatus()
      }
      res.json(monitoring)
    } catch (error) {
      res.status(500).json({ error: 'Failed to get monitoring data' })
    }
  })

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message } = req.body
      const response = await aiEngine.processMessage(message)
      res.json(response)
    } catch (error) {
      res.status(500).json({ error: 'Failed to process message' })
    }
  })

  // Socket.IO real-time updates
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Start sending system updates every second
    const interval = setInterval(async () => {
      try {
        const cpu = await systemMonitor.getCpuUsage()
        const memory = await systemMonitor.getMemoryUsage()
        socket.emit('system-update', { cpu, memory })
      } catch (error) {
        console.error('Error broadcasting system update:', error)
      }
    }, 1000)

    socket.on('disconnect', () => {
      clearInterval(interval)
      console.log('Client disconnected:', socket.id)
    })
  })

  const PORT = process.env.PORT || 3000
  return new Promise((resolve) => {
    httpServer.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`)
      resolve(httpServer)
    })
  })
}
