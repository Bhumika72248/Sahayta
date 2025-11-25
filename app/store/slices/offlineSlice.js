import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOnline: true,
  syncQueue: [],
  lastSyncTime: null
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    addToSyncQueue: (state, action) => {
      state.syncQueue.push({
        id: Date.now(),
        data: action.payload,
        timestamp: new Date().toISOString()
      });
    },
    removeFromSyncQueue: (state, action) => {
      state.syncQueue = state.syncQueue.filter(item => item.id !== action.payload);
    },
    clearSyncQueue: (state) => {
      state.syncQueue = [];
    },
    setLastSyncTime: (state) => {
      state.lastSyncTime = new Date().toISOString();
    }
  }
});

export const { 
  setOnlineStatus, 
  addToSyncQueue, 
  removeFromSyncQueue, 
  clearSyncQueue, 
  setLastSyncTime 
} = offlineSlice.actions;
export default offlineSlice.reducer;