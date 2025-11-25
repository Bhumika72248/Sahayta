// API Configuration - All endpoints controlled from here
export const API_CONFIG = {
  BASE_URL: 'https://api.sahayak.gov.in', // Replace with actual backend URL
  ENDPOINTS: {
    ASR: '/api/v1/asr/transcribe',
    TTS: '/api/v1/tts/synthesize',
    OCR: '/api/v1/ocr/extract',
    WORKFLOWS: '/api/v1/workflows',
    USER_PROFILE: '/api/v1/user/profile',
    SYNC: '/api/v1/sync'
  },
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3
};

// Request headers
export const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-App-Version': '1.0.0',
  'X-Platform': 'mobile'
});

// Error messages mapping
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  INVALID_RESPONSE: 'Invalid response from server.',
  PERMISSION_DENIED: 'Permission denied. Please check your credentials.',
  NOT_FOUND: 'Requested resource not found.',
  VALIDATION_ERROR: 'Invalid input data provided.'
};