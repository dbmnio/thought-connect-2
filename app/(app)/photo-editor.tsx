import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText, HelpCircle, MessageSquare, Undo2 } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, runOnJS } from 'react-native-reanimated';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';

const AnimatedPath = Animated.createAnimatedComponent(Path);

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

const PALETTE_COLORS = ['#EF4444', '#F59E0B', '#84CC16', '#3B82F6', '#A855F7', '#FFFFFF'];

interface EditorToolbarProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  onUndo: () => void;
}

function EditorToolbar({ selectedColor, onColorChange, onUndo }: EditorToolbarProps) {
  return (
    <View style={styles.toolbar}>
      <View style={styles.colorPalette}>
        {PALETTE_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => onColorChange(color)}
          >
            <View style={[
              styles.colorButtonContainer,
              { borderColor: selectedColor === color ? '#FFFFFF' : 'transparent' }
            ]}>
              <View style={[styles.colorButton, { backgroundColor: color }]} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={onUndo} style={styles.undoButton}>
        <Undo2 color="#FFFFFF" size={24} />
      </TouchableOpacity>
    </View>
  );
}

/**
 * A screen for editing a photo before saving it as a thought.
 * Allows drawing on the image and selecting a thought type.
 */
export default function PhotoEditorScreen() {
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const insets = useSafeAreaInsets();
  const [selectedType, setSelectedType] = useState<ThoughtType>('question');
  const [paths, setPaths] = useState<{ d: string; color: string }[]>([]);
  const [currentColor, setCurrentColor] = useState(PALETTE_COLORS[0]);
  const currentPath = useSharedValue('');
  const currentPathColor = useSharedValue(PALETTE_COLORS[0]);
  const viewShotRef = useRef(null);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const handleSave = async () => {
    if (!permissionResponse?.granted) {
      const permission = await requestPermission();
      if (!permission.granted) {
        Alert.alert('Permission required', 'We need permission to save photos to your device.');
        return;
      }
    }

    try {
      const localUri = await captureRef(viewShotRef, {
        quality: 1,
        format: 'jpg',
      });
      await MediaLibrary.saveToLibraryAsync(localUri);
      Alert.alert('Saved!', 'Your edited image has been saved to your photos.');
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save image.');
    }
  };

  const addPath = useCallback((pathData: {d: string, color: string}) => {
    setPaths(prev => [...prev, pathData]);
  }, []);

  const handleUndo = useCallback(() => {
    const lastPath = paths[paths.length - 1];
    const newPaths = paths.slice(0, -1);
    setPaths(newPaths);

    // If the path we are undoing is the same as the one in the "live" layer,
    // clear the live layer to make it disappear.
    if (lastPath && lastPath.d === currentPath.value) {
      currentPath.value = '';
    }
  }, [paths, currentPath]);

  const pan = Gesture.Pan()
    .onStart((g) => {
      currentPath.value = `M${g.x} ${g.y}`;
      currentPathColor.value = currentColor;
    })
    .onUpdate((g) => {
      currentPath.value += ` L${g.x} ${g.y}`;
    })
    .onEnd(() => {
      const pathData = { d: currentPath.value, color: currentPathColor.value };
      runOnJS(addPath)(pathData);
    });

  const animatedProps = useAnimatedProps(() => ({
    d: currentPath.value,
    stroke: currentPathColor.value,
  }));

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
              onPress={handleSave}
              title="Done"
            />
          ),
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
        }}
      />
      <GestureDetector gesture={pan}>
        <View style={{ flex: 1 }} ref={viewShotRef} collapsable={false}>
          <Image source={{ uri }} style={styles.image} resizeMode="contain" />
          <Svg style={StyleSheet.absoluteFill}>
            {paths.map((p, index) => (
              <Path
                key={index}
                d={p.d}
                stroke={p.color}
                strokeWidth={5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            <AnimatedPath
              animatedProps={animatedProps}
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <EditorToolbar
            selectedColor={currentColor}
            onColorChange={setCurrentColor}
            onUndo={handleUndo}
          />
        </View>
      </GestureDetector>

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
  toolbar: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    padding: 8,
    alignItems: 'center',
    gap: 20,
  },
  colorPalette: {
    gap: 16,
  },
  colorButtonContainer: {
    padding: 4,
    borderRadius: 99,
    borderWidth: 2,
  },
  colorButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  undoButton: {
    padding: 4,
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