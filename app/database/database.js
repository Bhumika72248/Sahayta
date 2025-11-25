import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';

let db = null;

export const initializeDatabase = async () => {
  try {
    db = SQLite.openDatabase('sahayak.db');
    
    return new Promise((resolve, reject) => {
      // Create tables
      db.transaction(tx => {
      // User profile table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS user_profile (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          age TEXT,
          gender TEXT,
          location TEXT,
          voice_profile_created INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Workflows table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS workflows (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          workflow_type TEXT,
          workflow_data TEXT,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME
        );
      `);
      
      // Offline sync queue
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS sync_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          data TEXT,
          endpoint TEXT,
          method TEXT DEFAULT 'POST',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          synced INTEGER DEFAULT 0
        );
      `);
      
      // Settings table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }, (error) => {
      console.error('Database transaction error:', error);
      reject(error);
    }, () => {
      console.log('Database initialized successfully');
      resolve();
    });
    });
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

// User profile operations
export const saveUserProfile = (profile) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR REPLACE INTO user_profile (name, age, gender, location, voice_profile_created) VALUES (?, ?, ?, ?, ?)',
        [profile.name, profile.age, profile.gender, profile.location, profile.voiceProfileCreated ? 1 : 0],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getUserProfile = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM user_profile ORDER BY id DESC LIMIT 1',
        [],
        (_, result) => {
          if (result.rows.length > 0) {
            const profile = result.rows.item(0);
            resolve({
              name: profile.name,
              age: profile.age,
              gender: profile.gender,
              location: profile.location,
              voiceProfileCreated: profile.voice_profile_created === 1
            });
          } else {
            resolve(null);
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Workflow operations
export const saveWorkflow = (workflowType, workflowData) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO workflows (workflow_type, workflow_data, status) VALUES (?, ?, ?)',
        [workflowType, JSON.stringify(workflowData), 'completed'],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getWorkflows = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM workflows ORDER BY created_at DESC',
        [],
        (_, result) => {
          const workflows = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            workflows.push({
              id: row.id,
              workflowType: row.workflow_type,
              workflowData: JSON.parse(row.workflow_data),
              status: row.status,
              createdAt: row.created_at,
              completedAt: row.completed_at
            });
          }
          resolve(workflows);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Offline sync operations
export const addToSyncQueue = (data, endpoint, method = 'POST') => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO sync_queue (data, endpoint, method) VALUES (?, ?, ?)',
        [JSON.stringify(data), endpoint, method],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getSyncQueue = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM sync_queue WHERE synced = 0 ORDER BY created_at ASC',
        [],
        (_, result) => {
          const queue = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            queue.push({
              id: row.id,
              data: JSON.parse(row.data),
              endpoint: row.endpoint,
              method: row.method,
              createdAt: row.created_at
            });
          }
          resolve(queue);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Settings operations
export const saveSetting = (key, value) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [key, value],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getSetting = (key) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT value FROM settings WHERE key = ?',
        [key],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0).value);
          } else {
            resolve(null);
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};