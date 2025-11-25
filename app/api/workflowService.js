import { API_CONFIG, getHeaders, ERROR_MESSAGES } from './apiConfig';

/**
 * Load workflow definition from local JSON files
 * @param {string} workflowId - Workflow identifier
 * @returns {Promise<Object>} Workflow definition
 */
export const loadWorkflow = async (workflowId) => {
  try {
    console.log('Workflow Service: Loading workflow', { workflowId });
    
    // Mock workflow definitions
    const workflows = {
      'aadhaar-application': {
        id: 'aadhaar-application',
        name: 'Aadhaar Card Application',
        description: 'Apply for new Aadhaar card',
        category: 'identity',
        estimatedTime: '15 minutes',
        steps: [
          {
            step: 1,
            type: 'info',
            key: 'welcome',
            title: 'Welcome',
            content: 'Let\'s help you apply for an Aadhaar card',
            audio: 'workflow.aadhaar.welcome.mp3'
          },
          {
            step: 2,
            type: 'ask',
            key: 'ask_name',
            title: 'Your Name',
            prompt: 'What is your full name?',
            input: 'voice',
            validation: 'required',
            audio: 'workflow.aadhaar.askName.mp3'
          },
          {
            step: 3,
            type: 'ask',
            key: 'ask_age',
            title: 'Your Age',
            prompt: 'What is your age?',
            input: 'voice',
            validation: 'number',
            audio: 'workflow.aadhaar.askAge.mp3'
          },
          {
            step: 4,
            type: 'ocr',
            key: 'scan_address_proof',
            title: 'Address Proof',
            prompt: 'Please scan your address proof document',
            documentType: 'address_proof',
            audio: 'workflow.aadhaar.scanAddress.mp3'
          },
          {
            step: 5,
            type: 'confirm',
            key: 'confirm_details',
            title: 'Confirm Details',
            prompt: 'Please confirm your details',
            audio: 'workflow.aadhaar.confirmDetails.mp3'
          },
          {
            step: 6,
            type: 'submit',
            key: 'submit_application',
            title: 'Submit Application',
            prompt: 'Submitting your application...',
            audio: 'workflow.aadhaar.submit.mp3'
          }
        ]
      },
      'pan-application': {
        id: 'pan-application',
        name: 'PAN Card Application',
        description: 'Apply for new PAN card',
        category: 'tax',
        estimatedTime: '10 minutes',
        steps: [
          {
            step: 1,
            type: 'info',
            key: 'welcome',
            title: 'PAN Application',
            content: 'Let\'s help you apply for a PAN card',
            audio: 'workflow.pan.welcome.mp3'
          },
          {
            step: 2,
            type: 'ask',
            key: 'ask_name',
            title: 'Full Name',
            prompt: 'What is your full name as per documents?',
            input: 'voice',
            validation: 'required',
            audio: 'workflow.pan.askName.mp3'
          },
          {
            step: 3,
            type: 'ask',
            key: 'ask_father_name',
            title: 'Father\'s Name',
            prompt: 'What is your father\'s name?',
            input: 'voice',
            validation: 'required',
            audio: 'workflow.pan.askFatherName.mp3'
          },
          {
            step: 4,
            type: 'ocr',
            key: 'scan_identity_proof',
            title: 'Identity Proof',
            prompt: 'Please scan your identity proof',
            documentType: 'identity_proof',
            audio: 'workflow.pan.scanIdentity.mp3'
          },
          {
            step: 5,
            type: 'submit',
            key: 'submit_application',
            title: 'Submit Application',
            prompt: 'Submitting your PAN application...',
            audio: 'workflow.pan.submit.mp3'
          }
        ]
      },
      'passport-application': {
        id: 'passport-application',
        name: 'Passport Application',
        description: 'Apply for new passport',
        category: 'travel',
        estimatedTime: '20 minutes',
        steps: [
          {
            step: 1,
            type: 'info',
            key: 'welcome',
            title: 'Passport Application',
            content: 'Let\'s help you apply for a passport',
            audio: 'workflow.passport.welcome.mp3'
          },
          {
            step: 2,
            type: 'ask',
            key: 'ask_name',
            title: 'Full Name',
            prompt: 'What is your full name?',
            input: 'voice',
            validation: 'required',
            audio: 'workflow.passport.askName.mp3'
          },
          {
            step: 3,
            type: 'ask',
            key: 'ask_place_of_birth',
            title: 'Place of Birth',
            prompt: 'Where were you born?',
            input: 'voice',
            validation: 'required',
            audio: 'workflow.passport.askPlaceOfBirth.mp3'
          },
          {
            step: 4,
            type: 'ocr',
            key: 'scan_birth_certificate',
            title: 'Birth Certificate',
            prompt: 'Please scan your birth certificate',
            documentType: 'birth_certificate',
            audio: 'workflow.passport.scanBirth.mp3'
          },
          {
            step: 5,
            type: 'ocr',
            key: 'scan_address_proof',
            title: 'Address Proof',
            prompt: 'Please scan your address proof',
            documentType: 'address_proof',
            audio: 'workflow.passport.scanAddress.mp3'
          },
          {
            step: 6,
            type: 'submit',
            key: 'submit_application',
            title: 'Submit Application',
            prompt: 'Submitting your passport application...',
            audio: 'workflow.passport.submit.mp3'
          }
        ]
      }
    };
    
    const workflow = workflows[workflowId];
    
    if (!workflow) {
      throw new Error(`Workflow '${workflowId}' not found`);
    }
    
    return {
      success: true,
      data: workflow
    };
    
  } catch (error) {
    console.error('Workflow Load Error:', error);
    throw new Error(`Failed to load workflow: ${error.message}`);
  }
};

/**
 * Get list of available workflows
 * @param {string} category - Filter by category (optional)
 * @returns {Promise<Array>} List of available workflows
 */
export const getAvailableWorkflows = async (category = null) => {
  try {
    console.log('Workflow Service: Getting available workflows', { category });
    
    const workflows = [
      {
        id: 'aadhaar-application',
        name: 'Aadhaar Card Application',
        description: 'Apply for new Aadhaar card',
        category: 'identity',
        icon: 'aadhaar-icon',
        estimatedTime: '15 minutes',
        difficulty: 'easy'
      },
      {
        id: 'pan-application',
        name: 'PAN Card Application',
        description: 'Apply for new PAN card',
        category: 'tax',
        icon: 'pan-icon',
        estimatedTime: '10 minutes',
        difficulty: 'easy'
      },
      {
        id: 'passport-application',
        name: 'Passport Application',
        description: 'Apply for new passport',
        category: 'travel',
        icon: 'passport-icon',
        estimatedTime: '20 minutes',
        difficulty: 'medium'
      },
      {
        id: 'driving-license',
        name: 'Driving License',
        description: 'Apply for driving license',
        category: 'transport',
        icon: 'license-icon',
        estimatedTime: '25 minutes',
        difficulty: 'medium'
      },
      {
        id: 'voter-id',
        name: 'Voter ID Card',
        description: 'Apply for voter ID card',
        category: 'civic',
        icon: 'voter-icon',
        estimatedTime: '12 minutes',
        difficulty: 'easy'
      },
      {
        id: 'ration-card',
        name: 'Ration Card',
        description: 'Apply for ration card',
        category: 'welfare',
        icon: 'ration-icon',
        estimatedTime: '18 minutes',
        difficulty: 'medium'
      }
    ];
    
    let filteredWorkflows = workflows;
    
    if (category) {
      filteredWorkflows = workflows.filter(w => w.category === category);
    }
    
    return {
      success: true,
      data: filteredWorkflows
    };
    
  } catch (error) {
    console.error('Available Workflows Error:', error);
    throw new Error(ERROR_MESSAGES.SERVER_ERROR);
  }
};

/**
 * Submit completed workflow data
 * @param {string} workflowId - Workflow identifier
 * @param {Object} workflowData - Collected workflow data
 * @returns {Promise<Object>} Submission result
 */
export const submitWorkflow = async (workflowId, workflowData) => {
  try {
    console.log('Workflow Service: Submitting workflow', { workflowId, workflowData });
    
    // Mock submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResponse = {
      success: true,
      data: {
        submissionId: `SUB_${Date.now()}`,
        workflowId: workflowId,
        status: 'submitted',
        referenceNumber: `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        estimatedProcessingTime: '3-5 business days',
        nextSteps: [
          'Your application has been submitted successfully',
          'You will receive SMS updates on your registered mobile number',
          'Track your application status using the reference number'
        ]
      },
      requestId: `workflow_${Date.now()}`
    };
    
    return mockResponse;
    
    /* 
    // Actual API implementation (uncomment when backend is ready)
    const requestBody = {
      workflowId: workflowId,
      data: workflowData,
      submittedAt: new Date().toISOString()
    };
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKFLOWS}/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestBody),
      timeout: API_CONFIG.TIMEOUT
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
    */
    
  } catch (error) {
    console.error('Workflow Submission Error:', error);
    throw new Error('Failed to submit workflow. Please try again.');
  }
};

/**
 * Validate workflow step data
 * @param {Object} step - Workflow step definition
 * @param {any} value - User input value
 * @returns {Object} Validation result
 */
export const validateStepData = (step, value) => {
  const validation = {
    isValid: true,
    errors: []
  };
  
  if (step.validation === 'required' && (!value || value.trim() === '')) {
    validation.isValid = false;
    validation.errors.push('This field is required');
  }
  
  if (step.validation === 'number' && value && isNaN(value)) {
    validation.isValid = false;
    validation.errors.push('Please enter a valid number');
  }
  
  if (step.validation === 'email' && value && !isValidEmail(value)) {
    validation.isValid = false;
    validation.errors.push('Please enter a valid email address');
  }
  
  return validation;
};

/**
 * Helper function to validate email
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Expected Workflow JSON Schema:
 * {
 *   "id": "workflow-id",
 *   "name": "Workflow Name",
 *   "description": "Workflow description",
 *   "category": "category-name",
 *   "estimatedTime": "15 minutes",
 *   "steps": [
 *     {
 *       "step": 1,
 *       "type": "info|ask|ocr|confirm|submit",
 *       "key": "unique_step_key",
 *       "title": "Step Title",
 *       "prompt": "Step prompt text",
 *       "input": "voice|text|camera",
 *       "validation": "required|number|email",
 *       "audio": "audio_file_name.mp3"
 *     }
 *   ]
 * }
 */