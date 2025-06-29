import { Tabs } from 'expo-router';
import { Camera, TestTube } from 'lucide-react-native';

export default function CameraTestLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Camera color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Test Tab',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <TestTube color={color} size={size} />,
        }}
      />
    </Tabs>
  );
} 