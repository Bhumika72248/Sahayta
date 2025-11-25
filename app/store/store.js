import { configureStore } from '@reduxjs/toolkit';
import languageSlice from './slices/languageSlice';
import userSlice from './slices/userSlice';
import workflowSlice from './slices/workflowSlice';
import offlineSlice from './slices/offlineSlice';

export const store = configureStore({
  reducer: {
    language: languageSlice,
    user: userSlice,
    workflow: workflowSlice,
    offline: offlineSlice,
  },
});