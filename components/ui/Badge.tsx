import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium';
  style?: any;
}

export function Badge({ children, variant = 'primary', size = 'medium', style }: BadgeProps) {
  const badgeStyle = [
    styles.badge,
    styles[variant],
    size === 'small' && styles.small,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    size === 'small' && styles.smallText,
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  text: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  smallText: {
    fontSize: 10,
  },
  primary: {
    backgroundColor: '#EFF6FF',
  },
  primaryText: {
    color: '#3B82F6',
  },
  secondary: {
    backgroundColor: '#F8FAFC',
  },
  secondaryText: {
    color: '#64748B',
  },
  success: {
    backgroundColor: '#F0FDF4',
  },
  successText: {
    color: '#16A34A',
  },
  warning: {
    backgroundColor: '#FFFBEB',
  },
  warningText: {
    color: '#D97706',
  },
  error: {
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#DC2626',
  },
  info: {
    backgroundColor: '#F0F9FF',
  },
  infoText: {
    color: '#0284C7',
  },
});