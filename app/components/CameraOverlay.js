import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, typography, spacing } from '../theme/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CameraOverlay = ({ 
  documentType = 'document',
  isAligned = false,
  instructions = [],
  confidence = 0 
}) => {
  const getOverlayColor = () => {
    if (confidence > 0.8) {
      return colors.success;
    } else if (confidence > 0.5) {
      return colors.secondary;
    } else {
      return colors.error;
    }
  };

  const getInstructionText = () => {
    if (instructions.length > 0) {
      return instructions[0];
    } else if (isAligned) {
      return 'Document aligned. Tap to capture.';
    } else {
      return 'Position document in frame';
    }
  };

  const frameWidth = screenWidth * 0.8;
  const frameHeight = frameWidth * 0.63; // Standard document ratio

  return (
    <View style={styles.container}>
      {/* Top overlay */}
      <View style={[styles.overlay, styles.topOverlay]} />
      
      {/* Middle section with frame */}
      <View style={styles.middleSection}>
        {/* Left overlay */}
        <View style={[styles.overlay, styles.sideOverlay]} />
        
        {/* Document frame */}
        <View style={[styles.frame, { width: frameWidth, height: frameHeight }]}>
          <View style={[styles.frameBorder, { borderColor: getOverlayColor() }]}>
            {/* Corner indicators */}
            <View style={[styles.corner, styles.topLeft, { borderColor: getOverlayColor() }]} />
            <View style={[styles.corner, styles.topRight, { borderColor: getOverlayColor() }]} />
            <View style={[styles.corner, styles.bottomLeft, { borderColor: getOverlayColor() }]} />
            <View style={[styles.corner, styles.bottomRight, { borderColor: getOverlayColor() }]} />
            
            {/* Document type indicator */}
            <View style={styles.documentTypeContainer}>
              <Text style={styles.documentType}>
                {documentType.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Right overlay */}
        <View style={[styles.overlay, styles.sideOverlay]} />
      </View>
      
      {/* Bottom overlay with instructions */}
      <View style={[styles.overlay, styles.bottomOverlay]}>
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructions}>
            {getInstructionText()}
          </Text>
          
          {confidence > 0 && (
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceText}>
                Quality: {Math.round(confidence * 100)}%
              </Text>
              <View style={styles.confidenceBar}>
                <View 
                  style={[
                    styles.confidenceFill,
                    { 
                      width: `${confidence * 100}%`,
                      backgroundColor: getOverlayColor()
                    }
                  ]} 
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  topOverlay: {
    flex: 1,
  },
  middleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideOverlay: {
    flex: 1,
    height: screenWidth * 0.8 * 0.63, // Match frame height
  },
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameBorder: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderRadius: 8,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 3,
  },
  topLeft: {
    top: -3,
    left: -3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -3,
    right: -3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -3,
    left: -3,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -3,
    right: -3,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  documentTypeContainer: {
    position: 'absolute',
    top: -30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  documentType: {
    ...typography.caption,
    color: colors.white,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    fontWeight: '600',
  },
  bottomOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  instructions: {
    ...typography.bodyLarge,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  confidenceContainer: {
    alignItems: 'center',
    width: '100%',
  },
  confidenceText: {
    ...typography.caption,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  confidenceBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default CameraOverlay;