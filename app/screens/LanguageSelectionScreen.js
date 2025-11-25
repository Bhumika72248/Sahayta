import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../theme/theme';
import { setLanguage } from '../store/slices/languageSlice';
import LargeButton from '../components/LargeButton';
import { synthesizeSpeech } from '../api/ttsService';

const LanguageSelectionScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'regional', name: 'Marathi', nativeName: 'मराठी' }
  ];

  const handleLanguageSelect = async (languageCode) => {
    setSelectedLanguage(languageCode);
    
    // Change app language
    await i18n.changeLanguage(languageCode);
    dispatch(setLanguage(languageCode));
    
    // Play welcome message in selected language
    try {
      await synthesizeSpeech(
        t('language.subtitle'), 
        languageCode, 
        { playImmediately: true }
      );
    } catch (error) {
      console.error('TTS Error:', error);
    }
  };

  const handleContinue = () => {
    navigation.navigate('Permissions');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🌐</Text>
          <Text style={styles.title}>{t('language.title')}</Text>
          <Text style={styles.subtitle}>{t('language.subtitle')}</Text>
        </View>

        <View style={styles.languageList}>
          {languages.map((language) => (
            <LargeButton
              key={language.code}
              title={`${language.nativeName} (${language.name})`}
              onPress={() => handleLanguageSelect(language.code)}
              variant={selectedLanguage === language.code ? 'primary' : 'secondary'}
              style={styles.languageButton}
              accessibilityLabel={`Select ${language.name} language`}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <LargeButton
            title={t('common.continue')}
            onPress={handleContinue}
            disabled={!selectedLanguage}
            style={styles.continueButton}
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
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
  languageList: {
    flex: 1,
    justifyContent: 'center',
  },
  languageButton: {
    marginBottom: spacing.md,
  },
  footer: {
    paddingTop: spacing.lg,
  },
  continueButton: {
    marginTop: spacing.md,
  },
});

export default LanguageSelectionScreen;