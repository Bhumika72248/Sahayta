import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/theme';
import PictogramIcon from './PictogramIcon';

const CardTile = ({ 
  title, 
  subtitle, 
  iconName, 
  color = colors.primary,
  onPress, 
  disabled = false,
  style,
  size = 'medium'
}) => {
  const getCardStyle = () => {
    const baseStyle = [styles.card];
    
    if (size === 'large') {
      baseStyle.push(styles.cardLarge);
    } else if (size === 'small') {
      baseStyle.push(styles.cardSmall);
    } else {
      baseStyle.push(styles.cardMedium);
    }
    
    if (disabled) {
      baseStyle.push(styles.cardDisabled);
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  const getIconSize = () => {
    switch (size) {
      case 'large':
        return 64;
      case 'small':
        return 40;
      case 'medium':
      default:
        return 56;
    }
  };

  return (
    <TouchableOpacity
      style={getCardStyle()}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={title}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <View style={styles.iconContainer}>
        <PictogramIcon
          name={iconName}
          size={getIconSize()}
          color={disabled ? colors.disabled : color}
        />
      </View>
      
      <View style={styles.textContainer}>
        <Text 
          style={[
            styles.title,
            disabled && styles.titleDisabled
          ]} 
          numberOfLines={2}
        >
          {title}
        </Text>
        
        {subtitle && (
          <Text 
            style={[
              styles.subtitle,
              disabled && styles.subtitleDisabled
            ]} 
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  cardSmall: {
    minHeight: 100,
    padding: spacing.sm,
  },
  cardMedium: {
    minHeight: 120,
    padding: spacing.md,
  },
  cardLarge: {
    minHeight: 140,
    padding: spacing.lg,
  },
  cardDisabled: {
    backgroundColor: colors.disabled,
    ...shadows.sm,
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  textContainer: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.textPrimary,
  },
  titleDisabled: {
    color: colors.textSecondary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  subtitleDisabled: {
    color: colors.disabled,
  },
});

export default CardTile;