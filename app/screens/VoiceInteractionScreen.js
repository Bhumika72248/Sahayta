import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../theme/theme';
import AppHeader from '../components/AppHeader';
import VoiceMicButton from '../components/VoiceMicButton';
import VoiceWaveform from '../components/VoiceWaveform';
import { transcribeAudio } from '../api/asrService';
import { synthesizeSpeech } from '../api/ttsService';

const VoiceInteractionScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { currentLanguage } = useSelector(state => state.language);
  
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const handleVoiceInput = async () => {
    setIsListening(true);
    setTranscript('');
    setResponse('');
    
    try {
      // Mock voice recording
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setIsListening(false);
      setIsProcessing(true);
      
      // Transcribe audio
      const result = await transcribeAudio('mock_audio_uri', currentLanguage);
      
      if (result.success) {
        const userInput = result.data.transcription;
        setTranscript(userInput);
        
        // Process command and generate response
        const aiResponse = await processVoiceCommand(userInput);
        setResponse(aiResponse);
        
        // Speak response
        await synthesizeSpeech(aiResponse, currentLanguage, { playImmediately: true });
      }
    } catch (error) {
      console.error('Voice interaction error:', error);
      const errorMessage = 'Sorry, I could not understand. Please try again.';
      setResponse(errorMessage);
      await synthesizeSpeech(errorMessage, currentLanguage, { playImmediately: true });
    } finally {
      setIsProcessing(false);
    }
  };

  const processVoiceCommand = async (input) => {
    const lowerInput = input.toLowerCase();
    
    // Simple command processing
    if (lowerInput.includes('aadhaar') || lowerInput.includes('aadhar')) {
      setTimeout(() => navigation.navigate('ProcessSelector', { selectedProcess: 'aadhaar-application' }), 2000);
      return 'I can help you with Aadhaar card application. Let me guide you through the process.';
    }
    
    if (lowerInput.includes('pan')) {
      setTimeout(() => navigation.navigate('ProcessSelector', { selectedProcess: 'pan-application' }), 2000);
      return 'I can help you with PAN card application. Let me start the process for you.';
    }
    
    if (lowerInput.includes('passport')) {
      setTimeout(() => navigation.navigate('ProcessSelector', { selectedProcess: 'passport-application' }), 2000);
      return 'I can help you with passport application. Let me guide you through the steps.';
    }
    
    if (lowerInput.includes('scan') || lowerInput.includes('document')) {
      setTimeout(() => navigation.navigate('OCRCamera'), 2000);
      return 'I will open the document scanner for you. Please position your document in the camera frame.';
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('support')) {
      setTimeout(() => navigation.navigate('Help'), 2000);
      return 'I will show you the help section with tutorials and support information.';
    }
    
    if (lowerInput.includes('history') || lowerInput.includes('tasks')) {
      setTimeout(() => navigation.navigate('History'), 2000);
      return 'Let me show you your saved tasks and application history.';
    }
    
    return 'I can help you with government services like Aadhaar, PAN, passport applications, or document scanning. What would you like to do?';
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title={t('home.voiceAssistant')}
        showBack={true}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Voice Assistant</Text>
          <Text style={styles.subtitle}>
            {isListening ? t('voice.listening') : 
             isProcessing ? t('voice.processing') : 
             t('voice.speakNow')}
          </Text>
        </View>

        <View style={styles.waveformContainer}>
          <VoiceWaveform 
            isActive={isListening} 
            height={60}
            barCount={7}
          />
        </View>

        <View style={styles.voiceSection}>
          <VoiceMicButton
            onPress={handleVoiceInput}
            isListening={isListening}
            isProcessing={isProcessing}
            size="large"
          />
        </View>

        {transcript && (
          <View style={styles.transcriptContainer}>
            <Text style={styles.transcriptLabel}>You said:</Text>
            <Text style={styles.transcriptText}>{transcript}</Text>
          </View>
        )}

        {response && (
          <View style={styles.responseContainer}>
            <Text style={styles.responseLabel}>Sahayak:</Text>
            <Text style={styles.responseText}>{response}</Text>
          </View>
        )}

        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Try saying:</Text>
          <Text style={styles.suggestion}>"Help me with Aadhaar application"</Text>
          <Text style={styles.suggestion}>"I need to apply for PAN card"</Text>
          <Text style={styles.suggestion}>"Scan my document"</Text>
          <Text style={styles.suggestion}>"Show my tasks"</Text>
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
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  waveformContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  voiceSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  transcriptContainer: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transcriptLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  transcriptText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  responseContainer: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.xl,
  },
  responseLabel: {
    ...typography.caption,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  responseText: {
    ...typography.body,
    color: colors.white,
  },
  suggestionsContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  suggestionsTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  suggestion: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
});

export default VoiceInteractionScreen;