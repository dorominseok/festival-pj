// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>

      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <IconSymbol size={size ?? 24} name="house.fill" color={color} />,
        }}
      />

      {/* 예약 */}
      <Tabs.Screen
        name="explore"
        options={{
          tabBarLabel: '예약',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size ?? 24} color={color} />,
        }}
      />

      {/* 내 정보 */}
      <Tabs.Screen
        name="my"
        options={{
          tabBarLabel: '내 정보',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size ?? 24} color={color} />,
        }}
      />
    </Tabs>
  );
}
