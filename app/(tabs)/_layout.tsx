import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors, LindexColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: LindexColors.red,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
          default: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Daily',
          tabBarIcon: ({ color }:any) => <IconSymbol size={28} name="sun.max.fill" color={color} />,
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].headerBackground,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].headerText,
        }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: 'Wardrobe',
          tabBarIcon: ({ color }:any) => <IconSymbol size={28} name="tshirt.fill" color={color} />,
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].headerBackground,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].headerText,
        }}
      />
      <Tabs.Screen
        name="rank-outfits"
        options={{
          title: 'Rank Outfits',
          tabBarIcon: ({ color }:any) => <IconSymbol size={28} name="heart.fill" color={color} />,
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].headerBackground,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].headerText,
        }}
      />
      <Tabs.Screen
        name="lindy-ai/index"
        options={{
          title: 'Lindy AI',
          tabBarIcon: ({ color }:any) => <IconSymbol size={28} name="sparkles" color={color} />,
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].headerBackground,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].headerText,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }:any) => <IconSymbol size={28} name="person.fill" color={color} />,
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].headerBackground,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].headerText,
        }}
      />
    </Tabs>
  );
}
