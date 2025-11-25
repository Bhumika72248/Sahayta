import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/theme';

const Stepper = ({ 
  currentStep, 
  totalSteps, 
  steps = [], 
  showLabels = false 
}) => {
  const renderStep = (stepIndex) => {
    const isActive = stepIndex === currentStep;
    const isCompleted = stepIndex < currentStep;
    const step = steps[stepIndex];

    const getStepStyle = () => {
      if (isCompleted) {
        return styles.stepCompleted;
      } else if (isActive) {
        return styles.stepActive;
      } else {
        return styles.stepInactive;
      }
    };

    const getStepTextStyle = () => {
      if (isCompleted || isActive) {
        return styles.stepTextActive;
      } else {
        return styles.stepTextInactive;
      }
    };

    return (
      <View key={stepIndex} style={styles.stepContainer}>
        <View style={[styles.step, getStepStyle()]}>
          {isCompleted ? (
            <Ionicons name="checkmark" size={16} color={colors.white} />
          ) : (
            <Text style={getStepTextStyle()}>
              {stepIndex + 1}
            </Text>
          )}
        </View>
        
        {showLabels && step && (
          <Text style={styles.stepLabel} numberOfLines={2}>
            {step.title || `Step ${stepIndex + 1}`}
          </Text>
        )}
        
        {stepIndex < totalSteps - 1 && (
          <View style={[
            styles.connector,
            isCompleted ? styles.connectorCompleted : styles.connectorInactive
          ]} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => renderStep(index))}
      </View>
      
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {totalSteps}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / totalSteps) * 100}%` }
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  stepActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepInactive: {
    backgroundColor: colors.background,
    borderColor: colors.disabled,
  },
  stepTextActive: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  stepTextInactive: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  stepLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 80,
  },
  connector: {
    position: 'absolute',
    top: 15,
    left: '50%',
    right: '-50%',
    height: 2,
    zIndex: -1,
  },
  connectorCompleted: {
    backgroundColor: colors.success,
  },
  connectorInactive: {
    backgroundColor: colors.disabled,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.disabled,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
});

export default Stepper;