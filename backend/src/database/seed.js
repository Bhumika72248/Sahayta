const bcrypt = require('bcryptjs');
const { User, Workflow, Document, Log } = require('../models');
const logger = require('../utils/logger');

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    // Create test users
    const users = await createTestUsers();
    logger.info(`Created ${users.length} test users`);

    // Create sample workflows
    const workflows = await createSampleWorkflows(users);
    logger.info(`Created ${workflows.length} sample workflows`);

    // Create sample documents
    const documents = await createSampleDocuments(users, workflows);
    logger.info(`Created ${documents.length} sample documents`);

    // Create sample logs
    await createSampleLogs(users);
    logger.info('Created sample logs');

    logger.info('Database seeding completed successfully');
    process.exit(0);

  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

async function createTestUsers() {
  const testUsers = [
    {
      name: 'John Doe',
      phone: '+919876543210',
      password_hash: await bcrypt.hash('password123', 12),
      age: '30',
      gender: 'Male',
      location: 'Mumbai, Maharashtra',
      language: 'en',
      voice_profile_created: true,
      email: 'john.doe@example.com'
    },
    {
      name: 'राहुल शर्मा',
      phone: '+919876543211',
      password_hash: await bcrypt.hash('password123', 12),
      age: '25',
      gender: 'Male',
      location: 'दिल्ली',
      language: 'hi',
      voice_profile_created: true,
      email: 'rahul.sharma@example.com'
    },
    {
      name: 'सुनील पाटील',
      phone: '+919876543212',
      password_hash: await bcrypt.hash('password123', 12),
      age: '35',
      gender: 'Male',
      location: 'पुणे, महाराष्ट्र',
      language: 'regional',
      voice_profile_created: false,
      email: 'sunil.patil@example.com'
    },
    {
      name: 'Priya Singh',
      phone: '+919876543213',
      age: '28',
      gender: 'Female',
      location: 'Bangalore, Karnataka',
      language: 'en',
      voice_profile_created: true,
      email: 'priya.singh@example.com'
    }
  ];

  const users = [];
  for (const userData of testUsers) {
    try {
      const user = await User.create(userData);
      users.push(user);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        logger.info(`User with phone ${userData.phone} already exists, skipping...`);
        const existingUser = await User.findOne({ where: { phone: userData.phone } });
        if (existingUser) users.push(existingUser);
      } else {
        throw error;
      }
    }
  }

  return users;
}

async function createSampleWorkflows(users) {
  const sampleWorkflows = [
    {
      user_id: users[0].id,
      workflow_type: 'aadhaar-application',
      workflow_data: {
        ask_name: 'John Doe',
        ask_age: '30',
        ask_gender: 'Male',
        ask_mobile: '+919876543210',
        scan_address_proof: {
          documentType: 'electricity_bill',
          extractedFields: {
            name: 'John Doe',
            address: 'Mumbai, Maharashtra'
          }
        }
      },
      current_step: 6,
      status: 'completed',
      reference_number: 'REF123ABC',
      completed_at: new Date()
    },
    {
      user_id: users[1].id,
      workflow_type: 'pan-application',
      workflow_data: {
        ask_name: 'राहुल शर्मा',
        ask_father_name: 'श्याम शर्मा',
        scan_identity_proof: {
          documentType: 'aadhaar',
          extractedFields: {
            name: 'राहुल शर्मा',
            aadhaarNumber: '1234 5678 9012'
          }
        }
      },
      current_step: 4,
      status: 'completed',
      reference_number: 'REF456DEF',
      completed_at: new Date()
    },
    {
      user_id: users[2].id,
      workflow_type: 'passport-application',
      workflow_data: {
        ask_name: 'सुनील पाटील',
        ask_place_of_birth: 'पुणे'
      },
      current_step: 2,
      status: 'in_progress',
      reference_number: 'REF789GHI'
    },
    {
      user_id: users[3].id,
      workflow_type: 'aadhaar-application',
      workflow_data: {
        ask_name: 'Priya Singh',
        ask_age: '28'
      },
      current_step: 3,
      status: 'in_progress',
      reference_number: 'REF012JKL'
    }
  ];

  const workflows = [];
  for (const workflowData of sampleWorkflows) {
    const workflow = await Workflow.create(workflowData);
    workflows.push(workflow);
  }

  return workflows;
}

async function createSampleDocuments(users, workflows) {
  const sampleDocuments = [
    {
      user_id: users[0].id,
      workflow_id: workflows[0].id,
      document_type: 'aadhaar',
      file_path: '/uploads/documents/sample-aadhaar.jpg',
      extracted_fields: {
        name: 'JOHN DOE',
        aadhaarNumber: '1234 5678 9012',
        dateOfBirth: '01/01/1990',
        gender: 'MALE',
        address: 'MUMBAI, MAHARASHTRA'
      },
      confidence: 0.92,
      language: 'en'
    },
    {
      user_id: users[1].id,
      workflow_id: workflows[1].id,
      document_type: 'pan',
      file_path: '/uploads/documents/sample-pan.jpg',
      extracted_fields: {
        name: 'RAHUL SHARMA',
        panNumber: 'ABCDE1234F',
        dateOfBirth: '15/05/1995',
        fatherName: 'SHYAM SHARMA'
      },
      confidence: 0.88,
      language: 'hi'
    },
    {
      user_id: users[2].id,
      document_type: 'passport',
      file_path: '/uploads/documents/sample-passport.jpg',
      extracted_fields: {
        name: 'SUNIL PATIL',
        passportNumber: 'A1234567',
        dateOfBirth: '10/03/1985',
        placeOfBirth: 'PUNE'
      },
      confidence: 0.85,
      language: 'regional'
    }
  ];

  const documents = [];
  for (const docData of sampleDocuments) {
    const document = await Document.create(docData);
    documents.push(document);
  }

  return documents;
}

async function createSampleLogs(users) {
  const sampleLogs = [
    {
      user_id: users[0].id,
      feature: 'asr',
      action: 'transcribe',
      message: 'ASR transcription completed successfully',
      metadata: {
        language: 'en',
        confidence: 0.95,
        duration: 3.2
      },
      level: 'info'
    },
    {
      user_id: users[1].id,
      feature: 'tts',
      action: 'synthesize',
      message: 'TTS synthesis completed',
      metadata: {
        language: 'hi',
        textLength: 45,
        voice: 'hi-female-1'
      },
      level: 'info'
    },
    {
      user_id: users[2].id,
      feature: 'ocr',
      action: 'extract',
      message: 'OCR extraction completed',
      metadata: {
        documentType: 'passport',
        confidence: 0.85,
        language: 'regional'
      },
      level: 'info'
    },
    {
      user_id: users[3].id,
      feature: 'workflow',
      action: 'start',
      message: 'Workflow started',
      metadata: {
        workflowType: 'aadhaar-application',
        step: 1
      },
      level: 'info'
    }
  ];

  for (const logData of sampleLogs) {
    await Log.create(logData);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };