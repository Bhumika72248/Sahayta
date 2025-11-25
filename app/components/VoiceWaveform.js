import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing } from '../theme/theme';

const VoiceWaveform = ({ 
  isActive = false, 
  barCount = 5, 
  height = 40,
  color = colors.secondary 
}) => {
  const [animations] = useState(
    Array.from({ length: barCount }, () => new Animated.Value(0.3))
  );

  useEffect(() => {
    if (isActive) {
      startWaveAnimation();
    } else {
      stopWaveAnimation();
    }
  }, [isActive]);

  const startWaveAnimation = () => {
    const animationSequences = animations.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.random() * 0.7 + 0.3, // Random height between 0.3 and 1
            duration: 300 + Math.random() * 200, // Random duration
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 300 + Math.random() * 200,
            useNativeDriver: false,
          }),
        ])
      );
    });

    // Start animations with slight delays for wave effect
    animationSequences.forEach((animation, index) => {
      setTimeout(() => {
        animation.start();
      }, index * 100);
    });
  };

  const stopWaveAnimation = () => {
    animations.forEach(anim => {
      anim.stopAnimation();
      Animated.timing(anim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  };

  return (
    <View style={[styles.container, { height }]}>
      {animations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [height * 0.2, height],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  bar: {
    width: 4,
    marginHorizontal: 2,
    borderRadius: 2,
    minHeight: 8,
  },
});

export default VoiceWaveform;