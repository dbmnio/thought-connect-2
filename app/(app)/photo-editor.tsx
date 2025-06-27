import { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, CircleHelp as HelpCircle, MessageSquare, FileText } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function PhotoEditor() {
  const router = useRouter();
  const { imageUri, thoughtType } = useLocalSearchParams<{
    imageUri: string;
    thoughtType: 'question' | 'answer' | 'document';
  }>();

  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const getTypeInfo = () => {
    switch (thoughtType) {
      case 'question':
        return {
          icon: HelpCircle,
          title: 'Ask Question',
          color: '#EF4444',
          placeholder: 'Describe your question...',
        };
      case 'answer':
        return {
          icon: MessageSquare,
          title: 'Share Answer',
          color: '#10B981',
          placeholder: 'Explain your answer...',
        };
      case 'document':
        return {
          icon: FileText,
          title: 'Add Document',
          color: '#F59E0B',
          placeholder: 'Describe this document...',
        };
      default:
        return {
          icon: MessageSquare,
          title: 'Add Thought',
          color: '#6366F1',
          placeholder: 'Describe your thought...',
        };
    }
  };

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please add a description for your thought');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call to save thought
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show different behavior based on thought type
      if (thoughtType === 'question') {
        // Simulate searching for existing answers
        Alert.alert(
          'Question Saved',
          'We found some similar answers that might help. Would you like to review them?',
          [
            { text: 'Not Now', onPress: () => router.back() },
            { text: 'Review', onPress: () => router.back() },
          ]
        );
      } else {
        Alert.alert('Success', 'Your thought has been saved!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save thought. Please try again.');
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

      {/* Description Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={styles.textInput}
          value={description}
          onChangeText={setDescription}
          placeholder={typeInfo.placeholder}
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={500}
          textAlignVertical="top"
        />
        <Text style={styles.characterCount}>
          {description.length}/500
        </Text>
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
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    height: 120,
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