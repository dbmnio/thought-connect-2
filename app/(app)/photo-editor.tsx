import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, CircleHelp as HelpCircle, MessageSquare, FileText } from 'lucide-react-native';
import { useThoughts } from '@/hooks/useThoughts';
import { useTeam } from '@/hooks/useTeam';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

type ThoughtType = 'question' | 'answer' | 'document';

interface TypeOption {
  type: ThoughtType;
  icon: any;
  title: string;
  description: string;
  color: string;
  gradient: string[];
}

const typeOptions: TypeOption[] = [
  {
    type: 'question',
    icon: HelpCircle,
    title: 'Ask Question',
    description: 'Get answers from your community',
    color: '#EF4444',
    gradient: ['#EF4444', '#DC2626'],
  },
  {
    type: 'answer',
    icon: MessageSquare,
    title: 'Share Answer',
    description: 'Help others with your knowledge',
    color: '#10B981',
    gradient: ['#10B981', '#059669'],
  },
  {
    type: 'document',
    icon: FileText,
    title: 'Save Document',
    description: 'Store important information',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'],
  },
];

export default function PhotoEditor() {
  const router = useRouter();
  const { imageUri, thoughtType } = useLocalSearchParams<{
    imageUri: string;
    thoughtType?: ThoughtType;
  }>();

  const [selectedType, setSelectedType] = useState<ThoughtType | null>(thoughtType || null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleTypeSelect = (type: ThoughtType) => {
    setSelectedType(type);
    setError(null);
  };

  const getPlaceholders = () => {
    if (!selectedType) return { title: '', description: '' };
    
    switch (selectedType) {
      case 'question':
        return {
          title: 'What\'s your question?',
          description: 'Provide more details about your question...',
        };
      case 'answer':
        return {
          title: 'What\'s your answer?',
          description: 'Explain your answer in detail...',
        };
      case 'document':
        return {
          title: 'Document title',
          description: 'Describe this document...',
        };
      default:
        return { title: 'Title', description: 'Description...' };
    }
  };

  const handleSave = async () => {
    if (!selectedType) {
      setError('Please select a type for your thought');
      return;
    }

    if (!title.trim()) {
      setError('Please add a title for your thought');
      return;
    }

    if (!description.trim()) {
      setError('Please add a description for your thought');
      return;
    }

    if (selectedTeams.length === 0) {
      setError('Please select at least one team');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createThought(
        selectedType,
        title.trim(),
        description.trim(),
        imageUri
      );
      
      handleBack();
    } catch (error: any) {
      setError(error.message || 'Failed to save thought. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const placeholders = getPlaceholders();
  const selectedOption = typeOptions.find(opt => opt.type === selectedType);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {selectedType ? selectedOption?.title : 'Add Details'}
        </Text>

        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          
          {/* Type Selection Overlay */}
          <View style={styles.typeSelectionOverlay}>
            <View style={styles.typeButtonsContainer}>
              {typeOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = selectedType === option.type;
                
                return (
                  <TouchableOpacity
                    key={option.type}
                    style={[
                      styles.typeIconButton,
                      isSelected && styles.typeIconButtonSelected,
                    ]}
                    onPress={() => handleTypeSelect(option.type)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={isSelected ? option.gradient : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']}
                      style={styles.typeIconGradient}
                    >
                      <IconComponent 
                        color={isSelected ? '#FFFFFF' : option.color} 
                        size={28} 
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Content Form */}
        <View style={styles.formContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Team Selection Info */}
          <View style={styles.teamInfoContainer}>
            <Text style={styles.teamInfoLabel}>
              Will be posted to: {selectedTeams.length > 0 ? selectedTeams[0].name : 'No team selected'}
            </Text>
            {selectedTeams.length > 1 && (
              <Text style={styles.teamInfoSubtext}>
                (First selected team: {selectedTeams[0].name})
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder={placeholders.title}
              placeholderTextColor="#9CA3AF"
              maxLength={100}
            />
            <Text style={styles.characterCount}>
              {title.length}/100
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder={placeholders.description}
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {description.length}/500
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.saveButton, (!selectedType || loading) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!selectedType || loading}
        >
          <LinearGradient
            colors={
              !selectedType || loading 
                ? ['#E5E7EB', '#D1D5DB'] 
                : selectedOption?.gradient || ['#6366F1', '#3B82F6']
            }
            style={styles.saveButtonGradient}
          >
            <Check color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : selectedType ? `Save ${selectedOption?.title}` : 'Select Type First'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  imageContainer: {
    height: height * 0.5,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  typeSelectionOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  typeIconButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  typeIconButtonSelected: {
    transform: [{ scale: 1.1 }],
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  typeIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    marginTop: -24,
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  teamInfoContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  teamInfoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0369A1',
  },
  teamInfoSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#0284C7',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    backgroundColor: '#FAFAFA',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    height: 120,
    backgroundColor: '#FAFAFA',
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 6,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  saveButton: {
    width: '100%',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});