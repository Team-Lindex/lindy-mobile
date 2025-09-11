import React, { useState } from 'react';
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

const categories = ['All', 'Tops', 'Bottoms', 'Dresses'];

const clothingItems = [
  { id: 1, image: require('@/assets/images/tops/top6.webp'), category: 'Tops' },
  { id: 2, image: require('@/assets/images/pants/pant1.webp'), category: 'Bottoms' },
  { id: 3, image: require('@/assets/images/tops/top1.webp'), category: 'Tops' },
  { id: 4, image: require('@/assets/images/tops/top2.webp'), category: 'Tops' },
  { id: 5, image: require('@/assets/images/pants/pant2.webp'), category: 'Bottoms' },
  { id: 6, image: require('@/assets/images/tops/top3.webp'), category: 'Tops' },
  { id: 7, image: require('@/assets/images/pants/pant3.webp'), category: 'Bottoms' },
  { id: 8, image: require('@/assets/images/tops/top4.webp'), category: 'Tops' },
  { id: 9, image: require('@/assets/images/pants/pant4.webp'), category: 'Bottoms' },
  { id: 10, image: require('@/assets/images/tops/top5.webp'), category: 'Tops' },
];

export default function WardrobeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems = selectedCategory === 'All' 
    ? clothingItems 
    : clothingItems.filter(item => item.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wardrobe</Text>
        <TouchableOpacity style={styles.addButton}>
          <IconSymbol name="plus" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {filteredItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.gridItem}>
              <Image source={item.image} style={styles.itemImage} />
            </TouchableOpacity>
          ))}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 16,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  selectedCategory: {
    backgroundColor: '#000',
  },
  categoryText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingTop: 10,
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
  },
});
