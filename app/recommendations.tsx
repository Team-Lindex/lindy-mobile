import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

const recommendedOutfits = [
  {
    id: 1,
    image: require('@/assets/images/react-logo.png'),
    title: 'Outfit 1',
  },
  {
    id: 2,
    image: require('@/assets/images/react-logo.png'),
    title: 'Outfit 2',
  },
];

const moreRecommendations = [
  {
    id: 1,
    image: require('@/assets/images/react-logo.png'),
    title: 'Lindex Dress',
    brand: 'Lindex',
  },
  {
    id: 2,
    image: require('@/assets/images/react-logo.png'),
    title: 'Lindex Blouse',
    brand: 'Lindex',
  },
  {
    id: 3,
    image: require('@/assets/images/react-logo.png'),
    title: 'Lindex Skirt',
    brand: 'Lindex',
  },
  {
    id: 4,
    image: require('@/assets/images/react-logo.png'),
    title: 'Lindex Pants',
    brand: 'Lindex',
  },
];

export default function RecommendationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Lindy AI</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {recommendedOutfits.map((outfit) => (
              <TouchableOpacity key={outfit.id} style={styles.outfitCard}>
                <Image source={outfit.image} style={styles.outfitImage} />
                <Text style={styles.outfitTitle}>{outfit.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More recommendations</Text>
          
          <View style={styles.grid}>
            {moreRecommendations.map((item) => (
              <TouchableOpacity key={item.id} style={styles.gridItem}>
                <Image source={item.image} style={styles.itemImage} />
                <Text style={styles.itemTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  outfitCard: {
    marginRight: 16,
    width: 200,
  },
  outfitImage: {
    width: 200,
    height: 300,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  outfitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  itemImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});
