# Frontend Integration Guide

This guide explains how to integrate the Sahayak backend with your existing React Native frontend.

## 🔧 Quick Integration Steps

### 1. Update API Configuration

Replace the mock API configuration in your frontend:

```javascript
// app/api/apiConfig.js
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000', // Change to your backend URL
  ENDPOINTS: {
    ASR: '/api/v1/asr/transcribe',
    TTS: '/api/v1/tts/synthesize',
    OCR: '/api/v1/ocr/extract',
    WORKFLOWS: '/api/v1/workflows',
    USER_PROFILE: '/api/v1/users',
    SYNC: '/api/v1/sync'
  },
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
};

export const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': token ? `Bearer ${token}` : undefined,
  'X-App-Version': '1.0.0',
  'X-Platform': 'mobile'
});
```

### 2. Update Service Files

#### ASR Service Integration
```javascript
// app/api/asrService.js
import { API_CONFIG, getHeaders } from './apiConfig';

export const transcribeAudio = async (audioUri, language = 'en', token) => {
  try {
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
        'Authorization': token ? `Bearer ${token}` : undefined,
        'Content-Type': 'multipart/form-data'
      },
      body: formData,
      timeout: API_CONFIG.TIMEOUT
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('ASR Service Error:', error);
    throw error;
  }
};
```

#### TTS Service Integration
```javascript
// app/api/ttsService.js
import { API_CONFIG, getHeaders } from './apiConfig';

export const synthesizeSpeech = async (text, language = 'en', options = {}, token) => {
  try {
    const requestBody = {
      text,
      language,
      voice: options.voice || 'default',
      speed: options.speed || 1.0,
      pitch: options.pitch || 1.0,
      format: 'mp3'
    };

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TTS}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(requestBody),
      timeout: API_CONFIG.TIMEOUT
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('TTS Service Error:', error);
    throw error;
  }
};
```

#### OCR Service Integration
```javascript
// app/api/ocrService.js
import { API_CONFIG, getHeaders } from './apiConfig';

export const extractDocumentData = async (imageUri, documentType = 'auto', token) => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'document.jpg'
    });
    formData.append('documentType', documentType);
    formData.append('extractFields', 'true');

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.OCR}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : undefined,
        'Content-Type': 'multipart/form-data'
      },
      body: formData,
      timeout: API_CONFIG.TIMEOUT
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('OCR Service Error:', error);
    throw error;
  }
};
```

### 3. Add Authentication

Create authentication service:

```javascript
// app/api/authService.js
import { API_CONFIG, getHeaders } from './apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success && result.data.token) {
      await AsyncStorage.setItem('authToken', result.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(result.data.user));
    }

    return result;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (phone, password) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ phone, password })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success && result.data.token) {
      await AsyncStorage.setItem('authToken', result.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(result.data.user));
    }

    return result;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
};
```

### 4. Update Redux Store

Add authentication to your Redux store:

```javascript
// app/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { registerUser, loginUser, getStoredToken } from '../../api/authService';

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await registerUser(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ phone, password }, { rejectWithValue }) => {
    try {
      const response = await loginUser(phone, password);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
```

### 5. Update Service Calls

Modify your existing service calls to use the real backend:

```javascript
// In your components, replace mock calls with real API calls
import { useSelector } from 'react-redux';
import { transcribeAudio } from '../api/asrService';

const VoiceComponent = () => {
  const { token } = useSelector(state => state.auth);
  
  const handleVoiceInput = async (audioUri, language) => {
    try {
      const result = await transcribeAudio(audioUri, language, token);
      if (result.success) {
        // Handle successful transcription
        console.log('Transcription:', result.data.transcription);
      }
    } catch (error) {
      console.error('Voice input error:', error);
    }
  };
};
```

## 🔄 Testing Integration

### 1. Start Backend Server
```bash
cd backend
npm install
npm run dev
```

### 2. Update Frontend Configuration
```javascript
// Update API_CONFIG.BASE_URL to point to your backend
export const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:3000', // Android emulator
  // BASE_URL: 'http://localhost:3000', // iOS simulator
  // BASE_URL: 'http://192.168.1.100:3000', // Physical device
  // ...
};
```

### 3. Test Authentication Flow
1. Register a new user through the app
2. Login with the registered credentials
3. Verify token storage and API calls

### 4. Test Core Features
1. **Voice Recognition**: Record audio and verify transcription
2. **Text-to-Speech**: Play generated audio
3. **Document Scanning**: Upload image and verify OCR extraction
4. **Workflow Submission**: Complete a workflow end-to-end

## 🐛 Troubleshooting

### Common Issues

#### Network Connection
```javascript
// Add network error handling
const handleNetworkError = (error) => {
  if (error.message.includes('Network request failed')) {
    Alert.alert('Network Error', 'Please check your internet connection');
  }
};
```

#### Authentication Errors
```javascript
// Handle token expiration
const handleAuthError = async (error) => {
  if (error.status === 401) {
    // Token expired, redirect to login
    await AsyncStorage.removeItem('authToken');
    navigation.navigate('Login');
  }
};
```

#### File Upload Issues
```javascript
// Ensure proper file format for uploads
const prepareFileForUpload = (uri, type) => {
  return {
    uri,
    type: type || 'image/jpeg',
    name: `file_${Date.now()}.${type?.split('/')[1] || 'jpg'}`
  };
};
```

## 📱 Platform-Specific Configuration

### Android
```javascript
// android/app/src/main/AndroidManifest.xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />

// For HTTP traffic in development
<application
  android:usesCleartextTraffic="true"
  ...>
```

### iOS
```javascript
// ios/Sahayak/Info.plist
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

## 🚀 Production Deployment

### Backend Deployment
1. Deploy backend to cloud service (AWS, Google Cloud, Azure)
2. Set up PostgreSQL database
3. Configure environment variables
4. Set up SSL certificates

### Frontend Configuration
```javascript
// Update for production
export const API_CONFIG = {
  BASE_URL: 'https://api.sahayak.gov.in', // Production URL
  // ...
};
```

## 📊 Monitoring Integration

Add API monitoring to your frontend:

```javascript
// app/utils/apiMonitor.js
export const logApiCall = (endpoint, method, duration, success) => {
  console.log('API Call:', {
    endpoint,
    method,
    duration,
    success,
    timestamp: new Date().toISOString()
  });
  
  // Send to analytics service
  // Analytics.track('api_call', { endpoint, method, duration, success });
};
```

## 🔐 Security Best Practices

1. **Token Management**: Store JWT securely using AsyncStorage or Keychain
2. **API Validation**: Validate all API responses
3. **Error Handling**: Don't expose sensitive error information
4. **Network Security**: Use HTTPS in production
5. **Input Sanitization**: Validate user inputs before sending to API

This integration guide ensures seamless connection between your React Native frontend and the production-ready backend. Follow these steps to replace all mock implementations with real API calls.