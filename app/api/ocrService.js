import { API_CONFIG, getHeaders, ERROR_MESSAGES } from './apiConfig';

// Mock OCR responses for different document types
const MOCK_OCR_RESPONSES = {
  aadhaar: {
    documentType: 'aadhaar',
    fields: {
      name: 'JOHN DOE',
      aadhaarNumber: '1234 5678 9012',
      dateOfBirth: '01/01/1990',
      gender: 'MALE',
      address: 'S/O: FATHER NAME\nVILLAGE/TOWN: MUMBAI\nDISTRICT: MUMBAI\nSTATE: MAHARASHTRA\nPIN: 400001'
    },
    confidence: 0.92
  },
  pan: {
    documentType: 'pan',
    fields: {
      name: 'JOHN DOE',
      panNumber: 'ABCDE1234F',
      dateOfBirth: '01/01/1990',
      fatherName: 'FATHER NAME'
    },
    confidence: 0.88
  },
  passport: {
    documentType: 'passport',
    fields: {
      name: 'JOHN DOE',
      passportNumber: 'A1234567',
      dateOfBirth: '01/01/1990',
      placeOfBirth: 'MUMBAI',
      dateOfIssue: '01/01/2020',
      dateOfExpiry: '01/01/2030'
    },
    confidence: 0.85
  }
};

/**
 * Extract text and data from document image using OCR
 * @param {string} imageUri - URI of the captured image
 * @param {string} documentType - Type of document (aadhaar, pan, passport, etc.)
 * @returns {Promise<Object>} OCR extraction result
 */
export const extractDocumentData = async (imageUri, documentType = 'auto') => {
  try {
    console.log('OCR Service: Extracting document data', { imageUri, documentType });
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response based on document type
    let mockData = MOCK_OCR_RESPONSES.aadhaar; // Default to Aadhaar
    
    if (documentType !== 'auto' && MOCK_OCR_RESPONSES[documentType]) {
      mockData = MOCK_OCR_RESPONSES[documentType];
    }
    
    const mockResponse = {
      success: true,
      data: {
        ...mockData,
        imageUri: imageUri,
        extractedText: generateExtractedText(mockData.fields),
        processingTime: 1.8,
        qualityScore: 0.9
      },
      requestId: `ocr_${Date.now()}`
    };
    
    return mockResponse;
    
    /* 
    // Actual API implementation (uncomment when backend is ready)
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
        ...getHeaders(),
        'Content-Type': 'multipart/form-data'
      },
      body: formData,
      timeout: API_CONFIG.TIMEOUT
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
    */
    
  } catch (error) {
    console.error('OCR Service Error:', error);
    
    let userMessage = ERROR_MESSAGES.SERVER_ERROR;
    
    if (error.message.includes('Network')) {
      userMessage = ERROR_MESSAGES.NETWORK_ERROR;
    } else if (error.message.includes('timeout')) {
      userMessage = ERROR_MESSAGES.TIMEOUT_ERROR;
    }
    
    throw new Error(userMessage);
  }
};

/**
 * Validate document image quality before OCR processing
 * @param {string} imageUri - URI of the captured image
 * @returns {Promise<Object>} Quality validation result
 */
export const validateImageQuality = async (imageUri) => {
  try {
    console.log('OCR Service: Validating image quality', { imageUri });
    
    // Mock validation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockValidation = {
      success: true,
      data: {
        isValid: true,
        qualityScore: 0.85,
        issues: [],
        recommendations: []
      }
    };
    
    // Simulate some quality issues randomly
    if (Math.random() < 0.3) {
      mockValidation.data.isValid = false;
      mockValidation.data.qualityScore = 0.45;
      mockValidation.data.issues = ['blur', 'low_light'];
      mockValidation.data.recommendations = [
        'Hold the camera steady',
        'Ensure good lighting',
        'Move closer to the document'
      ];
    }
    
    return mockValidation;
    
  } catch (error) {
    console.error('Image Quality Validation Error:', error);
    throw new Error('Image quality validation failed');
  }
};

/**
 * Get supported document types for OCR
 * @returns {Promise<Array>} List of supported document types
 */
export const getSupportedDocumentTypes = async () => {
  try {
    return {
      success: true,
      data: [
        {
          type: 'aadhaar',
          name: 'Aadhaar Card',
          description: 'Government issued identity card',
          fields: ['name', 'aadhaarNumber', 'dateOfBirth', 'gender', 'address']
        },
        {
          type: 'pan',
          name: 'PAN Card',
          description: 'Permanent Account Number card',
          fields: ['name', 'panNumber', 'dateOfBirth', 'fatherName']
        },
        {
          type: 'passport',
          name: 'Passport',
          description: 'Indian passport',
          fields: ['name', 'passportNumber', 'dateOfBirth', 'placeOfBirth', 'dateOfIssue', 'dateOfExpiry']
        },
        {
          type: 'driving_license',
          name: 'Driving License',
          description: 'Driving license',
          fields: ['name', 'licenseNumber', 'dateOfBirth', 'address', 'validUpto']
        }
      ]
    };
  } catch (error) {
    console.error('Document Types Error:', error);
    throw new Error(ERROR_MESSAGES.SERVER_ERROR);
  }
};

/**
 * Generate extracted text from structured fields
 * @param {Object} fields - Structured field data
 * @returns {string} Raw extracted text
 */
const generateExtractedText = (fields) => {
  return Object.values(fields).join(' ');
};

/**
 * Camera guidance for document alignment
 * @param {Object} cameraFrame - Camera frame dimensions
 * @param {Object} documentBounds - Detected document bounds
 * @returns {Object} Alignment guidance
 */
export const getAlignmentGuidance = (cameraFrame, documentBounds) => {
  // Mock alignment guidance
  const guidance = {
    isAligned: false,
    instructions: [],
    confidence: 0
  };
  
  if (!documentBounds) {
    guidance.instructions.push('Position document in frame');
    return guidance;
  }
  
  // Mock alignment logic
  const centerX = cameraFrame.width / 2;
  const centerY = cameraFrame.height / 2;
  const docCenterX = documentBounds.x + documentBounds.width / 2;
  const docCenterY = documentBounds.y + documentBounds.height / 2;
  
  const offsetX = Math.abs(centerX - docCenterX);
  const offsetY = Math.abs(centerY - docCenterY);
  
  if (offsetX > 50) {
    guidance.instructions.push(docCenterX < centerX ? 'Move document right' : 'Move document left');
  }
  
  if (offsetY > 50) {
    guidance.instructions.push(docCenterY < centerY ? 'Move document down' : 'Move document up');
  }
  
  if (documentBounds.width < cameraFrame.width * 0.6) {
    guidance.instructions.push('Move closer to document');
  }
  
  if (documentBounds.width > cameraFrame.width * 0.9) {
    guidance.instructions.push('Move away from document');
  }
  
  guidance.isAligned = guidance.instructions.length === 0;
  guidance.confidence = guidance.isAligned ? 0.9 : 0.3;
  
  return guidance;
};

/**
 * Expected API Request Format:
 * POST /api/v1/ocr/extract
 * Content-Type: multipart/form-data
 * 
 * Body:
 * - image: File (image/jpeg, image/png)
 * - documentType: String (aadhaar, pan, passport, auto)
 * - extractFields: Boolean (true/false)
 * - language: String (en, hi, regional)
 * 
 * Expected API Response Format:
 * {
 *   "success": true,
 *   "data": {
 *     "documentType": "aadhaar",
 *     "fields": {
 *       "name": "JOHN DOE",
 *       "aadhaarNumber": "1234 5678 9012",
 *       "dateOfBirth": "01/01/1990",
 *       "gender": "MALE",
 *       "address": "Complete address..."
 *     },
 *     "extractedText": "Raw OCR text...",
 *     "confidence": 0.92,
 *     "processingTime": 1.8,
 *     "qualityScore": 0.9
 *   },
 *   "requestId": "ocr_1234567890"
 * }
 */