import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="team-change" />
      <Stack.Screen name="team-filter" />
      <Stack.Screen name="team-settings/[id]" />
      <Stack.Screen name="photo-editor" />
      <Stack.Screen name="question-thread/[id]" />
      <Stack.Screen name="answer-view/[id]" />
      <Stack.Screen name="user-profile" />
    </Stack>
  );
}