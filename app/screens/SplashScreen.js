import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { colors, typography, spacing } from '../theme/theme';
import { getUserProfile } from '../database/database';
import { setUserProfile, setOnboarded } from '../store/slices/userSlice';

const SplashScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isOnboarded } = useSelector(state => state.user);
  
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Check user onboarding status
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const profile = await getUserProfile();
      
      if (profile && profile.voiceProfileCreated) {
        dispatch(setUserProfile(profile));
        dispatch(setOnboarded(true));
        
        setTimeout(() => {
          navigation.replace('Home');
        }, 2000);
      } else {
        setTimeout(() => {
          navigation.replace('LanguageSelection');
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setTimeout(() => {
        navigation.replace('LanguageSelection');
      }, 2000);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🤝</Text>
          <Text style={styles.title}>Sahayak</Text>
          <Text style={styles.subtitle}>
            Your AI Assistant for Government Services
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Animated.View style={styles.loadingDot} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  loadingContainer: {
    marginTop: spacing.xxl,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
});

export default SplashScreen;