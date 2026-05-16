import si from 'systeminformation'
import { Logger } from '../services/logger'

const logger = new Logger('SystemMonitor')

/**
 * SystemMonitor - Real-time system telemetry collection engine
 * 
 * Provides comprehensive system metrics including CPU, memory, disk, network,
 * processes, and security status. Supports continuous monitoring with configurable
 * update intervals.
 * 
 * @example
 * const monitor = new SystemMonitor()
 * const cpu = await monitor.getCpuUsage()
 * monitor.startMonitoring(2000)
 */
export class SystemMonitor {
  private updateInterval: NodeJS.Timeout | null = null
  private lastCpuUsage = 0

  /**
   * Retrieves comprehensive system information
   * @returns {Promise<Object>} OS, system, CPU, and memory information
   * @throws {Error} If system information is unavailable
   */
  async getSystemInfo() {
    try {
      const [osInfo, system, cpu, mem] = await Promise.all([
        si.osInfo(),
        si.system(),
        si.cpu(),
        si.mem()
      ])

      return {
        os: osInfo,
        system,
        cpu,
        memory: mem,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Failed to get system info:', error)
      throw error
    }
  }

  /**
   * Gets current CPU usage and core-specific metrics
   * @returns {Promise<Object>} CPU metrics with current load and per-core data
   * @throws {Error} If CPU data is unavailable
   */
  async getCpuUsage() {
    try {
      logger.debug('Fetching CPU usage metrics')
      const cpuLoad = await si.currentLoad()
      this.lastCpuUsage = cpuLoad.currentLoad

      const result = {
        current: cpuLoad.currentLoad,
        cores: cpuLoad.cores.map((core) => ({
          load: core.load,
          speed: core.speedMax
        })),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
      
      logger.debug('CPU metrics collected', { current: result.current })
      return result
    } catch (error) {
      logger.error('Failed to get CPU usage:', error)
      throw error
    }
  }

  /**
   * Gets current memory/RAM usage statistics
   * @returns {Promise<Object>} Memory metrics with usage percentages
   * @throws {Error} If memory data is unavailable
   */
  async getMemoryUsage() {
    try {
      logger.debug('Fetching memory usage metrics')
      const mem = await si.mem()

      const result = {
        total: mem.total,
        used: mem.used,
        available: mem.available,
        free: mem.free,
        percent: (mem.used / mem.total) * 100,
        timestamp: new Date().toISOString()
      }
      
      logger.debug('Memory metrics collected', { percent: result.percent })
      return result
    } catch (error) {
      logger.error('Failed to get memory usage:', error)
      throw error
    }
  }

  async getDiskHealth() {
    try {
      const [disks, diskLayout] = await Promise.all([
        si.fsSize(),
        si.diskLayout()
      ])

      return {
        drives: disks.map((disk) => ({
          filesystem: disk.fs,
          size: disk.size,
          used: disk.used,
          available: disk.available,
          percent: disk.use,
          mount: disk.mount
        })),
        health: diskLayout.map((disk) => ({
          device: disk.device,
          size: disk.size,
          type: disk.type,
          rpm: disk.rpm
        })),
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Failed to get disk health:', error)
      throw error
    }
  }

  async getNetworkStats() {
    try {
      const [networkInterfaces, networkStats] = await Promise.all([
        si.networkInterfaces(),
        si.networkStats()
      ])

      return {
        interfaces: networkInterfaces.slice(0, 5),
        stats: networkStats.slice(0, 5),
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Failed to get network stats:', error)
      throw error
    }
  }

  async getProcessList() {
    try {
      const processes = await si.processes()

      return {
        topByMemory: processes.list
          .sort((a, b) => b.mem - a.mem)
          .slice(0, 10),
        topByCpu: processes.list
          .sort((a, b) => (b.pcpu || 0) - (a.pcpu || 0))
          .slice(0, 10),
        totalProcesses: processes.all,
        running: processes.running,
        blocked: processes.blocked,
        sleeping: processes.sleeping,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Failed to get process list:', error)
      throw error
    }
  }

  async getSecurityStatus() {
    try {
      // Note: Full security scanning requires system-specific implementations
      // This is a placeholder that returns basic security status

      return {
        antivirusStatus: 'unknown',
        firewallStatus: 'unknown',
        windowsDefenderEnabled: false,
        lastSecurityScan: null,
        vulnerabilities: [],
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Failed to get security status:', error)
      throw error
    }
  }

  /**
   * Starts background system monitoring loop
   * @param {number} interval - Monitoring interval in milliseconds (default: 2000)
   * @returns {void}
   */
  startMonitoring(interval: number = 2000) {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    logger.info('Starting system monitoring', { interval })
    this.updateInterval = setInterval(async () => {
      try {
        const cpu = await this.getCpuUsage()
        const memory = await this.getMemoryUsage()
        // Emit to monitoring listeners
      } catch (error) {
        logger.error('Monitoring error:', error)
      }
    }, interval)
  }

  /**
   * Stops background system monitoring loop
   * @returns {void}
   */
  stopMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
      logger.info('System monitoring stopped')
    }
  }
}
