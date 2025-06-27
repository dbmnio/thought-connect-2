import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: any;
}

const sizeMap = {
  small: 32,
  medium: 48,
  large: 64,
  xlarge: 96,
};

const fontSizeMap = {
  small: 14,
  medium: 18,
  large: 24,
  xlarge: 36,
};

export function Avatar({ uri, name = '', size = 'medium', style }: AvatarProps) {
  const avatarSize = sizeMap[size];
  const fontSize = fontSizeMap[size];
  
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarStyle = [
    styles.avatar,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
    },
    style,
  ];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={avatarStyle}
        defaultSource={require('@/assets/images/icon.png')}
      />
    );
  }

  return (
    <View style={[avatarStyle, styles.placeholder]}>
      <Text style={[styles.initials, { fontSize }]}>
        {initials || '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#F3F4F6',
  },
  placeholder: {
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
});