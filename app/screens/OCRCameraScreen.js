import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme/theme';
import { updateWorkflowData } from '../store/slices/workflowSlice';
import CameraOverlay from '../components/CameraOverlay';
import FullScreenModal from '../components/FullScreenModal';
import LargeButton from '../components/LargeButton';
import { extractDocumentData, validateImageQuality, getAlignmentGuidance } from '../api/ocrService';
import { synthesizeSpeech } from '../api/ttsService';

const OCRCameraScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { currentLanguage } = useSelector(state => state.language);
  
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [alignmentData, setAlignmentData] = useState({
    isAligned: false,
    instructions: ['Position document in frame'],
    confidence: 0
  });

  const documentType = route.params?.documentType || 'document';
  const returnTo = route.params?.returnTo;
  const stepKey = route.params?.stepKey;

  useEffect(() => {
    getCameraPermissions();
    playInstructions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const playInstructions = async () => {
    try {
      await synthesizeSpeech(
        `Position your ${documentType} in the camera frame. The document should be well-lit and clearly visible.`,
        currentLanguage,
        { playImmediately: true }
      );
    } catch (error) {
      console.error('TTS Error:', error);
    }
  };

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;
    
    setIsCapturing(true);
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });
      
      setCapturedImage(photo);
      
      // Validate image quality
      const qualityResult = await validateImageQuality(photo.uri);
      
      if (!qualityResult.data.isValid) {
        Alert.alert(
          'Image Quality Issue',
          qualityResult.data.recommendations.join('\n'),
          [
            { text: 'Retake', onPress: () => setIsCapturing(false) },
            { text: 'Continue Anyway', onPress: () => processOCR(photo.uri) }
          ]
        );
        return;
      }
      
      await processOCR(photo.uri);
      
    } catch (error) {
      console.error('Camera capture error:', error);
      Alert.alert('Capture Error', 'Failed to capture image. Please try again.');
      setIsCapturing(false);
    }
  };

  const processOCR = async (imageUri) => {
    try {
      await synthesizeSpeech(
        'Processing document. Please wait...',
        currentLanguage,
        { playImmediately: true }
      );
      
      const result = await extractDocumentData(imageUri, documentType);
      
      if (result.success) {
        setOcrResult(result.data);
        setShowConfirmModal(true);
        
        await synthesizeSpeech(
          'Document processed successfully. Please review the extracted information.',
          currentLanguage,
          { playImmediately: true }
        );
      } else {
        throw new Error('OCR processing failed');
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      Alert.alert(
        'Processing Error',
        'Failed to process document. Please ensure the document is clear and try again.',
        [
          { text: 'Retake', onPress: handleRetake },
          { text: 'Cancel', onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setOcrResult(null);
    setShowConfirmModal(false);
    setIsCapturing(false);
  };

  const handleConfirmOCR = () => {
    if (returnTo === 'WorkflowStepper' && stepKey) {
      // Update workflow data
      dispatch(updateWorkflowData({ [stepKey]: ocrResult }));
      navigation.goBack();
    } else {
      // Navigate to form filling
      navigation.navigate('FormFilling', { ocrData: ocrResult });
    }
  };

  const handleFlashToggle = () => {
    // Flash toggle functionality would be implemented here
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <LargeButton
          title="Grant Permission"
          onPress={getCameraPermissions}
          style={styles.permissionButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        onCameraReady={handleCameraReady}
        autoFocus={Camera.Constants.AutoFocus.on}
      >
        <CameraOverlay
          documentType={documentType}
          isAligned={alignmentData.isAligned}
          instructions={alignmentData.instructions}
          confidence={alignmentData.confidence}
        />
        
        {/* Camera Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleFlashToggle}
          >
            <Ionicons name="flash-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
        
        {/* Capture Button */}
        <View style={styles.captureContainer}>
          <TouchableOpacity
            style={[
              styles.captureButton,
              isCapturing && styles.captureButtonDisabled
            ]}
            onPress={handleCapture}
            disabled={isCapturing || !cameraReady}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </Camera>

      {/* OCR Confirmation Modal */}
      <FullScreenModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Document Details"
      >
        {ocrResult && (
          <View style={styles.ocrResultContainer}>
            <Text style={styles.ocrResultTitle}>Extracted Information:</Text>
            
            {Object.entries(ocrResult.fields).map(([key, value]) => (
              <View key={key} style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                </Text>
                <Text style={styles.fieldValue}>{value}</Text>
              </View>
            ))}
            
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceText}>
                Confidence: {Math.round(ocrResult.confidence * 100)}%
              </Text>
            </View>
            
            <View style={styles.modalButtons}>
              <LargeButton
                title="Retake"
                onPress={handleRetake}
                variant="secondary"
                style={styles.modalButton}
              />
              <LargeButton
                title="Confirm"
                onPress={handleConfirmOCR}
                style={styles.modalButton}
              />
            </View>
          </View>
        )}
      </FullScreenModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
  },
  permissionText: {
    ...typography.body,
    color: colors.white,
    textAlign: 'center',
    margin: spacing.lg,
  },
  permissionButton: {
    margin: spacing.lg,
  },
  controls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.secondary,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondary,
  },
  ocrResultContainer: {
    flex: 1,
  },
  ocrResultTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
  },
  fieldContainer: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.disabled,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  fieldValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  confidenceContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  confidenceText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  modalButton: {
    flex: 0.45,
  },
});

export default OCRCameraScreen;