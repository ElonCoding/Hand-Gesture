/**
 * Voice Security System - Quick Start
 * Demonstrates the security system in action
 */

import { VoiceSecurityModule } from './VoiceSecurityModule.js';

async function startVoiceSecuritySystem() {
  console.log('🛡️  Starting Voice Security System...\n');
  
  try {
    // Initialize security module with default settings
    const security = new VoiceSecurityModule({
      enableVoiceAuth: true,
      voiceAuthThreshold: 0.75,
      maxAuthAttempts: 3,
      enableAuditLog: true,
      dataRetentionDays: 7
    });
    
    // Initialize the system
    await security.initialize();
    console.log('✅ Voice Security System is ACTIVE and ready!\n');
    
    // Show current security status
    const status = security.getSecurityStatus();
    console.log('📊 Current Security Status:');
    console.log(`   🔐 Encryption: ${status.encryptionEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   📝 Audit Log: ${status.auditLogSize} events tracked`);
    console.log(`   🔑 Voice Auth: ${status.voiceProfileExists ? '✅ Profile exists' : '❌ No profile'}`);
    console.log(`   ⏰ Auth Status: ${status.isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}`);
    console.log(`   🎯 Auth Attempts: ${status.authAttempts}/${security.config.maxAuthAttempts}`);
    
    console.log('\n🚀 System is ready for voice processing!');
    console.log('\n💡 Available commands:');
    console.log('   • Encrypt voice data: security.encryptVoiceData(audioBuffer)');
    console.log('   • Check command security: security.requiresAuthentication(command)');
    console.log('   • View audit log: security.getAuditLog(limit)');
    console.log('   • Get security status: security.getSecurityStatus()');
    
    // Keep the system running
    console.log('\n🔄 Voice Security System is running...');
    console.log('   Press Ctrl+C to stop the system');
    
    // Return the security instance for interactive use
    return security;
    
  } catch (error) {
    console.error('❌ Failed to start Voice Security System:', error.message);
    throw error;
  }
}

// Start the system
const securitySystem = await startVoiceSecuritySystem();

// Make the security system available globally for interactive use
global.voiceSecurity = securitySystem;

console.log('\n🎤 Voice Security System is now running and ready for voice commands!');
console.log('💬 You can now use: voiceSecurity.[method] to interact with the system');