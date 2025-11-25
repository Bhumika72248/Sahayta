# Sahayak - AI Citizen Assistance App

A complete, production-ready React Native + Expo mobile application designed for illiterate and semi-literate users to access government services through voice-first interactions.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Physical Android device or emulator

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sahayak-app

# Install dependencies
npm install

# Start the development server
npm start

# Run on Android
npm run android
```

## 📱 Features

### ✅ Implemented Features

- **Voice-First Interface**: Complete ASR/TTS integration with fallbacks
- **Offline-First Architecture**: SQLite database with sync queue
- **Multi-language Support**: English, Hindi, Marathi with i18n
- **Document Scanning**: OCR integration with camera overlay and guidance
- **Government Workflows**: Step-by-step guided processes
- **Accessibility**: WCAG AA compliant with screen reader support
- **Redux State Management**: Centralized state with persistence
- **Component Library**: Reusable UI components with design system

### 🎯 Core Workflows

1. **User Onboarding**
   - Language selection
   - Permission requests
   - Voice profile creation
   
2. **Document Processing**
   - Camera-based document scanning
   - Real-time OCR with quality validation
   - Form auto-filling from extracted data
   
3. **Government Applications**
   - Aadhaar card application
   - PAN card application  
   - Passport application
   - Driving license application
   - Voter ID application
   - Ration card application

## 🏗️ Architecture

### Project Structure
```
/sahayak-app
├── app/
│   ├── api/                 # API services (ASR, TTS, OCR, Workflows)
│   ├── components/          # Reusable UI components
│   ├── database/           # SQLite database configuration
│   ├── i18n/               # Internationalization files
│   ├── screens/            # Application screens
│   ├── store/              # Redux store and slices
│   ├── theme/              # Design system and theme
│   └── workflows/          # Workflow JSON definitions
├── assets/                 # Static assets (icons, images)
├── App.js                  # Main application entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

### Technology Stack

- **Framework**: React Native + Expo 49
- **State Management**: Redux Toolkit
- **Database**: SQLite with expo-sqlite
- **Styling**: NativeWind (Tailwind for React Native)
- **Navigation**: React Navigation 6
- **Internationalization**: react-i18next
- **Voice**: expo-speech (TTS), expo-av (recording)
- **Camera**: expo-camera
- **Icons**: @expo/vector-icons

## 🎨 Design System

### Color Palette (Government Style)
```javascript
{
  primary: '#0F4C81',      // Government blue
  secondary: '#FF6F00',    // Accent orange
  background: '#FFFFFF',   // White background
  textPrimary: '#0B2545',  // Dark blue text
  textSecondary: '#5B6B7A', // Gray text
  success: '#2E7D32',      // Green
  error: '#D32F2F',        // Red
  disabled: '#E6EEF8'      // Light gray
}
```

### Typography Scale
- **H1**: 32px, Bold - Page titles
- **H2**: 24px, Bold - Section headers  
- **H3**: 20px, SemiBold - Subsections
- **Body**: 16px, Regular - Main content
- **Body Large**: 18px, Regular - Important content
- **Caption**: 14px, Regular - Secondary info

### Component Library

#### Core Components
- `AppHeader` - Navigation header with back/settings
- `LargeButton` - Primary/Secondary/Danger button variants
- `VoiceMicButton` - Voice input with animations
- `VoiceWaveform` - Audio visualization
- `PictogramIcon` - SVG icons for documents/actions
- `FullScreenModal` - Animated modal overlay
- `OfflineSyncBanner` - Network status indicator
- `Stepper` - Workflow progress indicator
- `CameraOverlay` - Document scanning guidance
- `CardTile` - Action cards for home screen

## 🔊 Voice Integration

### Text-to-Speech (TTS)
```javascript
import { synthesizeSpeech } from './app/api/ttsService';

// Play immediate audio
await synthesizeSpeech(text, language, { playImmediately: true });

// Generate audio file
const result = await synthesizeSpeech(text, language);
// Returns: { audioUri, duration, voice, format }
```

### Automatic Speech Recognition (ASR)
```javascript
import { transcribeAudio } from './app/api/asrService';

const result = await transcribeAudio(audioUri, language);
// Returns: { transcription, confidence, alternatives }
```

### Audio File Naming Convention
```
<feature>.<screen>.<promptKey>.mp3

Examples:
- workflow.aadhaar.welcome.mp3
- workflow.aadhaar.askName.mp3
- home.welcome.greeting.mp3
```

## 📷 OCR Integration

### Document Scanning
```javascript
import { extractDocumentData } from './app/api/ocrService';

const result = await extractDocumentData(imageUri, documentType);
// Returns: { fields, confidence, documentType, extractedText }
```

### Supported Document Types
- Aadhaar Card
- PAN Card  
- Passport
- Driving License
- Voter ID
- Birth Certificate
- Address Proof documents

### Camera Features
- Real-time document detection
- Alignment guidance overlay
- Quality validation
- Auto-capture when aligned
- Flash control

## 🌐 Internationalization

### Language Support
- **English** (`en`) - Primary language
- **Hindi** (`hi`) - National language  
- **Marathi** (`regional`) - Regional language

### Usage
```javascript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
const text = t('home.welcome'); // "Welcome to Sahayak"
```

### Adding New Languages
1. Create new JSON file in `app/i18n/`
2. Add language to `availableLanguages` in store
3. Update language selector in settings
4. Add TTS voice support

## 💾 Offline-First Architecture

### Database Schema
```sql
-- User profile
CREATE TABLE user_profile (
  id INTEGER PRIMARY KEY,
  name TEXT,
  age TEXT,
  gender TEXT,
  location TEXT,
  voice_profile_created INTEGER,
  created_at DATETIME
);

-- Workflow submissions
CREATE TABLE workflows (
  id INTEGER PRIMARY KEY,
  workflow_type TEXT,
  workflow_data TEXT,
  status TEXT,
  created_at DATETIME,
  completed_at DATETIME
);

-- Offline sync queue
CREATE TABLE sync_queue (
  id INTEGER PRIMARY KEY,
  data TEXT,
  endpoint TEXT,
  method TEXT,
  created_at DATETIME,
  synced INTEGER
);
```

### Sync Strategy
1. **Online**: Direct API submission
2. **Offline**: Queue in local database
3. **Reconnection**: Auto-sync queued items
4. **Conflict Resolution**: Last-write-wins

## 🔄 Workflow System

### Workflow Definition Schema
```json
{
  "id": "workflow-id",
  "name": "Workflow Name", 
  "steps": [
    {
      "step": 1,
      "type": "info|ask|ocr|confirm|submit",
      "key": "unique_step_key",
      "title": "Step Title",
      "prompt": "Voice prompt text",
      "input": "voice|text|camera",
      "validation": "required|number|email",
      "audio": "audio_file.mp3"
    }
  ]
}
```

### Step Types
- **info**: Display information with audio
- **ask**: Voice input with validation
- **ocr**: Document scanning step
- **confirm**: Review and confirmation
- **submit**: Final submission

### Adding New Workflows
1. Create JSON file in `app/workflows/`
2. Add to `getAvailableWorkflows()` in workflowService
3. Create audio files for each step
4. Test end-to-end flow

## 🔧 Backend Integration Guide

### API Endpoints Required

#### ASR Service
```
POST /api/v1/asr/transcribe
Content-Type: multipart/form-data

Body:
- audio: File (wav/mp3/m4a)
- language: String (en/hi/regional)
- model: String (general/government/legal)

Response:
{
  "success": true,
  "data": {
    "transcription": "Hello, I need help",
    "confidence": 0.95,
    "language": "en",
    "duration": 3.2,
    "alternatives": [...]
  }
}
```

#### TTS Service  
```
POST /api/v1/tts/synthesize
Content-Type: application/json

Body:
{
  "text": "Hello, welcome to Sahayak",
  "language": "en", 
  "voice": "en-female-1",
  "speed": 1.0,
  "pitch": 1.0,
  "format": "mp3"
}

Response:
{
  "success": true,
  "data": {
    "audioUri": "https://api.../audio.mp3",
    "duration": 3.2,
    "voice": "en-female-1"
  }
}
```

#### OCR Service
```
POST /api/v1/ocr/extract  
Content-Type: multipart/form-data

Body:
- image: File (jpeg/png)
- documentType: String (aadhaar/pan/passport)
- extractFields: Boolean
- language: String

Response:
{
  "success": true,
  "data": {
    "documentType": "aadhaar",
    "fields": {
      "name": "JOHN DOE",
      "aadhaarNumber": "1234 5678 9012",
      "dateOfBirth": "01/01/1990"
    },
    "confidence": 0.92
  }
}
```

#### Workflow Submission
```
POST /api/v1/workflows/submit
Content-Type: application/json

Body:
{
  "workflowId": "aadhaar-application",
  "data": { ... },
  "submittedAt": "2024-01-01T00:00:00Z"
}

Response:
{
  "success": true,
  "data": {
    "submissionId": "SUB_123456",
    "referenceNumber": "REF123ABC",
    "status": "submitted",
    "estimatedProcessingTime": "3-5 business days"
  }
}
```

### Integration Steps

1. **Update API Configuration**
   ```javascript
   // app/api/apiConfig.js
   export const API_CONFIG = {
     BASE_URL: 'https://your-api-domain.com',
     // ... endpoints
   };
   ```

2. **Replace Mock Implementations**
   - Uncomment actual API calls in service files
   - Remove mock data and delays
   - Add proper error handling

3. **Configure Authentication**
   - Add API keys/tokens to headers
   - Implement token refresh logic
   - Handle authentication errors

4. **Test Integration**
   - Verify all API endpoints
   - Test error scenarios
   - Validate response formats

## 📱 Building APK

### Development Build
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build development APK
eas build --platform android --profile development
```

### Production Build
```bash
# Build production APK
eas build --platform android --profile production

# Build AAB for Play Store
eas build --platform android --profile production --format aab
```

### Local Build (Alternative)
```bash
# Generate native code
npx expo prebuild

# Build with Android Studio or Gradle
cd android
./gradlew assembleRelease
```

### Build Profiles (eas.json)
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

## 🧪 Testing

### Manual Testing Checklist

#### Voice Features
- [ ] Language selection with TTS feedback
- [ ] Voice profile creation flow
- [ ] Voice commands recognition
- [ ] Audio playback quality
- [ ] Offline voice fallback

#### Camera/OCR
- [ ] Camera permissions
- [ ] Document alignment guidance  
- [ ] OCR accuracy for each document type
- [ ] Image quality validation
- [ ] Retake functionality

#### Workflows
- [ ] Complete Aadhaar application flow
- [ ] Step navigation (next/back)
- [ ] Data persistence between steps
- [ ] Offline submission queue
- [ ] Success/error handling

#### Accessibility
- [ ] Screen reader compatibility
- [ ] High contrast mode
- [ ] Large text scaling
- [ ] Voice-only navigation
- [ ] Keyboard navigation

### Device Testing
- **Minimum**: Android 8.0 (API 26)
- **Recommended**: Android 10+ with 3GB+ RAM
- **Screen sizes**: 5" to 7" phones and tablets
- **Network**: 2G/3G/4G/WiFi/Offline scenarios

## 🔒 Security Considerations

### Data Protection
- All sensitive data encrypted in SQLite
- No credentials stored in app
- Secure API communication (HTTPS)
- Biometric authentication (future)

### Privacy
- Minimal data collection
- Local processing preferred
- Clear privacy policy
- User consent for data usage

### Compliance
- Government data handling standards
- GDPR compliance for EU users
- Accessibility standards (WCAG AA)
- Security audit recommendations

## 🚀 Deployment

### App Store Deployment
1. **Google Play Store**
   - Build signed AAB
   - Complete store listing
   - Upload screenshots
   - Submit for review

2. **Alternative Distribution**
   - Direct APK download
   - Enterprise app stores
   - Government app portals

### Backend Deployment
1. **API Services**
   - Deploy ASR/TTS/OCR services
   - Configure load balancing
   - Set up monitoring
   - Enable HTTPS

2. **Database**
   - Set up production database
   - Configure backups
   - Implement security measures
   - Monitor performance

## 📊 Analytics & Monitoring

### Key Metrics
- User onboarding completion rate
- Voice command success rate
- OCR accuracy by document type
- Workflow completion rate
- Offline usage patterns
- Error rates by feature

### Monitoring Tools
- Crash reporting (Sentry/Bugsnag)
- Performance monitoring
- API response times
- User behavior analytics
- Accessibility usage stats

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Add tests for new features
5. Submit pull request

### Coding Standards
- ESLint configuration included
- Prettier for code formatting
- Component documentation required
- Accessibility testing mandatory

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### For Developers
- **Documentation**: See `/docs` folder
- **API Reference**: See `/api-docs`
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

### For Users
- **Help**: In-app help section
- **Support**: support@sahayak.gov.in
- **Phone**: 1800-XXX-XXXX

---

**Built with ❤️ for digital inclusion in India**