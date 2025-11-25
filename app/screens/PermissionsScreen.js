import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as Camera from 'expo-camera';
// import * as MediaLibrary from 'expo-media-library';
import { colors, typography, spacing } from '../theme/theme';
import { setPermissions } from '../store/slices/userSlice';
import AppHeader from '../components/AppHeader';
import LargeButton from '../components/LargeButton';
import PictogramIcon from '../components/PictogramIcon';

const PermissionsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [isGranting, setIsGranting] = useState(false);

  const permissions = [
    {
      key: 'camera',
      title: t('permissions.camera'),
      icon: 'camera',
      color: colors.primary
    },
    {
      key: 'microphone',
      title: t('permissions.microphone'),
      icon: 'microphone',
      color: colors.secondary
    },
    {
      key: 'storage',
      title: t('permissions.storage'),
      icon: 'document',
      color: colors.success
    }
  ];

  const handleGrantPermissions = async () => {
    setIsGranting(true);
    
    try {
      // Mock permissions for demo
      const permissionsGranted = {
        camera: true,
        microphone: true,
        storage: true
      };
      
      dispatch(setPermissions(permissionsGranted));
      navigation.navigate('VoiceProfile');
      
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title={t('permissions.title')}
        showBack={true}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🔐</Text>
          <Text style={styles.title}>{t('permissions.title')}</Text>
          <Text style={styles.subtitle}>{t('permissions.subtitle')}</Text>
        </View>

        <View style={styles.permissionsList}>
          {permissions.map((permission) => (
            <View key={permission.key} style={styles.permissionItem}>
              <PictogramIcon
                name={permission.icon}
                size={48}
                color={permission.color}
              />
              <Text style={styles.permissionText}>
                {permission.title}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <LargeButton
            title={t('permissions.grant')}
            onPress={handleGrantPermissions}
            loading={isGranting}
            style={styles.grantButton}
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
  permissionsList: {
    flex: 1,
    justifyContent: 'center',
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  permissionText: {
    ...typography.body,
    marginLeft: spacing.md,
    flex: 1,
  },
  footer: {
    paddingTop: spacing.lg,
  },
  grantButton: {
    marginTop: spacing.md,
  },
});

export default PermissionsScreen;