import React, { useState, useEffect } from 'react';
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
import { fetchUserWardrobe, WardrobeItem, getUniqueWardrobeTypes, updateWardrobeItemTags } from '@/services/wardrobeService';
import { useUser } from '@/contexts/UserContext';
import { LazyImage } from '@/components/LazyImage';
import { AddWardrobeItemModal } from '@/components/AddWardrobeItemModal';
import { EditWardrobeItemModal } from '@/components/EditWardrobeItemModal';
import { Colors, LindexColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Will be populated dynamically from API data

// Will be fetched from API

export default function WardrobeScreen() {
  const { currentUser } = useUser();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);

  const loadWardrobeData = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Use userId 1 for demo purposes if currentUser.id is not a number
      const userId = isNaN(Number(currentUser.id)) ? '1' : currentUser.id;
      const response = await fetchUserWardrobe(userId);
      
      if (response.success && response.data) {
        setWardrobeItems(response.data);
        setCategories(getUniqueWardrobeTypes(response.data));
      } else {
        setError(response.message || 'Failed to load wardrobe items');
      }
    } catch (err) {
      setError('An error occurred while fetching wardrobe data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemPress = (item: WardrobeItem) => {
    console.log('Item selected:', JSON.stringify(item));
    setSelectedItem(item);
    // Ensure state is updated before showing modal
    setTimeout(() => {
      setEditModalVisible(true);
    }, 100);
  };

  const handleUpdateTags = async (itemId: string, tags: string[]) => {
    try {
      const response = await updateWardrobeItemTags(itemId, tags);
      if (response.success) {
        // Refresh wardrobe data to show updated tags
        await loadWardrobeData();
      } else {
        console.error('Failed to update tags:', response.message);
      }
    } catch (error) {
      console.error('Error updating tags:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadWardrobeData();
  }, [currentUser]);

  const filteredItems = selectedCategory === 'All' 
    ? wardrobeItems 
    : wardrobeItems.filter(item => item.type.trim() === selectedCategory);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: LindexColors.peach }]}>
        <Text style={[styles.title, { color: colors.text }]}>Wardrobe</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: LindexColors.peach }]}
          onPress={() => setModalVisible(true)}
        >
          <IconSymbol name="plus" size={24} color={LindexColors.red} />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && [styles.selectedCategory, { backgroundColor: LindexColors.red }],
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                { color: colors.text },
                selectedCategory === category && styles.selectedCategoryText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your wardrobe...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="tshirt" size={50} color={LindexColors.peach} />
            <Text style={[styles.emptyText, { color: colors.text }]}>Your wardrobe seems to be empty</Text>
            <Text style={[styles.emptySubText, { color: LindexColors.red }]}>Add some items to get started</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredItems.map((item) => (
              <TouchableOpacity 
                key={item._id} 
                style={styles.gridItem}
                onPress={() => handleItemPress(item)}
              >
                <LazyImage 
                  source={{ uri: item.imageUrl }} 
                  style={styles.itemImage} 
                  resizeMode="cover"
                  placeholderColor="#f0f0f0"
                  spinnerColor="#666"
                  spinnerSize="small"
                />
                {item.tags.length > 0 && (
                  <View style={[styles.tagIndicator, { backgroundColor: LindexColors.red + 'CC' }]}>
                    <Text style={styles.tagCount}>{item.tags.length}</Text>
                    <IconSymbol name="tag.fill" size={12} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <AddWardrobeItemModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={loadWardrobeData}
      />

      <EditWardrobeItemModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSuccess={loadWardrobeData}
        item={selectedItem}
        updateItemTags={handleUpdateTags}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: LindexColors.red,
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
  tagIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagCount: {
    color: '#fff',
    fontSize: 12,
    marginRight: 4,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
