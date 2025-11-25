import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../theme/theme';
import { setUserProfile, setVoiceProfileCreated, setOnboarded } from '../store/slices/userSlice';
import { saveUserProfile } from '../database/database';
import AppHeader from '../components/AppHeader';
import VoiceMicButton from '../components/VoiceMicButton';
import LargeButton from '../components/LargeButton';
import { transcribeAudio } from '../api/asrService';
import { synthesizeSpeech } from '../api/ttsService';

const VoiceProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { currentLanguage } = useSelector(state => state.language);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    age: '',
    gender: '',
    location: ''
  });

  const steps = [
    {
      key: 'name',
      prompt: t('voiceProfile.namePrompt'),
      field: 'name'
    },
    {
      key: 'age',
      prompt: t('voiceProfile.agePrompt'),
      field: 'age'
    },
    {
      key: 'gender',
      prompt: t('voiceProfile.genderPrompt'),
      field: 'gender',
      options: [t('voiceProfile.male'), t('voiceProfile.female'), t('voiceProfile.other')]
    },
    {
      key: 'location',
      prompt: t('voiceProfile.locationPrompt'),
      field: 'location'
    }
  ];

  const currentStepData = steps[currentStep];

  React.useEffect(() => {
    // Play current step prompt
    playStepPrompt();
  }, [currentStep]);

  const playStepPrompt = async () => {
    try {
      await synthesizeSpeech(
        currentStepData.prompt,
        currentLanguage,
        { playImmediately: true }
      );
    } catch (error) {
      console.error('TTS Error:', error);
    }
  };

  const handleVoiceInput = async () => {
    setIsListening(true);
    
    try {
      // Mock voice recording - in production, use expo-av
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setIsListening(false);
      setIsProcessing(true);
      
      // Mock ASR transcription
      const result = await transcribeAudio('mock_audio_uri', currentLanguage);
      
      if (result.success) {
        const transcription = result.data.transcription;
        
        // Update profile data
        const updatedProfile = {
          ...profileData,
          [currentStepData.field]: transcription
        };
        setProfileData(updatedProfile);
        
        // Confirm with user
        await synthesizeSpeech(
          `You said: ${transcription}. Is this correct?`,
          currentLanguage,
          { playImmediately: true }
        );
        
        // Auto-proceed to next step after confirmation
        setTimeout(() => {
          handleNextStep();
        }, 3000);
      }
    } catch (error) {
      console.error('Voice input error:', error);
      Alert.alert('Error', 'Failed to process voice input. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteProfile();
    }
  };

  const handleCompleteProfile = async () => {
    try {
      const completeProfile = {
        ...profileData,
        voiceProfileCreated: true
      };
      
      // Save to database
      await saveUserProfile(completeProfile);
      
      // Update Redux store
      dispatch(setUserProfile(completeProfile));
      dispatch(setVoiceProfileCreated());
      dispatch(setOnboarded(true));
      
      // Welcome message
      await synthesizeSpeech(
        `Welcome ${profileData.name}! Your voice profile has been created successfully.`,
        currentLanguage,
        { playImmediately: true }
      );
      
      // Navigate to home
      setTimeout(() => {
        navigation.replace('Home');
      }, 2000);
      
    } catch (error) {
      console.error('Profile save error:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Voice Profile',
      'Are you sure you want to skip creating a voice profile? This will limit voice features.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => navigation.replace('Home') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title={t('voiceProfile.title')}
        showBack={true}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🎤</Text>
          <Text style={styles.title}>{t('voiceProfile.title')}</Text>
          <Text style={styles.subtitle}>{t('voiceProfile.subtitle')}</Text>
        </View>

        <View style={styles.stepContainer}>
          <Text style={styles.stepIndicator}>
            {t('workflow.step', { current: currentStep + 1, total: steps.length })}
          </Text>
          
          <Text style={styles.prompt}>
            {currentStepData.prompt}
          </Text>
          
          {profileData[currentStepData.field] && (
            <View style={styles.responseContainer}>
              <Text style={styles.responseLabel}>Your response:</Text>
              <Text style={styles.responseText}>
                {profileData[currentStepData.field]}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.voiceSection}>
          <VoiceMicButton
            onPress={handleVoiceInput}
            isListening={isListening}
            isProcessing={isProcessing}
            label={isListening ? t('voice.listening') : isProcessing ? t('voice.processing') : t('voice.tapToSpeak')}
            size="large"
          />
        </View>

        <View style={styles.footer}>
          <LargeButton
            title={t('common.skip')}
            onPress={handleSkip}
            variant="secondary"
            style={styles.skipButton}
          />
          
          {profileData[currentStepData.field] && (
            <LargeButton
              title={currentStep === steps.length - 1 ? t('common.done') : t('common.next')}
              onPress={handleNextStep}
              style={styles.nextButton}
            />
          )}
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
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  stepIndicator: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  prompt: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  responseContainer: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    width: '100%',
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingTop: spacing.lg,
  },
  skipButton: {
    marginBottom: spacing.md,
  },
  nextButton: {
    marginTop: spacing.sm,
  },
});

export default VoiceProfileScreen;