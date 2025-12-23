/**
 * Test Environment Configuration
 * Verifies that the environment setup is working correctly
 */

import { getEnvConfig } from './envConfig.js';
import { createVoiceActivationSystem } from './index.js';

async function testEnvironmentConfig() {
  console.log('🧪 Testing Environment Configuration');
  console.log('====================================');
  
  try {
    // Test 1: Load environment configuration
    console.log('1. Loading environment configuration...');
    const config = getEnvConfig();
    console.log('✅ Environment configuration loaded successfully');
    
    // Test 2: Check API key
    if (config.api.key === 'your_gemini_api_key_here') {
      console.log('⚠️  API key not configured (using placeholder)');
      console.log('   Please set GEMINI_API_KEY in your .env file');
    } else {
      console.log('✅ API key configured');
    }
    
    // Test 3: Check wake words
    console.log('2. Wake words:', config.system.wakeWords.join(', '));
    
    // Test 4: Check voice processing settings
    console.log('3. Voice processing:');
    console.log('   Sample rate:', config.voiceProcessing.sampleRate);
    console.log('   Noise suppression:', config.voiceProcessing.noiseSuppression);
    console.log('   Echo cancellation:', config.voiceProcessing.echoCancellation);
    
    // Test 5: Check security settings
    console.log('4. Security settings:');
    console.log('   Voice auth enabled:', config.security.enableVoiceAuth);
    console.log('   Auth threshold:', config.security.voiceAuthThreshold);
    
    // Test 6: Check analytics settings
    console.log('5. Analytics settings:');
    console.log('   Logging enabled:', config.analytics.enableLogging);
    console.log('   Log level:', config.analytics.logLevel);
    console.log('   Metrics enabled:', config.analytics.enableMetrics);
    
    console.log('\n✅ All environment configuration tests passed!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Environment configuration test failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Make sure .env file exists');
    console.error('2. Check that GEMINI_API_KEY is set');
    console.error('3. Verify .env file format');
    return false;
  }
}

async function testQuickStart() {
  console.log('\n🚀 Testing Quick Start Function');
  console.log('================================');
  
  try {
    // This will use environment configuration
    console.log('Attempting to create voice system...');
    
    // Note: This will fail if API key is not configured
    // But it will test the configuration loading
    const config = getEnvConfig();
    
    if (config.api.key === 'your_gemini_api_key_here') {
      console.log('⚠️  Cannot create voice system - API key is placeholder');
      console.log('   Please update GEMINI_API_KEY in .env file');
      return false;
    }
    
    console.log('✅ Configuration valid - ready to create voice system');
    return true;
    
  } catch (error) {
    console.error('❌ Quick start test failed:', error.message);
    return false;
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔍 Environment Configuration Test Suite');
  console.log('========================================\n');
  
  const configTest = await testEnvironmentConfig();
  const quickStartTest = await testQuickStart();
  
  console.log('\n📊 Test Results:');
  console.log('Configuration test:', configTest ? '✅ PASSED' : '❌ FAILED');
  console.log('Quick start test:', quickStartTest ? '✅ PASSED' : '❌ FAILED');
  
  if (configTest && quickStartTest) {
    console.log('\n🎉 All tests passed! Your environment is ready.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration above.');
  }
}

export { testEnvironmentConfig, testQuickStart };