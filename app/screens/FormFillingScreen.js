import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius } from '../theme/theme';
import AppHeader from '../components/AppHeader';
import LargeButton from '../components/LargeButton';

const FormFillingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  
  const ocrData = route.params?.ocrData;
  const [formData, setFormData] = useState(ocrData?.fields || {});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Navigate to submission screen
    setTimeout(() => {
      navigation.navigate('Submission', {
        submissionData: {
          formData,
          documentType: ocrData?.documentType,
          status: 'submitted'
        }
      });
    }, 2000);
  };

  const renderFormField = (key, value) => {
    const fieldLabel = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    return (
      <View key={key} style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{fieldLabel}</Text>
        <TextInput
          style={styles.fieldInput}
          value={value || ''}
          onChangeText={(text) => handleFieldChange(key, text)}
          placeholder={`Enter ${fieldLabel.toLowerCase()}`}
          multiline={key === 'address'}
          numberOfLines={key === 'address' ? 3 : 1}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title="Review & Submit"
        showBack={true}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Review Information</Text>
          <Text style={styles.subtitle}>
            Please review and edit the extracted information before submitting
          </Text>
        </View>

        <View style={styles.formContainer}>
          {Object.entries(formData).map(([key, value]) => 
            renderFormField(key, value)
          )}
        </View>

        <View style={styles.footer}>
          <LargeButton
            title="Submit Application"
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
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
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
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
  formContainer: {
    paddingHorizontal: spacing.lg,
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },
  fieldInput: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.disabled,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});

export default FormFillingScreen;