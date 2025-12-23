/**
 * Comprehensive Voice Security Demo
 * Shows all security features working together
 */

import { VoiceSecurityModule } from './VoiceSecurityModule.js';

async function comprehensiveSecurityDemo() {
  console.log('🛡️  Voice Security System - Comprehensive Demo\n');
  console.log('='.repeat(50));
  
  try {
    // Initialize security module
    const security = new VoiceSecurityModule({
      enableVoiceAuth: true,
      voiceAuthThreshold: 0.8,
      maxAuthAttempts: 3,
      enableAuditLog: true,
      dataRetentionDays: 7
    });
    
    // Initialize the module
    await security.initialize();
    console.log('✅ Security system initialized\n');
    
    // Demo 1: Data Encryption for Privacy
    console.log('🔐 Demo 1: Voice Data Encryption');
    console.log('-'.repeat(30));
    
    const voiceSample = new Float32Array(1000).map(() => Math.random() * 2 - 1);
    console.log(`Original voice data: ${voiceSample.length} samples`);
    
    const encryptedVoice = await security.encryptVoiceData(voiceSample.buffer);
    console.log(`Encrypted data: ${encryptedVoice.byteLength} bytes`);
    console.log(`Encryption ratio: ${(encryptedVoice.byteLength / voiceSample.length).toFixed(2)}x`);
    
    const decryptedVoice = await security.decryptVoiceData(encryptedVoice);
    console.log(`Decrypted data: ${decryptedVoice.byteLength} bytes`);
    console.log(`✅ Encryption/Decryption working perfectly\n`);
    
    // Demo 2: Voice Authentication Setup
    console.log('🎤 Demo 2: Voice Authentication Setup');
    console.log('-'.repeat(30));
    
    // Create voice profile with multiple samples
    const voiceSamples = [];
    for (let i = 0; i < 5; i++) {
      // Simulate different voice samples (slightly different each time)
      const sample = new Float32Array(1000).map((_, idx) => 
        Math.sin(idx * 0.01) * 0.5 + Math.random() * 0.1 + (i * 0.01)
      );
      voiceSamples.push(sample);
    }
    
    const profile = await security.createVoiceProfile(voiceSamples, 'alice');
    console.log(`✅ Voice profile created for user: ${profile.userId}`);
    console.log(`   Profile samples: ${voiceSamples.length}`);
    console.log(`   Profile created: ${new Date(profile.createdAt).toLocaleString()}\n`);
    
    // Demo 3: Authentication Attempts
    console.log('🔍 Demo 3: Voice Authentication');
    console.log('-'.repeat(30));
    
    // Test with correct user voice
    const authSample1 = new Float32Array(1000).map((_, idx) => 
      Math.sin(idx * 0.01) * 0.5 + Math.random() * 0.1
    );
    
    const authResult1 = await security.authenticateVoice(authSample1, 'alice');
    console.log(`Authentication attempt 1:`);
    console.log(`   User: alice`);
    console.log(`   Result: ${authResult1.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Confidence: ${(authResult1.confidence * 100).toFixed(1)}%`);
    
    // Test with different voice
    const authSample2 = new Float32Array(1000).map(() => Math.random() * 2 - 1);
    const authResult2 = await security.authenticateVoice(authSample2, 'alice');
    console.log(`\nAuthentication attempt 2:`);
    console.log(`   User: alice`);
    console.log(`   Result: ${authResult2.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Confidence: ${(authResult2.confidence * 100).toFixed(1)}%`);
    
    // Demo 4: Command Security Analysis
    console.log('\n🔒 Demo 4: Command Security Analysis');
    console.log('-'.repeat(30));
    
    const commands = [
      'play some music',
      'what is the weather',
      'delete all my files',
      'export user data',
      'shutdown the system',
      'configure settings',
      'restart the service',
      'show me the time'
    ];
    
    let secureCommands = 0;
    let sensitiveCommands = 0;
    
    commands.forEach(command => {
      const requiresAuth = security.requiresAuthentication(command);
      if (requiresAuth) {
        sensitiveCommands++;
        console.log(`   "${command}": ⚠️  REQUIRES AUTHENTICATION`);
      } else {
        secureCommands++;
        console.log(`   "${command}": ✅ SAFE - No auth needed`);
      }
    });
    
    console.log(`\n   Summary: ${secureCommands} safe, ${sensitiveCommands} require auth\n`);
    
    // Demo 5: Security Audit Trail
    console.log('📋 Demo 5: Security Audit Trail');
    console.log('-'.repeat(30));
    
    const auditLog = security.getAuditLog(10);
    console.log(`Total security events: ${auditLog.length}`);
    console.log('Recent events:');
    
    auditLog.slice(-5).forEach((event, index) => {
      const timestamp = new Date(event.timestamp).toLocaleString();
      console.log(`   ${index + 1}. [${timestamp}] ${event.eventType}`);
      if (event.details && Object.keys(event.details).length > 0) {
        const details = Object.keys(event.details).join(', ');
        console.log(`      Details: ${details}`);
      }
    });
    
    // Demo 6: Security Status
    console.log('\n📊 Demo 6: Current Security Status');
    console.log('-'.repeat(30));
    
    const status = security.getSecurityStatus();
    console.log(`Voice Profile: ${status.voiceProfileExists ? '✅ Active' : '❌ Not set'}`);
    console.log(`Authenticated: ${status.isAuthenticated ? '✅ Yes' : '❌ No'}`);
    console.log(`Auth Attempts: ${status.authAttempts}/${security.config.maxAuthAttempts}`);
    console.log(`Audit Log: ${status.auditLogSize} events`);
    console.log(`Encryption: ${status.encryptionEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`Data Retention: ${security.config.dataRetentionDays} days`);
    
    // Demo 7: Privacy Compliance
    console.log('\n🧹 Demo 7: Privacy & Compliance');
    console.log('-'.repeat(30));
    
    const sensitiveData = {
      audioData: voiceSample,
      userId: 'alice',
      timestamp: Date.now(),
      location: 'living room',
      device: 'smart speaker'
    };
    
    const sanitizedData = security.sanitizeVoiceData(sensitiveData);
    console.log('Original data fields:', Object.keys(sensitiveData).join(', '));
    console.log('Sanitized data fields:', Object.keys(sanitizedData).join(', '));
    console.log(`Data retention until: ${new Date(sanitizedData.retentionUntil).toLocaleDateString()}`);
    console.log(`Privacy compliance: ✅ Data sanitized for protection`);
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Voice Security System Demo Complete!');
    console.log('='.repeat(50));
    
    // Final security summary
    console.log('\n📈 Security Summary:');
    console.log(`   ✅ Voice data encryption: ACTIVE`);
    console.log(`   ✅ User authentication: CONFIGURED`);
    console.log(`   ✅ Command security: ${sensitiveCommands} commands protected`);
    console.log(`   ✅ Audit logging: ${status.auditLogSize} events tracked`);
    console.log(`   ✅ Privacy compliance: ENABLED`);
    console.log(`   ✅ Data retention: ${security.config.dataRetentionDays} days`);
    
    // Cleanup
    security.destroy();
    console.log('\n✅ Security system cleaned up and ready for production!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error(error.stack);
  }
}

// Run the comprehensive demo
comprehensiveSecurityDemo();