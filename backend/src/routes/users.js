const express = require('express');
const { User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get user profile
router.get('/:id/profile', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user is accessing their own profile
    if (req.user.id !== id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      });
    }

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        age: user.age,
        gender: user.gender,
        location: user.location,
        language: user.language,
        voiceProfileCreated: user.voice_profile_created,
        phone: user.phone,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/:id/profile', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, age, gender, location, language, voiceProfileCreated } = req.body;

    // Check if user is updating their own profile
    if (req.user.id !== id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Update user
    await user.update({
      name: name || user.name,
      age: age || user.age,
      gender: gender || user.gender,
      location: location || user.location,
      language: language || user.language,
      voice_profile_created: voiceProfileCreated !== undefined ? voiceProfileCreated : user.voice_profile_created
    });

    logger.info('User profile updated', { userId: user.id });

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        age: user.age,
        gender: user.gender,
        location: user.location,
        language: user.language,
        voiceProfileCreated: user.voice_profile_created,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create/Update voice profile
router.post('/:id/voice-profile', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user is updating their own profile
    if (req.user.id !== id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Mark voice profile as created
    await user.update({
      voice_profile_created: true
    });

    logger.info('Voice profile created', { userId: user.id });

    res.json({
      success: true,
      data: {
        voiceProfileCreated: true,
        message: 'Voice profile created successfully'
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;