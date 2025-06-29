import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export function TeamManagementSection() {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Teams</Text>
      
      <TouchableOpacity
        style={styles.teamManagementButton}
        onPress={() => router.push('/(app)/team-change')}
        activeOpacity={0.7}
      >
        <LinearGradient colors={['#6366F1', '#3B82F6']} style={styles.teamManagementGradient}>
          <View style={styles.teamManagementContent}>
            <View style={styles.teamManagementLeft}>
              <View style={styles.teamManagementIcon}>
                <Users color="#FFFFFF" size={24} />
              </View>
              <View style={styles.teamManagementText}>
                <Text style={styles.teamManagementTitle}>Manage</Text>
                <Text style={styles.teamManagementSubtitle}>
                  Manage teams you own
                </Text>
              </View>
            </View>
            <View style={styles.teamManagementArrow}>
              <Text style={styles.teamManagementArrowText}>›</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  teamManagementButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  teamManagementGradient: {
    padding: 16,
  },
  teamManagementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamManagementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamManagementIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 10,
    marginRight: 16,
  },
  teamManagementText: {
    justifyContent: 'center',
  },
  teamManagementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  teamManagementSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  teamManagementArrow: {
    justifyContent: 'center',
  },
  teamManagementArrowText: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 'bold',
  },
}); 