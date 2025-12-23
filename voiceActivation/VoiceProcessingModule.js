/**
 * Voice Processing Module
 * Handles audio input, noise reduction, and voice enhancement
 */

export class VoiceProcessingModule {
  constructor(config = {}) {
    this.config = {
      sampleRate: config.sampleRate || 16000,
      bufferSize: config.bufferSize || 4096,
      channels: config.channels || 1,
      echoCancellation: config.echoCancellation !== false,
      noiseSuppression: config.noiseSuppression !== false,
      autoGainControl: config.autoGainControl !== false,
      ...config
    };
    
    this.audioContext = null;
    this.mediaStream = null;
    this.sourceNode = null;
    this.processorNode = null;
    this.gainNode = null;
    this.isRecording = false;
    this.audioBuffer = [];
    this.recognitionActive = false;
    
    this.initializeAudioContext();
  }

  /**
   * Initialize Web Audio API context
   */
  async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: this.config.sampleRate
      });
      
      // Resume context if suspended (common in browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      console.log('Audio context initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw new Error('Web Audio API not supported');
    }
  }

  /**
   * Request microphone access and setup audio processing chain
   */
  async startRecording() {
    try {
      // Request microphone permission
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: this.config.echoCancellation,
          noiseSuppression: this.config.noiseSuppression,
          autoGainControl: this.config.autoGainControl,
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channels
        }
      });

      // Create audio processing chain
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.gainNode = this.audioContext.createGain();
      this.processorNode = this.audioContext.createScriptProcessor(
        this.config.bufferSize,
        this.config.channels,
        this.config.channels
      );

      // Connect audio nodes
      this.sourceNode.connect(this.gainNode);
      this.gainNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      // Setup audio processing
      this.processorNode.onaudioprocess = (event) => {
        this.processAudio(event);
      };

      this.isRecording = true;
      this.audioBuffer = [];
      
      console.log('Voice recording started');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('Microphone access denied or not available');
    }
  }

  /**
   * Process incoming audio data
   */
  processAudio(event) {
    if (!this.isRecording) return;

    const inputBuffer = event.inputBuffer;
    const outputBuffer = event.outputBuffer;
    
    // Process each channel
    for (let channel = 0; channel < inputBuffer.numberOfChannels; channel++) {
      const inputData = inputBuffer.getChannelData(channel);
      const outputData = outputBuffer.getChannelData(channel);
      
      // Apply noise reduction and enhancement
      const processedData = this.enhanceAudio(inputData);
      
      // Copy processed data to output
      for (let i = 0; i < inputData.length; i++) {
        outputData[i] = processedData[i];
      }
      
      // Store audio data for speech recognition
      this.audioBuffer.push(new Float32Array(processedData));
      
      // Limit buffer size to prevent memory issues
      if (this.audioBuffer.length > 100) {
        this.audioBuffer.shift();
      }
    }
  }

  /**
   * Apply noise reduction and voice enhancement algorithms
   */
  enhanceAudio(audioData) {
    // Create a copy to avoid modifying original
    const enhancedData = new Float32Array(audioData);
    
    // Apply high-pass filter to remove low-frequency noise
    enhancedData.forEach((sample, index) => {
      if (index > 0) {
        enhancedData[index] = sample - 0.95 * audioData[index - 1];
      }
    });
    
    // Apply noise gate
    const threshold = 0.01;
    const ratio = 0.1;
    
    for (let i = 0; i < enhancedData.length; i++) {
      const absSample = Math.abs(enhancedData[i]);
      if (absSample < threshold) {
        enhancedData[i] *= ratio;
      }
    }
    
    // Apply gentle compression for voice clarity
    const compressionRatio = 0.8;
    const knee = 0.3;
    
    for (let i = 0; i < enhancedData.length; i++) {
      const sample = enhancedData[i];
      const absSample = Math.abs(sample);
      
      if (absSample > knee) {
        const excess = absSample - knee;
        const compressedExcess = excess * compressionRatio;
        const compressedSample = (sample > 0 ? 1 : -1) * (knee + compressedExcess);
        enhancedData[i] = compressedSample;
      }
    }
    
    // Normalize to prevent clipping
    const maxValue = Math.max(...enhancedData.map(Math.abs));
    if (maxValue > 0.95) {
      const normalizationFactor = 0.95 / maxValue;
      for (let i = 0; i < enhancedData.length; i++) {
        enhancedData[i] *= normalizationFactor;
      }
    }
    
    return enhancedData;
  }

  /**
   * Get accumulated audio buffer as WAV format
   */
  getAudioBufferWAV() {
    if (this.audioBuffer.length === 0) return null;
    
    // Flatten audio buffer
    const totalLength = this.audioBuffer.reduce((sum, buffer) => sum + buffer.length, 0);
    const flatBuffer = new Float32Array(totalLength);
    
    let offset = 0;
    for (const buffer of this.audioBuffer) {
      flatBuffer.set(buffer, offset);
      offset += buffer.length;
    }
    
    return this.encodeWAV(flatBuffer);
  }

  /**
   * Encode audio data as WAV format
   */
  encodeWAV(samples) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, this.config.channels, true);
    view.setUint32(24, this.config.sampleRate, true);
    view.setUint32(28, this.config.sampleRate * this.config.channels * 2, true);
    view.setUint16(32, this.config.channels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return buffer;
  }

  /**
   * Stop recording and cleanup resources
   */
  async stopRecording() {
    this.isRecording = false;
    
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode = null;
    }
    
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    console.log('Voice recording stopped');
  }

  /**
   * Get current recording status
   */
  getStatus() {
    return {
      isRecording: this.isRecording,
      audioContextState: this.audioContext?.state,
      bufferLength: this.audioBuffer.length,
      sampleRate: this.config.sampleRate
    };
  }

  /**
   * Cleanup and destroy module
   */
  destroy() {
    this.stopRecording();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}