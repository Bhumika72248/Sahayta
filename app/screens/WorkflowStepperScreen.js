import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../theme/theme';
import { nextStep, previousStep, updateWorkflowData, completeWorkflow } from '../store/slices/workflowSlice';
import { addToSyncQueue } from '../store/slices/offlineSlice';
import AppHeader from '../components/AppHeader';
import Stepper from '../components/Stepper';
import LargeButton from '../components/LargeButton';
import VoiceMicButton from '../components/VoiceMicButton';
import { loadWorkflow, validateStepData, submitWorkflow } from '../api/workflowService';
import { transcribeAudio } from '../api/asrService';
import { synthesizeSpeech } from '../api/ttsService';

const WorkflowStepperScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  const { currentWorkflow, currentStep, workflowData } = useSelector(state => state.workflow);
  const { currentLanguage } = useSelector(state => state.language);
  const { isOnline } = useSelector(state => state.offline);
  
  const [workflowDefinition, setWorkflowDefinition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepData, setCurrentStepData] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentWorkflow) {
      loadWorkflowDefinition();
    }
  }, [currentWorkflow]);

  useEffect(() => {
    if (workflowDefinition && workflowDefinition.steps[currentStep]) {
      playStepAudio();
    }
  }, [currentStep, workflowDefinition]);

  const loadWorkflowDefinition = async () => {
    try {
      const result = await loadWorkflow(currentWorkflow.id);
      if (result.success) {
        setWorkflowDefinition(result.data);
      }
    } catch (error) {
      console.error('Failed to load workflow definition:', error);
      Alert.alert('Error', 'Failed to load workflow. Please try again.');
      navigation.goBack();
    }
  };

  const playStepAudio = async () => {
    if (!workflowDefinition) return;
    
    const step = workflowDefinition.steps[currentStep];
    if (step && step.prompt) {
      try {
        await synthesizeSpeech(step.prompt, currentLanguage, { playImmediately: true });
      } catch (error) {
        console.error('TTS Error:', error);
      }
    }
  };

  const handleVoiceInput = async () => {
    setIsListening(true);
    
    try {
      // Mock voice recording
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setIsListening(false);
      setIsProcessing(true);
      
      const result = await transcribeAudio('mock_audio_uri', currentLanguage);
      
      if (result.success) {
        const transcription = result.data.transcription;
        setCurrentStepData(transcription);
        
        // Validate input
        const step = workflowDefinition.steps[currentStep];
        const validation = validateStepData(step, transcription);
        
        if (validation.isValid) {
          dispatch(updateWorkflowData({ [step.key]: transcription }));
          
          // Confirm with user
          await synthesizeSpeech(
            `You said: ${transcription}. Is this correct?`,
            currentLanguage,
            { playImmediately: true }
          );
        } else {
          Alert.alert('Invalid Input', validation.errors.join(', '));
        }
      }
    } catch (error) {
      console.error('Voice input error:', error);
      Alert.alert('Error', 'Failed to process voice input. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextStep = () => {
    const step = workflowDefinition.steps[currentStep];
    
    // Validate current step data
    if (step.type === 'ask' && !workflowData[step.key]) {
      Alert.alert('Required Field', 'Please provide input for this step.');
      return;
    }
    
    if (currentStep < workflowDefinition.steps.length - 1) {
      dispatch(nextStep());
      setCurrentStepData('');
    } else {
      handleSubmitWorkflow();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      dispatch(previousStep());
      setCurrentStepData('');
    }
  };

  const handleSubmitWorkflow = async () => {
    setIsSubmitting(true);
    
    try {
      if (isOnline) {
        const result = await submitWorkflow(currentWorkflow.id, workflowData);
        
        if (result.success) {
          dispatch(completeWorkflow());
          
          await synthesizeSpeech(
            `Your ${currentWorkflow.name} has been submitted successfully. Reference number: ${result.data.referenceNumber}`,
            currentLanguage,
            { playImmediately: true }
          );
          
          navigation.navigate('Submission', { 
            submissionData: result.data 
          });
        }
      } else {
        // Add to offline queue
        dispatch(addToSyncQueue({
          type: 'workflow_submission',
          workflowId: currentWorkflow.id,
          data: workflowData
        }));
        
        dispatch(completeWorkflow());
        
        await synthesizeSpeech(
          'Your application has been saved offline and will be submitted when you are connected to the internet.',
          currentLanguage,
          { playImmediately: true }
        );
        
        navigation.navigate('Submission', { 
          submissionData: { 
            status: 'queued',
            message: 'Saved offline for later submission'
          }
        });
      }
    } catch (error) {
      console.error('Workflow submission error:', error);
      Alert.alert('Submission Error', 'Failed to submit workflow. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOCRStep = () => {
    const step = workflowDefinition.steps[currentStep];
    navigation.navigate('OCRCamera', {
      documentType: step.documentType,
      returnTo: 'WorkflowStepper',
      stepKey: step.key
    });
  };

  if (!workflowDefinition) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Loading..." showBack={true} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading workflow...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const step = workflowDefinition.steps[currentStep];
  const isLastStep = currentStep === workflowDefinition.steps.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title={workflowDefinition.name}
        showBack={true}
      />
      
      <View style={styles.content}>
        <Stepper
          currentStep={currentStep}
          totalSteps={workflowDefinition.steps.length}
          steps={workflowDefinition.steps}
          showLabels={false}
        />

        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepPrompt}>{step.prompt}</Text>
          
          {workflowData[step.key] && (
            <View style={styles.responseContainer}>
              <Text style={styles.responseLabel}>Your input:</Text>
              <Text style={styles.responseText}>
                {workflowData[step.key]}
              </Text>
            </View>
          )}
        </View>

        {step.type === 'ask' && (
          <View style={styles.voiceSection}>
            <VoiceMicButton
              onPress={handleVoiceInput}
              isListening={isListening}
              isProcessing={isProcessing}
              size="large"
            />
          </View>
        )}

        {step.type === 'ocr' && (
          <View style={styles.ocrSection}>
            <LargeButton
              title="Scan Document"
              onPress={handleOCRStep}
              style={styles.ocrButton}
            />
          </View>
        )}

        {step.type === 'info' && (
          <View style={styles.infoSection}>
            <Text style={styles.infoContent}>{step.content}</Text>
          </View>
        )}

        <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <LargeButton
              title={t('common.back')}
              onPress={handlePreviousStep}
              variant="secondary"
              style={styles.backButton}
            />
          )}
          
          <LargeButton
            title={isLastStep ? t('workflow.complete') : t('common.next')}
            onPress={handleNextStep}
            loading={isSubmitting}
            disabled={step.type === 'ask' && !workflowData[step.key]}
            style={styles.nextButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  stepContent: {
    flex: 1,
    paddingVertical: spacing.lg,
  },
  stepTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  stepPrompt: {
    ...typography.bodyLarge,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  responseContainer: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  responseLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  responseText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  voiceSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  ocrSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  ocrButton: {
    width: '80%',
  },
  infoSection: {
    paddingVertical: spacing.lg,
  },
  infoContent: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
  },
  backButton: {
    flex: 0.45,
  },
  nextButton: {
    flex: 0.45,
  },
});

export default WorkflowStepperScreen;