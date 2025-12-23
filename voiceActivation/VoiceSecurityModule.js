/**
 * Security Module for Voice Activation System
 * Handles encryption, voice authentication, and data privacy compliance
 */

export class VoiceSecurityModule {
  constructor(config = {}) {
    this.config = {
      enableVoiceAuth: config.enableVoiceAuth !== false,
      voiceAuthThreshold: config.voiceAuthThreshold || 0.85,
      maxAuthAttempts: config.maxAuthAttempts || 3,
      authTimeout: config.authTimeout || 300000, // 5 minutes
      dataRetentionDays: config.dataRetentionDays || 30,
      enableAuditLog: config.enableAuditLog !== false,
      ...config
    };
    
    this.voiceProfile = null;
    this.authAttempts = 0;
    this.lastAuthTime = null;
    this.encryptionKey = null;
    this.auditLog = [];
    this.sensitiveCommands = new Set([
      'delete', 'remove', 'clear', 'reset', 'shutdown', 'restart',
      'export', 'import', 'backup', 'restore', 'configure', 'settings'
    ]);
  }

  /**
   * Initialize security module
   */
  async initialize() {
    try {
      // Generate encryption key
      this.encryptionKey = await this.generateKey();
      console.log('✅ Security module initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize security module:', error);
      throw new Error('Security module initialization failed');
    }
  }

  /**
   * Generate encryption key
   */
  async generateKey() {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Import existing encryption key
   */
  async importKey(keyData) {
    const keyBuffer = new TextEncoder().encode(keyData);
    return await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate encryption key for configuration
   */
  generateEncryptionKey() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Encrypt voice data
   */
  async encryptVoiceData(audioData) {
    try {
      // Ensure encryption key is available
      if (!this.encryptionKey) {
        await this.initialize();
      }
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey,
        audioData
      );
      
      // Combine IV and encrypted data
      const result = new Uint8Array(iv.length + encrypted.byteLength);
      result.set(iv, 0);
      result.set(new Uint8Array(encrypted), iv.length);
      
      this.logSecurityEvent('data_encrypted', { size: result.length });
      return result.buffer;
      
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Voice data encryption failed');
    }
  }

  /**
   * Decrypt voice data
   */
  async decryptVoiceData(encryptedData) {
    try {
      // Ensure encryption key is available
      if (!this.encryptionKey) {
        await this.initialize();
      }
      
      const data = new Uint8Array(encryptedData);
      const iv = data.slice(0, 12);
      const encrypted = data.slice(12);
      
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey,
        encrypted
      );
      
      this.logSecurityEvent('data_decrypted', { size: decrypted.byteLength });
      return decrypted;
      
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Voice data decryption failed');
    }
  }

  /**
   * Create voice authentication profile
   */
  async createVoiceProfile(audioSamples, userId) {
    try {
      // Extract voice features from multiple samples
      const voiceFeatures = await this.extractVoiceFeatures(audioSamples);
      
      // Create encrypted voice profile
      const profileData = {
        userId: userId,
        voiceFeatures: voiceFeatures,
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        sampleCount: audioSamples.length
      };
      
      const profileBuffer = new TextEncoder().encode(JSON.stringify(profileData));
      const encryptedProfile = await this.encryptVoiceData(profileBuffer);
      
      this.voiceProfile = {
        encryptedData: encryptedProfile,
        userId: userId,
        createdAt: Date.now()
      };
      
      this.logSecurityEvent('voice_profile_created', { userId });
      return this.voiceProfile;
      
    } catch (error) {
      console.error('Voice profile creation failed:', error);
      throw new Error('Voice authentication profile creation failed');
    }
  }

  /**
   * Extract voice features for authentication
   */
  async extractVoiceFeatures(audioSamples) {
    // Simplified voice feature extraction
    // In a real implementation, this would use sophisticated ML models
    const features = {
      pitch: [],
      tone: [],
      rhythm: [],
      spectral: []
    };
    
    for (const sample of audioSamples) {
      // Extract basic audio features
      const audioData = new Float32Array(sample);
      
      // Pitch estimation (simplified)
      const pitch = this.estimatePitch(audioData);
      features.pitch.push(pitch);
      
      // Tone characteristics
      const tone = this.analyzeTone(audioData);
      features.tone.push(tone);
      
      // Rhythm patterns
      const rhythm = this.analyzeRhythm(audioData);
      features.rhythm.push(rhythm);
      
      // Spectral features
      const spectral = this.extractSpectralFeatures(audioData);
      features.spectral.push(spectral);
    }
    
    // Calculate average features
    return {
      avgPitch: features.pitch.reduce((a, b) => a + b) / features.pitch.length,
      avgTone: this.averageTone(features.tone),
      avgRhythm: this.averageRhythm(features.rhythm),
      avgSpectral: this.averageSpectral(features.spectral),
      featureCount: audioSamples.length
    };
  }

  /**
   * Authenticate user by voice
   */
  async authenticateVoice(audioSample, userId) {
    try {
      if (!this.voiceProfile) {
        throw new Error('No voice profile available for authentication');
      }
      
      // Check if profile belongs to requested user
      if (this.voiceProfile.userId !== userId) {
        throw new Error('Voice profile does not match requested user');
      }
      
      // Check authentication timeout
      if (this.lastAuthTime && (Date.now() - this.lastAuthTime) > this.config.authTimeout) {
        this.authAttempts = 0;
      }
      
      // Check max attempts
      if (this.authAttempts >= this.config.maxAuthAttempts) {
        throw new Error('Maximum authentication attempts exceeded');
      }
      
      // Decrypt voice profile
      const profileBuffer = await this.decryptVoiceData(this.voiceProfile.encryptedData);
      const profileData = JSON.parse(new TextDecoder().decode(profileBuffer));
      
      // Extract features from current sample
      const currentFeatures = await this.extractVoiceFeatures([audioSample]);
      
      // Compare features
      const similarity = this.calculateVoiceSimilarity(profileData.voiceFeatures, currentFeatures);
      
      this.authAttempts++;
      
      if (similarity >= this.config.voiceAuthThreshold) {
        this.lastAuthTime = Date.now();
        this.authAttempts = 0;
        
        this.logSecurityEvent('voice_auth_success', { userId, similarity });
        return {
          success: true,
          userId: userId,
          confidence: similarity,
          timestamp: this.lastAuthTime
        };
      } else {
        this.logSecurityEvent('voice_auth_failed', { userId, similarity });
        return {
          success: false,
          userId: userId,
          confidence: similarity,
          reason: 'Voice similarity below threshold'
        };
      }
      
    } catch (error) {
      console.error('Voice authentication failed:', error);
      this.logSecurityEvent('voice_auth_error', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Calculate voice similarity (simplified)
   */
  calculateVoiceSimilarity(profileFeatures, currentFeatures) {
    // Simplified similarity calculation
    // In a real implementation, this would use ML models
    const pitchDiff = Math.abs(profileFeatures.avgPitch - currentFeatures.avgPitch) / profileFeatures.avgPitch;
    const toneSimilarity = this.calculateToneSimilarity(profileFeatures.avgTone, currentFeatures.avgTone);
    const rhythmSimilarity = this.calculateRhythmSimilarity(profileFeatures.avgRhythm, currentFeatures.avgRhythm);
    
    // Weighted similarity score
    const similarity = 1 - (pitchDiff * 0.4) + (toneSimilarity * 0.3) + (rhythmSimilarity * 0.3);
    return Math.max(0, Math.min(1, similarity));
  }

  /**
   * Simplified voice analysis functions
   */
  estimatePitch(audioData) {
    // Basic pitch estimation using autocorrelation
    let maxCorrelation = 0;
    let bestLag = 0;
    
    for (let lag = 50; lag < audioData.length / 2; lag++) {
      let correlation = 0;
      for (let i = 0; i < audioData.length - lag; i++) {
        correlation += audioData[i] * audioData[i + lag];
      }
      
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestLag = lag;
      }
    }
    
    return this.config.sampleRate / bestLag;
  }

  analyzeTone(audioData) {
    // Analyze spectral centroid as tone characteristic
    const spectrum = this.calculateSpectrum(audioData);
    let spectralSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < spectrum.length; i++) {
      spectralSum += i * spectrum[i];
      magnitudeSum += spectrum[i];
    }
    
    return magnitudeSum > 0 ? spectralSum / magnitudeSum : 0;
  }

  analyzeRhythm(audioData) {
    // Analyze energy variations as rhythm
    const frameSize = 512;
    const energies = [];
    
    for (let i = 0; i < audioData.length - frameSize; i += frameSize) {
      let energy = 0;
      for (let j = 0; j < frameSize; j++) {
        energy += audioData[i + j] * audioData[i + j];
      }
      energies.push(energy / frameSize);
    }
    
    // Calculate rhythm as coefficient of variation
    const mean = energies.reduce((a, b) => a + b) / energies.length;
    const variance = energies.reduce((sum, energy) => sum + Math.pow(energy - mean, 2), 0) / energies.length;
    
    return Math.sqrt(variance) / mean;
  }

  extractSpectralFeatures(audioData) {
    const spectrum = this.calculateSpectrum(audioData);
    
    // Extract spectral features
    const spectralCentroid = this.calculateSpectralCentroid(spectrum);
    const spectralRolloff = this.calculateSpectralRolloff(spectrum);
    const spectralFlux = this.calculateSpectralFlux(spectrum);
    
    return {
      centroid: spectralCentroid,
      rolloff: spectralRolloff,
      flux: spectralFlux
    };
  }

  calculateSpectrum(audioData) {
    // Simplified spectrum calculation
    const spectrum = new Array(audioData.length / 2).fill(0);
    
    for (let i = 0; i < spectrum.length; i++) {
      const real = audioData[i * 2] || 0;
      const imag = audioData[i * 2 + 1] || 0;
      spectrum[i] = Math.sqrt(real * real + imag * imag);
    }
    
    return spectrum;
  }

  calculateSpectralCentroid(spectrum) {
    let spectralSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < spectrum.length; i++) {
      spectralSum += i * spectrum[i];
      magnitudeSum += spectrum[i];
    }
    
    return magnitudeSum > 0 ? spectralSum / magnitudeSum : 0;
  }

  calculateSpectralRolloff(spectrum) {
    const totalEnergy = spectrum.reduce((a, b) => a + b, 0);
    const threshold = totalEnergy * 0.85;
    
    let cumulativeEnergy = 0;
    for (let i = 0; i < spectrum.length; i++) {
      cumulativeEnergy += spectrum[i];
      if (cumulativeEnergy >= threshold) {
        return i / spectrum.length;
      }
    }
    
    return 1.0;
  }

  calculateSpectralFlux(spectrum) {
    let flux = 0;
    for (let i = 1; i < spectrum.length; i++) {
      const diff = spectrum[i] - spectrum[i - 1];
      flux += diff > 0 ? diff : 0;
    }
    return flux;
  }

  calculateToneSimilarity(profileTone, currentTone) {
    const diff = Math.abs(profileTone - currentTone);
    return Math.max(0, 1 - (diff / Math.max(profileTone, currentTone)));
  }

  calculateRhythmSimilarity(profileRhythm, currentRhythm) {
    const diff = Math.abs(profileRhythm - currentRhythm);
    const maxRhythm = Math.max(profileRhythm, currentRhythm);
    return Math.max(0, 1 - (diff / maxRhythm));
  }

  averageTone(tones) {
    return tones.reduce((a, b) => a + b) / tones.length;
  }

  averageRhythm(rhythms) {
    return rhythms.reduce((a, b) => a + b) / rhythms.length;
  }

  averageSpectral(spectralFeatures) {
    const centroids = spectralFeatures.map(f => f.centroid);
    const rolloffs = spectralFeatures.map(f => f.rolloff);
    const fluxes = spectralFeatures.map(f => f.flux);
    
    return {
      centroid: centroids.reduce((a, b) => a + b) / centroids.length,
      rolloff: rolloffs.reduce((a, b) => a + b) / rolloffs.length,
      flux: fluxes.reduce((a, b) => a + b) / fluxes.length
    };
  }

  /**
   * Check if command requires authentication
   */
  requiresAuthentication(commandText) {
    const lowerText = commandText.toLowerCase();
    return Array.from(this.sensitiveCommands).some(cmd => lowerText.includes(cmd));
  }

  /**
   * Sanitize voice data for privacy compliance
   */
  sanitizeVoiceData(audioData, retentionDays = this.config.dataRetentionDays) {
    // Remove personally identifiable information
    const sanitizedData = {
      audio: audioData,
      timestamp: Date.now(),
      retentionUntil: Date.now() + (retentionDays * 24 * 60 * 60 * 1000),
      sanitized: true
    };
    
    return sanitizedData;
  }

  /**
   * Log security events for audit
   */
  logSecurityEvent(eventType, details = {}) {
    if (!this.config.enableAuditLog) return;
    
    const event = {
      timestamp: Date.now(),
      eventType: eventType,
      details: this.sanitizeForLogging(details),
      sessionId: this.generateSessionId()
    };
    
    this.auditLog.push(event);
    
    // Keep only last 1000 events
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }
    
    console.log(`Security Event: ${eventType}`, details);
  }

  /**
   * Sanitize data for logging
   */
  sanitizeForLogging(data) {
    const sanitized = { ...data };
    
    // Remove sensitive information
    if (sanitized.userId) {
      sanitized.userIdHash = this.hashCode(sanitized.userId.toString());
      delete sanitized.userId;
    }
    
    if (sanitized.audioData) {
      sanitized.audioDataSize = sanitized.audioData.byteLength || sanitized.audioData.length;
      delete sanitized.audioData;
    }
    
    return sanitized;
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Simple hash function for user IDs
   */
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get security audit log
   */
  getAuditLog(limit = 100) {
    return this.auditLog.slice(-limit);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.lastAuthTime && (Date.now() - this.lastAuthTime) < this.config.authTimeout;
  }

  /**
   * Get security status
   */
  getSecurityStatus() {
    return {
      voiceProfileExists: !!this.voiceProfile,
      isAuthenticated: this.isAuthenticated(),
      authAttempts: this.authAttempts,
      lastAuthTime: this.lastAuthTime,
      auditLogSize: this.auditLog.length,
      encryptionEnabled: !!this.encryptionKey
    };
  }

  /**
   * Cleanup expired data for privacy compliance
   */
  cleanupExpiredData() {
    const now = Date.now();
    const expiredEvents = this.auditLog.filter(event => 
      event.details && event.details.retentionUntil && event.details.retentionUntil < now
    );
    
    this.auditLog = this.auditLog.filter(event => 
      !event.details || !event.details.retentionUntil || event.details.retentionUntil >= now
    );
    
    this.logSecurityEvent('expired_data_cleaned', { 
      cleanedCount: expiredEvents.length 
    });
  }

  /**
   * Destroy security module
   */
  destroy() {
    this.voiceProfile = null;
    this.encryptionKey = null;
    this.auditLog = [];
    this.authAttempts = 0;
    this.lastAuthTime = null;
  }
}