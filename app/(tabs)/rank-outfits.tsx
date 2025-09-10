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

const pastOutfits = [
  {
    id: 1,
    image: require('@/assets/images/tops/top5.webp'),
    title: 'Outfit 1',
    feedback: 'Liked',
    feedbackColor: '#4CAF50',
  },
  {
    id: 2,
    image: require('@/assets/images/tops/top2.webp'),
    title: 'Outfit 2',
    feedback: 'Disliked',
    feedbackColor: '#F44336',
  },
];

export default function RankOutfitsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>

        <Text style={styles.title}>Style Preferences</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Upload your outfit</Text>
          <Text style={styles.sectionDescription}>
            Help us learn your style by uploading your outfits and providing feedback.
          </Text>

          <View style={styles.uploadCard}>
            <Text style={styles.uploadTitle}>Upload your outfit</Text>
            <Text style={styles.uploadDescription}>
              Tap to upload a photo of your outfit and help us understand your style preferences.
            </Text>
            <TouchableOpacity style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>Upload Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.pastOutfitsSection}>
          <Text style={styles.sectionTitle}>Past Outfits</Text>
          
          {pastOutfits.map((outfit) => (
            <TouchableOpacity key={outfit.id} style={styles.outfitItem}>
              <Image source={outfit.image} style={styles.outfitImage} />
              <View style={styles.outfitInfo}>
                <Text style={styles.outfitTitle}>{outfit.title}</Text>
                <Text style={[styles.outfitFeedback, { color: outfit.feedbackColor }]}>
                  Feedback: {outfit.feedback}
                </Text>
              </View>
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
    justifyContent: 'center',
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
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  uploadSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  uploadCard: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  uploadDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  pastOutfitsSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  outfitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  outfitImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 16,
  },
  outfitInfo: {
    flex: 1,
  },
  outfitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  outfitFeedback: {
    fontSize: 14,
    fontWeight: '500',
  },
});
