import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTeam } from '@/hooks/useTeam';

function AppHeader() {
  const router = useRouter();
  const { currentTeam } = useTeam();

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.logo}>ThoughtSpace</Text>
        <TouchableOpacity
          style={styles.teamButton}
          onPress={() => router.push('/(app)/team-change')}
        >
          <Users color="#6366F1" size={20} />
          <Text style={styles.teamText}>{currentTeam?.name || 'Personal'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AppLayout() {
  return (
    <>
      <AppHeader />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="team-change" />
        <Stack.Screen name="photo-editor" />
        <Stack.Screen name="question-thread/[id]" />
        <Stack.Screen name="answer-view/[id]" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#6366F1',
  },
  teamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  teamText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6366F1',
  },
});