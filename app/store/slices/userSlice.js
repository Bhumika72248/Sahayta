import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: {
    name: '',
    age: '',
    gender: '',
    location: '',
    voiceProfileCreated: false
  },
  isOnboarded: false,
  permissions: {
    camera: false,
    microphone: false,
    storage: false
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    setOnboarded: (state, action) => {
      state.isOnboarded = action.payload;
    },
    setPermissions: (state, action) => {
      state.permissions = { ...state.permissions, ...action.payload };
    },
    setVoiceProfileCreated: (state) => {
      state.profile.voiceProfileCreated = true;
    }
  }
});

export const { setUserProfile, setOnboarded, setPermissions, setVoiceProfileCreated } = userSlice.actions;
export default userSlice.reducer;