const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { Workflow, User, Log } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Workflow definitions (matching frontend JSON structure)
const workflowDefinitions = {
  'aadhaar-application': {
    id: 'aadhaar-application',
    name: 'Aadhaar Card Application',
    description: 'Apply for new Aadhaar card',
    category: 'identity',
    estimatedTime: '15 minutes',
    difficulty: 'easy',
    steps: [
      {
        step: 1,
        type: 'info',
        key: 'welcome',
        title: 'Welcome to Aadhaar Application',
        prompt: 'Welcome to Aadhaar card application. I will guide you through the process step by step.',
        audio: 'workflow.aadhaar.welcome.mp3'
      },
      {
        step: 2,
        type: 'ask',
        key: 'ask_name',
        title: 'Full Name',
        prompt: 'What is your full name as it should appear on the Aadhaar card?',
        input: 'voice',
        validation: 'required',
        audio: 'workflow.aadhaar.askName.mp3'
      },
      {
        step: 3,
        type: 'ask',
        key: 'ask_age',
        title: 'Age',
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
        prompt: 'Please review all information and confirm',
        audio: 'workflow.aadhaar.confirmDetails.mp3'
      },
      {
        step: 6,
        type: 'submit',
        key: 'submit_application',
        title: 'Submit Application',
        prompt: 'Submitting your Aadhaar application...',
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
    difficulty: 'easy',
    steps: [
      {
        step: 1,
        type: 'info',
        key: 'welcome',
        title: 'PAN Application',
        prompt: 'Let\'s help you apply for a PAN card',
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
        type: 'ocr',
        key: 'scan_identity_proof',
        title: 'Identity Proof',
        prompt: 'Please scan your identity proof',
        documentType: 'identity_proof',
        audio: 'workflow.pan.scanIdentity.mp3'
      },
      {
        step: 4,
        type: 'submit',
        key: 'submit_application',
        title: 'Submit Application',
        prompt: 'Submitting your PAN application...',
        audio: 'workflow.pan.submit.mp3'
      }
    ]
  }
};

// Get available workflows
router.get('/', (req, res) => {
  const { category } = req.query;
  
  let workflows = Object.values(workflowDefinitions).map(w => ({
    id: w.id,
    name: w.name,
    description: w.description,
    category: w.category,
    estimatedTime: w.estimatedTime,
    difficulty: w.difficulty,
    icon: w.id.split('-')[0] // Extract icon name from ID
  }));

  if (category && category !== 'all') {
    workflows = workflows.filter(w => w.category === category);
  }

  res.json({
    success: true,
    data: workflows
  });
});

// Get specific workflow definition
router.get('/:workflowId', (req, res, next) => {
  try {
    const { workflowId } = req.params;
    const workflow = workflowDefinitions[workflowId];

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'WORKFLOW_NOT_FOUND',
          message: 'Workflow not found'
        }
      });
    }

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
});

// Get user's workflows
router.get('/user/:userId', authenticateToken, async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if user is accessing their own workflows
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      });
    }

    const workflows = await Workflow.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 50
    });

    const formattedWorkflows = workflows.map(w => ({
      id: w.id,
      workflowType: w.workflow_type,
      workflowData: w.workflow_data,
      currentStep: w.current_step,
      status: w.status,
      referenceNumber: w.reference_number,
      createdAt: w.created_at,
      completedAt: w.completed_at
    }));

    res.json({
      success: true,
      data: formattedWorkflows
    });
  } catch (error) {
    next(error);
  }
});

// Submit workflow
router.post('/submit', authenticateToken, async (req, res, next) => {
  try {
    const { workflowId, data, submittedAt } = req.body;

    if (!workflowId || !data) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_DATA',
          message: 'Workflow ID and data are required'
        }
      });
    }

    // Validate workflow exists
    const workflowDef = workflowDefinitions[workflowId];
    if (!workflowDef) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_WORKFLOW',
          message: 'Invalid workflow ID'
        }
      });
    }

    // Generate reference number
    const referenceNumber = `REF${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    // Create workflow record
    const workflow = await Workflow.create({
      user_id: req.user.id,
      workflow_type: workflowId,
      workflow_data: data,
      current_step: workflowDef.steps.length,
      status: 'completed',
      reference_number: referenceNumber,
      completed_at: new Date()
    });

    // Log workflow submission
    await Log.create({
      user_id: req.user.id,
      feature: 'workflow',
      action: 'submit',
      message: `Workflow ${workflowId} submitted successfully`,
      metadata: {
        workflowId,
        referenceNumber,
        dataKeys: Object.keys(data)
      }
    });

    // Mock processing time based on workflow
    const processingTimes = {
      'aadhaar-application': '90 days',
      'pan-application': '15-20 business days',
      'passport-application': '30-45 days'
    };

    const nextSteps = [
      'Your application has been submitted successfully',
      'You will receive SMS updates on your registered mobile number',
      'Track your application status using the reference number',
      'Visit the nearest center if biometric verification is required'
    ];

    const response = {
      success: true,
      data: {
        submissionId: workflow.id,
        workflowId,
        status: 'submitted',
        referenceNumber,
        estimatedProcessingTime: processingTimes[workflowId] || '15-30 business days',
        trackingUrl: `${req.protocol}://${req.get('host')}/api/v1/workflows/track/${referenceNumber}`,
        nextSteps,
        requiredActions: []
      },
      requestId: `workflow_${Date.now()}`
    };

    logger.info('Workflow submitted successfully', {
      workflowId,
      referenceNumber,
      userId: req.user.id
    });

    res.status(201).json(response);

  } catch (error) {
    next(error);
  }
});

// Track workflow by reference number
router.get('/track/:referenceNumber', async (req, res, next) => {
  try {
    const { referenceNumber } = req.params;

    const workflow = await Workflow.findOne({
      where: { reference_number: referenceNumber },
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'phone']
      }]
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'WORKFLOW_NOT_FOUND',
          message: 'Workflow not found with this reference number'
        }
      });
    }

    // Mock timeline based on status
    const timeline = [
      {
        stage: 'submitted',
        timestamp: workflow.created_at,
        description: 'Application submitted successfully'
      }
    ];

    if (workflow.status === 'completed') {
      timeline.push({
        stage: 'processing',
        timestamp: new Date(workflow.created_at.getTime() + 24 * 60 * 60 * 1000),
        description: 'Application under review'
      });
    }

    const progress = workflow.status === 'completed' ? 100 : 
                    workflow.status === 'in_progress' ? 60 : 25;

    res.json({
      success: true,
      data: {
        referenceNumber,
        workflowType: workflow.workflow_type,
        status: workflow.status,
        currentStage: workflow.status === 'completed' ? 'completed' : 'processing',
        progress,
        timeline,
        estimatedCompletion: workflow.completed_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        submittedAt: workflow.created_at,
        applicantName: workflow.user?.name
      }
    });

  } catch (error) {
    next(error);
  }
});

// Update workflow step
router.put('/:workflowId/step', authenticateToken, async (req, res, next) => {
  try {
    const { workflowId } = req.params;
    const { stepData, currentStep } = req.body;

    const workflow = await Workflow.findOne({
      where: {
        id: workflowId,
        user_id: req.user.id
      }
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'WORKFLOW_NOT_FOUND',
          message: 'Workflow not found'
        }
      });
    }

    // Update workflow data and step
    const updatedData = { ...workflow.workflow_data, ...stepData };
    
    await workflow.update({
      workflow_data: updatedData,
      current_step: currentStep,
      status: 'in_progress'
    });

    res.json({
      success: true,
      data: {
        workflowId: workflow.id,
        currentStep,
        workflowData: updatedData,
        status: workflow.status
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;