/**
 * Voice Analytics Module - Node.js Compatible Version
 * Handles analytics, performance monitoring, and system health tracking
 */

export class VoiceAnalyticsModule {
  constructor(config = {}) {
    this.config = {
      enableLogging: config.enableLogging !== false,
      enableMetrics: config.enableMetrics !== false,
      enableHealthMonitoring: config.enableHealthMonitoring !== false,
      logLevel: config.logLevel || 'info', // debug, info, warn, error
      metricsInterval: config.metricsInterval || 30000, // 30 seconds
      healthCheckInterval: config.healthCheckInterval || 60000, // 1 minute
      maxLogEntries: config.maxLogEntries || 10000,
      maxMetricsEntries: config.maxMetricsEntries || 1000,
      exportInterval: config.exportInterval || 300000, // 5 minutes
      ...config
    };
    
    this.logs = [];
    this.metrics = [];
    this.healthData = [];
    this.performanceMetrics = {
      totalCommands: 0,
      successfulCommands: 0,
      failedCommands: 0,
      averageResponseTime: 0,
      apiCalls: 0,
      apiFailures: 0,
      uptime: 0,
      lastHealthCheck: null
    };
    
    this.startTime = Date.now();
    this.isMonitoring = false;
    this.sessionId = this.generateSessionId();
    
    if (this.config.enableHealthMonitoring) {
      this.startHealthMonitoring();
    }
    
    if (this.config.enableMetrics) {
      this.startMetricsCollection();
    }
  }

  /**
   * Initialize the analytics module
   */
  async initialize() {
    console.log('📊 Initializing Voice Analytics Module...');
    
    // Start monitoring
    this.isMonitoring = true;
    
    console.log('✅ Voice Analytics Module initialized');
    return true;
  }

  /**
   * Generate session ID for Node.js
   */
  generateSessionId() {
    return 'node_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get system information for Node.js
   */
  getSystemInfo() {
    return {
      platform: process.platform,
      nodeVersion: process.version,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      pid: process.pid,
      cwd: process.cwd()
    };
  }

  /**
   * Log system events
   */
  log(level, message, data = {}, category = 'general') {
    if (!this.config.enableLogging) return;
    
    const validLevels = ['debug', 'info', 'warn', 'error'];
    if (!validLevels.includes(level)) {
      level = 'info';
    }
    
    // Check log level
    const levelPriority = { debug: 0, info: 1, warn: 2, error: 3 };
    const configLevelPriority = levelPriority[this.config.logLevel] || 1;
    
    if (levelPriority[level] < configLevelPriority) {
      return;
    }
    
    const logEntry = {
      timestamp: Date.now(),
      level: level,
      message: message,
      category: category,
      data: this.sanitizeData(data),
      sessionId: this.sessionId,
      systemInfo: this.getSystemInfo()
    };
    
    this.logs.push(logEntry);
    
    // Maintain log size limit
    if (this.logs.length > this.config.maxLogEntries) {
      this.logs = this.logs.slice(-this.config.maxLogEntries);
    }
    
    // Console output for development
    if (level === 'error') {
      console.error(`[${level.toUpperCase()}] ${message}`, data);
    } else if (level === 'warn') {
      console.warn(`[${level.toUpperCase()}] ${message}`, data);
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`, data);
    }
  }

  /**
   * Log event (convenience method)
   */
  logEvent(eventName, data = {}) {
    this.log('info', `Event: ${eventName}`, data, 'event');
  }

  /**
   * Record performance metrics
   */
  recordMetric(metricName, value, tags = {}) {
    if (!this.config.enableMetrics) return;
    
    const metric = {
      timestamp: Date.now(),
      name: metricName,
      value: value,
      tags: tags,
      sessionId: this.sessionId
    };
    
    this.metrics.push(metric);
    
    // Maintain metrics size limit
    if (this.metrics.length > this.config.maxMetricsEntries) {
      this.metrics = this.metrics.slice(-this.config.maxMetricsEntries);
    }
    
    // Update performance metrics
    this.updatePerformanceMetrics(metricName, value);
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(metricName, value) {
    switch (metricName) {
      case 'command_processed':
        this.performanceMetrics.totalCommands++;
        break;
      case 'command_success':
        this.performanceMetrics.successfulCommands++;
        break;
      case 'command_failed':
        this.performanceMetrics.failedCommands++;
        break;
      case 'api_call':
        this.performanceMetrics.apiCalls++;
        break;
      case 'api_failure':
        this.performanceMetrics.apiFailures++;
        break;
      case 'response_time':
        this.updateAverageResponseTime(value);
        break;
    }
  }

  /**
   * Update average response time
   */
  updateAverageResponseTime(newTime) {
    const currentAvg = this.performanceMetrics.averageResponseTime;
    const totalCommands = this.performanceMetrics.totalCommands;
    
    if (totalCommands === 0) {
      this.performanceMetrics.averageResponseTime = newTime;
    } else {
      this.performanceMetrics.averageResponseTime = 
        (currentAvg * (totalCommands - 1) + newTime) / totalCommands;
    }
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    console.log('🏥 Starting health monitoring...');
    
    this.healthMonitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform health check
   */
  performHealthCheck() {
    const healthCheck = {
      timestamp: Date.now(),
      status: 'healthy',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      performanceMetrics: { ...this.performanceMetrics },
      logCount: this.logs.length,
      metricsCount: this.metrics.length
    };
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    if (memoryUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
      healthCheck.status = 'warning';
      healthCheck.memoryWarning = 'High memory usage detected';
    }
    
    // Check log queue size
    if (this.logs.length > this.config.maxLogEntries * 0.9) {
      healthCheck.status = 'warning';
      healthCheck.logWarning = 'Log queue approaching capacity';
    }
    
    this.healthData.push(healthCheck);
    this.performanceMetrics.lastHealthCheck = Date.now();
    
    // Maintain health data size
    if (this.healthData.length > 100) {
      this.healthData = this.healthData.slice(-100);
    }
    
    // Log health status
    if (healthCheck.status !== 'healthy') {
      this.log('warn', 'Health check warning', healthCheck, 'health');
    }
  }

  /**
   * Start metrics collection
   */
  startMetricsCollection() {
    console.log('📊 Starting metrics collection...');
    
    this.metricsCollectionInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, this.config.metricsInterval);
  }

  /**
   * Collect system metrics
   */
  collectSystemMetrics() {
    const metrics = {
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
      performanceMetrics: { ...this.performanceMetrics }
    };
    
    this.recordMetric('system_metrics', metrics, {
      type: 'system',
      session: this.sessionId
    });
  }

  /**
   * Sanitize data for logging
   */
  sanitizeData(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    const sanitized = { ...data };
    
    // Remove sensitive information
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth'];
    
    for (const key in sanitized) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary() {
    const now = Date.now();
    const uptime = now - this.startTime;
    
    return {
      uptime: uptime,
      totalLogs: this.logs.length,
      totalMetrics: this.metrics.length,
      totalHealthChecks: this.healthData.length,
      performanceMetrics: { ...this.performanceMetrics },
      lastLog: this.logs[this.logs.length - 1] || null,
      lastMetric: this.metrics[this.metrics.length - 1] || null,
      lastHealthCheck: this.healthData[this.healthData.length - 1] || null,
      timestamp: now
    };
  }

  /**
   * Get logs
   */
  getLogs(limit = 100, level = null, category = null) {
    let filteredLogs = [...this.logs];
    
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }
    
    return filteredLogs.slice(-limit);
  }

  /**
   * Get metrics
   */
  getMetrics(limit = 100, metricName = null) {
    let filteredMetrics = [...this.metrics];
    
    if (metricName) {
      filteredMetrics = filteredMetrics.filter(metric => metric.name === metricName);
    }
    
    return filteredMetrics.slice(-limit);
  }

  /**
   * Get health data
   */
  getHealthData(limit = 50) {
    return this.healthData.slice(-limit);
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      config: this.config,
      summary: this.getAnalyticsSummary(),
      sessionId: this.sessionId
    };
  }

  /**
   * Export analytics data
   */
  exportAnalytics() {
    return {
      logs: this.logs,
      metrics: this.metrics,
      healthData: this.healthData,
      summary: this.getAnalyticsSummary(),
      exportedAt: Date.now()
    };
  }

  /**
   * Clear analytics data
   */
  clearAnalytics() {
    this.logs = [];
    this.metrics = [];
    this.healthData = [];
    
    // Reset performance metrics
    this.performanceMetrics = {
      totalCommands: 0,
      successfulCommands: 0,
      failedCommands: 0,
      averageResponseTime: 0,
      apiCalls: 0,
      apiFailures: 0,
      uptime: 0,
      lastHealthCheck: null
    };
    
    console.log('🧹 Analytics data cleared');
  }

  /**
   * Stop monitoring
   */
  stop() {
    console.log('🛑 Stopping Voice Analytics Module...');
    
    this.isMonitoring = false;
    
    if (this.healthMonitoringInterval) {
      clearInterval(this.healthMonitoringInterval);
      this.healthMonitoringInterval = null;
    }
    
    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
      this.metricsCollectionInterval = null;
    }
    
    console.log('✅ Voice Analytics Module stopped');
  }

  /**
   * Destroy the module
   */
  destroy() {
    console.log('🧹 Destroying Voice Analytics Module...');
    
    this.stop();
    this.clearAnalytics();
    
    console.log('✅ Voice Analytics Module destroyed');
  }
}