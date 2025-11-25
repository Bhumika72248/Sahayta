import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { colors, typography, spacing, borderRadius } from '../theme/theme';

const OfflineSyncBanner = ({ onSyncPress }) => {
  const { isOnline, syncQueue } = useSelector(state => state.offline);
  const pulseAnim = new Animated.Value(1);

  React.useEffect(() => {
    if (!isOnline && syncQueue.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isOnline, syncQueue.length]);

  if (isOnline && syncQueue.length === 0) {
    return null;
  }

  const getBannerStyle = () => {
    if (!isOnline) {
      return styles.offline;
    } else if (syncQueue.length > 0) {
      return styles.syncing;
    }
    return styles.online;
  };

  const getIconName = () => {
    if (!isOnline) {
      return 'cloud-offline-outline';
    } else if (syncQueue.length > 0) {
      return 'sync-outline';
    }
    return 'cloud-done-outline';
  };

  const getMessage = () => {
    if (!isOnline) {
      return `You're offline. ${syncQueue.length} items queued for sync.`;
    } else if (syncQueue.length > 0) {
      return `Syncing ${syncQueue.length} items...`;
    }
    return 'All data synced';
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        getBannerStyle(),
        { transform: [{ scale: pulseAnim }] }
      ]}
    >
      <View style={styles.content}>
        <Ionicons 
          name={getIconName()} 
          size={20} 
          color={colors.white} 
          style={styles.icon}
        />
        <Text style={styles.message} numberOfLines={2}>
          {getMessage()}
        </Text>
      </View>
      
      {syncQueue.length > 0 && isOnline && onSyncPress && (
        <TouchableOpacity
          style={styles.syncButton}
          onPress={onSyncPress}
          accessibilityLabel="Sync now"
          accessibilityRole="button"
        >
          <Text style={styles.syncButtonText}>Sync</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  offline: {
    backgroundColor: colors.error,
  },
  syncing: {
    backgroundColor: colors.secondary,
  },
  online: {
    backgroundColor: colors.success,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  message: {
    ...typography.caption,
    color: colors.white,
    flex: 1,
  },
  syncButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  syncButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
});

export default OfflineSyncBanner;