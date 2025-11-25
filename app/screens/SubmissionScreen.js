import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme/theme';
import AppHeader from '../components/AppHeader';
import LargeButton from '../components/LargeButton';
import { synthesizeSpeech } from '../api/ttsService';

const SubmissionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { currentLanguage } = useSelector(state => state.language);
  
  const submissionData = route.params?.submissionData;

  useEffect(() => {
    playSuccessMessage();
  }, []);

  const playSuccessMessage = async () => {
    try {
      let message = '';
      
      if (submissionData?.status === 'submitted') {
        message = `Your application has been submitted successfully. ${submissionData.referenceNumber ? `Reference number: ${submissionData.referenceNumber}` : ''}`;
      } else if (submissionData?.status === 'queued') {
        message = 'Your application has been saved offline and will be submitted when you are connected to the internet.';
      } else {
        message = 'Your information has been saved successfully.';
      }
      
      await synthesizeSpeech(message, currentLanguage, { playImmediately: true });
    } catch (error) {
      console.error('TTS Error:', error);
    }
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleViewHistory = () => {
    navigation.navigate('History');
  };

  const getStatusIcon = () => {
    if (submissionData?.status === 'submitted') {
      return 'checkmark-circle';
    } else if (submissionData?.status === 'queued') {
      return 'cloud-upload-outline';
    } else {
      return 'save-outline';
    }
  };

  const getStatusColor = () => {
    if (submissionData?.status === 'submitted') {
      return colors.success;
    } else if (submissionData?.status === 'queued') {
      return colors.secondary;
    } else {
      return colors.primary;
    }
  };

  const getStatusTitle = () => {
    if (submissionData?.status === 'submitted') {
      return 'Application Submitted';
    } else if (submissionData?.status === 'queued') {
      return 'Saved for Later Submission';
    } else {
      return 'Information Saved';
    }
  };

  const getStatusMessage = () => {
    if (submissionData?.status === 'submitted') {
      return 'Your application has been submitted successfully and is being processed.';
    } else if (submissionData?.status === 'queued') {
      return 'Your application has been saved offline and will be automatically submitted when you are connected to the internet.';
    } else {
      return 'Your information has been saved successfully.';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title="Submission Status"
        showBack={false}
      />
      
      <View style={styles.content}>
        <View style={styles.statusContainer}>
          <Ionicons 
            name={getStatusIcon()} 
            size={80} 
            color={getStatusColor()} 
            style={styles.statusIcon}
          />
          
          <Text style={styles.statusTitle}>
            {getStatusTitle()}
          </Text>
          
          <Text style={styles.statusMessage}>
            {getStatusMessage()}
          </Text>
        </View>

        {submissionData?.referenceNumber && (
          <View style={styles.referenceContainer}>
            <Text style={styles.referenceLabel}>Reference Number:</Text>
            <Text style={styles.referenceNumber}>
              {submissionData.referenceNumber}
            </Text>
          </View>
        )}

        {submissionData?.estimatedProcessingTime && (
          <View style={styles.processingTimeContainer}>
            <Text style={styles.processingTimeLabel}>Estimated Processing Time:</Text>
            <Text style={styles.processingTime}>
              {submissionData.estimatedProcessingTime}
            </Text>
          </View>
        )}

        {submissionData?.nextSteps && (
          <View style={styles.nextStepsContainer}>
            <Text style={styles.nextStepsTitle}>Next Steps:</Text>
            {submissionData.nextSteps.map((step, index) => (
              <View key={index} style={styles.nextStepItem}>
                <Text style={styles.nextStepBullet}>•</Text>
                <Text style={styles.nextStepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionsContainer}>
          <LargeButton
            title="View My Applications"
            onPress={handleViewHistory}
            variant="secondary"
            style={styles.actionButton}
          />
          
          <LargeButton
            title="Go to Home"
            onPress={handleGoHome}
            style={styles.actionButton}
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
    paddingVertical: spacing.xl,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  statusIcon: {
    marginBottom: spacing.lg,
  },
  statusTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  statusMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  referenceContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  referenceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  referenceNumber: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  processingTimeContainer: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  processingTimeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  processingTime: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  nextStepsContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.xl,
  },
  nextStepsTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  nextStepItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  nextStepBullet: {
    ...typography.body,
    color: colors.primary,
    marginRight: spacing.sm,
    fontWeight: 'bold',
  },
  nextStepText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  actionsContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginBottom: spacing.md,
  },
});

export default SubmissionScreen;