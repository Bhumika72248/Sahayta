const express = require('express');
const { SyncQueue, Workflow, User, Log } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Bulk sync endpoint for offline data
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { items, deviceId, lastSyncTime } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SYNC_DATA',
          message: 'Items array is required'
        }
      });
    }

    const results = [];
    let successful = 0;
    let failed = 0;

    // Process each sync item
    for (const item of items) {
      try {
        const { id: localId, type, data, timestamp } = item;

        let result = {
          localId,
          status: 'failed',
          error: null
        };

        // Process different types of sync items
        switch (type) {
          case 'workflow_submission':
            result = await processWorkflowSubmission(req.user.id, data, localId);
            break;
            
          case 'profile_update':
            result = await processProfileUpdate(req.user.id, data, localId);
            break;
            
          case 'document_upload':
            result = await processDocumentUpload(req.user.id, data, localId);
            break;
            
          default:
            result.error = 'Unknown sync item type';
        }

        if (result.status === 'success') {
          successful++;
        } else {
          failed++;
          
          // Add to sync queue for retry
          await SyncQueue.create({
            user_id: req.user.id,
            data: item,
            endpoint: '/api/v1/sync',
            method: 'POST',
            status: 'failed',
            error_message: result.error
          });
        }

        results.push(result);

      } catch (error) {
        logger.error('Sync item processing error:', error);
        failed++;
        
        results.push({
          localId: item.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Log sync operation
    await Log.create({
      user_id: req.user.id,
      feature: 'sync',
      action: 'bulk_sync',
      message: `Bulk sync completed: ${successful} successful, ${failed} failed`,
      metadata: {
        deviceId,
        itemCount: items.length,
        successful,
        failed,
        lastSyncTime
      }
    });

    const response = {
      success: true,
      data: {
        processed: items.length,
        successful,
        failed,
        results,
        syncTime: new Date().toISOString()
      }
    };

    logger.info('Bulk sync completed', {
      userId: req.user.id,
      processed: items.length,
      successful,
      failed
    });

    res.json(response);

  } catch (error) {
    next(error);
  }
});

// Get sync queue for user
router.get('/queue', authenticateToken, async (req, res, next) => {
  try {
    const queueItems = await SyncQueue.findAll({
      where: {
        user_id: req.user.id,
        status: 'pending'
      },
      order: [['created_at', 'ASC']],
      limit: 100
    });

    const formattedItems = queueItems.map(item => ({
      id: item.id,
      data: item.data,
      endpoint: item.endpoint,
      method: item.method,
      createdAt: item.created_at,
      errorMessage: item.error_message
    }));

    res.json({
      success: true,
      data: {
        queueItems: formattedItems,
        count: queueItems.length
      }
    });

  } catch (error) {
    next(error);
  }
});

// Retry failed sync items
router.post('/retry', authenticateToken, async (req, res, next) => {
  try {
    const { syncIds } = req.body;

    if (!syncIds || !Array.isArray(syncIds)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SYNC_IDS',
          message: 'Sync IDs array is required'
        }
      });
    }

    const queueItems = await SyncQueue.findAll({
      where: {
        id: syncIds,
        user_id: req.user.id,
        status: 'failed'
      }
    });

    const results = [];
    let successful = 0;

    for (const queueItem of queueItems) {
      try {
        const { type, data } = queueItem.data;
        let result;

        switch (type) {
          case 'workflow_submission':
            result = await processWorkflowSubmission(req.user.id, data, queueItem.id);
            break;
          case 'profile_update':
            result = await processProfileUpdate(req.user.id, data, queueItem.id);
            break;
          default:
            result = { status: 'failed', error: 'Unknown type' };
        }

        if (result.status === 'success') {
          await queueItem.update({
            status: 'synced',
            synced_at: new Date()
          });
          successful++;
        } else {
          await queueItem.update({
            error_message: result.error
          });
        }

        results.push({
          syncId: queueItem.id,
          ...result
        });

      } catch (error) {
        logger.error('Retry sync error:', error);
        results.push({
          syncId: queueItem.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        processed: queueItems.length,
        successful,
        results
      }
    });

  } catch (error) {
    next(error);
  }
});

// Helper function to process workflow submission
async function processWorkflowSubmission(userId, data, localId) {
  try {
    const { workflowId, workflowData } = data;

    // Generate reference number
    const referenceNumber = `REF${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    // Create workflow record
    const workflow = await Workflow.create({
      user_id: userId,
      workflow_type: workflowId,
      workflow_data: workflowData,
      status: 'completed',
      reference_number: referenceNumber,
      completed_at: new Date()
    });

    return {
      localId,
      status: 'success',
      serverId: workflow.id,
      referenceNumber
    };

  } catch (error) {
    return {
      localId,
      status: 'failed',
      error: error.message
    };
  }
}

// Helper function to process profile update
async function processProfileUpdate(userId, data, localId) {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.update(data);

    return {
      localId,
      status: 'success',
      serverId: user.id
    };

  } catch (error) {
    return {
      localId,
      status: 'failed',
      error: error.message
    };
  }
}

// Helper function to process document upload
async function processDocumentUpload(userId, data, localId) {
  try {
    // Mock document processing
    // In real implementation, this would handle file uploads
    
    return {
      localId,
      status: 'success',
      serverId: `doc_${Date.now()}`
    };

  } catch (error) {
    return {
      localId,
      status: 'failed',
      error: error.message
    };
  }
}

module.exports = router;