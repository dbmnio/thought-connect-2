import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { Camera as CameraIcon, RotateCcw, X } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import { useThoughtStore } from '@/lib/stores/useThoughtStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const setCapturedImage = useThoughtStore((state) => state.setCapturedImage);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      // Resume camera preview when the screen is focused
      const resumePreview = async () => {
        if (cameraRef.current) {
          await cameraRef.current.resumePreview();
        }
      };
      resumePreview();

      return () => {
        // Pause camera preview when the screen is unfocused
        const pausePreview = async () => {
          if (cameraRef.current) {
            await cameraRef.current.pausePreview();
          }
        };
        pausePreview();
      };
    }, [])
  );

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <CameraIcon color="#6366F1" size={64} />
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            We need camera access to capture your thoughts and questions
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <LinearGradient colors={['#6366F1', '#3B82F6']} style={styles.permissionButtonGradient}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      if (Platform.OS === 'web') {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });

        if (photo && photo.base64) {
          setCapturedImage({
            uri: `data:image/jpeg;base64,${photo.base64}`,
            base64: photo.base64,
          });
          router.push('/(app)/photo-editor');
        }
      } else {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        if (photo) {
          const photoDirectory = `${FileSystem.documentDirectory}photos/`;
          const fileInfo = await FileSystem.getInfoAsync(photoDirectory);
          if (!fileInfo.exists) {
            await FileSystem.makeDirectoryAsync(photoDirectory, { intermediates: true });
          }
          const newImageUri = `${photoDirectory}${Date.now()}.jpg`;
          await FileSystem.copyAsync({
            from: photo.uri,
            to: newImageUri,
          });

          setCapturedImage({ uri: newImageUri });
          router.push('/(app)/photo-editor');
        }
      }
    } catch (error) {
      console.error('Failed to take picture:', error);
      
      // Show user-friendly error message
      if (Platform.OS === 'web') {
        // For web platform, show a simple alert
        alert('Failed to capture image. Please try again.');
      } else {
        // For mobile platforms, use Alert API
        Alert.alert(
          'Camera Error',
          'Failed to capture image. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

      {/* Header Controls */}
      <View style={[styles.headerControls, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerLeft} />
        <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
          <RotateCcw color="#FFFFFF" size={20} />
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.captureContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonOuter}>
              <View style={styles.captureButtonInner} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    width: '100%',
  },
  permissionButtonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  permissionButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  headerControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerLeft: {
    width: 40,
  },
  flipButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingHorizontal: 24,
  },
  captureContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});