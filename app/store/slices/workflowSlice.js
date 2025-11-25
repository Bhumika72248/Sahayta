import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentWorkflow: null,
  currentStep: 0,
  workflowData: {},
  isActive: false,
  completedWorkflows: []
};

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    startWorkflow: (state, action) => {
      state.currentWorkflow = action.payload;
      state.currentStep = 0;
      state.workflowData = {};
      state.isActive = true;
    },
    nextStep: (state) => {
      state.currentStep += 1;
    },
    previousStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    updateWorkflowData: (state, action) => {
      state.workflowData = { ...state.workflowData, ...action.payload };
    },
    completeWorkflow: (state) => {
      if (state.currentWorkflow) {
        state.completedWorkflows.push({
          id: Date.now(),
          workflow: state.currentWorkflow,
          data: state.workflowData,
          completedAt: new Date().toISOString()
        });
      }
      state.currentWorkflow = null;
      state.currentStep = 0;
      state.workflowData = {};
      state.isActive = false;
    },
    resetWorkflow: (state) => {
      state.currentWorkflow = null;
      state.currentStep = 0;
      state.workflowData = {};
      state.isActive = false;
    }
  }
});

export const { 
  startWorkflow, 
  nextStep, 
  previousStep, 
  updateWorkflowData, 
  completeWorkflow, 
  resetWorkflow 
} = workflowSlice.actions;
export default workflowSlice.reducer;