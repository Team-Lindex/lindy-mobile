import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, LindexColors } from '@/constants/Colors';

export default function BlurTabBarBackground() {
  const colorScheme = useColorScheme();
  
  // Use Lindex brand colors for the tab bar background
  const backgroundColor = colorScheme === 'dark' 
    ? '#151718' + 'CC' // Dark mode with transparency
    : LindexColors.sand + 'CC'; // Light mode with transparency (sand color)
  
  return (
    <BlurView
      // Using a lighter blur effect that matches the Lindex brand aesthetic
      tint={colorScheme === 'dark' ? 'dark' : 'light'}
      intensity={60} // Reduced intensity for a more subtle effect
      style={[StyleSheet.absoluteFill, { backgroundColor }]}
    />
  );
}

// Simple utility function to get a standard tab bar height
export function useBottomTabOverflow() {
  return 49; // Standard tab bar height
}
