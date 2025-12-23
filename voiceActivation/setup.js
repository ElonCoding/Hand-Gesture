/**
 * Voice Activation System - Setup Script
 * Helps configure the environment for first-time use
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🎤 Voice Activation System Setup');
console.log('==================================');

function setupEnvironment() {
  try {
    const envExamplePath = join(__dirname, '.env.example');
    const envPath = join(__dirname, '.env');
    
    // Check if .env.example exists
    if (!existsSync(envExamplePath)) {
      console.error('❌ .env.example file not found in:', __dirname);
      return false;
    }
    
    // Check if .env already exists
    if (existsSync(envPath)) {
      console.log('⚠️  .env file already exists');
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
        rl.close();
        if (answer.toLowerCase() === 'y') {
          copyEnvFile(envExamplePath, envPath);
        } else {
          console.log('ℹ️  Keeping existing .env file');
          showNextSteps();
        }
      });
    } else {
      copyEnvFile(envExamplePath, envPath);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return false;
  }
}

function copyEnvFile(source, destination) {
  try {
    const content = readFileSync(source, 'utf8');
    writeFileSync(destination, content);
    console.log('✅ Created .env file from template');
    showNextSteps();
  } catch (error) {
    console.error('❌ Failed to copy .env file:', error.message);
  }
}

function showNextSteps() {
  console.log('\n📋 Next Steps:');
  console.log('1. Edit the .env file with your configuration');
  console.log('2. Set your GEMINI_API_KEY (required)');
  console.log('3. Configure other settings as needed');
  console.log('4. Install dotenv: npm install dotenv');
  console.log('\n💡 Quick Start:');
  console.log('import { quickStart } from "./voiceActivation/examples.js";');
  console.log('const voiceSystem = await quickStart();');
  console.log('\n🚀 You\'re ready to go!');
}

function createSampleEnv() {
  const sampleContent = `# Voice Activation System - Environment Configuration
# Copy this file to .env and update with your actual values

# Required: Google Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta

# Optional: Voice Processing Configuration
VOICE_SAMPLE_RATE=16000
VOICE_BUFFER_SIZE=4096
VOICE_NOISE_SUPPRESSION=true
VOICE_ECHO_CANCELLATION=true

# Optional: System Configuration
WAKE_WORDS=hey particles,hello system,computer
RESPONSE_TIMEOUT=7000
MAX_COMMAND_LENGTH=50
ENABLE_VOICE_FEEDBACK=true

# Optional: Security Configuration
ENABLE_VOICE_AUTH=false
VOICE_AUTH_THRESHOLD=0.85
MAX_AUTH_ATTEMPTS=3
DATA_RETENTION_DAYS=7
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Optional: Analytics Configuration
ENABLE_LOGGING=true
LOG_LEVEL=info
ENABLE_METRICS=true
ENABLE_HEALTH_MONITORING=true

# Optional: Performance Configuration
API_RATE_LIMIT=10
API_RETRY_ATTEMPTS=3
API_TIMEOUT=5000
CACHE_TTL=300000

# Optional: Development Configuration
NODE_ENV=development
DEBUG_MODE=false
SIMULATE_API_CALLS=false
`;
  
  try {
    writeFileSync(join(__dirname, '.env'), sampleContent);
    console.log('✅ Created sample .env file');
    return true;
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    return false;
  }
}

// Run setup
if (import.meta.url === `file://${process.argv[1]}`) {
  setupEnvironment();
}

export { setupEnvironment, createSampleEnv };