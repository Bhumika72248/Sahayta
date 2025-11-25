import { API_CONFIG, getHeaders, ERROR_MESSAGES } from './apiConfig';

// Mock ASR response for development
const MOCK_ASR_RESPONSES = {
  'hello': 'Hello, how can I help you?',
  'name': 'My name is John Doe',
  'age': 'I am 35 years old',
  'address': 'I live in Mumbai, Maharashtra',
  'help': 'I need help with Aadhaar card application'
};

/**
 * Transcribe audio to text using ASR service
 * @param {string} audioUri - URI of the audio file
 * @param {string} language - Language code (en, hi, regional)
 * @returns {Promise<Object>} Transcription result
 */
export const transcribeAudio = async (audioUri, language = 'en') => {
  try {
    // Mock implementation - replace with actual API call
    console.log('ASR Service: Transcribing audio', { audioUri, language });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock response based on common patterns
    const mockText = Object.keys(MOCK_ASR_RESPONSES)[
      Math.floor(Math.random() * Object.keys(MOCK_ASR_RESPONSES).length)
    ];
    
    const mockResponse = {
      success: true,
      data: {
        transcription: MOCK_ASR_RESPONSES[mockText],
        confidence: 0.95,
        language: language,
        duration: 2.5,
        alternatives: [
          {
            text: MOCK_ASR_RESPONSES[mockText],
            confidence: 0.95
          }
        ]
      },
      requestId: `asr_${Date.now()}`
    };
    
    return mockResponse;
    
    /* 
    // Actual API implementation (uncomment when backend is ready)
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/wav',
      name: 'audio.wav'
    });
    formData.append('language', language);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ASR}`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data'
      },
      body: formData,
      timeout: API_CONFIG.TIMEOUT
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
    */
    
  } catch (error) {
    console.error('ASR Service Error:', error);
    
    // Convert technical errors to user-friendly messages
    let userMessage = ERROR_MESSAGES.SERVER_ERROR;
    
    if (error.message.includes('Network')) {
      userMessage = ERROR_MESSAGES.NETWORK_ERROR;
    } else if (error.message.includes('timeout')) {
      userMessage = ERROR_MESSAGES.TIMEOUT_ERROR;
    }
    
    throw new Error(userMessage);
  }
};

/**
 * Get supported languages for ASR
 * @returns {Promise<Array>} List of supported languages
 */
export const getSupportedLanguages = async () => {
  try {
    // Mock implementation
    return {
      success: true,
      data: [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
        { code: 'regional', name: 'Marathi', nativeName: 'मराठी' }
      ]
    };
  } catch (error) {
    console.error('ASR Languages Error:', error);
    throw new Error(ERROR_MESSAGES.SERVER_ERROR);
  }
};

/**
 * Expected API Request Format:
 * POST /api/v1/asr/transcribe
 * Content-Type: multipart/form-data
 * 
 * Body:
 * - audio: File (audio/wav, audio/mp3, audio/m4a)
 * - language: String (en, hi, regional)
 * - model: String (optional - general, government, legal)
 * 
 * Expected API Response Format:
 * {
 *   "success": true,
 *   "data": {
 *     "transcription": "Hello, I need help with my application",
 *     "confidence": 0.95,
 *     "language": "en",
 *     "duration": 3.2,
 *     "alternatives": [
 *       {
 *         "text": "Hello, I need help with my application",
 *         "confidence": 0.95
 *       }
 *     ]
 *   },
 *   "requestId": "asr_1234567890"
 * }
 */