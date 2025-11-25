import { API_CONFIG, getHeaders, ERROR_MESSAGES } from './apiConfig';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';

/**
 * Convert text to speech using TTS service
 * @param {string} text - Text to convert to speech
 * @param {string} language - Language code (en, hi, regional)
 * @param {Object} options - TTS options (voice, speed, pitch)
 * @returns {Promise<Object>} Audio file URI and metadata
 */
export const synthesizeSpeech = async (text, language = 'en', options = {}) => {
  try {
    console.log('TTS Service: Synthesizing speech', { text, language, options });
    
    // Use Expo Speech for local TTS (fallback)
    const ttsOptions = {
      language: getLanguageCode(language),
      pitch: options.pitch || 1.0,
      rate: options.speed || 0.8,
      voice: options.voice || null
    };
    
    // For immediate playback
    if (options.playImmediately) {
      await Speech.speak(text, ttsOptions);
      return {
        success: true,
        data: {
          played: true,
          text: text,
          language: language
        }
      };
    }
    
    // Mock implementation for audio file generation
    // In production, this would call the backend TTS service
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockResponse = {
      success: true,
      data: {
        audioUri: `${FileSystem.documentDirectory}tts_${Date.now()}.mp3`,
        text: text,
        language: language,
        duration: Math.ceil(text.length / 10), // Rough estimate
        voice: options.voice || 'default',
        format: 'mp3',
        sampleRate: 22050
      },
      requestId: `tts_${Date.now()}`
    };
    
    return mockResponse;
    
    /* 
    // Actual API implementation (uncomment when backend is ready)
    const requestBody = {
      text: text,
      language: language,
      voice: options.voice || 'default',
      speed: options.speed || 1.0,
      pitch: options.pitch || 1.0,
      format: 'mp3'
    };
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TTS}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestBody),
      timeout: API_CONFIG.TIMEOUT
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
    */
    
  } catch (error) {
    console.error('TTS Service Error:', error);
    
    // Fallback to local TTS
    try {
      await Speech.speak(text, {
        language: getLanguageCode(language),
        rate: 0.8
      });
      
      return {
        success: true,
        data: {
          played: true,
          text: text,
          language: language,
          fallback: true
        }
      };
    } catch (fallbackError) {
      console.error('TTS Fallback Error:', fallbackError);
      throw new Error('Text-to-speech service unavailable');
    }
  }
};

/**
 * Play audio from URI
 * @param {string} audioUri - URI of the audio file
 * @returns {Promise<void>}
 */
export const playAudio = async (audioUri) => {
  try {
    // Mock implementation - in production, use expo-av
    console.log('Playing audio:', audioUri);
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error) {
    console.error('Audio playback error:', error);
    throw new Error('Audio playback failed');
  }
};

/**
 * Get available voices for TTS
 * @param {string} language - Language code
 * @returns {Promise<Array>} List of available voices
 */
export const getAvailableVoices = async (language = 'en') => {
  try {
    // Mock implementation
    const voices = {
      en: [
        { id: 'en-female-1', name: 'Sarah', gender: 'female', quality: 'high' },
        { id: 'en-male-1', name: 'John', gender: 'male', quality: 'high' }
      ],
      hi: [
        { id: 'hi-female-1', name: 'Priya', gender: 'female', quality: 'high' },
        { id: 'hi-male-1', name: 'Arjun', gender: 'male', quality: 'high' }
      ],
      regional: [
        { id: 'mr-female-1', name: 'Sunita', gender: 'female', quality: 'medium' },
        { id: 'mr-male-1', name: 'Rahul', gender: 'male', quality: 'medium' }
      ]
    };
    
    return {
      success: true,
      data: voices[language] || voices.en
    };
  } catch (error) {
    console.error('TTS Voices Error:', error);
    throw new Error(ERROR_MESSAGES.SERVER_ERROR);
  }
};

/**
 * Convert app language code to system language code
 * @param {string} appLanguage - App language code (en, hi, regional)
 * @returns {string} System language code
 */
const getLanguageCode = (appLanguage) => {
  const languageMap = {
    en: 'en-US',
    hi: 'hi-IN',
    regional: 'mr-IN' // Marathi
  };
  
  return languageMap[appLanguage] || 'en-US';
};

/**
 * Generate audio filename for caching
 * @param {string} feature - Feature name
 * @param {string} screen - Screen name
 * @param {string} promptKey - Prompt key
 * @returns {string} Audio filename
 */
export const generateAudioFilename = (feature, screen, promptKey) => {
  return `${feature}.${screen}.${promptKey}.mp3`;
};

/**
 * Expected API Request Format:
 * POST /api/v1/tts/synthesize
 * Content-Type: application/json
 * 
 * Body:
 * {
 *   "text": "Hello, welcome to Sahayak",
 *   "language": "en",
 *   "voice": "en-female-1",
 *   "speed": 1.0,
 *   "pitch": 1.0,
 *   "format": "mp3"
 * }
 * 
 * Expected API Response Format:
 * {
 *   "success": true,
 *   "data": {
 *     "audioUri": "https://api.sahayak.gov.in/audio/tts_1234567890.mp3",
 *     "text": "Hello, welcome to Sahayak",
 *     "language": "en",
 *     "duration": 3.2,
 *     "voice": "en-female-1",
 *     "format": "mp3",
 *     "sampleRate": 22050
 *   },
 *   "requestId": "tts_1234567890"
 * }
 */