const { sequelize } = require('./connection');
const { User, Workflow, Document, SyncQueue, Log } = require('../models');
const logger = require('../utils/logger');

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');

    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Create tables
    await sequelize.sync({ force: false, alter: true });
    logger.info('Database tables created/updated successfully');

    // Create indexes for better performance
    await createIndexes();
    logger.info('Database indexes created successfully');

    logger.info('Database migrations completed successfully');
    process.exit(0);

  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

async function createIndexes() {
  try {
    // User indexes
    await sequelize.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone ON "Users" (phone);');
    await sequelize.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON "Users" (email);');
    
    // Workflow indexes
    await sequelize.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflows_user_id ON "Workflows" (user_id);');
    await sequelize.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflows_reference_number ON "Workflows" (reference_number);');
    await sequelize.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflows_status ON "Workflows" (status);');
    await sequelize.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflows_created_at ON "Workflows" (created_at);');
    
    // Document indexes
    await sequelize.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_user_id ON "Documents" (user_id);');
    await sequelize.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_workflow_id ON "Documents" (workflow_id);');
    await sequelize.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_type ON "Documents" (document_type);');
    
    // Sync queue indexes
    await sequelize.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sync_queue_user_id ON "SyncQueues" (user_id);');
    await sequelize.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sync_queue_status ON "SyncQueues" (status);');
    await sequelize.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sync_queue_created_at ON "SyncQueues" (created_at);');
    
    // Log indexes
    await sequelize.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_logs_user_id ON "Logs" (user_id);');
    await sequelize.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_logs_feature ON "Logs" (feature);');
    await sequelize.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_logs_created_at ON "Logs" (created_at);');

  } catch (error) {
    // Ignore index creation errors (they might already exist)
    logger.warn('Some indexes might already exist:', error.message);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };