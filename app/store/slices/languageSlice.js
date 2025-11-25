import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentLanguage: 'en',
  availableLanguages: ['en', 'hi', 'regional'],
  isLoaded: false
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.currentLanguage = action.payload;
    },
    setLanguageLoaded: (state) => {
      state.isLoaded = true;
    }
  }
});

export const { setLanguage, setLanguageLoaded } = languageSlice.actions;
export default languageSlice.reducer;