import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { Bell, Moon, Smartphone, Shield, HelpCircle, Globe, Settings, LucideIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';

type SettingsType = 'switch' | 'navigation';

export interface SettingsOption {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    type: SettingsType;
    value?: boolean;
    onToggle?: (value: boolean) => void;
    onPress?: () => void;
}

interface SettingsSectionProps {
  settingsOptions: SettingsOption[];
}

export function SettingsSection({ settingsOptions }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.settingsContainer}>
        {settingsOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.settingItem, index === settingsOptions.length - 1 && styles.settingItemNoBorder]}
            onPress={item.onPress}
            disabled={!item.onPress && item.type === 'navigation'}
            activeOpacity={0.7}
          >
            <item.icon color="#6366F1" size={24} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </View>
            {item.type === 'switch' && (
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
                thumbColor={item.value ? '#FFFFFF' : '#F9FAFB'}
                ios_backgroundColor="#E5E7EB"
              />
            )}
            {item.type === 'navigation' && (
              <Text style={styles.navigationArrow}>›</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
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
  settingsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingItemNoBorder: {
    borderBottomWidth: 0,
  },
  settingText: {
    flex: 1,
    marginLeft: 20,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  navigationArrow: {
    fontSize: 20,
    color: '#9CA3AF',
  },
}); 