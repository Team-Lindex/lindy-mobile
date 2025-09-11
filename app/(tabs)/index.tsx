import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useUser } from '@/contexts/UserContext';

const { width } = Dimensions.get('window');

// Mock data for recommendations and news
const recommendations = [
  {
    id: 1,
    title: 'Perfect Weather Outfit',
    description: 'Based on today\'s sunny weather, try this light summer combo',
    image: require('@/assets/images/tops/top1.webp'),
    type: 'outfit'
  },
  {
    id: 2,
    title: 'Trending Colors',
    description: 'Pastel blues are trending this season',
    image: require('@/assets/images/tops/top2.webp'),
    type: 'trend'
  },
  {
    id: 3,
    title: 'Sustainable Choice',
    description: 'These eco-friendly pieces match your values',
    image: require('@/assets/images/tops/top3.webp'),
    type: 'sustainable'
  }
];

const backgroundImages = [
  {
    id: 1,
    title: 'City',
    textColor: '#2c3e50',
    image: require('@/assets/images/city-background.png'),
  },
  {
    id: 2,
    title: 'Forest',
    textColor: '#ffffff',
    image: require('@/assets/images/forest-background.png'),
  },
  {
    id: 3,
    title: 'Snow',
    textColor: '#ffffff',
    image: require('@/assets/images/snow-background.png'),
  },
];

const twins = [
  {
    id: 'user_001',
    name: 'Sophia',
    textColor: '#2c3e50',
    image: require('@/assets/images/digital-twin.png'),
  },
  {
    id: 'user_002',
    name: 'Emma',
    textColor: '#ffffff',
    image: require('@/assets/images/digital-twin2.png'),
  },
  {
    id: 'user_003',
    name: 'Alex',
    textColor: '#ffffff',
    image: require('@/assets/images/digital-twin3.png'),
  },
  {
    id: 'user_004',
    name: 'Maya',
    textColor: '#2c3e50',
    image: require('@/assets/images/digital-twin.png'),
  },
];

const newsItems = [
  {
    id: 1,
    title: 'Fashion Week Highlights',
    summary: 'The latest trends from Paris Fashion Week',
    time: '2 hours ago',
    category: 'Fashion'
  },
  {
    id: 2,
    title: 'Sustainable Fashion Report',
    summary: 'New study shows growing interest in eco-friendly clothing',
    time: '5 hours ago',
    category: 'Sustainability'
  },
  {
    id: 3,
    title: 'Color of the Year 2024',
    summary: 'Pantone announces the trending color for next year',
    time: '1 day ago',
    category: 'Trends'
  },
  {
    id: 4,
    title: 'Fashion Week Highlights',
    summary: 'The latest trends from Paris Fashion Week',
    time: '2 hours ago',
    category: 'Fashion'
  },
  {
    id: 5,
    title: 'Sustainable Fashion Report',
    summary: 'New study shows growing interest in eco-friendly clothing',
    time: '5 hours ago',
    category: 'Sustainability'
  },
  {
    id: 6,
    title: 'Color of the Year 2024',
    summary: 'Pantone announces the trending color for next year',
    time: '1 day ago',
    category: 'Trends'
  }
];

export default function DailyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentUser } = useUser();
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  
  // Animation values
  const backgroundFadeAnim = useRef(new Animated.Value(1)).current;
  const twinFadeAnim = useRef(new Animated.Value(1)).current;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'outfit': return 'tshirt.fill';
      case 'trend': return 'sparkles';
      case 'sustainable': return 'leaf.fill';
      default: return 'heart.fill';
    }
  };

  const currentBackground = backgroundImages[currentBackgroundIndex];

  const rotateBackground = () => {
    // Fade background to transparent, change background, then fade back in
    Animated.sequence([
      Animated.timing(backgroundFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Change the background index when fully transparent
    setTimeout(() => {
      setCurrentBackgroundIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 200);
  };

  // Get the current twin based on the logged-in user's ID
  const getCurrentTwin = () => {
    if (!currentUser) {
      // Default twin if no user is logged in
      return twins[0];
    }
    const userTwin = twins.find(twin => twin.id === currentUser.id);
    return userTwin || twins[0]; // Fallback to first twin if user ID not found
  };

  const currentTwin = getCurrentTwin();

  const headerImage = (
    <LinearGradient
      colors={['#000000', '#000000', '#000000']}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.Image 
        source={currentBackground.image} 
        style={[styles.cityBackground, { opacity: backgroundFadeAnim }]}
        resizeMode="cover"
      />
      <BlurView 
        intensity={10}
        style={styles.blurOverlay}
        tint="light"
      />
      <View style={styles.headerContent}>
        <View style={styles.digitalTwinContainer}>
          <Text style={styles.digitalTwinTitle}>Lindy</Text>
          <Text style={styles.digitalTwinTitleSmall}>by Lindex</Text>
          <Animated.Image 
            source={currentTwin.image} 
            style={[styles.digitalTwinImage, { opacity: twinFadeAnim }]}
            resizeMode="contain"
          />
          <Text style={styles.digitalTwinSubtitle}>Style Profile: Minimalist Chic</Text>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>

      {/* Background Change Button */}
      <TouchableOpacity 
        style={styles.backgroundButton} 
        onPress={rotateBackground}
        activeOpacity={0.8}
      >
        <IconSymbol name="photo.fill" size={20} color="#fff" />
        <Text style={styles.backgroundButtonText}>{currentBackground.title}</Text>
      </TouchableOpacity>

      <ParallaxScrollView
        headerBackgroundColor={{ light: '#f8f9ff', dark: '#1a1a1a' }}
        headerImage={headerImage}
      >
      {/* Recommendations Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Recommendations</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: colors.tint }]}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {recommendations.map((item) => (
            <TouchableOpacity key={item.id} style={styles.recommendationCard}>
              <Image source={item.image} style={styles.recommendationImage} />
              <View style={styles.recommendationContent}>
                <View style={styles.recommendationHeader}>
                  <IconSymbol 
                    name={getRecommendationIcon(item.type)} 
                    size={16} 
                    color={colors.tint} 
                  />
                  <Text style={[styles.recommendationType, { color: colors.tint }]}>
                    {item.type.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.recommendationTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.recommendationDescription, { color: colors.icon }]}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* News Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Fashion News</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: colors.tint }]}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {newsItems.map((item) => (
          <TouchableOpacity key={item.id} style={[styles.newsCard, { borderColor: colors.icon + '20' }]}>
            <View style={styles.newsContent}>
              <View style={styles.newsHeader}>
                <Text style={[styles.newsCategory, { color: colors.tint }]}>{item.category}</Text>
                <Text style={[styles.newsTime, { color: colors.icon }]}>{item.time}</Text>
              </View>
              <Text style={[styles.newsTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.newsSummary, { color: colors.icon }]}>{item.summary}</Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.icon} />
          </TouchableOpacity>
        ))}
      </View>
      </ParallaxScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  backgroundButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cityBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '130%',
    height: '100%',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '130%',
    height: '100%',
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    zIndex: 1,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#34495e',
    marginBottom: 30,
    textAlign: 'center',
  },
  digitalTwinContainer: {
    alignItems: 'center',
    marginTop: 410,
  },
  digitalTwinTitle: {
    fontSize: 44,
    fontWeight: '600',
    color: '#2c3e50',
  },
  digitalTwinTitleSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2c3e50',

  },
  digitalTwinImage: {
    width: 600,
    height: 680,
    zIndex: 2,
    marginTop: -30,
  },
  digitalTwinSubtitle: {
    fontSize: 18,
    color: '#34495e',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '500',
  },
  horizontalScroll: {
    marginLeft: -32,
    paddingLeft: 32,
  },
  recommendationCard: {
    width: 200,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendationImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  recommendationContent: {
    padding: 16,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationType: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  newsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  newsContent: {
    flex: 1,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  newsCategory: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  newsTime: {
    fontSize: 12,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  newsSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
});
