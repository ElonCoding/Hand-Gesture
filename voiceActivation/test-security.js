/**
 * Test Script for VoiceSecurityModule
 * Demonstrates encryption, voice authentication, and security features
 */

import { VoiceSecurityModule } from './VoiceSecurityModule.js';

async function testVoiceSecurityModule() {
  console.log('🛡️  Testing VoiceSecurityModule...\n');
  
  try {
    // Initialize security module
    const securityModule = new VoiceSecurityModule({
      enableVoiceAuth: true,
      voiceAuthThreshold: 0.75,
      maxAuthAttempts: 3,
      enableAuditLog: true
    });
    
    // Initialize the security module (async)
    await securityModule.initialize();
    console.log('✅ Security module initialized');
    
    // Test 1: Encryption/Decryption
    console.log('\n🔐 Test 1: Voice Data Encryption');
    const testAudioData = new Float32Array(1000).map(() => Math.random() * 2 - 1);
    const encryptedData = await securityModule.encryptVoiceData(testAudioData.buffer);
    console.log(`✅ Encrypted ${testAudioData.length} samples to ${encryptedData.byteLength} bytes`);
    
    const decryptedData = await securityModule.decryptVoiceData(encryptedData);
    console.log(`✅ Decrypted back to ${decryptedData.byteLength} bytes`);
    
    // Test 2: Voice Profile Creation
    console.log('\n🎤 Test 2: Voice Profile Creation');
    const voiceSamples = [];
    for (let i = 0; i < 3; i++) {
      voiceSamples.push(new Float32Array(1000).map(() => Math.random() * 2 - 1));
    }
    
    const voiceProfile = await securityModule.createVoiceProfile(voiceSamples, 'user123');
    console.log(`✅ Created voice profile for user: ${voiceProfile.userId}`);
    
    // Test 3: Voice Authentication
    console.log('\n🔍 Test 3: Voice Authentication');
    const authSample = new Float32Array(1000).map(() => Math.random() * 2 - 1);
    const authResult = await securityModule.authenticateVoice(authSample, 'user123');
    console.log(`✅ Authentication result: ${authResult.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   Confidence: ${(authResult.confidence * 100).toFixed(1)}%`);
    
    // Test 4: Security Status
    console.log('\n📊 Test 4: Security Status');
    const securityStatus = securityModule.getSecurityStatus();
    console.log('✅ Security Status:');
    console.log(`   Voice Profile: ${securityStatus.voiceProfileExists ? 'EXISTS' : 'NOT FOUND'}`);
    console.log(`   Authenticated: ${securityStatus.isAuthenticated ? 'YES' : 'NO'}`);
    console.log(`   Auth Attempts: ${securityStatus.authAttempts}`);
    console.log(`   Audit Log Size: ${securityStatus.auditLogSize}`);
    console.log(`   Encryption: ${securityStatus.encryptionEnabled ? 'ENABLED' : 'DISABLED'}`);
    
    // Test 5: Command Security Check
    console.log('\n🔒 Test 5: Command Security Check');
    const testCommands = [
      'play music',
      'delete all files',
      'shutdown system',
      'what time is it',
      'export user data'
    ];
    
    testCommands.forEach(command => {
      const requiresAuth = securityModule.requiresAuthentication(command);
      console.log(`   "${command}": ${requiresAuth ? '⚠️  REQUIRES AUTH' : '✅ SAFE'}`);
    });
    
    // Test 6: Audit Log
    console.log('\n📋 Test 6: Security Audit Log');
    const auditLog = securityModule.getAuditLog(5);
    console.log(`✅ Retrieved ${auditLog.length} recent security events:`);
    auditLog.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.eventType} at ${new Date(event.timestamp).toLocaleTimeString()}`);
    });
    
    // Test 7: Data Sanitization
    console.log('\n🧹 Test 7: Data Sanitization');
    const sensitiveData = {
      audioData: testAudioData,
      userId: 'user123',
      timestamp: Date.now()
    };
    
    const sanitizedData = securityModule.sanitizeVoiceData(sensitiveData);
    console.log(`✅ Sanitized data: ${Object.keys(sanitizedData).join(', ')}`);
    console.log(`   Retention until: ${new Date(sanitizedData.retentionUntil).toLocaleDateString()}`);
    
    console.log('\n🎉 All VoiceSecurityModule tests completed successfully!');
    
    // Cleanup
    securityModule.destroy();
    console.log('✅ Security module cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testVoiceSecurityModule();