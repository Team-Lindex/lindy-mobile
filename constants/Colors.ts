/**
 * Lindex brand colors based on official brand guidelines.
 * Primary colors, accent colors, and theme combinations are defined here.
 */

// Primary Colors
export const LindexColors = {
  // Primary Colors
  red: '#DC2638',       // HEX: #DC2638, RGB: 220 38 56
  peach: '#F5D9CB',     // HEX: #F5D9CB, RGB: 245 217 200
  sand: '#F4EEE7',      // HEX: #F4EEE7, RGB: 244 238 231
  pink: '#FBE9EB',      // HEX: #FBE9EB, RGB: 251 233 235
  
  // Accent Colors - Primary
  blue: '#0055C7',      // HEX: #0055C7, RGB: 0 85 199
  lightBlue: '#D6E8FF', // HEX: #D6E8FF, RGB: 214 232 255
  coral: '#DDEFFF',     // HEX: #DDEFFF, RGB: 237 103 116
  lightPink: '#FDF4F7', // HEX: #FDF4F7, RGB: 253 244 247
  
  // Accent Colors - Secondary
  green: '#5AA300',     // HEX: #5AA300, RGB: 88 174 0
  lightGreen: '#E8FFD6', // HEX: #E8FFD6, RGB: 232 255 214
  yellow: '#FDFF83',    // HEX: #FDFF83, RGB: 253 244 131
  lightYellow: '#FFFFC0', // HEX: #FFFFC0, RGB: 255 255 192
  
  // Basic Colors
  black: '#000000',
  white: '#FFFFFF',
};

// Theme configurations
export const Colors = {
  light: {
    // Basic theme (Sand background with Black text)
    text: '#000000',
    background: LindexColors.sand,
    tint: LindexColors.red,
    icon: '#000000',
    tabIconDefault: '#687076',
    tabIconSelected: LindexColors.red,
    
    // Additional theme colors
    primary: LindexColors.red,
    secondary: LindexColors.peach,
    accent: LindexColors.blue,
    highlight: LindexColors.pink,
    
    // UI specific colors
    buttonPrimary: LindexColors.red,
    buttonSecondary: LindexColors.peach,
    buttonText: LindexColors.white,
    headerBackground: LindexColors.sand,
    headerText: '#000000',
  },
  dark: {
    // For dark mode, we'll use a darker version of the sand color for background
    // and maintain the brand identity with appropriate contrast
    text: '#FFFFFF',
    background: '#151718',
    tint: LindexColors.red,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: LindexColors.red,
    
    // Additional theme colors
    primary: LindexColors.red,
    secondary: '#8A6F63', // Darker version of peach
    accent: LindexColors.blue,
    highlight: '#7D6E70', // Darker version of pink
    
    // UI specific colors
    buttonPrimary: LindexColors.red,
    buttonSecondary: '#8A6F63', // Darker version of peach
    buttonText: LindexColors.white,
    headerBackground: '#151718',
    headerText: LindexColors.white,
  },
};
