import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Brain, Camera, MessageSquare, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTeam } from '@/hooks/useTeam';

function TabHeader() {
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

export default function TabLayout() {
  return (
    <>
      <TabHeader />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#6366F1',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
            paddingBottom: 8,
            paddingTop: 8,
            height: 80,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Inter-Medium',
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="knowledge-base"
          options={{
            title: 'Knowledge',
            tabBarIcon: ({ color, size }) => (
              <Brain color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="camera"
          options={{
            title: 'Camera',
            tabBarIcon: ({ color, size }) => (
              <Camera color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="thoughts"
          options={{
            title: 'Thoughts',
            tabBarIcon: ({ color, size }) => (
              <MessageSquare color={color} size={size} />
            ),
          }}
        />
      </Tabs>
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