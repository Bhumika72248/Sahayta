# Sahayak Backend API

Production-ready backend for the Sahayak AI Citizen Assistance mobile app. Provides complete integration with ASR, TTS, OCR, workflow management, and offline synchronization.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- Docker & Docker Compose (optional)

### Local Development

```bash
# Clone and setup
cd backend
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npm run migrate
npm run seed

# Start development server
npm run dev
```

### Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `GET /api/v1/auth/verify` - Verify token

### User Management
- `GET /api/v1/users/:id/profile` - Get user profile
- `PUT /api/v1/users/:id/profile` - Update user profile
- `POST /api/v1/users/:id/voice-profile` - Create voice profile

### ASR (Speech Recognition)
- `POST /api/v1/asr/transcribe` - Transcribe audio to text
- `GET /api/v1/asr/languages` - Get supported languages

### TTS (Text-to-Speech)
- `POST /api/v1/tts/synthesize` - Convert text to speech
- `POST /api/v1/tts/play` - Immediate audio playback
- `GET /api/v1/tts/voices` - Get available voices

### OCR (Document Processing)
- `POST /api/v1/ocr/extract` - Extract data from document images
- `POST /api/v1/ocr/validate` - Validate image quality
- `GET /api/v1/ocr/document-types` - Get supported document types

### Workflow Management
- `GET /api/v1/workflows` - Get available workflows
- `GET /api/v1/workflows/:workflowId` - Get workflow definition
- `GET /api/v1/workflows/user/:userId` - Get user workflows
- `POST /api/v1/workflows/submit` - Submit completed workflow
- `GET /api/v1/workflows/track/:referenceNumber` - Track workflow status
- `PUT /api/v1/workflows/:workflowId/step` - Update workflow step

### Offline Sync
- `POST /api/v1/sync` - Bulk sync offline data
- `GET /api/v1/sync/queue` - Get sync queue
- `POST /api/v1/sync/retry` - Retry failed sync items

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE "Users" (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  age VARCHAR,
  gender ENUM('Male', 'Female', 'Other'),
  location VARCHAR,
  language ENUM('en', 'hi', 'regional') DEFAULT 'en',
  voice_profile_created BOOLEAN DEFAULT false,
  password_hash VARCHAR,
  phone VARCHAR UNIQUE,
  email VARCHAR UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Workflows Table
```sql
CREATE TABLE "Workflows" (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES "Users"(id),
  workflow_type VARCHAR NOT NULL,
  workflow_data JSONB DEFAULT '{}',
  current_step INTEGER DEFAULT 0,
  status ENUM('pending', 'in_progress', 'completed', 'failed'),
  reference_number VARCHAR UNIQUE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Documents Table
```sql
CREATE TABLE "Documents" (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES "Users"(id),
  workflow_id UUID REFERENCES "Workflows"(id),
  document_type ENUM('aadhaar', 'pan', 'passport', 'driving_license', 'voter_id'),
  file_path VARCHAR NOT NULL,
  extracted_fields JSONB DEFAULT '{}',
  confidence FLOAT DEFAULT 0.0,
  language VARCHAR DEFAULT 'en',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 🔧 Configuration

### Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sahayak_db
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Logging
LOG_LEVEL=info
```

### Frontend Integration

Update your frontend API configuration:

```javascript
// app/api/apiConfig.js
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000', // Your backend URL
  ENDPOINTS: {
    ASR: '/api/v1/asr/transcribe',
    TTS: '/api/v1/tts/synthesize',
    OCR: '/api/v1/ocr/extract',
    WORKFLOWS: '/api/v1/workflows',
    USER_PROFILE: '/api/v1/users',
    SYNC: '/api/v1/sync'
  }
};
```

## 🧪 Testing

### Sample API Requests

#### Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+919876543210",
    "password": "password123",
    "language": "en"
  }'
```

#### ASR Transcription
```bash
curl -X POST http://localhost:3000/api/v1/asr/transcribe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "audio=@sample.wav" \
  -F "language=en"
```

#### TTS Synthesis
```bash
curl -X POST http://localhost:3000/api/v1/tts/synthesize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "text": "Hello, welcome to Sahayak",
    "language": "en",
    "voice": "en-female-1"
  }'
```

#### OCR Extraction
```bash
curl -X POST http://localhost:3000/api/v1/ocr/extract \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@document.jpg" \
  -F "documentType=aadhaar"
```

### Test Users

The seed script creates these test users:

| Phone | Password | Language | Name |
|-------|----------|----------|------|
| +919876543210 | password123 | en | John Doe |
| +919876543211 | password123 | hi | राहुल शर्मा |
| +919876543212 | password123 | regional | सुनील पाटील |
| +919876543213 | password123 | en | Priya Singh |

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- File upload security (type and size validation)
- CORS configuration
- Helmet.js security headers
- SQL injection prevention with Sequelize ORM

## 📊 Monitoring & Logging

### Winston Logging
- Structured JSON logging
- Multiple log levels (error, warn, info, debug)
- File and console transports
- Request/response logging

### Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "version": "1.0.0"
}
```

## 🚀 Production Deployment

### Docker Production
```bash
# Build production image
docker build -t sahayak-backend .

# Run with production environment
docker run -d \
  --name sahayak-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  -e JWT_SECRET=your-production-secret \
  sahayak-backend
```

### Database Migration
```bash
# Run migrations
npm run migrate

# Seed initial data
npm run seed
```

### SSL Configuration
For production, configure SSL/TLS:
1. Obtain SSL certificates
2. Configure nginx reverse proxy
3. Update CORS origins
4. Set secure cookie flags

## 🔄 Integration with External Services

### Real ASR Integration
Replace mock ASR with actual service:

```javascript
// In src/routes/asr.js
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

// Replace mock transcription with:
const [response] = await client.recognize({
  audio: { content: audioBuffer },
  config: {
    encoding: 'WEBM_OPUS',
    sampleRateHertz: 16000,
    languageCode: language
  }
});
```

### Real TTS Integration
```javascript
// In src/routes/tts.js
const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();

const [response] = await client.synthesizeSpeech({
  input: { text },
  voice: { languageCode: language, ssmlGender: 'NEUTRAL' },
  audioConfig: { audioEncoding: 'MP3' }
});
```

### Real OCR Integration
```javascript
// In src/routes/ocr.js
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

const [result] = await client.textDetection(imageBuffer);
const detections = result.textAnnotations;
```

## 📝 API Documentation

Complete API documentation is available at:
- Swagger UI: `http://localhost:3000/api-docs`
- Postman Collection: `./postman/Sahayak-API.postman_collection.json`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: GitHub Issues
- **Email**: backend-support@sahayak.gov.in
- **Documentation**: See `/docs` folder

---

**Built for digital inclusion in India 🇮🇳**