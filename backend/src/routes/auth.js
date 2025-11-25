const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Register user
router.post('/register', async (req, res, next) => {
  try {
    const { name, phone, password, age, gender, location, language } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this phone number already exists'
        }
      });
    }

    // Hash password
    const passwordHash = password ? await bcrypt.hash(password, 12) : null;

    // Create user
    const user = await User.create({
      name,
      phone,
      password_hash: passwordHash,
      age,
      gender,
      location,
      language: language || 'en'
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info('User registered successfully', { userId: user.id, phone });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          language: user.language
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid phone number or password'
        }
      });
    }

    // Check password
    if (password && user.password_hash) {
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid phone number or password'
          }
        });
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info('User logged in successfully', { userId: user.id, phone });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          language: user.language,
          voiceProfileCreated: user.voice_profile_created
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res, next) => {
  try {
    const token = jwt.sign(
      { userId: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    next(error);
  }
});

// Verify token
router.get('/verify', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        name: req.user.name,
        phone: req.user.phone,
        language: req.user.language,
        voiceProfileCreated: req.user.voice_profile_created
      }
    }
  });
});

module.exports = router;