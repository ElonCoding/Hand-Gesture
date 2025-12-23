/**
 * Environment Status Check
 * Quick verification of your setup
 */

import { getEnvConfig } from './envConfig.js';

console.log('🔍 Environment Configuration Status');
console.log('====================================');

try {
  const config = getEnvConfig();
  
  console.log('✅ Environment configuration loaded successfully');
  console.log('\n📋 Current Configuration:');
  console.log('- API Key:', config.api.key === 'your_gemini_api_key_here' ? '❌ Not configured' : '✅ Configured');
  console.log('- Wake Words:', config.system.wakeWords.join(', '));
  console.log('- Voice Processing:', config.voiceProcessing.sampleRate + 'Hz');
  console.log('- Security:', config.security.enableVoiceAuth ? '✅ Voice auth enabled' : '❌ Voice auth disabled');
  console.log('- Logging:', config.analytics.enableLogging ? '✅ Enabled' : '❌ Disabled');
  
  console.log('\n🎯 Next Steps:');
  if (config.api.key === 'your_gemini_api_key_here') {
    console.log('1. Set your GEMINI_API_KEY in the .env file');
    console.log('2. Run: npm install dotenv');
    console.log('3. Test with: node examples.js');
  } else {
    console.log('✅ Your environment is ready to use!');
    console.log('Run: node examples.js to start using the voice system');
  }
  
} catch (error) {
  console.error('❌ Configuration error:', error.message);
  console.log('\n💡 Quick Fix:');
  console.log('1. Make sure .env file exists (copy from .env.example)');
  console.log('2. Set required GEMINI_API_KEY');
  console.log('3. Check file permissions');
}