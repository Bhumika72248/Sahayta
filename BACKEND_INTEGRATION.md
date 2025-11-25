# Backend Integration Guide for Sahayak

This document provides detailed instructions for backend developers to integrate with the Sahayak mobile app.

## 🏗️ Architecture Overview

The Sahayak app is designed with a service-oriented architecture where the mobile app communicates with backend services through REST APIs. The app includes mock implementations that need to be replaced with actual backend integrations.

## 🔧 Required Backend Services

### 1. Automatic Speech Recognition (ASR) Service

**Purpose**: Convert user voice input to text

**Endpoint**: `POST /api/v1/asr/transcribe`

**Request Format**:
```http
POST /api/v1/asr/transcribe
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- audio: File (audio/wav, audio/mp3, audio/m4a)
- language: String (en, hi, regional)
- model: String (optional - general, government, legal)
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "transcription": "Hello, I need help with my application",
    "confidence": 0.95,
    "language": "en",
    "duration": 3.2,
    "alternatives": [
      {
        "text": "Hello, I need help with my application",
        "confidence": 0.95
      },
      {
        "text": "Hello, I need help with my applications", 
        "confidence": 0.87
      }
    ]
  },
  "requestId": "asr_1234567890",
  "processingTime": 1.2
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "ASR_PROCESSING_FAILED",
    "message": "Unable to process audio file",
    "details": "Audio quality too low"
  },
  "requestId": "asr_1234567890"
}
```

**Implementation Notes**:
- Support multiple audio formats (WAV, MP3, M4A)
- Handle different sample rates (8kHz to 48kHz)
- Provide confidence scores for quality assessment
- Support Indian languages with proper pronunciation models
- Implement noise reduction for mobile recordings
- Return alternative transcriptions for ambiguous audio

### 2. Text-to-Speech (TTS) Service

**Purpose**: Convert text to natural-sounding speech

**Endpoint**: `POST /api/v1/tts/synthesize`

**Request Format**:
```http
POST /api/v1/tts/synthesize
Content-Type: application/json
Authorization: Bearer <token>

{
  "text": "Hello, welcome to Sahayak",
  "language": "en",
  "voice": "en-female-1",
  "speed": 1.0,
  "pitch": 1.0,
  "format": "mp3"
}
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "audioUri": "https://api.sahayak.gov.in/audio/tts_1234567890.mp3",
    "text": "Hello, welcome to Sahayak",
    "language": "en",
    "duration": 3.2,
    "voice": "en-female-1",
    "format": "mp3",
    "sampleRate": 22050,
    "expiresAt": "2024-01-01T12:00:00Z"
  },
  "requestId": "tts_1234567890"
}
```

**Available Voices Endpoint**: `GET /api/v1/tts/voices`

**Response**:
```json
{
  "success": true,
  "data": {
    "en": [
      {
        "id": "en-female-1",
        "name": "Sarah",
        "gender": "female",
        "quality": "high",
        "description": "Clear, professional female voice"
      },
      {
        "id": "en-male-1", 
        "name": "John",
        "gender": "male",
        "quality": "high",
        "description": "Warm, friendly male voice"
      }
    ],
    "hi": [
      {
        "id": "hi-female-1",
        "name": "Priya", 
        "gender": "female",
        "quality": "high",
        "description": "Native Hindi speaker"
      }
    ],
    "regional": [
      {
        "id": "mr-female-1",
        "name": "Sunita",
        "gender": "female", 
        "quality": "medium",
        "description": "Marathi native speaker"
      }
    ]
  }
}
```

**Implementation Notes**:
- Provide high-quality neural voices for each language
- Support SSML for advanced speech control
- Cache generated audio files with expiration
- Optimize for mobile bandwidth (compressed audio)
- Handle long text by breaking into chunks
- Provide streaming audio for real-time playback

### 3. Optical Character Recognition (OCR) Service

**Purpose**: Extract text and structured data from document images

**Endpoint**: `POST /api/v1/ocr/extract`

**Request Format**:
```http
POST /api/v1/ocr/extract
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- image: File (image/jpeg, image/png)
- documentType: String (aadhaar, pan, passport, driving_license, voter_id, auto)
- extractFields: Boolean (true/false)
- language: String (en, hi, regional)
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "documentType": "aadhaar",
    "fields": {
      "name": "JOHN DOE",
      "aadhaarNumber": "1234 5678 9012",
      "dateOfBirth": "01/01/1990",
      "gender": "MALE",
      "address": "S/O: FATHER NAME\nVILLAGE: MUMBAI\nDISTRICT: MUMBAI\nSTATE: MAHARASHTRA\nPIN: 400001"
    },
    "extractedText": "Raw OCR text output...",
    "confidence": 0.92,
    "processingTime": 1.8,
    "qualityScore": 0.9,
    "boundingBoxes": {
      "name": {"x": 100, "y": 150, "width": 200, "height": 30},
      "aadhaarNumber": {"x": 100, "y": 200, "width": 250, "height": 25}
    }
  },
  "requestId": "ocr_1234567890"
}
```

**Document Types Endpoint**: `GET /api/v1/ocr/document-types`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "type": "aadhaar",
      "name": "Aadhaar Card",
      "description": "Government issued identity card",
      "fields": ["name", "aadhaarNumber", "dateOfBirth", "gender", "address"],
      "sampleImage": "https://api.../samples/aadhaar.jpg"
    },
    {
      "type": "pan",
      "name": "PAN Card", 
      "description": "Permanent Account Number card",
      "fields": ["name", "panNumber", "dateOfBirth", "fatherName"],
      "sampleImage": "https://api.../samples/pan.jpg"
    }
  ]
}
```

**Implementation Notes**:
- Use specialized models for Indian government documents
- Implement template matching for structured documents
- Provide confidence scores for each extracted field
- Handle multiple languages (English, Hindi, regional scripts)
- Validate extracted data against known patterns
- Return bounding boxes for field highlighting
- Support image preprocessing (rotation, contrast adjustment)

### 4. Workflow Management Service

**Purpose**: Manage government service workflows and submissions

**Submit Workflow Endpoint**: `POST /api/v1/workflows/submit`

**Request Format**:
```http
POST /api/v1/workflows/submit
Content-Type: application/json
Authorization: Bearer <token>

{
  "workflowId": "aadhaar-application",
  "userId": "user_123",
  "data": {
    "personalInfo": {
      "name": "John Doe",
      "age": "30",
      "gender": "Male",
      "mobile": "9876543210"
    },
    "documents": {
      "addressProof": {
        "type": "electricity_bill",
        "ocrData": {...},
        "imageUri": "https://..."
      }
    },
    "metadata": {
      "language": "en",
      "deviceInfo": "Android 10",
      "location": "Mumbai, Maharashtra"
    }
  },
  "submittedAt": "2024-01-01T10:00:00Z"
}
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "submissionId": "SUB_1234567890",
    "workflowId": "aadhaar-application",
    "status": "submitted",
    "referenceNumber": "REF123ABC456",
    "estimatedProcessingTime": "3-5 business days",
    "trackingUrl": "https://track.sahayak.gov.in/REF123ABC456",
    "nextSteps": [
      "Your application has been submitted successfully",
      "You will receive SMS updates on your registered mobile number",
      "Visit the nearest Aadhaar center for biometric verification",
      "Track your application status using the reference number"
    ],
    "requiredActions": [
      {
        "action": "biometric_verification",
        "deadline": "2024-01-15T23:59:59Z",
        "location": "Nearest Aadhaar Center",
        "instructions": "Bring original documents for verification"
      }
    ]
  },
  "requestId": "workflow_1234567890"
}
```

**Track Application Endpoint**: `GET /api/v1/workflows/track/{referenceNumber}`

**Response**:
```json
{
  "success": true,
  "data": {
    "referenceNumber": "REF123ABC456",
    "status": "in_progress",
    "currentStage": "document_verification",
    "progress": 60,
    "timeline": [
      {
        "stage": "submitted",
        "timestamp": "2024-01-01T10:00:00Z",
        "description": "Application submitted successfully"
      },
      {
        "stage": "document_verification",
        "timestamp": "2024-01-02T14:30:00Z", 
        "description": "Documents under verification"
      }
    ],
    "estimatedCompletion": "2024-01-05T17:00:00Z",
    "notifications": [
      {
        "type": "sms",
        "message": "Your Aadhaar application is under review",
        "sentAt": "2024-01-02T14:30:00Z"
      }
    ]
  }
}
```

**Implementation Notes**:
- Implement workflow state management
- Generate unique reference numbers
- Send SMS/email notifications for status updates
- Integrate with government backend systems
- Handle document uploads and storage
- Implement retry mechanisms for failed submissions
- Provide detailed tracking information

### 5. User Management Service

**Purpose**: Manage user profiles and authentication

**Create/Update Profile**: `POST /api/v1/user/profile`

**Request Format**:
```http
POST /api/v1/user/profile
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "John Doe",
  "age": "30",
  "gender": "Male",
  "location": "Mumbai, Maharashtra",
  "language": "en",
  "voiceProfile": {
    "created": true,
    "samples": ["sample1.wav", "sample2.wav"],
    "characteristics": {
      "pitch": "medium",
      "speed": "normal",
      "accent": "indian_english"
    }
  },
  "preferences": {
    "voiceSpeed": 1.0,
    "highContrast": false,
    "largeText": false
  }
}
```

**Get Profile**: `GET /api/v1/user/profile`

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "name": "John Doe",
    "age": "30",
    "gender": "Male",
    "location": "Mumbai, Maharashtra",
    "language": "en",
    "voiceProfile": {
      "created": true,
      "lastUpdated": "2024-01-01T10:00:00Z"
    },
    "preferences": {
      "voiceSpeed": 1.0,
      "highContrast": false,
      "largeText": false
    },
    "statistics": {
      "applicationsSubmitted": 5,
      "lastActivity": "2024-01-01T10:00:00Z",
      "preferredServices": ["aadhaar", "pan"]
    }
  }
}
```

### 6. Sync Service (for Offline Support)

**Purpose**: Handle offline data synchronization

**Bulk Sync Endpoint**: `POST /api/v1/sync/bulk`

**Request Format**:
```http
POST /api/v1/sync/bulk
Content-Type: application/json
Authorization: Bearer <token>

{
  "items": [
    {
      "id": "local_123",
      "type": "workflow_submission",
      "data": {...},
      "timestamp": "2024-01-01T10:00:00Z"
    },
    {
      "id": "local_124", 
      "type": "profile_update",
      "data": {...},
      "timestamp": "2024-01-01T10:05:00Z"
    }
  ],
  "deviceId": "device_abc123",
  "lastSyncTime": "2024-01-01T09:00:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "processed": 2,
    "successful": 2,
    "failed": 0,
    "results": [
      {
        "localId": "local_123",
        "status": "success",
        "serverId": "server_456",
        "referenceNumber": "REF123ABC"
      },
      {
        "localId": "local_124",
        "status": "success", 
        "serverId": "server_457"
      }
    ],
    "syncTime": "2024-01-01T10:30:00Z"
  }
}
```

## 🔐 Authentication & Security

### API Authentication

**JWT Token Based Authentication**:
```http
Authorization: Bearer <jwt_token>
```

**Token Refresh Endpoint**: `POST /api/v1/auth/refresh`

**Request**:
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token", 
    "expiresIn": 3600
  }
}
```

### Security Requirements

1. **HTTPS Only**: All API endpoints must use HTTPS
2. **Rate Limiting**: Implement rate limiting per user/IP
3. **Input Validation**: Validate all input parameters
4. **File Upload Security**: 
   - Scan uploaded files for malware
   - Limit file sizes (max 10MB for images, 50MB for audio)
   - Validate file types and headers
5. **Data Encryption**: Encrypt sensitive data at rest
6. **Audit Logging**: Log all API requests and responses
7. **CORS Configuration**: Configure CORS for web clients

## 📊 Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details",
    "field": "fieldName" // for validation errors
  },
  "requestId": "req_1234567890",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Malformed request |
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### Service-Specific Error Codes

**ASR Service**:
- `ASR_AUDIO_TOO_LONG` - Audio file exceeds maximum duration
- `ASR_UNSUPPORTED_FORMAT` - Audio format not supported
- `ASR_POOR_QUALITY` - Audio quality too low for processing
- `ASR_LANGUAGE_NOT_SUPPORTED` - Language not supported

**TTS Service**:
- `TTS_TEXT_TOO_LONG` - Text exceeds maximum length
- `TTS_VOICE_NOT_AVAILABLE` - Requested voice not available
- `TTS_INVALID_SSML` - Invalid SSML markup

**OCR Service**:
- `OCR_IMAGE_TOO_LARGE` - Image file too large
- `OCR_POOR_IMAGE_QUALITY` - Image quality insufficient
- `OCR_DOCUMENT_NOT_DETECTED` - No document detected in image
- `OCR_UNSUPPORTED_DOCUMENT` - Document type not supported

## 🚀 Deployment & Infrastructure

### Recommended Architecture

```
[Mobile App] → [API Gateway] → [Microservices]
                    ↓
[Load Balancer] → [ASR Service]
                → [TTS Service] 
                → [OCR Service]
                → [Workflow Service]
                → [User Service]
                    ↓
[Database Cluster] + [File Storage] + [Cache Layer]
```

### Infrastructure Requirements

**Compute**:
- ASR Service: GPU-enabled instances for model inference
- TTS Service: CPU-optimized instances with good I/O
- OCR Service: GPU-enabled instances for image processing
- API Gateway: High-availability load balancers

**Storage**:
- Database: PostgreSQL cluster with read replicas
- File Storage: S3-compatible object storage
- Cache: Redis cluster for session and API caching

**Networking**:
- CDN for audio file delivery
- VPC with private subnets for services
- NAT Gateway for outbound internet access

### Performance Requirements

| Service | Response Time | Throughput | Availability |
|---------|---------------|------------|--------------|
| ASR | < 3 seconds | 100 req/sec | 99.9% |
| TTS | < 2 seconds | 200 req/sec | 99.9% |
| OCR | < 5 seconds | 50 req/sec | 99.9% |
| Workflow | < 1 second | 500 req/sec | 99.95% |

## 📈 Monitoring & Analytics

### Required Metrics

**API Metrics**:
- Request count and rate
- Response times (p50, p95, p99)
- Error rates by endpoint
- Authentication success/failure rates

**Service Metrics**:
- ASR accuracy rates by language
- TTS generation success rates
- OCR accuracy by document type
- Workflow completion rates

**Business Metrics**:
- User onboarding completion rate
- Application submission success rate
- Most used services and workflows
- User retention and engagement

### Logging Requirements

**Structured Logging Format**:
```json
{
  "timestamp": "2024-01-01T10:00:00Z",
  "level": "INFO",
  "service": "asr-service",
  "requestId": "req_123",
  "userId": "user_456",
  "action": "transcribe_audio",
  "duration": 1.2,
  "language": "en",
  "confidence": 0.95,
  "metadata": {
    "audioLength": 3.5,
    "model": "government-v2"
  }
}
```

## 🧪 Testing

### API Testing Requirements

1. **Unit Tests**: Test individual service functions
2. **Integration Tests**: Test API endpoints end-to-end
3. **Load Tests**: Verify performance under load
4. **Security Tests**: Test authentication and authorization
5. **Accessibility Tests**: Ensure API responses support accessibility

### Test Data Requirements

- Sample audio files in multiple languages
- Sample document images for each supported type
- Test user profiles with various configurations
- Mock government backend responses

## 📋 Integration Checklist

### Pre-Integration
- [ ] Set up development environment
- [ ] Configure authentication system
- [ ] Set up database schemas
- [ ] Prepare test data and mock services

### ASR Service Integration
- [ ] Implement audio file upload handling
- [ ] Set up speech recognition models
- [ ] Configure language support
- [ ] Test with various audio qualities
- [ ] Implement confidence scoring
- [ ] Add error handling for poor audio

### TTS Service Integration  
- [ ] Set up text-to-speech engines
- [ ] Configure voice models for each language
- [ ] Implement audio file generation
- [ ] Set up audio file storage and CDN
- [ ] Test with various text lengths
- [ ] Implement SSML support

### OCR Service Integration
- [ ] Set up document recognition models
- [ ] Configure field extraction templates
- [ ] Implement image preprocessing
- [ ] Test with various document types
- [ ] Add confidence scoring
- [ ] Implement bounding box detection

### Workflow Service Integration
- [ ] Set up workflow state management
- [ ] Implement submission processing
- [ ] Configure government backend integration
- [ ] Set up notification systems
- [ ] Implement tracking functionality
- [ ] Add retry mechanisms

### Testing & Validation
- [ ] Run integration tests
- [ ] Perform load testing
- [ ] Validate security measures
- [ ] Test offline sync functionality
- [ ] Verify error handling
- [ ] Test with real user scenarios

### Production Deployment
- [ ] Set up monitoring and alerting
- [ ] Configure logging and analytics
- [ ] Implement backup and recovery
- [ ] Set up CI/CD pipelines
- [ ] Configure auto-scaling
- [ ] Perform security audit

## 📞 Support & Maintenance

### Backend Developer Support

**Documentation**: 
- API documentation with OpenAPI/Swagger
- Service architecture diagrams
- Database schema documentation
- Deployment guides

**Development Tools**:
- Postman collection for API testing
- Docker containers for local development
- Database migration scripts
- Monitoring dashboards

**Contact Information**:
- Technical Lead: tech-lead@sahayak.gov.in
- DevOps Team: devops@sahayak.gov.in
- Security Team: security@sahayak.gov.in

### Maintenance Schedule

**Regular Updates**:
- Security patches: Weekly
- Model updates: Monthly
- Feature releases: Quarterly
- Infrastructure updates: As needed

**Monitoring**:
- 24/7 system monitoring
- Weekly performance reviews
- Monthly security audits
- Quarterly capacity planning

---

This integration guide provides the foundation for building a robust backend system that supports the Sahayak mobile application. Follow the specifications carefully and reach out to the development team for any clarifications.