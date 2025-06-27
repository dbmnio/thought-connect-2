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
import { Camera as CameraIcon, RotateCcw, CircleHelp as HelpCircle, MessageSquare, FileText, X } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedType, setSelectedType] = useState<'question' | 'answer' | 'document' | null>(null);
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
    if (!cameraRef.current || !selectedType) return;

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
            thoughtType: selectedType,
          },
        });
      }
    } catch (error) {
      console.error('Failed to take picture:', error);
    }
  };

  const getTypeInfo = (type: 'question' | 'answer' | 'document') => {
    switch (type) {
      case 'question':
        return {
          icon: HelpCircle,
          title: 'Ask Question',
          description: 'Capture a question to get answers from your community',
          color: '#EF4444',
        };
      case 'answer':
        return {
          icon: MessageSquare,
          title: 'Share Answer',
          description: 'Provide an answer to help others learn',
          color: '#10B981',
        };
      case 'document':
        return {
          icon: FileText,
          title: 'Add Document',
          description: 'Save important information for future reference',
          color: '#F59E0B',
        };
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Type Selection Overlay */}
        {!selectedType && (
          <View style={styles.overlay}>
            <View style={styles.typeSelectionContainer}>
              <Text style={styles.overlayTitle}>What would you like to capture?</Text>
              <View style={styles.typeButtons}>
                {(['question', 'answer', 'document'] as const).map((type) => {
                  const info = getTypeInfo(type);
                  const IconComponent = info.icon;
                  
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeButton, { borderColor: info.color }]}
                      onPress={() => setSelectedType(type)}
                    >
                      <IconComponent color={info.color} size={32} />
                      <Text style={[styles.typeButtonTitle, { color: info.color }]}>
                        {info.title}
                      </Text>
                      <Text style={styles.typeButtonDescription}>
                        {info.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Camera Controls */}
        {selectedType && (
          <>
            <View style={styles.topControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setSelectedType(null)}
              >
                <X color="#FFFFFF" size={24} />
              </TouchableOpacity>
              <View style={styles.selectedTypeIndicator}>
                <Text style={styles.selectedTypeText}>
                  {getTypeInfo(selectedType).title}
                </Text>
              </View>
              <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
                <RotateCcw color="#FFFFFF" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.bottomControls}>
              <View style={styles.captureContainer}>
                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                  <LinearGradient
                    colors={['#6366F1', '#3B82F6']}
                    style={styles.captureButtonGradient}
                  >
                    <CameraIcon color="#FFFFFF" size={32} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeSelectionContainer: {
    padding: 24,
    alignItems: 'center',
  },
  overlayTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
  },
  typeButtons: {
    gap: 20,
  },
  typeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: width * 0.8,
    borderWidth: 2,
  },
  typeButtonTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: 12,
    marginBottom: 8,
  },
  typeButtonDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTypeIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectedTypeText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
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
  },
});