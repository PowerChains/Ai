import { ipcMain } from 'electron'
import { SystemMonitor } from '../backend/engines/monitor'
import { AIEngine } from '../backend/ai/engine'
import { SettingsService } from '../backend/services/settings'

let systemMonitor: SystemMonitor
let aiEngine: AIEngine
let settingsService: SettingsService

export const initializeIpcHandlers = () => {
  systemMonitor = new SystemMonitor()
  aiEngine = new AIEngine()
  settingsService = new SettingsService()

  // System monitoring handlers
  ipcMain.handle('get-system-info', async () => {
    return await systemMonitor.getSystemInfo()
  })

  ipcMain.handle('get-cpu-usage', async () => {
    return await systemMonitor.getCpuUsage()
  })

  ipcMain.handle('get-memory-usage', async () => {
    return await systemMonitor.getMemoryUsage()
  })

  ipcMain.handle('get-disk-health', async () => {
    return await systemMonitor.getDiskHealth()
  })

  ipcMain.handle('get-network-stats', async () => {
    return await systemMonitor.getNetworkStats()
  })

  ipcMain.handle('get-process-list', async () => {
    return await systemMonitor.getProcessList()
  })

  ipcMain.handle('get-security-status', async () => {
    return await systemMonitor.getSecurityStatus()
  })

  // AI Chatbot handlers
  ipcMain.handle('ai-chat', async (_, message: string) => {
    return await aiEngine.processMessage(message)
  })

  // Mode handlers
  ipcMain.handle('set-mode', async (_, mode: 'guided' | 'auto') => {
    await settingsService.setMode(mode)
    return { success: true }
  })

  ipcMain.handle('get-mode', async () => {
    return await settingsService.getMode()
  })

  // Settings handlers
  ipcMain.handle('get-settings', async () => {
    return await settingsService.getSettings()
  })

  ipcMain.handle('save-settings', async (_, settings: any) => {
    await settingsService.saveSettings(settings)
    return { success: true }
  })
}
