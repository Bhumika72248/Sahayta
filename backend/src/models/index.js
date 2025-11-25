const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

// User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  language: {
    type: DataTypes.ENUM('en', 'hi', 'regional'),
    defaultValue: 'en'
  },
  voice_profile_created: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  }
});

// Workflow model
const Workflow = sequelize.define('Workflow', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  workflow_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  workflow_data: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  current_step: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  reference_number: {
    type: DataTypes.STRING,
    unique: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

// Document model
const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  workflow_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Workflow,
      key: 'id'
    }
  },
  document_type: {
    type: DataTypes.ENUM('aadhaar', 'pan', 'passport', 'driving_license', 'voter_id', 'birth_certificate', 'address_proof'),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  extracted_fields: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'en'
  }
});

// Sync Queue model
const SyncQueue = sequelize.define('SyncQueue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  endpoint: {
    type: DataTypes.STRING,
    allowNull: false
  },
  method: {
    type: DataTypes.ENUM('GET', 'POST', 'PUT', 'DELETE'),
    defaultValue: 'POST'
  },
  status: {
    type: DataTypes.ENUM('pending', 'synced', 'failed'),
    defaultValue: 'pending'
  },
  synced_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Log model
const Log = sequelize.define('Log', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  feature: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  level: {
    type: DataTypes.ENUM('info', 'warn', 'error', 'debug'),
    defaultValue: 'info'
  }
});

// Define associations
User.hasMany(Workflow, { foreignKey: 'user_id', as: 'workflows' });
User.hasMany(Document, { foreignKey: 'user_id', as: 'documents' });
User.hasMany(SyncQueue, { foreignKey: 'user_id', as: 'syncQueue' });
User.hasMany(Log, { foreignKey: 'user_id', as: 'logs' });

Workflow.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Workflow.hasMany(Document, { foreignKey: 'workflow_id', as: 'documents' });

Document.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Document.belongsTo(Workflow, { foreignKey: 'workflow_id', as: 'workflow' });

SyncQueue.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Log.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  User,
  Workflow,
  Document,
  SyncQueue,
  Log,
  sequelize
};