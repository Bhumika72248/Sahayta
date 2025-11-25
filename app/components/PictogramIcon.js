import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';
import { colors } from '../theme/theme';

const PictogramIcon = ({ 
  name, 
  size = 56, 
  color = colors.primary,
  backgroundColor = colors.background 
}) => {
  const renderIcon = () => {
    switch (name) {
      case 'aadhaar':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Rect x="3" y="4" width="18" height="16" rx="2" fill={color} />
            <Circle cx="8" cy="9" r="2" fill={backgroundColor} />
            <Path d="M6 16c0-2 2-3 4-3s4 1 4 3" stroke={backgroundColor} strokeWidth="1.5" fill="none" />
            <Rect x="14" y="8" width="4" height="1" fill={backgroundColor} />
            <Rect x="14" y="10" width="4" height="1" fill={backgroundColor} />
            <Rect x="14" y="12" width="3" height="1" fill={backgroundColor} />
          </Svg>
        );
      
      case 'pan':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Rect x="2" y="6" width="20" height="12" rx="2" fill={color} />
            <Rect x="4" y="8" width="6" height="1" fill={backgroundColor} />
            <Rect x="4" y="10" width="8" height="1" fill={backgroundColor} />
            <Rect x="4" y="12" width="5" height="1" fill={backgroundColor} />
            <Rect x="4" y="14" width="7" height="1" fill={backgroundColor} />
            <Circle cx="17" cy="11" r="2" fill={backgroundColor} />
          </Svg>
        );
      
      case 'passport':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Rect x="4" y="2" width="16" height="20" rx="1" fill={color} />
            <Circle cx="12" cy="8" r="2.5" fill={backgroundColor} />
            <Path d="M8 15c0-2.5 2-4 4-4s4 1.5 4 4" stroke={backgroundColor} strokeWidth="1.5" fill="none" />
            <Rect x="7" y="17" width="10" height="0.5" fill={backgroundColor} />
            <Rect x="7" y="18.5" width="8" height="0.5" fill={backgroundColor} />
          </Svg>
        );
      
      case 'license':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Rect x="2" y="7" width="20" height="10" rx="2" fill={color} />
            <Circle cx="7" cy="12" r="2" fill={backgroundColor} />
            <Rect x="11" y="9" width="8" height="1" fill={backgroundColor} />
            <Rect x="11" y="11" width="6" height="1" fill={backgroundColor} />
            <Rect x="11" y="13" width="7" height="1" fill={backgroundColor} />
            <Rect x="11" y="15" width="5" height="1" fill={backgroundColor} />
          </Svg>
        );
      
      case 'voter':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Rect x="3" y="5" width="18" height="14" rx="2" fill={color} />
            <Circle cx="8" cy="10" r="2" fill={backgroundColor} />
            <Path d="M5 17c0-2 2-3 4-3s4 1 4 3" stroke={backgroundColor} strokeWidth="1.5" fill="none" />
            <Polygon points="15,8 17,10 20,7 20,6 17,9 15,7" fill={backgroundColor} />
            <Rect x="14" y="12" width="6" height="1" fill={backgroundColor} />
            <Rect x="14" y="14" width="4" height="1" fill={backgroundColor} />
          </Svg>
        );
      
      case 'ration':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Rect x="4" y="3" width="16" height="18" rx="1" fill={color} />
            <Rect x="6" y="6" width="12" height="1" fill={backgroundColor} />
            <Rect x="6" y="8" width="10" height="1" fill={backgroundColor} />
            <Rect x="6" y="10" width="8" height="1" fill={backgroundColor} />
            <Rect x="6" y="13" width="12" height="1" fill={backgroundColor} />
            <Rect x="6" y="15" width="9" height="1" fill={backgroundColor} />
            <Rect x="6" y="17" width="11" height="1" fill={backgroundColor} />
          </Svg>
        );
      
      case 'camera':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Rect x="2" y="7" width="20" height="12" rx="2" fill={color} />
            <Circle cx="12" cy="13" r="3" fill={backgroundColor} />
            <Rect x="8" y="4" width="8" height="3" rx="1" fill={color} />
            <Circle cx="18" cy="9" r="1" fill={backgroundColor} />
          </Svg>
        );
      
      case 'microphone':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Rect x="9" y="3" width="6" height="10" rx="3" fill={color} />
            <Path d="M6 11c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M12 17v4" stroke={color} strokeWidth="2" />
            <Path d="M8 21h8" stroke={color} strokeWidth="2" />
          </Svg>
        );
      
      case 'document':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path d="M6 2h8l6 6v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" fill={color} />
            <Path d="M14 2v6h6" stroke={backgroundColor} strokeWidth="2" fill="none" />
            <Rect x="8" y="10" width="8" height="1" fill={backgroundColor} />
            <Rect x="8" y="12" width="6" height="1" fill={backgroundColor} />
            <Rect x="8" y="14" width="7" height="1" fill={backgroundColor} />
          </Svg>
        );
      
      default:
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="10" fill={color} />
            <Path d="M12 8v4l3 3" stroke={backgroundColor} strokeWidth="2" fill="none" />
          </Svg>
        );
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {renderIcon()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PictogramIcon;