import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme/theme';

const VoiceMicButton = ({ 
  onPress, 
  isListening = false, 
  isProcessing = false,
  disabled = false,
  size = 'large',
  label = 'Tap to speak'
}) => {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isListening) {
      // Pulse animation while listening
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 48;
      case 'medium':
        return 64;
      case 'large':
      default:
        return 80;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 28;
      case 'large':
      default:
        return 36;
    }
  };

  const buttonSize = getButtonSize();
  const iconSize = getIconSize();

  const getButtonStyle = () => {
    let backgroundColor = colors.secondary;
    
    if (disabled) {
      backgroundColor = colors.disabled;
    } else if (isListening) {
      backgroundColor = colors.error;
    } else if (isProcessing) {
      backgroundColor = colors.textSecondary;
    }

    return {
      ...styles.button,
      width: buttonSize,
      height: buttonSize,
      borderRadius: buttonSize / 2,
      backgroundColor,
    };
  };

  const getIconColor = () => {
    if (disabled) {
      return colors.textSecondary;
    }
    return colors.white;
  };

  const getStatusText = () => {
    if (isProcessing) {
      return 'Processing...';
    } else if (isListening) {
      return 'Listening...';
    }
    return label;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={getButtonStyle()}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || isProcessing}
          accessibilityLabel={getStatusText()}
          accessibilityRole="button"
          accessibilityState={{ 
            disabled: disabled || isProcessing,
            selected: isListening 
          }}
        >
          <Ionicons 
            name={isListening ? "mic" : "mic-outline"} 
            size={iconSize} 
            color={getIconColor()} 
          />
        </TouchableOpacity>
      </Animated.View>
      
      <Text style={styles.label}>
        {getStatusText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginBottom: spacing.sm,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default VoiceMicButton;