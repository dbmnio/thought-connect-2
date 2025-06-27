import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Brain, Camera, MessageSquare, Users, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTeam } from '@/hooks/useTeam';
import { useAuth } from '@/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';

function TabHeader() {
  const router = useRouter();
  const { selectedTeams } = useTeam();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();

  const getDisplayText = () => {
    if (selectedTeams.length === 0) return 'No Teams';
    if (selectedTeams.length === 1) return selectedTeams[0].name;
    if (selectedTeams.length === 2) return `${selectedTeams[0].name} + 1 more`;
    return `${selectedTeams[0].name} + ${selectedTeams.length - 1} more`;
  };

  const handleProfilePress = () => {
    router.push('/(app)/user-profile');
  };

  const handleTeamFilterPress = () => {
    router.push('/(app)/team-filter');
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <View style={styles.headerContent}>
        {/* User Profile Button */}
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          <Avatar
            uri={profile?.avatar_url}
            name={profile?.full_name || 'User'}
            size="small"
          />
        </TouchableOpacity>

        {/* Team Filter Button */}
        <TouchableOpacity
          style={styles.teamButton}
          onPress={handleTeamFilterPress}
          activeOpacity={0.7}
        >
          <Users color="#6366F1" size={14} />
          <Text style={styles.teamText} numberOfLines={1}>
            {getDisplayText()}
          </Text>
          <ChevronDown color="#6366F1" size={12} />
        </TouchableOpacity>

        {/* Temporary Test Button */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => router.push('/(app)/embedding-test')}
          >
            <Text style={styles.testButtonText}>Test</Text>
          </TouchableOpacity>
        )}
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
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 10,
    flex: 1,
    maxWidth: 180,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.6)',
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    lineHeight: 14,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    lineHeight: 18,
  },
  teamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    maxWidth: 140,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.6)',
  },
  teamText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#6366F1',
    flex: 1,
  },
  testButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
  },
  testButtonText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#B91C1C',
  },
});