const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { optionalAuth } = require('../middleware/auth');
const { Document, Log } = require('../models');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Supported: JPG, PNG, BMP, TIFF'));
    }
  }
});

// Mock OCR data for different document types
const mockOCRData = {
  aadhaar: {
    name: 'JOHN DOE',
    aadhaarNumber: '1234 5678 9012',
    dateOfBirth: '01/01/1990',
    gender: 'MALE',
    address: 'S/O: FATHER NAME\nVILLAGE: MUMBAI\nDISTRICT: MUMBAI\nSTATE: MAHARASHTRA\nPIN: 400001'
  },
  pan: {
    name: 'JOHN DOE',
    panNumber: 'ABCDE1234F',
    dateOfBirth: '01/01/1990',
    fatherName: 'FATHER NAME'
  },
  passport: {
    name: 'JOHN DOE',
    passportNumber: 'A1234567',
    dateOfBirth: '01/01/1990',
    placeOfBirth: 'MUMBAI',
    dateOfIssue: '01/01/2020',
    dateOfExpiry: '01/01/2030',
    nationality: 'INDIAN'
  },
  driving_license: {
    name: 'JOHN DOE',
    licenseNumber: 'MH1234567890',
    dateOfBirth: '01/01/1990',
    address: 'MUMBAI, MAHARASHTRA',
    validUpto: '01/01/2030',
    vehicleClass: 'LMV'
  },
  voter_id: {
    name: 'JOHN DOE',
    voterIdNumber: 'ABC1234567',
    dateOfBirth: '01/01/1990',
    gender: 'MALE',
    address: 'MUMBAI, MAHARASHTRA'
  }
};

// OCR extraction endpoint
router.post('/extract', optionalAuth, upload.single('image'), async (req, res, next) => {
  try {
    const { documentType = 'auto', extractFields = 'true', language = 'en' } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_IMAGE',
          message: 'Image file is required'
        }
      });
    }

    const imagePath = req.file.path;
    const startTime = Date.now();

    // Validate and process image
    try {
      const imageInfo = await sharp(imagePath).metadata();
      
      // Check image dimensions
      if (imageInfo.width < 200 || imageInfo.height < 200) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'IMAGE_TOO_SMALL',
            message: 'Image resolution too low. Minimum 200x200 pixels required'
          }
        });
      }

      // Enhance image for better OCR
      await sharp(imagePath)
        .resize(null, 1000, { withoutEnlargement: true })
        .sharpen()
        .normalize()
        .toFile(imagePath + '_processed.jpg');

    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_IMAGE',
          message: 'Invalid or corrupted image file'
        }
      });
    }

    // Log the OCR request
    if (req.user) {
      await Log.create({
        user_id: req.user.id,
        feature: 'ocr',
        action: 'extract',
        message: `OCR extraction requested for document type: ${documentType}`,
        metadata: {
          documentType,
          language,
          fileSize: req.file.size,
          filename: req.file.filename
        }
      });
    }

    // Mock OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

    // Determine document type if auto-detection
    let detectedType = documentType;
    if (documentType === 'auto') {
      const types = Object.keys(mockOCRData);
      detectedType = types[Math.floor(Math.random() * types.length)];
    }

    // Get mock data for the document type
    const fields = mockOCRData[detectedType] || mockOCRData.aadhaar;
    const confidence = 0.85 + Math.random() * 0.1; // 0.85-0.95
    const processingTime = (Date.now() - startTime) / 1000;

    // Generate bounding boxes (mock)
    const boundingBoxes = {};
    Object.keys(fields).forEach((field, index) => {
      boundingBoxes[field] = {
        x: 100 + (index * 50),
        y: 150 + (index * 30),
        width: 200,
        height: 25
      };
    });

    // Save document record
    let documentRecord = null;
    if (req.user) {
      documentRecord = await Document.create({
        user_id: req.user.id,
        document_type: detectedType,
        file_path: imagePath,
        extracted_fields: fields,
        confidence: confidence,
        language: language
      });
    }

    const response = {
      success: true,
      data: {
        documentType: detectedType,
        fields,
        extractedText: Object.values(fields).join(' '),
        confidence,
        processingTime,
        qualityScore: 0.9,
        boundingBoxes,
        language,
        documentId: documentRecord?.id
      },
      requestId: `ocr_${Date.now()}`
    };

    logger.info('OCR extraction completed', {
      documentType: detectedType,
      confidence,
      processingTime,
      userId: req.user?.id
    });

    // Clean up processed image
    try {
      await fs.unlink(imagePath + '_processed.jpg');
    } catch (error) {
      logger.warn('Failed to delete processed image:', error);
    }

    res.json(response);

  } catch (error) {
    // Clean up uploaded files on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
        await fs.unlink(req.file.path + '_processed.jpg');
      } catch (unlinkError) {
        logger.warn('Failed to delete uploaded files on error:', unlinkError);
      }
    }
    next(error);
  }
});

// Get supported document types
router.get('/document-types', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        type: 'aadhaar',
        name: 'Aadhaar Card',
        description: 'Government issued identity card',
        fields: ['name', 'aadhaarNumber', 'dateOfBirth', 'gender', 'address'],
        sampleImage: '/samples/aadhaar.jpg'
      },
      {
        type: 'pan',
        name: 'PAN Card',
        description: 'Permanent Account Number card',
        fields: ['name', 'panNumber', 'dateOfBirth', 'fatherName'],
        sampleImage: '/samples/pan.jpg'
      },
      {
        type: 'passport',
        name: 'Passport',
        description: 'Indian passport',
        fields: ['name', 'passportNumber', 'dateOfBirth', 'placeOfBirth', 'dateOfIssue', 'dateOfExpiry'],
        sampleImage: '/samples/passport.jpg'
      },
      {
        type: 'driving_license',
        name: 'Driving License',
        description: 'Driving license',
        fields: ['name', 'licenseNumber', 'dateOfBirth', 'address', 'validUpto'],
        sampleImage: '/samples/license.jpg'
      },
      {
        type: 'voter_id',
        name: 'Voter ID Card',
        description: 'Election commission voter ID',
        fields: ['name', 'voterIdNumber', 'dateOfBirth', 'gender', 'address'],
        sampleImage: '/samples/voter.jpg'
      }
    ]
  });
});

// Validate image quality
router.post('/validate', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_IMAGE',
          message: 'Image file is required'
        }
      });
    }

    const imagePath = req.file.path;
    
    try {
      const imageInfo = await sharp(imagePath).metadata();
      const stats = await fs.stat(imagePath);
      
      const issues = [];
      const recommendations = [];
      let qualityScore = 1.0;

      // Check resolution
      if (imageInfo.width < 800 || imageInfo.height < 600) {
        issues.push('low_resolution');
        recommendations.push('Use higher resolution camera or move closer');
        qualityScore -= 0.3;
      }

      // Check file size (too small might indicate poor quality)
      if (stats.size < 100000) { // 100KB
        issues.push('low_quality');
        recommendations.push('Ensure good lighting and focus');
        qualityScore -= 0.2;
      }

      // Mock blur detection
      if (Math.random() < 0.2) {
        issues.push('blur');
        recommendations.push('Hold camera steady and ensure focus');
        qualityScore -= 0.3;
      }

      const isValid = qualityScore > 0.5;

      // Clean up uploaded file
      await fs.unlink(imagePath);

      res.json({
        success: true,
        data: {
          isValid,
          qualityScore: Math.max(0, qualityScore),
          issues,
          recommendations,
          imageInfo: {
            width: imageInfo.width,
            height: imageInfo.height,
            format: imageInfo.format,
            size: stats.size
          }
        }
      });

    } catch (error) {
      await fs.unlink(imagePath);
      throw error;
    }

  } catch (error) {
    next(error);
  }
});

module.exports = router;