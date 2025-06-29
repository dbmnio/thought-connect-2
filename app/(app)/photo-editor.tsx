import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText, HelpCircle, MessageSquare } from 'lucide-react-native';

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

/**
 * A screen for editing a photo before saving it as a thought.
 * Allows drawing on the image and selecting a thought type.
 */
export default function PhotoEditorScreen() {
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const insets = useSafeAreaInsets();
  const [selectedType, setSelectedType] = useState<ThoughtType>('question');

  useEffect(() => {
    if (!uri) {
      // This should not happen in a normal flow as navigation to this
      // screen requires a URI. We navigate back if it's possible.
      if (router.canGoBack()) {
        router.back();
      }
    }
  }, [uri, router]);

  if (!uri) {
    // Render nothing while we are about to navigate back.
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Edit Photo',
          headerLeft: () => (
            <Button
              onPress={() => {
                router.back();
              }}
              title="Cancel"
            />
          ),
          headerRight: () => (
            <Button
              onPress={() => {
                // TODO: Implement saving logic with the edited image and selectedType
                router.back();
              }}
              title="Done"
            />
          ),
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
        }}
      />
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />

      {/* Tab-Style Type Selection Bar */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 24 }]}>
        {typeOptions.map((option) => {
          const isActive = selectedType === option.type;
          return (
            <TouchableOpacity
              key={option.type}
              style={styles.tabButton}
              onPress={() => setSelectedType(option.type)}
              activeOpacity={0.7}>
              <View style={styles.tabButtonContent}>
                <option.icon color={isActive ? option.color : '#9CA3AF'} size={24} />
                <Text style={[styles.tabButtonText, { color: isActive ? option.color : '#9CA3AF' }]}>
                  {option.label}
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
    backgroundColor: 'black',
  },
  image: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});