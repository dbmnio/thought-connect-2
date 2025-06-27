import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CircleHelp as HelpCircle, MessageSquare, FileText } from 'lucide-react-native';
import { useThoughts } from '@/hooks/useThoughts';
import { useTeam } from '@/hooks/useTeam';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

type ThoughtType = 'question' | 'answer' | 'document';

interface TypeOption {
  type: ThoughtType;
  icon: any;
  color: string;
  gradient: string[];
}

const typeOptions: TypeOption[] = [
  {
    type: 'question',
    icon: HelpCircle,
    color: '#EF4444',
    gradient: ['#EF4444', '#DC2626'],
  },
  {
    type: 'answer',
    icon: MessageSquare,
    color: '#10B981',
    gradient: ['#10B981', '#059669'],
  },
  {
    type: 'document',
    icon: FileText,
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'],
  },
];

export default function PhotoEditor() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{
    imageUri: string;
  }>();

  const [loading, setLoading] = useState<ThoughtType | null>(null);
  const { createThought } = useThoughts();
  const { selectedTeams } = useTeam();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/(tabs)/camera');
    }
  };

  const handleTypeSelect = async (type: ThoughtType) => {
    if (selectedTeams.length === 0) {
      Alert.alert('No Team Selected', 'Please select at least one team before saving your thought.');
      return;
    }

    setLoading(type);

    try {
      // Generate a simple title based on type and timestamp
      const timestamp = new Date().toLocaleString();
      const title = `${type.charAt(0).toUpperCase() + type.slice(1)} - ${timestamp}`;
      const description = `Captured ${type} from camera`;

      await createThought(
        type,
        title,
        description,
        imageUri
      );
      
      handleBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save thought. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Choose Type</Text>

        <View style={styles.headerRight} />
      </View>

      {/* Full Screen Image with Type Selection */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        
        {/* Dark Overlay for Better Button Visibility */}
        <View style={styles.overlay} />
        
        {/* Team Info */}
        <View style={styles.teamInfo}>
          <Text style={styles.teamInfoText}>
            Posting to: {selectedTeams.length > 0 ? selectedTeams[0].name : 'No team selected'}
          </Text>
        </View>

        {/* Type Selection Buttons */}
        <View style={styles.typeSelectionContainer}>
          <Text style={styles.instructionText}>What type of content is this?</Text>
          
          <View style={styles.typeButtonsContainer}>
            {typeOptions.map((option) => {
              const IconComponent = option.icon;
              const isLoading = loading === option.type;
              
              return (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.typeButton,
                    isLoading && styles.typeButtonLoading,
                  ]}
                  onPress={() => handleTypeSelect(option.type)}
                  disabled={loading !== null}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={isLoading ? ['#9CA3AF', '#6B7280'] : option.gradient}
                    style={styles.typeButtonGradient}
                  >
                    <View style={styles.typeButtonContent}>
                      <IconComponent color="#FFFFFF" size={40} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  teamInfo: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  teamInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  typeSelectionContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  typeButtonLoading: {
    opacity: 0.8,
  },
  typeButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  typeButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});