import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, CircleHelp as HelpCircle, MessageSquare, FileText, ChevronDown } from 'lucide-react-native';
import { useThoughts } from '@/hooks/useThoughts';
import { useTeam } from '@/hooks/useTeam';

const { width, height } = Dimensions.get('window');

export default function PhotoEditor() {
  const router = useRouter();
  const { imageUri, thoughtType } = useLocalSearchParams<{
    imageUri: string;
    thoughtType: 'question' | 'answer' | 'document';
  }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createThought } = useThoughts();
  const { selectedTeams } = useTeam();

  const getTypeInfo = () => {
    switch (thoughtType) {
      case 'question':
        return {
          icon: HelpCircle,
          title: 'Ask Question',
          color: '#EF4444',
          titlePlaceholder: 'What\'s your question?',
          descriptionPlaceholder: 'Provide more details about your question...',
        };
      case 'answer':
        return {
          icon: MessageSquare,
          title: 'Share Answer',
          color: '#10B981',
          titlePlaceholder: 'What\'s your answer?',
          descriptionPlaceholder: 'Explain your answer in detail...',
        };
      case 'document':
        return {
          icon: FileText,
          title: 'Add Document',
          color: '#F59E0B',
          titlePlaceholder: 'Document title',
          descriptionPlaceholder: 'Describe this document...',
        };
      default:
        return {
          icon: MessageSquare,
          title: 'Add Thought',
          color: '#6366F1',
          titlePlaceholder: 'Title',
          descriptionPlaceholder: 'Description...',
        };
    }
  };

  const handleSave = async () => {
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
        thoughtType,
        title.trim(),
        description.trim(),
        imageUri
      );
      
      router.back();
    } catch (error: any) {
      setError(error.message || 'Failed to save thought. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const typeInfo = getTypeInfo();
  const IconComponent = typeInfo.icon;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={[styles.typeIndicator, { backgroundColor: typeInfo.color }]}>
            <IconComponent color="#FFFFFF" size={20} />
          </View>
          <Text style={styles.headerTitle}>{typeInfo.title}</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Check color="#FFFFFF" size={24} />
        </TouchableOpacity>
      </View>

      {/* Image Preview */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </View>

      {/* Input Form */}
      <View style={styles.inputContainer}>
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
            placeholder={typeInfo.titlePlaceholder}
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
            placeholder={typeInfo.descriptionPlaceholder}
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

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButtonLarge}
          onPress={handleSave}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ['#9CA3AF', '#9CA3AF'] : [typeInfo.color, typeInfo.color]}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : `Save ${typeInfo.title}`}
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
    paddingTop: 60,
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  imageContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 0,
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
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: 40,
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