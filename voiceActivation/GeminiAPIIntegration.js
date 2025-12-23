/**
 * Google Gemini API Integration Module
 * Handles authentication, rate limiting, and API communication
 */

export class GeminiAPIIntegration {
  constructor(config = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.GOOGLE_GEMINI_API_KEY,
      baseURL: config.baseURL || 'https://generativelanguage.googleapis.com/v1beta',
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      rateLimitWindow: config.rateLimitWindow || 60000, // 1 minute
      maxRequestsPerWindow: config.maxRequestsPerWindow || 60,
      timeout: config.timeout || 30000,
      ...config
    };
    
    this.requestQueue = [];
    this.requestCount = 0;
    this.windowStart = Date.now();
    this.cache = new Map();
    this.isRateLimited = false;
    this.retryQueue = [];
    
    this.initializeAPI();
  }

  /**
   * Initialize API connection and validate credentials
   */
  async initializeAPI() {
    if (!this.config.apiKey) {
      throw new Error('Google Gemini API key is required');
    }
    
    try {
      // Test API connectivity
      const testResponse = await this.makeRequest('/models', 'GET');
      console.log('Gemini API connection established successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Gemini API:', error);
      throw new Error('Gemini API initialization failed');
    }
  }

  /**
   * Make authenticated API request with retry logic
   */
  async makeRequest(endpoint, method = 'POST', data = null, headers = {}) {
    // Check rate limiting
    await this.checkRateLimit();
    
    const url = `${this.config.baseURL}${endpoint}`;
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'User-Agent': 'VoiceActivationSystem/1.0',
      ...headers
    };
    
    const requestOptions = {
      method,
      headers: requestHeaders,
      timeout: this.config.timeout
    };
    
    if (data && method !== 'GET') {
      requestOptions.body = JSON.stringify(data);
    }
    
    let retries = 0;
    
    while (retries <= this.config.maxRetries) {
      try {
        const response = await this.fetchWithTimeout(url, requestOptions);
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        this.requestCount++;
        return await response.json();
        
      } catch (error) {
        retries++;
        
        if (retries > this.config.maxRetries) {
          throw new Error(`Max retries exceeded: ${error.message}`);
        }
        
        // Exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, retries - 1);
        await this.sleep(delay);
      }
    }
  }

  /**
   * Fetch with timeout support
   */
  fetchWithTimeout(url, options) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, options.timeout);
      
      fetch(url, options)
        .then(response => {
          clearTimeout(timeout);
          resolve(response);
        })
        .catch(error => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Check and enforce rate limiting
   */
  async checkRateLimit() {
    const now = Date.now();
    const windowElapsed = now - this.windowStart;
    
    // Reset window if elapsed
    if (windowElapsed >= this.config.rateLimitWindow) {
      this.requestCount = 0;
      this.windowStart = now;
      this.isRateLimited = false;
    }
    
    // Check if we're at the limit
    if (this.requestCount >= this.config.maxRequestsPerWindow) {
      const waitTime = this.config.rateLimitWindow - windowElapsed;
      this.isRateLimited = true;
      
      console.warn(`Rate limit reached. Waiting ${waitTime}ms...`);
      await this.sleep(waitTime);
      
      // Reset after waiting
      this.requestCount = 0;
      this.windowStart = Date.now();
      this.isRateLimited = false;
    }
  }

  /**
   * Convert speech audio to text using Gemini API
   */
  async speechToText(audioData, language = 'en-US') {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(audioData, 'stt', language);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }
      
      const endpoint = '/models/gemini-pro:generateContent';
      const requestData = {
        contents: [{
          parts: [{
            inlineData: {
              data: this.arrayBufferToBase64(audioData),
              mimeType: 'audio/wav'
            }
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048
        }
      };
      
      const response = await this.makeRequest(endpoint, 'POST', requestData);
      
      // Extract text from response
      const text = this.extractTextFromResponse(response);
      
      // Cache result
      this.cache.set(cacheKey, text);
      
      return {
        text: text,
        confidence: 0.95, // Gemini doesn't provide confidence scores
        language: language,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('Speech-to-text conversion failed:', error);
      throw new Error(`STT conversion failed: ${error.message}`);
    }
  }

  /**
   * Process natural language text using Gemini API
   */
  async processNaturalLanguage(text, context = '') {
    try {
      const endpoint = '/models/gemini-pro:generateContent';
      const requestData = {
        contents: [{
          parts: [{
            text: `Context: ${context}\nUser input: ${text}\n\nPlease analyze this voice command and provide:\n1. Intent classification\n2. Entity extraction\n3. Confidence score\n4. Suggested action\n\nResponse format:\nIntent: [primary_intent]\nEntities: [list_of_entities]\nConfidence: [0-1]\nAction: [suggested_action]\nResponse: [natural_language_response]`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 5,
          topP: 0.8,
          maxOutputTokens: 512
        }
      };
      
      const response = await this.makeRequest(endpoint, 'POST', requestData);
      const processedText = this.extractTextFromResponse(response);
      
      return this.parseNLPResponse(processedText);
      
    } catch (error) {
      console.error('Natural language processing failed:', error);
      throw new Error(`NLP processing failed: ${error.message}`);
    }
  }

  /**
   * Convert text to speech using Gemini API
   */
  async textToSpeech(text, voice = 'en-US-Neural2-A', speed = 1.0) {
    try {
      const endpoint = '/models/gemini-pro:generateContent';
      const requestData = {
        contents: [{
          parts: [{
            text: `Convert this text to speech with voice ${voice} and speed ${speed}: ${text}`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1
        }
      };
      
      const response = await this.makeRequest(endpoint, 'POST', requestData);
      
      // Extract audio data from response
      const audioData = this.extractAudioFromResponse(response);
      
      return {
        audioData: audioData,
        text: text,
        voice: voice,
        speed: speed,
        duration: this.estimateSpeechDuration(text, speed)
      };
      
    } catch (error) {
      console.error('Text-to-speech conversion failed:', error);
      throw new Error(`TTS conversion failed: ${error.message}`);
    }
  }

  /**
   * Parse NLP response from Gemini API
   */
  parseNLPResponse(responseText) {
    const lines = responseText.split('\n');
    const result = {
      intent: 'unknown',
      entities: [],
      confidence: 0.5,
      action: 'none',
      response: 'I didn\'t understand that command.'
    };
    
    lines.forEach(line => {
      if (line.startsWith('Intent:')) {
        result.intent = line.split(':')[1].trim().toLowerCase();
      } else if (line.startsWith('Entities:')) {
        const entitiesStr = line.split(':')[1].trim();
        result.entities = entitiesStr ? entitiesStr.split(',').map(e => e.trim()) : [];
      } else if (line.startsWith('Confidence:')) {
        result.confidence = parseFloat(line.split(':')[1].trim()) || 0.5;
      } else if (line.startsWith('Action:')) {
        result.action = line.split(':')[1].trim().toLowerCase();
      } else if (line.startsWith('Response:')) {
        result.response = line.split(':')[1].trim();
      }
    });
    
    return result;
  }

  /**
   * Extract text from Gemini API response
   */
  extractTextFromResponse(response) {
    try {
      if (response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
          return candidate.content.parts[0].text || '';
        }
      }
      return '';
    } catch (error) {
      console.error('Failed to extract text from response:', error);
      return '';
    }
  }

  /**
   * Extract audio from Gemini API response
   */
  extractAudioFromResponse(response) {
    // This would need to be implemented based on actual Gemini API response format
    // For now, return placeholder
    return null;
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Generate cache key
   */
  generateCacheKey(data, type, language) {
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    return `${type}_${language}_${this.hashCode(dataStr)}`;
  }

  /**
   * Simple hash function for cache keys
   */
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  /**
   * Estimate speech duration
   */
  estimateSpeechDuration(text, speed) {
    const wordsPerMinute = 150 * speed;
    const wordCount = text.split(' ').length;
    return (wordCount / wordsPerMinute) * 60;
  }

  /**
   * Sleep utility function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get API statistics
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      windowStart: this.windowStart,
      cacheSize: this.cache.size,
      isRateLimited: this.isRateLimited,
      maxRequestsPerWindow: this.config.maxRequestsPerWindow,
      rateLimitWindow: this.config.rateLimitWindow
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.clearCache();
    this.requestQueue = [];
    this.retryQueue = [];
  }
}