const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { optionalAuth } = require('../middleware/auth');
const { Log } = require('../models');
const logger = require('../utils/logger');

const router = express.Router();

// Available voices configuration
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

// TTS synthesis endpoint
router.post('/synthesize', optionalAuth, async (req, res, next) => {
  try {
    const {
      text,
      language = 'en',
      voice,
      speed = 1.0,
      pitch = 1.0,
      format = 'mp3'
    } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TEXT',
          message: 'Text is required for synthesis'
        }
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TEXT_TOO_LONG',
          message: 'Text exceeds maximum length of 5000 characters'
        }
      });
    }

    // Validate voice
    const availableVoices = voices[language] || voices.en;
    const selectedVoice = voice 
      ? availableVoices.find(v => v.id === voice)
      : availableVoices[0];

    if (!selectedVoice) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VOICE_NOT_AVAILABLE',
          message: 'Requested voice is not available'
        }
      });
    }

    // Generate cache key
    const cacheKey = crypto
      .createHash('md5')
      .update(`${text}-${language}-${selectedVoice.id}-${speed}-${pitch}`)
      .digest('hex');

    const audioFilename = `tts_${cacheKey}.${format}`;
    const audioPath = path.join(__dirname, '../../audio', audioFilename);
    const audioUri = `${req.protocol}://${req.get('host')}/audio/${audioFilename}`;

    // Check if cached file exists
    try {
      await fs.access(audioPath);
      
      // File exists, return cached version
      const stats = await fs.stat(audioPath);
      const duration = Math.ceil(text.length / 10); // Rough estimate
      
      logger.info('TTS served from cache', {
        language,
        voice: selectedVoice.id,
        textLength: text.length,
        userId: req.user?.id
      });

      return res.json({
        success: true,
        data: {
          audioUri,
          text,
          language,
          duration,
          voice: selectedVoice.id,
          format,
          sampleRate: 22050,
          cached: true,
          expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
        },
        requestId: `tts_${Date.now()}`
      });
    } catch (error) {
      // File doesn't exist, generate new one
    }

    // Log the TTS request
    if (req.user) {
      await Log.create({
        user_id: req.user.id,
        feature: 'tts',
        action: 'synthesize',
        message: `TTS synthesis requested for language: ${language}`,
        metadata: {
          language,
          voice: selectedVoice.id,
          textLength: text.length,
          speed,
          pitch
        }
      });
    }

    // Mock TTS processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Create mock audio file (empty file for demo)
    await fs.writeFile(audioPath, Buffer.alloc(1024)); // 1KB empty file

    const duration = Math.ceil(text.length / 10); // Rough estimate: 10 chars per second

    const response = {
      success: true,
      data: {
        audioUri,
        text,
        language,
        duration,
        voice: selectedVoice.id,
        format,
        sampleRate: 22050,
        cached: false,
        expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
      },
      requestId: `tts_${Date.now()}`
    };

    logger.info('TTS synthesis completed', {
      language,
      voice: selectedVoice.id,
      duration,
      textLength: text.length,
      userId: req.user?.id
    });

    res.json(response);

  } catch (error) {
    next(error);
  }
});

// Get available voices
router.get('/voices', (req, res) => {
  const { language } = req.query;
  
  if (language && voices[language]) {
    return res.json({
      success: true,
      data: { [language]: voices[language] }
    });
  }

  res.json({
    success: true,
    data: voices
  });
});

// Play audio endpoint (for immediate playback)
router.post('/play', optionalAuth, async (req, res, next) => {
  try {
    const { text, language = 'en', voice, speed = 1.0 } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TEXT',
          message: 'Text is required'
        }
      });
    }

    // Log the play request
    if (req.user) {
      await Log.create({
        user_id: req.user.id,
        feature: 'tts',
        action: 'play',
        message: `TTS play requested for language: ${language}`,
        metadata: {
          language,
          voice,
          textLength: text.length,
          speed
        }
      });
    }

    // Mock immediate playback
    await new Promise(resolve => setTimeout(resolve, 500));

    res.json({
      success: true,
      data: {
        played: true,
        text,
        language,
        duration: Math.ceil(text.length / 10)
      },
      requestId: `tts_play_${Date.now()}`
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;