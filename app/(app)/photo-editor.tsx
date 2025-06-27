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
import { ArrowLeft, CircleHelp as HelpCircle, MessageSquare, FileText, Users, ChevronDown } from 'lucide-react-native';
import { useThoughtStore } from '@/lib/stores/useThoughtStore';
import { useTeam } from '@/hooks/useTeam';
import { useAuth } from '@/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

type ThoughtType = 'question' | 'answer' | 'document';

interface TypeOption {
  type: ThoughtType;
  icon: any;
  color: string;
  label: string;
}

const typeOptions: TypeOption[] = [
  {
    type: 'question',
    icon: HelpCircle,
    color: '#EF4444',
    label: 'Question',
  },
  {
    type: 'answer',
    icon: MessageSquare,
    color: '#10B981',
    label: 'Answer',
  },
  {
    type: 'document',
    icon: FileText,
    color: '#F59E0B',
    label: 'Document',
  },
];

export default function PhotoEditor() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{
    imageUri: string;
  }>();

  const [loading, setLoading] = useState<ThoughtType | null>(null);
  const { createThought } = useThoughtStore();
  const { selectedTeams } = useTeam();
  const { user } = useAuth();
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
        {
          type,
          title,
          description,
          imageUrl: imageUri,
        },
        user,
        selectedTeams[0].id
      );
      
      handleBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save thought. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const getDisplayText = () => {
    if (selectedTeams.length === 0) return 'No Teams';
    if (selectedTeams.length === 1) return selectedTeams[0].name;
    if (selectedTeams.length === 2) return `${selectedTeams[0].name} + 1 more`;
    return `${selectedTeams[0].name} + ${selectedTeams.length - 1} more`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Choose Type</Text>

        {/* Team Display */}
        <View style={styles.teamButton}>
          <Users color="#6366F1" size={14} />
          <Text style={styles.teamText} numberOfLines={1}>
            {getDisplayText()}
          </Text>
          <ChevronDown color="#6366F1" size={12} />
        </View>
      </View>

      {/* Full Screen Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </View>

      {/* Tab-Style Type Selection Bar */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom + 4 }]}>
        {typeOptions.map((option) => {
          const IconComponent = option.icon;
          const isLoading = loading === option.type;
          const isActive = false; // No active state needed for this use case
          
          return (
            <TouchableOpacity
              key={option.type}
              style={styles.tabButton}
              onPress={() => handleTypeSelect(option.type)}
              disabled={loading !== null}
              activeOpacity={0.7}
            >
              <View style={styles.tabButtonContent}>
                <IconComponent 
                  color={isLoading ? '#9CA3AF' : option.color} 
                  size={20} 
                />
                <Text 
                  style={[
                    styles.tabButtonText,
                    { color: isLoading ? '#9CA3AF' : option.color }
                  ]}
                >
                  {isLoading ? 'Saving...' : option.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  teamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    maxWidth: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  teamText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#6366F1',
    flex: 1,
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 4,
    height: 60,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    marginTop: 2,
    textAlign: 'center',
  },
});