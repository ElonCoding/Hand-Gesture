/**
 * Voice Activation System - Usage Example
 * Demonstrates how to integrate the voice activation system with your application
 * 
 * Environment Variables:
 * - Copy .env.example to .env and configure your settings
 * - Set GEMINI_API_KEY for API authentication
 * - Configure other optional settings as needed
 */

import { createVoiceActivationSystem } from './index.js';
import { getEnvConfig } from './envConfig.js';

/**
 * Example 1: Basic Integration using Environment Variables
 */
async function basicIntegration() {
  try {
    // Load configuration from environment variables
    const envConfig = getEnvConfig();
    
    // Initialize voice activation system with environment configuration
    const voiceSystem = await createVoiceActivationSystem(envConfig.api.key, {
      system: {
        wakeWords: envConfig.system.wakeWords,
        enableVoiceFeedback: envConfig.system.enableVoiceFeedback
      }
    });
    
    console.log('Voice activation system ready!');
    console.log('Wake words:', envConfig.system.wakeWords.join(', '));
    console.log('Say one of the wake words followed by a command.');
    
    // The system is now listening for voice commands
    // Example commands:
    // - "hey particles, change shape to cube"
    // - "hello system, switch to dark theme"
    // - "hey particles, increase particles to 3000"
    
    return voiceSystem;
    
  } catch (error) {
    console.error('Failed to initialize voice system:', error);
    console.error('Make sure to set GEMINI_API_KEY in your .env file');
  }
}

/**
 * Example 2: Advanced Integration with Environment Configuration
 */
async function advancedIntegration() {
  try {
    // Load configuration from environment variables
    const envConfig = getEnvConfig();
    
    // Create system with environment-based configuration
    const voiceSystem = await createVoiceActivationSystem(envConfig.api.key, {
      voiceProcessing: envConfig.voiceProcessing,
      system: envConfig.system,
      security: envConfig.security,
      analytics: envConfig.analytics,
      performance: envConfig.performance
    });
    
    // Register custom command handlers
    voiceSystem.registerCommand('save', async (entities, action) => {
      // Custom save command logic
      console.log('Save command executed:', entities, action);
      return {
        success: true,
        response: 'Settings saved successfully.',
        action: 'save_settings'
      };
    });
    
    voiceSystem.registerCommand('load', async (entities, action) => {
      // Custom load command logic
      console.log('Load command executed:', entities, action);
      return {
        success: true,
        response: 'Settings loaded successfully.',
        action: 'load_settings'
      };
    });
    
    // Monitor system status
    setInterval(() => {
      const status = voiceSystem.getSystemStatus();
      console.log('System Status:', {
        isActive: status.isActive,
        totalCommands: status.system.metrics.totalCommands,
        averageResponseTime: status.system.metrics.averageResponseTime.toFixed(2) + 'ms'
      });
    }, 30000);
    
    return voiceSystem;
    
  } catch (error) {
    console.error('Failed to initialize advanced voice system:', error);
  }
}

/**
 * Example 3: Integration with Three.js Particle System
 */
async function particleSystemIntegration() {
  try {
    // Load configuration from environment variables
    const envConfig = getEnvConfig();
    
    // Initialize voice system with environment configuration
    const voiceSystem = await createVoiceActivationSystem(envConfig.api.key, {
      system: envConfig.system,
      voiceProcessing: envConfig.voiceProcessing
    });
    
    // Connect voice commands to your particle system
    voiceSystem.voiceSystem.registerCommandHandler('shape', async (entities, action) => {
      const shape = entities[0];
      if (shape && window.particleSystem) {
        // Assuming you have a particle system with switchTemplate method
        window.particleSystem.switchTemplate(shape);
        return {
          success: true,
          response: `Switched to ${shape} shape.`,
          action: `shape_${shape}`
        };
      }
      return {
        success: false,
        response: 'Particle system not available.',
        action: 'none'
      };
    });
    
    voiceSystem.voiceSystem.registerCommandHandler('color', async (entities, action) => {
      const color = entities[0];
      if (color && window.particleSystem) {
        // Update particle colors
        window.particleSystem.updateColorTheme(color);
        return {
          success: true,
          response: `Changed to ${color} color theme.`,
          action: `color_${color}`
        };
      }
      return {
        success: false,
        response: 'Particle system not available.',
        action: 'none'
      };
    });
    
    voiceSystem.voiceSystem.registerCommandHandler('particle', async (entities, action) => {
      const count = parseInt(entities[0]) || 2000;
      if (window.particleSystem) {
        // Update particle count
        window.particleSystem.updateParticleCount(count);
        return {
          success: true,
          response: `Updated particles to ${count}.`,
          action: `particles_${count}`
        };
      }
      return {
        success: false,
        response: 'Particle system not available.',
        action: 'none'
      };
    });
    
    console.log('Voice-controlled particle system ready!');
    console.log('Try saying: "hey particles, change shape to heart"');
    
    return voiceSystem;
    
  } catch (error) {
    console.error('Failed to integrate with particle system:', error);
  }
}

/**
 * Example 4: Voice Authentication Setup with Environment Configuration
 */
async function voiceAuthenticationSetup() {
  try {
    // Load configuration from environment variables
    const envConfig = getEnvConfig();
    
    // Override security settings for voice authentication
    const voiceSystem = await createVoiceActivationSystem(envConfig.api.key, {
      system: envConfig.system,
      voiceProcessing: envConfig.voiceProcessing,
      security: {
        ...envConfig.security,
        enableVoiceAuth: true // Override to enable voice auth
      },
      analytics: envConfig.analytics
    });
    
    // Record voice samples for authentication (in a real app, you'd have a UI for this)
    console.log('Recording voice samples for authentication...');
    
    // Simulate recording 5 voice samples
    const voiceSamples = [];
    for (let i = 0; i < 5; i++) {
      console.log(`Recording sample ${i + 1}...`);
      // In a real app, you'd capture actual audio here
      // voiceSamples.push(await recordVoiceSample());
    }
    
    // Create voice profile
    const userId = 'user_' + Date.now();
    await voiceSystem.setVoiceProfile(voiceSamples, userId);
    
    console.log('Voice authentication profile created for user:', userId);
    
    // Test authentication
    console.log('Testing voice authentication...');
    const testSample = null; // Would be actual audio sample
    const authResult = await voiceSystem.authenticateVoice(testSample, userId);
    
    console.log('Authentication result:', authResult);
    
    return voiceSystem;
    
  } catch (error) {
    console.error('Voice authentication setup failed:', error);
  }
}

/**
 * Example 5: Analytics and Monitoring
 */
async function analyticsAndMonitoring() {
  try {
    const voiceSystem = await createVoiceActivationSystem('YOUR_GEMINI_API_KEY_HERE', {
      analytics: {
        enableLogging: true,
        enableMetrics: true,
        enableHealthMonitoring: true,
        logLevel: 'debug',
        metricsInterval: 15000, // 15 seconds
        healthCheckInterval: 30000  // 30 seconds
      }
    });
    
    // Get analytics reports
    setInterval(async () => {
      // Get last hour analytics
      const hourlyReport = voiceSystem.getAnalyticsReport('1h');
      console.log('Hourly Analytics:', {
        totalCommands: hourlyReport.statistics.totalCommands,
        successRate: hourlyReport.statistics.averageSuccessRate.toFixed(2) + '%',
        avgResponseTime: hourlyReport.statistics.averageResponseTime.toFixed(2) + 'ms',
        status: hourlyReport.summary.status
      });
      
      // Get last 24 hours analytics
      const dailyReport = voiceSystem.getAnalyticsReport('24h');
      console.log('Daily Analytics Summary:', hourlyReport.summary);
      
      // Export data for external analysis
      const csvData = voiceSystem.exportAnalyticsData('csv');
      console.log('Metrics CSV data length:', csvData.length);
      
    }, 60000); // Every minute
    
    // Monitor specific events
    voiceSystem.analyticsModule.log('info', 'Voice system monitoring started');
    
    return voiceSystem;
    
  } catch (error) {
    console.error('Analytics setup failed:', error);
  }
}

/**
 * Example 5: Environment Configuration Usage
 * Demonstrates how to use environment variables for all configuration
 */
async function environmentConfigurationExample() {
  try {
    // Load configuration from environment variables
    const envConfig = getEnvConfig();
    
    console.log('📋 Environment Configuration Loaded:');
    console.log('API URL:', envConfig.api.url);
    console.log('Sample Rate:', envConfig.voiceProcessing.sampleRate);
    console.log('Wake Words:', envConfig.system.wakeWords.join(', '));
    console.log('Voice Auth Enabled:', envConfig.security.enableVoiceAuth);
    console.log('Logging Level:', envConfig.analytics.logLevel);
    
    // Initialize with full environment configuration
    const voiceSystem = await createVoiceActivationSystem(envConfig.api.key, {
      api: envConfig.api,
      voiceProcessing: envConfig.voiceProcessing,
      system: envConfig.system,
      security: envConfig.security,
      analytics: envConfig.analytics,
      performance: envConfig.performance,
      development: envConfig.development
    });
    
    console.log('✅ Voice system initialized with environment configuration');
    
    // Monitor system with environment-based settings
    if (envConfig.analytics.enableHealthMonitoring) {
      setInterval(() => {
        const status = voiceSystem.getSystemStatus();
        console.log(`[${new Date().toISOString()}] System Health:`, {
          isActive: status.isActive,
          uptime: status.system.metrics.uptime,
          totalCommands: status.system.metrics.totalCommands,
          successRate: status.system.metrics.successRate.toFixed(2) + '%'
        });
      }, envConfig.performance.healthCheckInterval || 30000);
    }
    
    return voiceSystem;
    
  } catch (error) {
    console.error('Environment configuration failed:', error);
    console.error('\n📝 Setup Instructions:');
    console.error('1. Copy .env.example to .env');
    console.error('2. Set GEMINI_API_KEY in .env file');
    console.error('3. Configure other settings as needed');
    console.error('4. Install dotenv package: npm install dotenv');
  }
}

/**
 * Example 6: Error Handling and Recovery
 */
async function errorHandlingAndRecovery() {
  try {
    const envConfig = getEnvConfig();
    const voiceSystem = await createVoiceActivationSystem(envConfig.api.key, {
      system: envConfig.system,
      analytics: envConfig.analytics
    });
    
    // Monitor for errors
    voiceSystem.analyticsModule.log('info', 'Starting error monitoring');
    
    // Simulate error scenarios and recovery
    setInterval(() => {
      const status = voiceSystem.getSystemStatus();
      
      // Check for issues
      if (status.apiStats.isRateLimited) {
        console.warn('API rate limit detected - implementing backoff strategy');
        // Implement exponential backoff
      }
      
      if (status.voiceProcessor.status !== 'recording') {
        console.warn('Voice processor not recording - attempting restart');
        // Attempt to restart voice processing
        voiceSystem.voiceProcessor.startRecording().catch(error => {
          console.error('Failed to restart voice processor:', error);
        });
      }
      
      if (status.security.authAttempts >= status.security.maxAuthAttempts) {
        console.warn('Maximum authentication attempts reached - requiring manual intervention');
        // Lock system and require manual unlock
      }
      
    }, 10000); // Check every 10 seconds
    
    // Implement graceful degradation
    window.addEventListener('beforeunload', async () => {
      console.log('Cleaning up voice system before page unload...');
      await voiceSystem.destroy();
    });
    
    return voiceSystem;
    
  } catch (error) {
    console.error('Error handling setup failed:', error);
  }
}

/**
 * Helper function to test the voice system
 */
async function testVoiceSystem() {
  console.log('🎤 Voice Activation System Test Suite');
  console.log('=====================================');
  
  // Test basic integration
  console.log('1. Testing basic integration...');
  const basicSystem = await basicIntegration();
  
  // Test system status
  console.log('2. System status:', basicSystem.getSystemStatus());
  
  // Test command history
  console.log('3. Command history:', basicSystem.getCommandHistory(5));
  
  // Test analytics
  console.log('4. Analytics report:', basicSystem.getAnalyticsReport('1h'));
  
  console.log('✅ Voice system test completed');
  
  return basicSystem;
}

/**
 * Quick Start Function with Environment Configuration
 * This is the recommended way to get started
 */
async function quickStart() {
  console.log('🚀 Voice Activation System - Quick Start');
  console.log('=======================================');
  
  try {
    // Load environment configuration
    const envConfig = getEnvConfig();
    
    // Create voice system with environment settings
    const voiceSystem = await createVoiceActivationSystem(envConfig.api.key, {
      system: envConfig.system,
      voiceProcessing: envConfig.voiceProcessing,
      analytics: envConfig.analytics
    });
    
    console.log('✅ Voice system ready!');
    console.log('🎤 Wake words:', envConfig.system.wakeWords.join(', '));
    console.log('📊 Analytics:', envConfig.analytics.enableLogging ? 'enabled' : 'disabled');
    console.log('🔒 Voice auth:', envConfig.security.enableVoiceAuth ? 'enabled' : 'disabled');
    
    return voiceSystem;
    
  } catch (error) {
    console.error('❌ Quick start failed:', error.message);
    console.error('\n💡 Quick Fix:');
    console.error('1. Copy .env.example to .env');
    console.error('2. Add your GEMINI_API_KEY to .env file');
    console.error('3. Run: npm install dotenv (for Node.js)');
    throw error;
  }
}

// Export for use in other modules
export {
  basicIntegration,
  advancedIntegration,
  particleSystemIntegration,
  voiceAuthenticationSetup,
  environmentConfigurationExample,
  analyticsAndMonitoring,
  errorHandlingAndRecovery,
  testVoiceSystem,
  quickStart,
  getEnvConfig
};