import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Brain, Camera, MessageSquare, Users, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTeam } from '@/hooks/useTeam';

function TabHeader() {
  const router = useRouter();
  const { selectedTeams } = useTeam();

  const getDisplayText = () => {
    if (selectedTeams.length === 0) return 'No Teams';
    if (selectedTeams.length === 1) return selectedTeams[0].name;
    if (selectedTeams.length === 2) return `${selectedTeams[0].name} + 1 more`;
    return `${selectedTeams[0].name} + ${selectedTeams.length - 1} more`;
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.logo}>ThoughtSpace</Text>
        <TouchableOpacity
          style={styles.teamButton}
          onPress={() => router.push('/(app)/team-change')}
        >
          <Users color="#6366F1" size={16} />
          <Text style={styles.teamText} numberOfLines={1}>
            {getDisplayText()}
          </Text>
          <ChevronDown color="#6366F1" size={14} />
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
            paddingBottom: 4,
            paddingTop: 4,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: 'Inter-Medium',
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="knowledge-base"
          options={{
            title: 'Knowledge',
            tabBarIcon: ({ color, size }) => (
              <Brain color={color} size={20} />
            ),
          }}
        />
        <Tabs.Screen
          name="camera"
          options={{
            title: 'Camera',
            tabBarIcon: ({ color, size }) => (
              <Camera color={color} size={20} />
            ),
          }}
        />
        <Tabs.Screen
          name="thoughts"
          options={{
            title: 'Thoughts',
            tabBarIcon: ({ color, size }) => (
              <MessageSquare color={color} size={20} />
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
    paddingTop: 16,
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
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#6366F1',
  },
  teamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    maxWidth: 180,
  },
  teamText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6366F1',
    flex: 1,
  },
});