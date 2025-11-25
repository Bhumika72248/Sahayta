import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../theme/theme';
import AppHeader from '../components/AppHeader';
import CardTile from '../components/CardTile';
import OfflineSyncBanner from '../components/OfflineSyncBanner';
import VoiceMicButton from '../components/VoiceMicButton';
import { synthesizeSpeech } from '../api/ttsService';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { profile } = useSelector(state => state.user);
  const { currentLanguage } = useSelector(state => state.language);

  useEffect(() => {
    // Welcome message on first load
    playWelcomeMessage();
  }, []);

  const playWelcomeMessage = async () => {
    try {
      const welcomeText = `${t('home.title')}, ${profile.name || 'User'}. ${t('home.subtitle')}`;
      await synthesizeSpeech(welcomeText, currentLanguage, { playImmediately: true });
    } catch (error) {
      console.error('Welcome TTS Error:', error);
    }
  };

  const handleVoiceCommand = () => {
    navigation.navigate('VoiceInteraction');
  };

  const handleScanDocument = () => {
    navigation.navigate('OCRCamera');
  };

  const handleMyTasks = () => {
    navigation.navigate('History');
  };

  const handleProcessSelector = () => {
    navigation.navigate('ProcessSelector');
  };

  const mainActions = [
    {
      id: 'scan',
      title: t('home.scanDocument'),
      icon: 'camera',
      color: colors.primary,
      onPress: handleScanDocument
    },
    {
      id: 'voice',
      title: t('home.voiceAssistant'),
      icon: 'microphone',
      color: colors.secondary,
      onPress: handleVoiceCommand
    },
    {
      id: 'tasks',
      title: t('home.myTasks'),
      icon: 'document',
      color: colors.success,
      onPress: handleMyTasks
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title="Sahayak"
        showSettings={true}
      />
      
      <OfflineSyncBanner />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            {t('home.title')}{profile.name ? `, ${profile.name}` : ''}
          </Text>
          <Text style={styles.subtitleText}>
            {t('home.subtitle')}
          </Text>
        </View>

        <View style={styles.voiceSection}>
          <VoiceMicButton
            onPress={handleVoiceCommand}
            label={t('voice.tapToSpeak')}
            size="large"
          />
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {mainActions.map((action) => (
              <CardTile
                key={action.id}
                title={action.title}
                iconName={action.icon}
                color={action.color}
                onPress={action.onPress}
                style={styles.actionTile}
              />
            ))}
          </View>
        </View>

        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Government Services</Text>
          <CardTile
            title="Browse All Services"
            iconName="document"
            color={colors.textSecondary}
            onPress={handleProcessSelector}
            style={styles.browseServicesButton}
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
  welcomeSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  welcomeText: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitleText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  voiceSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  actionsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionTile: {
    width: '48%',
    marginBottom: spacing.md,
  },
  servicesSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  browseServicesButton: {
    width: '100%',
  },
});

export default HomeScreen;