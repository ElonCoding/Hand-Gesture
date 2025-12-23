/**
 * Voice Activation System - Main Integration
 * Complete voice activation system with Google Gemini API integration
 * 
 * Supports environment variable configuration via .env file
 */

import { VoiceProcessingModule } from './VoiceProcessingModule.js';
import { GeminiAPIIntegration } from './GeminiAPIIntegration.js';
import { VoiceActivationSystem } from './VoiceActivationSystem.js';
import { VoiceSecurityModule } from './VoiceSecurityModule.js';
import { VoiceAnalyticsModule } from './VoiceAnalyticsModule.js';
import { getEnvConfig, createConfigFromObject } from './envConfig.js';

/**
 * Main Voice Activation System Factory
 * Provides easy initialization and configuration of the complete system
 * 
 * Supports both direct configuration and environment variable configuration
 */
export class VoiceActivationManager {
  constructor(config = {}) {
    // Try to load environment configuration if no explicit config provided
    let envConfig = {};
    if (Object.keys(config).length === 0) {
      try {
        envConfig = getEnvConfig();
      } catch (error) {
        console.warn('Could not load environment configuration:', error.message);
        console.warn('Using default configuration. Set GEMINI_API_KEY in .env file.');
      }
    }
    
    this.config = {
      // API Configuration
      googleGeminiAPIKey: config.googleGeminiAPIKey || envConfig.api?.key || '',
      
      // Voice Processing Configuration
      voiceProcessing: {
        sampleRate: envConfig.voiceProcessing?.sampleRate || 16000,
        bufferSize: envConfig.voiceProcessing?.bufferSize || 4096,
        echoCancellation: envConfig.voiceProcessing?.echoCancellation !== false,
        noiseSuppression: envConfig.voiceProcessing?.noiseSuppression !== false,
        autoGainControl: envConfig.voiceProcessing?.autoGainControl !== false,
        ...config.voiceProcessing
      },
      
      // System Configuration
      system: {
        autoStart: true,
        wakeWords: envConfig.system?.wakeWords || ['hey system', 'hello system', 'system', 'computer'],
        responseTimeout: envConfig.system?.responseTimeout || 5000,
        maxCommandLength: envConfig.system?.maxCommandLength || 30,
        enableVoiceFeedback: envConfig.system?.enableVoiceFeedback !== false,
        enableGestureIntegration: true,
        ...config.system
      },
      
      // Security Configuration
      security: {
        enableVoiceAuth: envConfig.security?.enableVoiceAuth === true,
        voiceAuthThreshold: envConfig.security?.voiceAuthThreshold || 0.85,
        maxAuthAttempts: envConfig.security?.maxAuthAttempts || 3,
        authTimeout: 300000,
        dataRetentionDays: envConfig.security?.dataRetentionDays || 30,
        enableAuditLog: true,
        encryptionKey: envConfig.security?.encryptionKey || '',
        ...config.security
      },
      
      // Analytics Configuration
      analytics: {
        enableLogging: envConfig.analytics?.enableLogging !== false,
        enableMetrics: envConfig.analytics?.enableMetrics !== false,
        enableHealthMonitoring: envConfig.analytics?.enableHealthMonitoring !== false,
        logLevel: envConfig.analytics?.logLevel || 'info',
        metricsInterval: envConfig.analytics?.metricsInterval || 30000,
        healthCheckInterval: envConfig.analytics?.healthCheckInterval || 60000,
        ...config.analytics
      },
      
      // Performance Configuration
      performance: {
        cacheTtl: envConfig.performance?.cacheTtl || 300000, // 5 minutes
        ...config.performance
      },
      
      // Development Configuration
      development: {
        nodeEnv: envConfig.development?.nodeEnv || 'development',
        debugMode: envConfig.development?.debugMode === true,
        simulateApiCalls: envConfig.development?.simulateApiCalls === false,
        ...config.development
      }
    };
    
    this.voiceProcessor = null;
    this.geminiAPI = null;
    this.securityModule = null;
    this.analyticsModule = null;
    this.voiceSystem = null;
    
    this.isInitialized = false;
    this.isActive = false;
    
    this.initialize();
  }

  /**
   * Initialize the complete voice activation system
   */
  async initialize() {
    try {
      console.log('🎤 Initializing Voice Activation System...');
      
      // Validate configuration
      this.validateConfiguration();
      
      // Initialize analytics module first (for logging)
      this.analyticsModule = new VoiceAnalyticsModule(this.config.analytics);
      this.analyticsModule.log('info', 'Voice Activation System initialization started');
      
      // Initialize security module
      this.securityModule = new VoiceSecurityModule(this.config.security);
      this.analyticsModule.log('info', 'Security module initialized');
      
      // Initialize voice processing module
      this.voiceProcessor = new VoiceProcessingModule(this.config.voiceProcessing);
      this.analyticsModule.log('info', 'Voice processing module initialized');
      
      // Initialize Gemini API integration
      this.geminiAPI = new GeminiAPIIntegration({
        apiKey: this.config.googleGeminiAPIKey,
        ...this.config.geminiAPI
      });
      this.analyticsModule.log('info', 'Gemini API integration initialized');
      
      // Initialize main voice activation system
      this.voiceSystem = new VoiceActivationSystem({
        voiceProcessing: this.config.voiceProcessing,
        geminiAPI: this.config.geminiAPI,
        security: this.config.security,
        analytics: this.config.analytics,
        ...this.config.system
      });
      
      // Connect modules
      await this.connectModules();
      
      this.isInitialized = true;
      this.analyticsModule.log('info', 'Voice Activation System initialized successfully');
      
      // Auto-start if configured
      if (this.config.system.autoStart) {
        await this.start();
      }
      
      return true;
      
    } catch (error) {
      this.analyticsModule?.log('error', 'Voice Activation System initialization failed', { error: error.message });
      throw new Error(`Voice Activation System initialization failed: ${error.message}`);
    }
  }

  /**
   * Validate configuration
   */
  validateConfiguration() {
    if (!this.config.googleGeminiAPIKey) {
      throw new Error('Google Gemini API key is required');
    }
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('WebRTC not supported in this browser');
    }
    
    if (!window.AudioContext && !window.webkitAudioContext) {
      throw new Error('Web Audio API not supported in this browser');
    }
  }

  /**
   * Connect all modules together
   */
  async connectModules() {
    // Connect voice processor to system
    this.voiceSystem.voiceProcessor = this.voiceProcessor;
    
    // Connect Gemini API to system
    this.voiceSystem.geminiAPI = this.geminiAPI;
    
    // Connect security module to system
    this.voiceSystem.securityModule = this.securityModule;
    
    // Connect analytics module to system
    this.voiceSystem.analyticsModule = this.analyticsModule;
    
    this.analyticsModule.log('info', 'All modules connected successfully');
  }

  /**
   * Start the voice activation system
   */
  async start() {
    if (!this.isInitialized) {
      throw new Error('System not initialized');
    }
    
    try {
      this.analyticsModule.log('info', 'Starting Voice Activation System');
      
      await this.voiceSystem.initialize();
      this.isActive = true;
      
      this.analyticsModule.log('info', 'Voice Activation System started successfully');
      
      // Start monitoring
      this.startMonitoring();
      
      return true;
      
    } catch (error) {
      this.analyticsModule.log('error', 'Failed to start Voice Activation System', { error: error.message });
      throw error;
    }
  }

  /**
   * Stop the voice activation system
   */
  async stop() {
    if (!this.isActive) return;
    
    try {
      this.analyticsModule.log('info', 'Stopping Voice Activation System');
      
      await this.voiceSystem.stop();
      this.isActive = false;
      
      this.analyticsModule.log('info', 'Voice Activation System stopped');
      
    } catch (error) {
      this.analyticsModule.log('error', 'Error stopping Voice Activation System', { error: error.message });
      throw error;
    }
  }

  /**
   * Start system monitoring
   */
  startMonitoring() {
    // Monitor system health
    this.monitoringInterval = setInterval(() => {
      this.performSystemCheck();
    }, 30000); // Every 30 seconds
    
    this.analyticsModule.log('info', 'System monitoring started');
  }

  /**
   * Perform system health check
   */
  performSystemCheck() {
    try {
      const status = this.getSystemStatus();
      
      // Check for issues
      if (status.voiceProcessor.status !== 'recording') {
        this.analyticsModule.log('warn', 'Voice processor not recording', status.voiceProcessor);
      }
      
      if (status.apiStats.isRateLimited) {
        this.analyticsModule.log('warn', 'API rate limit active', status.apiStats);
      }
      
      if (status.security.authAttempts >= status.security.maxAuthAttempts) {
        this.analyticsModule.log('warn', 'Maximum authentication attempts reached');
      }
      
      // Record system metrics
      this.analyticsModule.recordMetric('system_health_check', 1, {
        voiceProcessorStatus: status.voiceProcessor.status,
        apiRateLimited: status.apiStats.isRateLimited,
        securityIssues: status.security.authAttempts >= status.security.maxAuthAttempts
      });
      
    } catch (error) {
      this.analyticsModule.log('error', 'System health check failed', { error: error.message });
    }
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    return {
      isInitialized: this.isInitialized,
      isActive: this.isActive,
      uptime: this.isInitialized ? Date.now() - this.voiceSystem.startTime : 0,
      voiceProcessor: this.voiceProcessor.getStatus(),
      apiStats: this.geminiAPI.getStats(),
      security: this.securityModule.getSecurityStatus(),
      analytics: this.analyticsModule.getSystemStatus(),
      system: this.voiceSystem.getStatus()
    };
  }

  /**
   * Register custom command handler
   */
  registerCommand(intent, handler) {
    this.voiceSystem.registerCommandHandler(intent, handler);
    this.analyticsModule.log('info', `Custom command handler registered: ${intent}`);
  }

  /**
   * Set voice authentication profile
   */
  async setVoiceProfile(audioSamples, userId) {
    try {
      const profile = await this.securityModule.createVoiceProfile(audioSamples, userId);
      this.analyticsModule.log('info', 'Voice authentication profile created', { userId });
      return profile;
    } catch (error) {
      this.analyticsModule.log('error', 'Failed to create voice profile', { error: error.message });
      throw error;
    }
  }

  /**
   * Authenticate user by voice
   */
  async authenticateVoice(audioSample, userId) {
    try {
      const result = await this.securityModule.authenticateVoice(audioSample, userId);
      this.analyticsModule.log('info', 'Voice authentication attempt', { 
        userId, 
        success: result.success,
        confidence: result.confidence 
      });
      return result;
    } catch (error) {
      this.analyticsModule.log('error', 'Voice authentication failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get analytics report
   */
  getAnalyticsReport(timeRange = '1h') {
    return this.analyticsModule.generateReport(timeRange);
  }

  /**
   * Export analytics data
   */
  exportAnalyticsData(format = 'json') {
    return this.analyticsModule.exportData(format);
  }

  /**
   * Get command history
   */
  getCommandHistory(limit = 10) {
    return this.voiceSystem.getCommandHistory(limit);
  }

  /**
   * Configure system settings
   */
  async configure(settings) {
    try {
      // Update configuration
      this.config = { ...this.config, ...settings };
      
      // Apply changes to modules
      if (settings.voiceProcessing) {
        // Voice processor would need reinitialization
        this.analyticsModule.log('warn', 'Voice processing settings changed - restart required');
      }
      
      if (settings.system) {
        Object.assign(this.voiceSystem.config, settings.system);
      }
      
      if (settings.security) {
        Object.assign(this.securityModule.config, settings.security);
      }
      
      if (settings.analytics) {
        Object.assign(this.analyticsModule.config, settings.analytics);
      }
      
      this.analyticsModule.log('info', 'System configuration updated');
      
    } catch (error) {
      this.analyticsModule.log('error', 'Configuration update failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Restart the system
   */
  async restart() {
    try {
      this.analyticsModule.log('info', 'Restarting Voice Activation System');
      
      await this.stop();
      await this.start();
      
      this.analyticsModule.log('info', 'Voice Activation System restarted successfully');
      
    } catch (error) {
      this.analyticsModule.log('error', 'System restart failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Cleanup and destroy
   */
  async destroy() {
    try {
      this.analyticsModule.log('info', 'Destroying Voice Activation System');
      
      await this.stop();
      
      // Destroy all modules
      await this.voiceSystem.destroy();
      this.securityModule.destroy();
      this.analyticsModule.destroy();
      
      // Clear monitoring interval
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }
      
      this.isInitialized = false;
      this.isActive = false;
      
      console.log('Voice Activation System destroyed');
      
    } catch (error) {
      console.error('Error destroying Voice Activation System:', error);
      throw error;
    }
  }
}

/**
 * Quick start function for easy integration
 * Uses environment variables if no API key is provided
 */
export async function createVoiceActivationSystem(apiKey, options = {}) {
  // If no API key provided, try to load from environment
  if (!apiKey) {
    try {
      const envConfig = getEnvConfig();
      apiKey = envConfig.api.key;
    } catch (error) {
      throw new Error('No API key provided and environment configuration failed: ' + error.message);
    }
  }
  
  const config = {
    googleGeminiAPIKey: apiKey,
    ...options
  };
  
  const system = new VoiceActivationManager(config);
  await system.initialize();
  
  return system;
}

/**
 * Create voice activation system using environment configuration only
 * This is the recommended approach for production use
 */
export async function createVoiceSystemFromEnv() {
  try {
    const envConfig = getEnvConfig();
    
    const config = {
      googleGeminiAPIKey: envConfig.api.key,
      voiceProcessing: envConfig.voiceProcessing,
      system: envConfig.system,
      security: envConfig.security,
      analytics: envConfig.analytics,
      performance: envConfig.performance,
      development: envConfig.development
    };
    
    const system = new VoiceActivationManager(config);
    await system.initialize();
    
    return system;
    
  } catch (error) {
    console.error('Failed to create voice system from environment:', error.message);
    console.error('\n💡 Setup Instructions:');
    console.error('1. Copy .env.example to .env');
    console.error('2. Set GEMINI_API_KEY in .env file');
    console.error('3. Configure other settings as needed');
    throw error;
  }
}

/**
 * Export all modules for advanced usage
 */
export {
  VoiceProcessingModule,
  GeminiAPIIntegration,
  VoiceActivationSystem,
  VoiceSecurityModule,
  VoiceAnalyticsModule,
  getEnvConfig,
  createConfigFromObject
};