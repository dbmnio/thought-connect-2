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
import { ArrowLeft, Check, CircleHelp as HelpCircle, MessageSquare, FileText, ChevronDown } from 'lucide-react-native';
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
    
    const option = typeOptions.find(opt => opt.type === selectedType);
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
          {selectedType ? selectedOption?.title : 'Choose Type'}
        </Text>

        {selectedType && (
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Check color="#FFFFFF" size={24} />
          </TouchableOpacity>
        )}
        
        {!selectedType && <View style={styles.headerRight} />}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>

        {!selectedType ? (
          /* Type Selection */
          <View style={styles.typeSelectionContainer}>
            <Text style={styles.sectionTitle}>What would you like to create?</Text>
            <Text style={styles.sectionSubtitle}>
              Choose the type of content you want to share with your team
            </Text>

            <View style={styles.typeOptions}>
              {typeOptions.map((option) => {
                const IconComponent = option.icon;
                
                return (
                  <TouchableOpacity
                    key={option.type}
                    style={styles.typeOption}
                    onPress={() => handleTypeSelect(option.type)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={option.gradient}
                      style={styles.typeOptionGradient}
                    >
                      <View style={styles.typeOptionContent}>
                        <View style={styles.typeOptionIcon}>
                          <IconComponent color="#FFFFFF" size={32} />
                        </View>
                        <View style={styles.typeOptionText}>
                          <Text style={styles.typeOptionTitle}>{option.title}</Text>
                          <Text style={styles.typeOptionDescription}>
                            {option.description}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          /* Content Form */
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

            {/* Change Type Button */}
            <TouchableOpacity
              style={styles.changeTypeButton}
              onPress={() => setSelectedType(null)}
            >
              <Text style={styles.changeTypeText}>Change Type</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Save Button (when type is selected) */}
      {selectedType && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={styles.saveButtonLarge}
            onPress={handleSave}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#9CA3AF', '#9CA3AF'] : selectedOption?.gradient || ['#6366F1', '#3B82F6']}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : `Save ${selectedOption?.title}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
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
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: height * 0.4,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  typeSelectionContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    marginTop: -24,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  typeOptions: {
    gap: 16,
  },
  typeOption: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  typeOptionGradient: {
    padding: 24,
  },
  typeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeOptionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  typeOptionText: {
    flex: 1,
  },
  typeOptionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  typeOptionDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
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
    marginBottom: 16,
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
    marginBottom: 16,
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
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    height: 100,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  changeTypeButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginTop: 8,
  },
  changeTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 16,
  },
  saveButtonLarge: {
    width: '100%',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});