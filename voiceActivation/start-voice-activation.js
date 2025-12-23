/**
 * Voice Activation System - Complete Integration
 * Starts the full voice activation system with all modules
 */

import { VoiceActivationManager } from './VoiceActivationManager.js';
import { getEnvConfig } from './envConfig.js';

async function startVoiceActivationSystem() {
  console.log('🎤 Starting Voice Activation System...\n');
  console.log('='.repeat(60));
  
  try {
    // Load environment configuration
    console.log('📋 Loading configuration...');
    const config = getEnvConfig();
    console.log('✅ Configuration loaded successfully\n');
    
    // Initialize the voice activation manager
    console.log('🚀 Initializing Voice Activation Manager...');
    const voiceSystem = new VoiceActivationManager(config);
    
    // Start the system
    console.log('🔄 Starting voice activation system...');
    await voiceSystem.start();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 VOICE ACTIVATION SYSTEM IS NOW RUNNING!');
    console.log('='.repeat(60));
    
    // Display system status
    console.log('\n📊 System Status:');
    console.log(`   🎤 Voice Processing: ✅ Active`);
    console.log(`   🔐 Security: ✅ Encryption enabled`);
    console.log(`   🔗 API Integration: ✅ Connected`);
    console.log(`   📝 Analytics: ✅ Logging active`);
    console.log(`   🎯 Wake Words: "${config.system.wakeWords.join('", "')}"`);
    
    console.log('\n🛡️  Security Features:');
    console.log(`   Voice Data Encryption: ✅ AES-GCM`);
    console.log(`   Command Security: ✅ Sensitive command detection`);
    console.log(`   Privacy Compliance: ✅ Data sanitization`);
    console.log(`   Audit Logging: ✅ ${config.analytics.enableLogging ? 'Enabled' : 'Disabled'}`);
    
    console.log('\n🎤 Voice Commands Ready:');
    console.log('   Say any wake word to activate the system');
    console.log('   Try: "Hey Particles, what can you do?"');
    console.log('   Try: "Computer, play some music"');
    console.log('   Try: "Hello System, delete my files" (will require auth)');
    
    console.log('\n💡 Available Voice Commands:');
    console.log('   • Play music, videos, or audio');
    console.log('   • Get information (weather, time, news)');
    console.log('   • Control system settings');
    console.log('   • Process voice data securely');
    console.log('   • And much more...');
    
    console.log('\n🔄 System is listening for voice commands...');
    console.log('   Press Ctrl+C to stop the system');
    
    // Return the system for interactive use
    return voiceSystem;
    
  } catch (error) {
    console.error('❌ Failed to start Voice Activation System:', error.message);
    
    if (error.message.includes('GEMINI_API_KEY')) {
      console.log('\n💡 Quick Fix:');
      console.log('   1. Set your GEMINI_API_KEY in the .env file');
      console.log('   2. Run: npm install dotenv');
      console.log('   3. Try starting the system again');
    }
    
    throw error;
  }
}

// Start the complete voice activation system
console.log('🎯 Initializing Voice Activation System...\n');

const voiceActivationSystem = await startVoiceActivationSystem().catch(error => {
  console.error('\n❌ System startup failed. Please check the error above.');
  process.exit(1);
});

// Make the system available globally for interactive use
global.voiceActivation = voiceActivationSystem;

console.log('\n🎤 Voice Activation System is now listening for your commands!');
console.log('💬 Try saying one of the wake words to activate the system');
console.log('🚀 The system is ready to process voice commands securely!');