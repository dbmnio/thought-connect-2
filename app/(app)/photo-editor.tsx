import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, FileText, HelpCircle, MessageSquare, Undo2, Users } from 'lucide-react-native';
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
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useTeam } from '@/hooks/useTeam';
import { supabase } from '@/lib/supabase';

const PALETTE_COLORS = ['#EF4444', '#F59E0B', '#84CC16', '#3B82F6', '#A855F7', '#FFFFFF'];

interface EditorToolbarProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  onUndo: () => void;
  isLandscape: boolean;
}

function EditorToolbar({ selectedColor, onColorChange, onUndo, isLandscape }: EditorToolbarProps) {
  return (
    <View style={[
      styles.toolbar,
      isLandscape && styles.toolbarLandscape
    ]}>
      <View style={[
        styles.colorPalette,
        isLandscape && styles.colorPaletteLandscape
      ]}>
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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDeviceLandscape = windowWidth > windowHeight;
  const { selectedTeams, allTeams } = useTeam();

  const [isProcessing, setIsProcessing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Unlock orientation when the screen is focused
      ScreenOrientation.unlockAsync();
      
      return () => {
        // Lock orientation to portrait when the screen is unfocused
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      };
    }, [])
  );

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

  const getDisplayText = () => {
    if (selectedTeams.length === allTeams.length && allTeams.length > 1) {
      return 'All Teams';
    }
    if (selectedTeams.length === 1) {
      return selectedTeams[0].name;
    }
    if (selectedTeams.length > 1) {
      return 'Multiple Teams';
    }
    return 'Select a Team';
  };

  const handleSaveAndProcess = async (thoughtType: ThoughtType) => {
    if (isProcessing) return;
    
    if (!selectedTeams || selectedTeams.length === 0) {
      Alert.alert('No Team Selected', 'Please select a team before creating a thought.');
      return;
    }

    setIsProcessing(true);

    if (!permissionResponse?.granted) {
      const permission = await requestPermission();
      if (!permission.granted) {
        Alert.alert('Permission required', 'We need permission to save photos to your device.');
        setIsProcessing(false);
        return;
      }
    }

    try {
      const image = await canvasRef.current?.makeImageSnapshot();
      if (!image) throw new Error('Failed to capture image');

      const bytes = image.encodeToBytes();
      if (!bytes) throw new Error('Failed to encode image to bytes.');

      const imageData = Buffer.from(bytes).toString('base64');
      const tempPath = `${FileSystem.cacheDirectory}${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(tempPath, imageData, { encoding: FileSystem.EncodingType.Base64 });

      // 1. Upload image to Supabase Storage
      const fileName = `${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('thoughts-images')
        .upload(fileName, Buffer.from(bytes), {
          contentType: 'image/png',
        });

      if (uploadError) throw new Error(`Storage upload error: ${uploadError.message}`);
      if (!uploadData) throw new Error('No data returned from storage upload');

      const { data: { publicUrl } } = supabase.storage.from('thoughts-images').getPublicUrl(uploadData.path);

      // 2. Create a new thought in the database
      const teamId = selectedTeams[0].id; // For simplicity, use the first selected team
      const { data: thoughtData, error: thoughtError } = await supabase
        .from('thoughts')
        .insert({
          type: thoughtType,
          image_url: publicUrl,
          team_id: teamId,
          embedding_status: 'pending'
        })
        .select('id')
        .single();
      
      if (thoughtError) throw new Error(`Failed to create thought: ${thoughtError.message}`);
      if (!thoughtData) throw new Error('Failed to create thought, no ID returned.');

      // 3. Invoke the edge function to generate embedding
      const { error: functionError } = await supabase.functions.invoke('generate-thought-embedding', {
        body: { thought_id: thoughtData.id },
      });

      if (functionError) {
        // Still navigate back, but log the error. The user can see the thought, it just won't be searchable yet.
        // A background process could retry failed embeddings.
        console.warn('Edge function invocation failed, but thought was saved.', functionError);
      }
      
      router.back();

    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      Alert.alert('Error', `Failed to save thought: ${message}`);
    } finally {
      setIsProcessing(false);
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
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}

      <GestureDetector gesture={panGesture}>
        <Canvas style={styles.canvas} ref={canvasRef}>
          <SkiaImage image={skiaImage} x={0} y={0} width={windowWidth} height={windowHeight} fit="contain" />
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/team-filter')} style={styles.teamButton}>
          <Users color="#A7A7A7" size={14} />
          <Text style={styles.teamText} numberOfLines={1}>
            {getDisplayText()}
          </Text>
        </TouchableOpacity>
      </View>
      
      <EditorToolbar
        selectedColor={currentColor}
        onColorChange={setCurrentColor}
        onUndo={handleUndo}
        isLandscape={isDeviceLandscape}
      />
      
      <View style={[
        styles.tabBar, 
        isDeviceLandscape && styles.tabBarLandscape,
        isDeviceLandscape 
          ? { paddingRight: insets.right > 0 ? insets.right : 12, paddingTop: insets.top, paddingBottom: insets.bottom }
          : { paddingBottom: insets.bottom > 0 ? insets.bottom : 24 }
      ]}>
        {typeOptions.map((option) => {
          return (
            <TouchableOpacity
              key={option.type}
              style={styles.tab}
              onPress={() => {
                setSelectedType(option.type);
                handleSaveAndProcess(option.type);
              }}
              disabled={isProcessing}
            >
              <option.icon color={option.color} size={24} />
              <Text style={[styles.tabLabel, { color: option.color }]}>{option.label}</Text>
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
    backgroundColor: '#000',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  processingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 90,
  },
  backButton: {
    padding: 8,
  },
  teamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 99,
    maxWidth: '50%',
  },
  teamText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
  },
  toolbar: {
    position: 'absolute',
    right: 12,
    top: 100,
    bottom: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarLandscape: {
    flexDirection: 'row',
    top: 12,
    right: 'auto',
    left: '50%',
    transform: [{ translateX: -150 }], // Adjust as needed
    bottom: 'auto',
    width: 300,
  },
  colorPalette: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 18,
    padding: 6,
    gap: 8,
  },
  colorPaletteLandscape: {
    flexDirection: 'row',
  },
  colorButtonContainer: {
    padding: 3,
    borderRadius: 99,
    borderWidth: 2,
  },
  colorButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  undoButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 99,
    marginTop: 12,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: 12,
  },
  tabBarLandscape: {
    flexDirection: 'column',
    left: 'auto',
    right: 12,
    top: 100,
    bottom: 20,
    justifyContent: 'space-around',
    width: 90,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 18,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});