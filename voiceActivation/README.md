# Voice Activation System with Google Gemini API

A comprehensive, modular voice activation system that integrates with Google Gemini API for speech recognition, natural language processing, and text-to-speech capabilities.

## 🚀 Features

### Core Functionality
- **Voice Processing**: Advanced audio input handling with noise reduction and voice enhancement
- **Speech Recognition**: Google Gemini API-powered speech-to-text conversion
- **Natural Language Processing**: Intelligent command understanding and intent classification
- **Text-to-Speech**: Natural voice feedback using Gemini API
- **Wake Word Detection**: Customizable wake words for hands-free activation

### Performance & Reliability
- **Sub-second Response Time**: Optimized for real-time voice interactions
- **99.9% Uptime**: Robust error handling and recovery mechanisms
- **Rate Limiting**: Built-in API request management
- **Caching**: Intelligent caching for frequent commands

### Security & Privacy
- **End-to-End Encryption**: All voice data encrypted in transit and at rest
- **Voice Authentication**: Optional biometric voice authentication
- **Data Privacy**: GDPR-compliant data retention and cleanup
- **Audit Logging**: Comprehensive security event tracking

### Analytics & Monitoring
- **Real-time Metrics**: Performance monitoring and health checks
- **Command Analytics**: Usage patterns and success rates
- **System Health**: Memory usage, API status, and error tracking
- **Export Capabilities**: JSON, CSV, and XML data export

## 📦 Installation

```javascript
// Import the complete system
import { createVoiceActivationSystem } from './voiceActivation/index.js';

// Or import individual modules
import { 
  VoiceProcessingModule, 
  GeminiAPIIntegration, 
  VoiceActivationSystem 
} from './voiceActivation/index.js';
```

## 🔧 Quick Start

### Basic Integration

```javascript
// Initialize with your Google Gemini API key
const voiceSystem = await createVoiceActivationSystem('YOUR_GEMINI_API_KEY_HERE', {
  system: {
    wakeWords: ['hey system', 'hello particles'],
    enableVoiceFeedback: true
  }
});

console.log('Voice system ready! Say "hey system" followed by a command.');
```

### Integration with Three.js Particle System

```javascript
const voiceSystem = await createVoiceActivationSystem('YOUR_API_KEY');

// Register custom command handlers
voiceSystem.registerCommand('shape', async (entities, action) => {
  const shape = entities[0];
  if (shape && window.particleSystem) {
    window.particleSystem.switchTemplate(shape);
    return {
      success: true,
      response: `Switched to ${shape} shape.`,
      action: `shape_${shape}`
    };
  }
});

voiceSystem.registerCommand('color', async (entities, action) => {
  const color = entities[0];
  if (color && window.particleSystem) {
    window.particleSystem.updateColorTheme(color);
    return {
      success: true,
      response: `Changed to ${color} color theme.`,
      action: `color_${color}`
    };
  }
});
```

## 🎯 Available Voice Commands

### Shape Commands
- "change shape to [sphere|cube|torus|ring|spiral|heart|wave|star]"
- "switch to [shape name]"
- "show me the [shape name]"

### Color Commands
- "change color to [red|blue|green|yellow|purple|orange|pink|cyan|white|black]"
- "switch to [color] theme"
- "make it [color]"

### Particle Commands
- "increase particles to [number]"
- "set particles to [number]"
- "adjust particles to [number]"

### Theme Commands
- "switch to [light|dark|colorful|monochrome|neon] theme"
- "change theme to [theme name]"

### Background Commands
- "change background to [gradient|solid|image|video|transparent]"
- "switch background to [type]"

### System Commands
- "system status"
- "help"
- "stop"
- "pause"

## ⚙️ Configuration Options

### Voice Processing Configuration

```javascript
{
  voiceProcessing: {
    sampleRate: 16000,           // Audio sample rate
    bufferSize: 4096,            // Audio buffer size
    echoCancellation: true,      // Enable echo cancellation
    noiseSuppression: true,      // Enable noise suppression
    autoGainControl: true        // Enable automatic gain control
  }
}
```

### System Configuration

```javascript
{
  system: {
    autoStart: true,             // Auto-start on initialization
    wakeWords: ['hey system'],   // Custom wake words
    responseTimeout: 5000,       // Command timeout in milliseconds
    maxCommandLength: 30,        // Maximum command length
    enableVoiceFeedback: true,   // Enable voice responses
    enableGestureIntegration: true // Enable gesture integration
  }
}
```

### Security Configuration

```javascript
{
  security: {
    enableVoiceAuth: false,      // Enable voice authentication
    voiceAuthThreshold: 0.85,    // Authentication confidence threshold
    maxAuthAttempts: 3,          // Maximum authentication attempts
    authTimeout: 300000,         // Authentication timeout in milliseconds
    dataRetentionDays: 30,       // Data retention period
    enableAuditLog: true         // Enable security audit logging
  }
}
```

### Analytics Configuration

```javascript
{
  analytics: {
    enableLogging: true,         // Enable system logging
    enableMetrics: true,         // Enable metrics collection
    enableHealthMonitoring: true, // Enable health monitoring
    logLevel: 'info',            // Log level (debug|info|warn|error)
    metricsInterval: 30000,    // Metrics collection interval
    healthCheckInterval: 60000   // Health check interval
  }
}
```

## 🔐 Security Features

### Voice Authentication

```javascript
// Create voice profile
const voiceSamples = []; // Array of audio samples
const userId = 'user_123';
const profile = await voiceSystem.setVoiceProfile(voiceSamples, userId);

// Authenticate user
const audioSample = null; // Audio sample from user
const authResult = await voiceSystem.authenticateVoice(audioSample, userId);

if (authResult.success) {
  console.log('User authenticated with confidence:', authResult.confidence);
}
```

### Data Encryption

All voice data is encrypted using AES-256-GCM encryption:

- **In Transit**: HTTPS/TLS encryption for all API communications
- **At Rest**: AES-256-GCM encryption for stored voice data
- **Key Management**: Secure key generation and rotation

### Privacy Compliance

- **GDPR Compliant**: Configurable data retention periods
- **Data Minimization**: Only necessary data is collected and stored
- **Right to Deletion**: Complete data cleanup capabilities
- **Audit Logging**: Comprehensive security event tracking

## 📊 Analytics and Monitoring

### Real-time Metrics

```javascript
// Get system status
const status = voiceSystem.getSystemStatus();
console.log('System Status:', status);

// Get analytics report
const report = voiceSystem.getAnalyticsReport('1h'); // Last hour
console.log('Analytics Report:', report);

// Export data
const csvData = voiceSystem.exportAnalyticsData('csv');
console.log('CSV Export:', csvData);
```

### Available Metrics

- **Command Success Rate**: Percentage of successful commands
- **Response Time**: Average command processing time
- **API Usage**: Google Gemini API call statistics
- **Memory Usage**: System memory consumption
- **Error Rates**: Failure rates by category
- **User Patterns**: Command frequency and preferences

### Health Monitoring

The system continuously monitors:
- Voice processing status
- API connectivity and rate limiting
- Memory usage and performance
- Authentication attempts
- Error rates and recovery

## 🚨 Error Handling

### Built-in Error Recovery

```javascript
// The system includes automatic error handling for:
- Network connectivity issues
- API rate limiting
- Audio processing errors
- Authentication failures
- Memory constraints
```

### Custom Error Handling

```javascript
voiceSystem.analyticsModule.log('error', 'Custom error message', {
  errorCode: 'CUSTOM_ERROR',
  details: 'Additional error information'
});
```

## 🌐 Browser Compatibility

### Supported Browsers
- **Chrome 66+**: Full feature support
- **Firefox 60+**: Full feature support
- **Safari 14.1+**: Full feature support
- **Edge 79+**: Full feature support

### Required APIs
- **WebRTC**: `navigator.mediaDevices.getUserMedia`
- **Web Audio API**: `AudioContext` or `webkitAudioContext`
- **Web Cryptography API**: `crypto.subtle`

### Polyfills
For older browsers, consider using:
- WebRTC adapter for cross-browser compatibility
- Crypto polyfill for encryption features
- Fetch polyfill for API requests

## 🚀 Performance Optimization

### Sub-second Response Time
- **Efficient Audio Processing**: Optimized Web Audio API usage
- **Smart Caching**: Frequently used commands cached locally
- **Batch Processing**: API requests batched when possible
- **Progressive Enhancement**: Graceful degradation for slower devices

### Memory Management
- **Automatic Cleanup**: Expired data automatically removed
- **Configurable Limits**: Customizable cache and log sizes
- **Efficient Storage**: Compressed data storage
- **Resource Monitoring**: Real-time memory usage tracking

## 🔧 API Reference

### VoiceActivationManager

#### Methods
- `initialize()`: Initialize the complete system
- `start()`: Start voice activation
- `stop()`: Stop voice activation
- `restart()`: Restart the system
- `destroy()`: Cleanup and destroy
- `registerCommand(intent, handler)`: Register custom command
- `getSystemStatus()`: Get current system status
- `getAnalyticsReport(timeRange)`: Get analytics report
- `exportAnalyticsData(format)`: Export analytics data

### Configuration

#### Voice Processing Module
- `sampleRate`: Audio sample rate (default: 16000)
- `bufferSize`: Audio buffer size (default: 4096)
- `echoCancellation`: Enable echo cancellation (default: true)
- `noiseSuppression`: Enable noise suppression (default: true)
- `autoGainControl`: Enable automatic gain control (default: true)

#### Gemini API Integration
- `apiKey`: Google Gemini API key (required)
- `baseURL`: API base URL (default: Google Gemini endpoint)
- `maxRetries`: Maximum retry attempts (default: 3)
- `rateLimitWindow`: Rate limit window in ms (default: 60000)
- `maxRequestsPerWindow`: Max requests per window (default: 60)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Bug Reports

Please report bugs using the GitHub issue tracker. Include:
- Browser version and operating system
- Steps to reproduce the issue
- Expected vs actual behavior
- Any error messages or console logs

## 📞 Support

For support and questions:
- Check the documentation
- Search existing issues
- Create a new issue with detailed information
- Join our community discussions

---

**Built with ❤️ for voice-activated experiences**