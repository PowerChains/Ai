import { create } from 'zustand'

export interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
}

export interface AppState {
  mode: 'guided' | 'auto'
  isInitialized: boolean
  systemMetrics: SystemMetrics | null
  notifications: any[]
  chatMessages: any[]
  setMode: (mode: 'guided' | 'auto') => void
  setSystemMetrics: (metrics: SystemMetrics) => void
  addNotification: (notification: any) => void
  addChatMessage: (message: any) => void
  initializeApp: () => void
}

export const useAppStore = create<AppState>((set) => ({
  mode: 'guided',
  isInitialized: false,
  systemMetrics: null,
  notifications: [],
  chatMessages: [],

  setMode: (mode) => set({ mode }),

  setSystemMetrics: (metrics) => set({ systemMetrics: metrics }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification].slice(-10)
    })),

  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message]
    })),

  initializeApp: () => {
    set({ isInitialized: true })
    // Setup system monitoring
    setInterval(async () => {
      try {
        const data = await (window as any).api.getCpuUsage()
        // Update metrics
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      }
    }, 2000)
  }
}))
