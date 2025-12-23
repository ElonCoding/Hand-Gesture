/**
 * Environment Configuration Utility
 * Handles loading and parsing of environment variables
 */

// Load environment variables in Node.js
import dotenv from 'dotenv';
dotenv.config();

/**
 * Load environment variables with fallback defaults
 */
export function loadEnvConfig() {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // For browser environments, you might want to use a different approach
    // This is a basic implementation - in production, consider using webpack DefinePlugin
    return loadBrowserEnv();
  }
  
  return loadNodeEnv();
}

/**
 * Load environment variables in Node.js environment
 */
function loadNodeEnv() {
  return {
    api: {
      key: process.env.GEMINI_API_KEY || '',
      url: process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta'
    },
    voiceProcessing: {
      sampleRate: parseInt(process.env.VOICE_SAMPLE_RATE) || 16000,
      bufferSize: parseInt(process.env.VOICE_BUFFER_SIZE) || 4096,
      noiseSuppression: process.env.VOICE_NOISE_SUPPRESSION === 'true',
      echoCancellation: process.env.VOICE_ECHO_CANCELLATION === 'true'
    },
    system: {
      wakeWords: parseWakeWords(process.env.WAKE_WORDS),
      responseTimeout: parseInt(process.env.RESPONSE_TIMEOUT) || 7000,
      maxCommandLength: parseInt(process.env.MAX_COMMAND_LENGTH) || 50,
      enableVoiceFeedback: process.env.ENABLE_VOICE_FEEDBACK !== 'false'
    },
    security: {
      enableVoiceAuth: process.env.ENABLE_VOICE_AUTH === 'true',
      voiceAuthThreshold: parseFloat(process.env.VOICE_AUTH_THRESHOLD) || 0.85,
      maxAuthAttempts: parseInt(process.env.MAX_AUTH_ATTEMPTS) || 3,
      dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS) || 7,
      encryptionKey: process.env.ENCRYPTION_KEY || ''
    },
    analytics: {
      enableLogging: process.env.ENABLE_LOGGING !== 'false',
      logLevel: process.env.LOG_LEVEL || 'info',
      enableMetrics: process.env.ENABLE_METRICS !== 'false',
      enableHealthMonitoring: process.env.ENABLE_HEALTH_MONITORING !== 'false'
    },
    performance: {
      apiRateLimit: parseInt(process.env.API_RATE_LIMIT) || 10,
      apiRetryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS) || 3,
      apiTimeout: parseInt(process.env.API_TIMEOUT) || 5000,
      cacheTtl: parseInt(process.env.CACHE_TTL) || 300000
    },
    development: {
      nodeEnv: process.env.NODE_ENV || 'development',
      debugMode: process.env.DEBUG_MODE === 'true',
      simulateApiCalls: process.env.SIMULATE_API_CALLS === 'true'
    }
  };
}

/**
 * Load environment variables in browser environment
 */
function loadBrowserEnv() {
  // For browser environments, you might want to use environment variables
  // injected during build time or loaded from a secure API
  return {
    api: {
      key: '', // Should be loaded securely in browser
      url: 'https://generativelanguage.googleapis.com/v1beta'
    },
    voiceProcessing: {
      sampleRate: 16000,
      bufferSize: 4096,
      noiseSuppression: true,
      echoCancellation: true
    },
    system: {
      wakeWords: ['hey particles', 'hello system', 'computer'],
      responseTimeout: 7000,
      maxCommandLength: 50,
      enableVoiceFeedback: true
    },
    security: {
      enableVoiceAuth: false,
      voiceAuthThreshold: 0.85,
      maxAuthAttempts: 3,
      dataRetentionDays: 7,
      encryptionKey: ''
    },
    analytics: {
      enableLogging: true,
      logLevel: 'info',
      enableMetrics: true,
      enableHealthMonitoring: true
    },
    performance: {
      apiRateLimit: 10,
      apiRetryAttempts: 3,
      apiTimeout: 5000,
      cacheTtl: 300000
    },
    development: {
      nodeEnv: 'development',
      debugMode: false,
      simulateApiCalls: false
    }
  };
}

/**
 * Parse wake words from comma-separated string
 */
function parseWakeWords(wakeWordsString) {
  if (!wakeWordsString) {
    return ['hey particles', 'hello system', 'computer'];
  }
  return wakeWordsString.split(',').map(word => word.trim());
}

/**
 * Validate environment configuration
 */
export function validateEnvConfig(config) {
  const errors = [];
  
  // Required fields
  if (!config.api.key) {
    errors.push('GEMINI_API_KEY is required and not configured');
  }
  
  // Validate API key format (basic check)
  if (config.api.key && config.api.key.length < 10) {
    errors.push('GEMINI_API_KEY appears to be invalid (too short)');
  }
  
  // Validate numeric ranges
  if (config.voiceProcessing.sampleRate < 8000 || config.voiceProcessing.sampleRate > 48000) {
    errors.push('VOICE_SAMPLE_RATE must be between 8000 and 48000');
  }
  
  if (config.security.voiceAuthThreshold < 0 || config.security.voiceAuthThreshold > 1) {
    errors.push('VOICE_AUTH_THRESHOLD must be between 0 and 1');
  }
  
  if (config.performance.apiTimeout < 1000 || config.performance.apiTimeout > 30000) {
    errors.push('API_TIMEOUT must be between 1000 and 30000 milliseconds');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get validated environment configuration
 */
export function getEnvConfig() {
  const config = loadEnvConfig();
  const validation = validateEnvConfig(config);
  
  if (validation.errors.length > 0) {
    throw new Error(`Configuration errors:\n${validation.errors.join('\n')}`);
  }
  
  return config;
}