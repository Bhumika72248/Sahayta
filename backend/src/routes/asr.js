const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { optionalAuth } = require('../middleware/auth');
const { Log } = require('../models');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/audio/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'asr-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.wav', '.mp3', '.m4a', '.ogg', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio format. Supported: WAV, MP3, M4A, OGG, WebM'));
    }
  }
});

// Mock ASR responses for different languages
const mockResponses = {
  en: [
    "Hello, I need help with my Aadhaar card application",
    "I want to apply for a PAN card",
    "Help me with passport application",
    "My name is John Doe",
    "I am 30 years old",
    "I live in Mumbai, Maharashtra"
  ],
  hi: [
    "नमस्ते, मुझे आधार कार्ड के लिए आवेदन करना है",
    "मैं पैन कार्ड के लिए आवेदन करना चाहता हूं",
    "मेरा नाम राहुल शर्मा है",
    "मैं 25 साल का हूं",
    "मैं दिल्ली में रहता हूं"
  ],
  regional: [
    "नमस्कार, मला आधार कार्डसाठी अर्ज करायचा आहे",
    "माझे नाव सुनील पाटील आहे",
    "मी मुंबईत राहतो",
    "मला पासपोर्टसाठी मदत हवी"
  ]
};

// ASR transcription endpoint
router.post('/transcribe', optionalAuth, upload.single('audio'), async (req, res, next) => {
  try {
    const { language = 'en', model = 'general' } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_AUDIO',
          message: 'Audio file is required'
        }
      });
    }

    const audioPath = req.file.path;
    const startTime = Date.now();

    // Log the ASR request
    if (req.user) {
      await Log.create({
        user_id: req.user.id,
        feature: 'asr',
        action: 'transcribe',
        message: `ASR transcription requested for language: ${language}`,
        metadata: {
          language,
          model,
          fileSize: req.file.size,
          filename: req.file.filename
        }
      });
    }

    // Mock ASR processing
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Get random mock response based on language
    const responses = mockResponses[language] || mockResponses.en;
    const transcription = responses[Math.floor(Math.random() * responses.length)];
    const confidence = 0.85 + Math.random() * 0.1; // 0.85-0.95
    const duration = 2.0 + Math.random() * 3.0; // 2-5 seconds
    const processingTime = (Date.now() - startTime) / 1000;

    // Generate alternatives
    const alternatives = [
      { text: transcription, confidence },
      { text: transcription.replace(/\b\w+\b/, '[unclear]'), confidence: confidence - 0.1 }
    ];

    // Clean up uploaded file
    try {
      await fs.unlink(audioPath);
    } catch (error) {
      logger.warn('Failed to delete uploaded audio file:', error);
    }

    const response = {
      success: true,
      data: {
        transcription,
        confidence,
        language,
        duration,
        alternatives,
        model,
        processingTime
      },
      requestId: `asr_${Date.now()}`
    };

    logger.info('ASR transcription completed', {
      language,
      confidence,
      processingTime,
      userId: req.user?.id
    });

    res.json(response);

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        logger.warn('Failed to delete uploaded audio file on error:', unlinkError);
      }
    }
    next(error);
  }
});

// Get supported languages
router.get('/languages', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        models: ['general', 'government', 'legal']
      },
      {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिंदी',
        models: ['general', 'government']
      },
      {
        code: 'regional',
        name: 'Marathi',
        nativeName: 'मराठी',
        models: ['general']
      }
    ]
  });
});

module.exports = router;