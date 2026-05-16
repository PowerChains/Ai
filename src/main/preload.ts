import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // System monitoring
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getCpuUsage: () => ipcRenderer.invoke('get-cpu-usage'),
  getMemoryUsage: () => ipcRenderer.invoke('get-memory-usage'),
  getDiskHealth: () => ipcRenderer.invoke('get-disk-health'),
  getNetworkStats: () => ipcRenderer.invoke('get-network-stats'),
  getProcessList: () => ipcRenderer.invoke('get-process-list'),
  getSecurityStatus: () => ipcRenderer.invoke('get-security-status'),

  // AI Chatbot
  sendMessage: (message: string) => ipcRenderer.invoke('ai-chat', message),
  
  // Mode control
  setMode: (mode: 'guided' | 'auto') => ipcRenderer.invoke('set-mode', mode),
  getMode: () => ipcRenderer.invoke('get-mode'),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),

  // Listeners
  onSystemUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('system-update', (_, data) => callback(data))
  },
  onNotification: (callback: (notification: any) => void) => {
    ipcRenderer.on('notification', (_, notification) => callback(notification))
  }
})
