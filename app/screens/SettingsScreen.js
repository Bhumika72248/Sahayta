import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/theme';
import { setLanguage } from '../store/slices/languageSlice';
import AppHeader from '../components/AppHeader';
import LargeButton from '../components/LargeButton';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  
  const { currentLanguage } = useSelector(state => state.language);
  const { profile } = useSelector(state => state.user);
  
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'regional', name: 'Marathi', nativeName: 'मराठी' }
  ];

  const handleLanguageChange = async (languageCode) => {
    await i18n.changeLanguage(languageCode);
    dispatch(setLanguage(languageCode));
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data including offline content. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            // Clear cache logic here
            Alert.alert('Success', 'Cache cleared successfully');
          }
        }
      ]
    );
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'This will reset all settings and data. You will need to set up the app again. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            // Reset app logic here
            navigation.reset({
              index: 0,
              routes: [{ name: 'LanguageSelection' }],
            });
          }
        }
      ]
    );
  };

  const renderSettingItem = (title, subtitle, rightComponent) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && (
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        )}
      </View>
      <View style={styles.settingControl}>
        {rightComponent}
      </View>
    </View>
  );

  const renderLanguageSelector = () => (
    <View style={styles.languageSelector}>
      {languages.map((language) => (
        <TouchableOpacity
          key={language.code}
          style={[
            styles.languageOption,
            currentLanguage === language.code && styles.languageOptionSelected
          ]}
          onPress={() => handleLanguageChange(language.code)}
        >
          <Text style={[
            styles.languageText,
            currentLanguage === language.code && styles.languageTextSelected
          ]}>
            {language.nativeName}
          </Text>
          {currentLanguage === language.code && (
            <Ionicons name="checkmark" size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title="Settings"
        showBack={true}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          
          {renderSettingItem(
            profile.name || 'User',
            'Voice profile created',
            <TouchableOpacity onPress={() => navigation.navigate('VoiceProfile')}>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          {renderLanguageSelector()}
        </View>

        {/* Voice Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Settings</Text>
          
          {renderSettingItem(
            'Voice Speed',
            `Current: ${voiceSpeed}x`,
            <View style={styles.speedControls}>
              <TouchableOpacity
                style={styles.speedButton}
                onPress={() => setVoiceSpeed(Math.max(0.5, voiceSpeed - 0.1))}
              >
                <Ionicons name="remove" size={16} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.speedValue}>{voiceSpeed.toFixed(1)}x</Text>
              <TouchableOpacity
                style={styles.speedButton}
                onPress={() => setVoiceSpeed(Math.min(2.0, voiceSpeed + 0.1))}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Accessibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          
          {renderSettingItem(
            'High Contrast',
            'Improve text visibility',
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: colors.disabled, true: colors.primary }}
              thumbColor={colors.white}
            />
          )}
          
          {renderSettingItem(
            'Large Text',
            'Increase text size',
            <Switch
              value={largeText}
              onValueChange={setLargeText}
              trackColor={{ false: colors.disabled, true: colors.primary }}
              thumbColor={colors.white}
            />
          )}
        </View>

        {/* Data & Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          
          {renderSettingItem(
            'Offline Mode',
            'Save data for offline use',
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              trackColor={{ false: colors.disabled, true: colors.primary }}
              thumbColor={colors.white}
            />
          )}
          
          <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Clear Cache</Text>
              <Text style={styles.settingSubtitle}>Free up storage space</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Help & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => navigation.navigate('Help')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Help & Tutorials</Text>
              <Text style={styles.settingSubtitle}>Learn how to use Sahayak</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          
          <LargeButton
            title="Reset App"
            onPress={handleResetApp}
            variant="danger"
            style={styles.resetButton}
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.disabled,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  settingSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  settingControl: {
    marginLeft: spacing.md,
  },
  languageSelector: {
    paddingHorizontal: spacing.lg,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.disabled,
  },
  languageOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  languageText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  languageTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  speedControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.disabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedValue: {
    ...typography.body,
    marginHorizontal: spacing.md,
    minWidth: 40,
    textAlign: 'center',
  },
  resetButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
});

export default SettingsScreen;