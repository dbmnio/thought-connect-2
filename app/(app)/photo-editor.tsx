import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Button, Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText, HelpCircle, MessageSquare, Undo2 } from 'lucide-react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import {
  Canvas,
  Path,
  Skia,
  useCanvasRef,
  Image as SkiaImage,
  useImage,
  rect,
  fitbox,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useSharedValue } from 'react-native-reanimated';

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
  const { width, height } = useWindowDimensions();
  const [selectedType, setSelectedType] = useState<ThoughtType>('question');
  const [currentColor, setCurrentColor] = useState(PALETTE_COLORS[0]);
  const [paths, setPaths] = useState<{ path: any; color: string }[]>([]);
  const currentPath = useSharedValue(Skia.Path.Make());
  const currentPathColor = useSharedValue(PALETTE_COLORS[0]);

  const canvasRef = useCanvasRef();
  const skiaImage = useImage(uri);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const addPath = useCallback((path: any, color: string) => {
    setPaths(prev => [...prev, { path, color }]);
  }, []);

  const panGesture = Gesture.Pan()
    .onStart((g) => {
      currentPathColor.value = currentColor;
      const newPath = Skia.Path.Make();
      newPath.moveTo(g.x, g.y);
      currentPath.value = newPath;
    })
    .onUpdate((g) => {
      if (currentPath.value) {
        const newPath = currentPath.value.copy();
        newPath.lineTo(g.x, g.y);
        currentPath.value = newPath;
      }
    })
    .onEnd(() => {
      if (currentPath.value) {
        runOnJS(addPath)(currentPath.value, currentPathColor.value);
      }
    });

  const handleUndo = () => {
    setPaths(prev => prev.slice(0, -1));
  };

  const handleSave = async () => {
    if (!permissionResponse?.granted) {
      const permission = await requestPermission();
      if (!permission.granted) {
        Alert.alert('Permission required', 'We need permission to save photos to your device.');
        return;
      }
    }

    try {
      // Temporarily clear the "live" path so it's not captured in the snapshot
      const lastLivePath = currentPath.value;
      currentPath.value = Skia.Path.Make();

      const image = await canvasRef.current?.makeImageSnapshot();
      
      // Restore the live path
      currentPath.value = lastLivePath;

      if (!image) throw new Error('Failed to capture image');
      
      const bytes = image.encodeToBytes();
      if (!bytes) throw new Error('Failed to encode image to bytes.');
      
      const tempPath = `${FileSystem.cacheDirectory}${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(tempPath, Buffer.from(bytes).toString('base64'), { encoding: FileSystem.EncodingType.Base64 });
      await MediaLibrary.saveToLibraryAsync(tempPath);

      Alert.alert('Saved!', 'Your edited image has been saved to your photos.');
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save image.');
    }
  };

  useEffect(() => {
    if (!uri) {
      if (router.canGoBack()) router.back();
    }
  }, [uri, router]);

  if (!uri || !skiaImage) {
    return null;
  }
  
  const dst = rect(0, 0, 1080, 1920); // Example dimensions, adjust as needed
  const src = rect(0, 0, skiaImage.width(), skiaImage.height());
  const transform = fitbox('contain', src, dst);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <GestureDetector gesture={panGesture}>
        <Canvas style={styles.canvas} ref={canvasRef}>
          <SkiaImage image={skiaImage} x={0} y={0} width={width} height={height} fit="cover" />
          {paths.map((p, index) => (
            <Path
              key={index}
              path={p.path}
              color={p.color}
              style="stroke"
              strokeWidth={5}
              strokeCap="round"
              strokeJoin="round"
            />
          ))}
          <Path
            path={currentPath}
            color={currentPathColor}
            style="stroke"
            strokeWidth={5}
            strokeCap="round"
            strokeJoin="round"
          />
        </Canvas>
      </GestureDetector>
      
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Button onPress={() => router.back()} title="Cancel" color="#fff" />
        <Button onPress={handleSave} title="Done" color="#fff" />
      </View>
      
      <EditorToolbar
        selectedColor={currentColor}
        onColorChange={setCurrentColor}
        onUndo={handleUndo}
      />
      
      <View style={[styles.tabBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 24 }]}>
        {typeOptions.map((option) => {
          const isActive = selectedType === option.type;
          return (
            <TouchableOpacity
              key={option.type}
              style={styles.tabButton}
              onPress={() => setSelectedType(option.type)}
              activeOpacity={0.7}
            >
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
  canvas: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  toolbar: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    padding: 8,
    alignItems: 'center',
    gap: 20,
    zIndex: 10,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
    zIndex: 10,
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