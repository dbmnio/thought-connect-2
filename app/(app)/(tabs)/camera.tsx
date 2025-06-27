import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Camera as CameraIcon, RotateCcw, X } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

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
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo) {
        router.push({
          pathname: '/(app)/photo-editor',
          params: {
            imageUri: photo.uri,
          },
        });
      }
    } catch (error) {
      console.error('Failed to take picture:', error);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Header Controls */}
        <View style={styles.headerControls}>
          <View style={styles.headerLeft} />
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <RotateCcw color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <View style={styles.captureContainer}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <LinearGradient
                colors={['#6366F1', '#3B82F6']}
                style={styles.captureButtonGradient}
              >
                <View style={styles.captureButtonInner} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerLeft: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  captureContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
  },
  captureButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2222222',
  },
});