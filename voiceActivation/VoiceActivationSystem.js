/**
 * Voice Activation System
 * Main orchestrator for voice commands and responses
 */

import { VoiceProcessingModule } from './VoiceProcessingModule.js';
import { GeminiAPIIntegration } from './GeminiAPIIntegration.js';

export class VoiceActivationSystem {
  constructor(config = {}) {
    this.config = {
      autoStart: config.autoStart !== false,
      wakeWords: config.wakeWords || ['hey system', 'hello system', 'system'],
      responseTimeout: config.responseTimeout || 5000,
      maxCommandLength: config.maxCommandLength || 30,
      enableVoiceFeedback: config.enableVoiceFeedback !== false,
      enableGestureIntegration: config.enableGestureIntegration !== false,
      ...config
    };
    
    this.voiceProcessor = new VoiceProcessingModule(config.voiceProcessing);
    this.geminiAPI = new GeminiAPIIntegration(config.geminiAPI);
    
    this.isActive = false;
    this.isListening = false;
    this.currentCommand = '';
    this.commandStartTime = null;
    this.responseQueue = [];
    this.commandHistory = [];
    this.wakeWordDetected = false;
    this.commandTimeout = null;
    
    // Performance metrics
    this.metrics = {
      totalCommands: 0,
      successfulCommands: 0,
      failedCommands: 0,
      averageResponseTime: 0,
      lastResponseTime: 0
    };
    
    // Command handlers
    this.commandHandlers = new Map();
    this.initializeCommandHandlers();
    
    if (this.config.autoStart) {
      this.initialize();
    }
  }

  /**
   * Initialize the voice activation system
   */
  async initialize() {
    try {
      console.log('Initializing Voice Activation System...');
      
      // Initialize voice processing
      await this.voiceProcessor.initializeAudioContext();
      
      // Initialize API integration
      await this.geminiAPI.initializeAPI();
      
      this.isActive = true;
      console.log('Voice Activation System initialized successfully');
      
      // Start wake word detection
      this.startWakeWordDetection();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Voice Activation System:', error);
      throw error;
    }
  }

  /**
   * Initialize default command handlers
   */
  initializeCommandHandlers() {
    // System control commands
    this.registerCommandHandler('system', this.handleSystemCommand.bind(this));
    this.registerCommandHandler('help', this.handleHelpCommand.bind(this));
    this.registerCommandHandler('stop', this.handleStopCommand.bind(this));
    this.registerCommandHandler('pause', this.handlePauseCommand.bind(this));
    
    // Application-specific commands
    this.registerCommandHandler('shape', this.handleShapeCommand.bind(this));
    this.registerCommandHandler('color', this.handleColorCommand.bind(this));
    this.registerCommandHandler('theme', this.handleThemeCommand.bind(this));
    this.registerCommandHandler('particle', this.handleParticleCommand.bind(this));
    this.registerCommandHandler('background', this.handleBackgroundCommand.bind(this));
    
    // Navigation commands
    this.registerCommandHandler('switch', this.handleSwitchCommand.bind(this));
    this.registerCommandHandler('change', this.handleChangeCommand.bind(this));
    this.registerCommandHandler('show', this.handleShowCommand.bind(this));
    this.registerCommandHandler('hide', this.handleHideCommand.bind(this));
  }

  /**
   * Register a command handler
   */
  registerCommandHandler(intent, handler) {
    this.commandHandlers.set(intent.toLowerCase(), handler);
  }

  /**
   * Start wake word detection
   */
  async startWakeWordDetection() {
    if (!this.isActive) return;
    
    try {
      await this.voiceProcessor.startRecording();
      this.isListening = true;
      
      console.log('Wake word detection started');
      
      // Process audio stream for wake words
      this.processWakeWordStream();
      
    } catch (error) {
      console.error('Failed to start wake word detection:', error);
      this.handleError(error);
    }
  }

  /**
   * Process audio stream for wake words
   */
  async processWakeWordStream() {
    if (!this.isListening) return;
    
    try {
      // Get audio buffer every 2 seconds
      setInterval(async () => {
        if (!this.isListening) return;
        
        const audioData = this.voiceProcessor.getAudioBufferWAV();
        if (!audioData) return;
        
        try {
          // Convert speech to text
          const result = await this.geminiAPI.speechToText(audioData);
          
          if (result.text && result.text.length > 0) {
            await this.processWakeWord(result.text.toLowerCase());
          }
        } catch (error) {
          // Ignore errors during wake word detection
          // This is expected for non-speech audio
        }
      }, 2000);
      
    } catch (error) {
      console.error('Wake word processing error:', error);
    }
  }

  /**
   * Process potential wake word
   */
  async processWakeWord(text) {
    const containsWakeWord = this.config.wakeWords.some(wakeWord => 
      text.includes(wakeWord.toLowerCase())
    );
    
    if (containsWakeWord && !this.wakeWordDetected) {
      this.wakeWordDetected = true;
      console.log('Wake word detected!');
      
      // Provide audio feedback
      if (this.config.enableVoiceFeedback) {
        await this.provideAudioFeedback('System activated. How can I help you?');
      }
      
      // Start command listening
      this.startCommandListening();
    }
  }

  /**
   * Start listening for commands after wake word
   */
  async startCommandListening() {
    this.commandStartTime = Date.now();
    this.currentCommand = '';
    
    // Set command timeout
    this.commandTimeout = setTimeout(() => {
      if (this.wakeWordDetected && this.currentCommand === '') {
        this.handleCommandTimeout();
      }
    }, this.config.responseTimeout);
    
    // Process command audio
    this.processCommandAudio();
  }

  /**
   * Process command audio
   */
  async processCommandAudio() {
    const commandInterval = setInterval(async () => {
      if (!this.wakeWordDetected) {
        clearInterval(commandInterval);
        return;
      }
      
      const audioData = this.voiceProcessor.getAudioBufferWAV();
      if (!audioData) return;
      
      try {
        const result = await this.geminiAPI.speechToText(audioData);
        
        if (result.text && result.text.length > 0) {
          this.currentCommand += ' ' + result.text;
          
          // Check if command is complete (pause in speech)
          if (await this.isCommandComplete(this.currentCommand)) {
            clearInterval(commandInterval);
            await this.processCommand(this.currentCommand.trim());
          }
        }
      } catch (error) {
        // Continue listening on STT errors
      }
    }, 1000);
  }

  /**
   * Check if command is complete
   */
  async isCommandComplete(commandText) {
    // Simple heuristic: if no new audio for 2 seconds, consider complete
    // This could be enhanced with more sophisticated speech detection
    return commandText.length > 5 && commandText.split(' ').length >= 2;
  }

  /**
   * Process the complete voice command
   */
  async processCommand(commandText) {
    const startTime = Date.now();
    
    try {
      // Clear command timeout
      if (this.commandTimeout) {
        clearTimeout(this.commandTimeout);
      }
      
      console.log('Processing command:', commandText);
      
      // Process natural language
      const nlpResult = await this.geminiAPI.processNaturalLanguage(commandText, this.getContext());
      
      // Execute command
      const executionResult = await this.executeCommand(nlpResult);
      
      // Provide feedback
      if (this.config.enableVoiceFeedback) {
        await this.provideAudioFeedback(executionResult.response || 'Command executed successfully.');
      }
      
      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(true, responseTime);
      
      // Store command history
      this.storeCommandHistory(commandText, nlpResult, executionResult, responseTime);
      
      // Reset for next command
      this.resetCommandState();
      
      return executionResult;
      
    } catch (error) {
      console.error('Command processing failed:', error);
      this.updateMetrics(false, Date.now() - startTime);
      this.handleError(error);
      this.resetCommandState();
      throw error;
    }
  }

  /**
   * Execute command based on NLP result
   */
  async executeCommand(nlpResult) {
    const { intent, entities, confidence, action, response } = nlpResult;
    
    // Check confidence threshold
    if (confidence < 0.6) {
      return {
        success: false,
        response: "I'm not sure what you meant. Could you please repeat that?",
        action: 'none'
      };
    }
    
    // Find appropriate handler
    const handler = this.commandHandlers.get(intent);
    
    if (handler) {
      try {
        return await handler(entities, action);
      } catch (error) {
        console.error(`Handler for intent '${intent}' failed:`, error);
        return {
          success: false,
          response: "I understood your command but couldn't execute it. Please try again.",
          action: 'none'
        };
      }
    } else {
      return {
        success: false,
        response: "I don't know how to handle that command yet.",
        action: 'none'
      };
    }
  }

  /**
   * Command handler implementations
   */
  
  async handleSystemCommand(entities, action) {
    const responses = {
      'status': 'System is running normally.',
      'help': 'I can help you control shapes, colors, themes, and background. Try saying "change shape to cube" or "switch to dark theme".',
      'restart': 'System restart initiated.',
      'shutdown': 'System shutdown not available in demo mode.'
    };
    
    const entity = entities[0] || 'help';
    return {
      success: true,
      response: responses[entity] || 'System command processed.',
      action: `system_${entity}`
    };
  }

  async handleHelpCommand(entities, action) {
    return {
      success: true,
      response: 'Available commands: change shape, switch color, adjust theme, modify background, show particles, hide elements.',
      action: 'help_display'
    };
  }

  async handleStopCommand(entities, action) {
    return {
      success: true,
      response: 'Stopping current operation.',
      action: 'stop_all'
    };
  }

  async handlePauseCommand(entities, action) {
    return {
      success: true,
      response: 'Pausing current operation.',
      action: 'pause_all'
    };
  }

  async handleShapeCommand(entities, action) {
    const validShapes = ['sphere', 'cube', 'torus', 'ring', 'spiral', 'heart', 'wave', 'star'];
    const shape = entities.find(e => validShapes.includes(e.toLowerCase()));
    
    if (shape) {
      return {
        success: true,
        response: `Changing shape to ${shape}.`,
        action: `shape_${shape}`
      };
    } else {
      return {
        success: false,
        response: `Available shapes: ${validShapes.join(', ')}.`,
        action: 'none'
      };
    }
  }

  async handleColorCommand(entities, action) {
    const validColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'white', 'black'];
    const color = entities.find(e => validColors.includes(e.toLowerCase()));
    
    if (color) {
      return {
        success: true,
        response: `Changing color to ${color}.`,
        action: `color_${color}`
      };
    } else {
      return {
        success: false,
        response: `Available colors: ${validColors.join(', ')}.`,
        action: 'none'
      };
    }
  }

  async handleThemeCommand(entities, action) {
    const validThemes = ['light', 'dark', 'colorful', 'monochrome', 'neon'];
    const theme = entities.find(e => validThemes.includes(e.toLowerCase()));
    
    if (theme) {
      return {
        success: true,
        response: `Switching to ${theme} theme.`,
        action: `theme_${theme}`
      };
    } else {
      return {
        success: false,
        response: `Available themes: ${validThemes.join(', ')}.`,
        action: 'none'
      };
    }
  }

  async handleParticleCommand(entities, action) {
    const number = entities.find(e => !isNaN(parseInt(e)));
    const count = number ? parseInt(number) : 2000;
    
    return {
      success: true,
      response: `Adjusting particles to ${count}.`,
      action: `particles_${count}`
    };
  }

  async handleBackgroundCommand(entities, action) {
    const validBackgrounds = ['gradient', 'solid', 'image', 'video', 'transparent'];
    const background = entities.find(e => validBackgrounds.includes(e.toLowerCase()));
    
    if (background) {
      return {
        success: true,
        response: `Changing background to ${background}.`,
        action: `background_${background}`
      };
    } else {
      return {
        success: false,
        response: `Available backgrounds: ${validBackgrounds.join(', ')}.`,
        action: 'none'
      };
    }
  }

  async handleSwitchCommand(entities, action) {
    const target = entities[0] || 'mode';
    return {
      success: true,
      response: `Switching ${target}.`,
      action: `switch_${target}`
    };
  }

  async handleChangeCommand(entities, action) {
    const target = entities[0] || 'setting';
    return {
      success: true,
      response: `Changing ${target}.`,
      action: `change_${target}`
    };
  }

  async handleShowCommand(entities, action) {
    const target = entities[0] || 'element';
    return {
      success: true,
      response: `Showing ${target}.`,
      action: `show_${target}`
    };
  }

  async handleHideCommand(entities, action) {
    const target = entities[0] || 'element';
    return {
      success: true,
      response: `Hiding ${target}.`,
      action: `hide_${target}`
    };
  }

  /**
   * Provide audio feedback
   */
  async provideAudioFeedback(text) {
    try {
      const ttsResult = await this.geminiAPI.textToSpeech(text);
      
      // Play the audio (implementation depends on your audio playback system)
      this.playAudio(ttsResult.audioData);
      
    } catch (error) {
      console.error('Audio feedback failed:', error);
    }
  }

  /**
   * Play audio data (placeholder implementation)
   */
  playAudio(audioData) {
    // This would need to be implemented based on your audio playback system
    console.log('Playing audio feedback...');
  }

  /**
   * Handle command timeout
   */
  handleCommandTimeout() {
    console.log('Command timeout');
    this.wakeWordDetected = false;
    
    if (this.config.enableVoiceFeedback) {
      this.provideAudioFeedback('I didn\'t hear a command. Please say the wake word again.');
    }
  }

  /**
   * Reset command state
   */
  resetCommandState() {
    this.wakeWordDetected = false;
    this.currentCommand = '';
    this.commandStartTime = null;
    
    if (this.commandTimeout) {
      clearTimeout(this.commandTimeout);
      this.commandTimeout = null;
    }
  }

  /**
   * Get current context for NLP processing
   */
  getContext() {
    return {
      currentShape: 'particles', // This would come from your main system
      currentTheme: 'dark',
      lastCommand: this.commandHistory[0] || null,
      systemState: 'active'
    };
  }

  /**
   * Update performance metrics
   */
  updateMetrics(success, responseTime) {
    this.metrics.totalCommands++;
    
    if (success) {
      this.metrics.successfulCommands++;
    } else {
      this.metrics.failedCommands++;
    }
    
    this.metrics.lastResponseTime = responseTime;
    this.metrics.averageResponseTime = (
      (this.metrics.averageResponseTime * (this.metrics.totalCommands - 1) + responseTime) / 
      this.metrics.totalCommands
    );
  }

  /**
   * Store command history
   */
  storeCommandHistory(command, nlpResult, executionResult, responseTime) {
    const historyEntry = {
      timestamp: Date.now(),
      command: command,
      intent: nlpResult.intent,
      entities: nlpResult.entities,
      confidence: nlpResult.confidence,
      action: executionResult.action,
      response: executionResult.response,
      responseTime: responseTime,
      success: executionResult.success
    };
    
    this.commandHistory.unshift(historyEntry);
    
    // Keep only last 100 commands
    if (this.commandHistory.length > 100) {
      this.commandHistory = this.commandHistory.slice(0, 100);
    }
  }

  /**
   * Handle errors
   */
  handleError(error) {
    console.error('Voice Activation System error:', error);
    
    if (this.config.enableVoiceFeedback) {
      this.provideAudioFeedback('Sorry, I encountered an error. Please try again.');
    }
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      isListening: this.isListening,
      wakeWordDetected: this.wakeWordDetected,
      currentCommand: this.currentCommand,
      metrics: { ...this.metrics },
      voiceProcessor: this.voiceProcessor.getStatus(),
      apiStats: this.geminiAPI.getStats()
    };
  }

  /**
   * Get command history
   */
  getCommandHistory(limit = 10) {
    return this.commandHistory.slice(0, limit);
  }

  /**
   * Stop the voice activation system
   */
  async stop() {
    this.isActive = false;
    this.isListening = false;
    
    await this.voiceProcessor.stopRecording();
    
    console.log('Voice Activation System stopped');
  }

  /**
   * Restart the voice activation system
   */
  async restart() {
    await this.stop();
    await this.initialize();
  }

  /**
   * Cleanup and destroy
   */
  async destroy() {
    await this.stop();
    this.voiceProcessor.destroy();
    this.geminiAPI.destroy();
    
    this.commandHandlers.clear();
    this.commandHistory = [];
    this.responseQueue = [];
    
    console.log('Voice Activation System destroyed');
  }
}