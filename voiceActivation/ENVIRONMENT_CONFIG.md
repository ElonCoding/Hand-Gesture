# Voice Activation System - Environment Configuration

This document explains how to use environment variables to configure the Voice Activation System.

## Quick Start

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Configure your API key:**
   ```bash
   # Edit .env file and set your Google Gemini API key
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Install dotenv (for Node.js):**
   ```bash
   npm install dotenv
   ```

4. **Use the system:**
   ```javascript
   import { quickStart } from './voiceActivation/examples.js';
   
   const voiceSystem = await quickStart();
   ```

## Environment Variables Reference

### Required Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Google Gemini API key | *Required* |

### Voice Processing Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `VOICE_SAMPLE_RATE` | Audio sample rate in Hz | 16000 |
| `VOICE_BUFFER_SIZE` | Audio buffer size | 4096 |
| `VOICE_NOISE_SUPPRESSION` | Enable noise suppression | true |
| `VOICE_ECHO_CANCELLATION` | Enable echo cancellation | true |

### System Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `WAKE_WORDS` | Comma-separated wake words | "hey particles,hello system" |
| `RESPONSE_TIMEOUT` | Response timeout in ms | 7000 |
| `MAX_COMMAND_LENGTH` | Maximum command length | 50 |
| `ENABLE_VOICE_FEEDBACK` | Enable voice feedback | true |

### Security Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_VOICE_AUTH` | Enable voice authentication | false |
| `VOICE_AUTH_THRESHOLD` | Authentication threshold (0.5-1.0) | 0.85 |
| `MAX_AUTH_ATTEMPTS` | Maximum auth attempts | 3 |
| `DATA_RETENTION_DAYS` | Data retention period | 7 |
| `ENCRYPTION_KEY` | 32-character encryption key | *Optional* |

### Analytics Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_LOGGING` | Enable logging | true |
| `LOG_LEVEL` | Log level (debug, info, warn, error) | info |
| `ENABLE_METRICS` | Enable metrics collection | true |
| `ENABLE_HEALTH_MONITORING` | Enable health monitoring | true |

### Performance Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `API_RATE_LIMIT` | API rate limit per minute | 10 |
| `API_RETRY_ATTEMPTS` | API retry attempts | 3 |
| `API_TIMEOUT` | API timeout in ms | 5000 |
| `CACHE_TTL` | Cache TTL in ms | 300000 |

### Development Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | development |
| `DEBUG_MODE` | Enable debug mode | false |
| `SIMULATE_API_CALLS` | Simulate API calls | false |

## Usage Examples

### Basic Usage with Environment Variables

```javascript
import { createVoiceActivationSystem } from './voiceActivation/index.js';

// Automatically loads configuration from .env file
const voiceSystem = await createVoiceActivationSystem();
```

### Advanced Usage with Custom Configuration

```javascript
import { createVoiceActivationSystem } from './voiceActivation/index.js';
import { getEnvConfig } from './voiceActivation/envConfig.js';

// Load environment configuration
const envConfig = getEnvConfig();

// Create system with environment settings
const voiceSystem = await createVoiceActivationSystem(envConfig.api.key, {
  system: envConfig.system,
  voiceProcessing: envConfig.voiceProcessing,
  security: envConfig.security,
  analytics: envConfig.analytics
});
```

### Using the Quick Start Function

```javascript
import { quickStart } from './voiceActivation/examples.js';

// This is the recommended approach
const voiceSystem = await quickStart();
console.log('Voice system ready!');
```

### Environment-Specific Configuration

```javascript
import { createVoiceSystemFromEnv } from './voiceActivation/index.js';

// Loads all configuration from environment
const voiceSystem = await createVoiceSystemFromEnv();
```

## Sample .env File

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Voice Processing
VOICE_SAMPLE_RATE=16000
VOICE_BUFFER_SIZE=4096
VOICE_NOISE_SUPPRESSION=true
VOICE_ECHO_CANCELLATION=true

# System Settings
WAKE_WORDS=hey particles,hello system,computer
RESPONSE_TIMEOUT=7000
MAX_COMMAND_LENGTH=50
ENABLE_VOICE_FEEDBACK=true

# Security
ENABLE_VOICE_AUTH=false
VOICE_AUTH_THRESHOLD=0.85
MAX_AUTH_ATTEMPTS=3
DATA_RETENTION_DAYS=7

# Analytics
ENABLE_LOGGING=true
LOG_LEVEL=info
ENABLE_METRICS=true
ENABLE_HEALTH_MONITORING=true

# Performance
API_RATE_LIMIT=10
API_RETRY_ATTEMPTS=3
API_TIMEOUT=5000
CACHE_TTL=300000

# Development
NODE_ENV=development
DEBUG_MODE=false
SIMULATE_API_CALLS=false
```

## Browser Usage

For browser environments, you'll need to use a different approach since .env files aren't available. Consider using:

1. **Build-time configuration** with webpack DefinePlugin
2. **Runtime configuration** loaded from a config endpoint
3. **Environment-specific builds** with different configurations

```javascript
// Browser example with manual configuration
import { createVoiceActivationSystem } from './voiceActivation/index.js';

const config = {
  api: {
    key: 'your_api_key_here' // Load from secure source
  },
  system: {
    wakeWords: ['hey particles', 'hello system']
  }
};

const voiceSystem = await createVoiceActivationSystem(config.api.key, {
  system: config.system
});
```

## Security Notes

- **Never commit .env files to version control**
- **Use environment-specific .env files** (.env.production, .env.development)
- **Validate your .env file** before deployment
- **Use secure key management** for production environments
- **Rotate API keys regularly**

## Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY is required" error**
   - Make sure you've set the API key in your .env file
   - Check that the .env file is in the correct location
   - Verify dotenv is installed and configured

2. **Environment variables not loading**
   - Ensure dotenv is installed: `npm install dotenv`
   - Check file permissions on .env file
   - Verify .env file format (no spaces around =)

3. **Browser compatibility issues**
   - Use build-time configuration for browser environments
   - Consider using a configuration service

### Validation

The system automatically validates your environment configuration and provides helpful error messages:

```javascript
import { getEnvConfig } from './voiceActivation/envConfig.js';

try {
  const config = getEnvConfig();
  console.log('Configuration is valid!');
} catch (error) {
  console.error('Configuration error:', error.message);
}
```

## Next Steps

1. Set up your environment variables
2. Test the basic integration
3. Customize wake words for your application
4. Add custom command handlers
5. Configure security settings as needed
6. Set up monitoring and analytics