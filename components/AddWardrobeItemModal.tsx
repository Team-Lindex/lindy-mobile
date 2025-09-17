import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from './ui/IconSymbol';
import { useUser } from '@/contexts/UserContext';
import { addWardrobeItem } from '@/services/wardrobeService';

// Define a type for the legacy ImagePicker result format
type LegacyImagePickerResult = ImagePicker.ImagePickerResult & {
  uri?: string;
}

interface AddWardrobeItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const itemTypes = [
  'top',
  'bottoms',
  'dress',
  'jacket',
  'bag',
  'accessory',
  'shoes',
  'other',
];

const occasions = [
  'casual',
  'formal',
  'work',
  'sport',
  'party',
  'beach',
  'winter',
];

export const AddWardrobeItemModal: React.FC<AddWardrobeItemModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useUser();
  const [step, setStep] = useState<'photo' | 'details'>('photo');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [type, setType] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      try {
        console.log('Requesting camera permissions...');
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        console.log('Camera permission status:', cameraStatus);
        
        console.log('Requesting media library permissions...');
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('Media library permission status:', libraryStatus);
        
        if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
          Alert.alert(
            'Permissions Required',
            'Please grant camera and photo library permissions to use this feature.',
            [{ text: 'OK' }]
          );
          return false;
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
        Alert.alert('Error', 'Failed to request permissions. Please check your device settings.');
        return false;
      }
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      console.log('Launching camera...');
      
      // Platform-specific options
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3] as [number, number],
        quality: 0.8,
      };
      
      // Add platform-specific options
      if (Platform.OS === 'ios') {
        // @ts-ignore - TypeScript doesn't recognize this property but it's valid
        options.presentationStyle = 0; // FULL_SCREEN
      } else if (Platform.OS === 'android') {
        // @ts-ignore - TypeScript doesn't recognize this property but it's valid
        options.exif = false; // Reduce data size
      }
      
      const result = await ImagePicker.launchCameraAsync(options);
      
      console.log(`Camera result (${Platform.OS}):`, JSON.stringify(result));
      
      if (!result.canceled) {
        // Handle both older and newer ImagePicker response formats
        if (result.assets && result.assets.length > 0) {
          console.log('Setting image from assets:', result.assets[0].uri);
          // Force UI update with a small delay to ensure state is properly updated
          setTimeout(() => {
            setImage(result.assets[0].uri);
            setStep('details');
          }, 100);
        } else {
          // For backward compatibility with older expo-image-picker versions
          const legacyResult = result as LegacyImagePickerResult;
          if (legacyResult.uri) {
            console.log('Setting image from uri:', legacyResult.uri);
            // Force UI update with a small delay to ensure state is properly updated
            setTimeout(() => {
              setImage(legacyResult.uri || null);
              setStep('details');
            }, 100);
          } else {
            console.error('No image URI found in the result');
            Alert.alert('Error', 'Could not get the image. Please try again.');
          }
        }
      } else {
        console.log('User canceled taking a photo');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      console.log('Launching image library...');
      
      // Platform-specific options
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3] as [number, number],
        quality: 0.8,
      };
      
      // Add platform-specific options
      if (Platform.OS === 'ios') {
        // @ts-ignore - TypeScript doesn't recognize this property but it's valid
        options.presentationStyle = 0; // FULL_SCREEN
      }
      
      const result = await ImagePicker.launchImageLibraryAsync(options);
      
      console.log(`Image picker result (${Platform.OS}):`, JSON.stringify(result));
      
      if (!result.canceled) {
        // Handle both older and newer ImagePicker response formats
        if (result.assets && result.assets.length > 0) {
          console.log('Setting image from assets:', result.assets[0].uri);
          // Force UI update with a small delay to ensure state is properly updated
          setTimeout(() => {
            setImage(result.assets[0].uri);
            setStep('details');
          }, 100);
        } else {
          // For backward compatibility with older expo-image-picker versions
          const legacyResult = result as LegacyImagePickerResult;
          if (legacyResult.uri) {
            console.log('Setting image from uri:', legacyResult.uri);
            // Force UI update with a small delay to ensure state is properly updated
            setTimeout(() => {
              setImage(legacyResult.uri || null);
              setStep('details');
            }, 100);
          } else {
            console.error('No image URI found in the result');
            Alert.alert('Error', 'Could not get the image. Please try again.');
          }
        }
      } else {
        console.log('User canceled picking an image');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('Error', 'Please select or take a photo');
      return;
    }

    if (!type) {
      Alert.alert('Error', 'Please select an item type');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to add items');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting to add wardrobe item');
      console.log('Current user:', JSON.stringify(currentUser));

      // In a real app, you would upload the image to a server here
      // For this demo, we'll simulate it by using the local URI
      const imageUrl = image;
      console.log('Image URL:', imageUrl);
      
      // Use userId 1 for demo purposes if currentUser.id is not a number
      const userId = isNaN(Number(currentUser.id)) ? '1' : currentUser.id;
      console.log('Using user ID:', userId);
      
      console.log('Sending API request with data:', {
        userId,
        imageUrl: imageUrl.substring(0, 50) + '...', // Truncate for logging
        type,
        tags,
      });
      
      const response = await addWardrobeItem({
        userId: userId,
        imageUrl,
        type,
        tags,
      });
      
      console.log('API response:', JSON.stringify(response));

      if (response.success) {
        console.log('Item added successfully');
        Alert.alert(
          'Success',
          'Item added to your wardrobe!',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('Success alert OK pressed');
                resetForm();
                onSuccess();
                onClose();
              },
            },
          ]
        );
      } else {
        console.error('API returned error:', response.message);
        Alert.alert('Error', response.message || 'Failed to add item');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setImage(null);
    setType('');
    setTags([]);
    setTagInput('');
    setStep('photo');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderPhotoStep = () => (
    <View style={styles.photoStep}>
      <Text style={styles.title}>Add to Your Wardrobe</Text>
      <Text style={styles.subtitle}>Choose how you want to add your item</Text>

      <TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
        <IconSymbol name="camera.fill" size={24} color="#333" />
        <Text style={styles.optionText}>Take a Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionButton} onPress={pickImage}>
        <IconSymbol name="photo.on.rectangle" size={24} color="#333" />
        <Text style={styles.optionText}>Choose from Library</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDetailsStep = () => (
    <ScrollView style={styles.detailsStep} contentContainerStyle={styles.detailsContent}>
      <Text style={styles.title}>Item Details</Text>

      {image && (
        <Image source={{ uri: image }} style={styles.previewImage} />
      )}

      <Text style={styles.label}>Item Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeContainer}>
        {itemTypes.map((itemType) => (
          <TouchableOpacity
            key={itemType}
            style={[
              styles.typeButton,
              type === itemType && styles.selectedTypeButton,
            ]}
            onPress={() => setType(itemType)}
          >
            <Text
              style={[
                styles.typeText,
                type === itemType && styles.selectedTypeText,
              ]}
            >
              {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Tags (Optional)</Text>
      <View style={styles.tagInputContainer}>
        <TextInput
          style={styles.tagInput}
          value={tagInput}
          onChangeText={setTagInput}
          placeholder="Add tags (e.g., summer, favorite)"
          placeholderTextColor="#999"
          onSubmitEditing={addTag}
        />
        <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
          <Text style={styles.addTagText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tagsContainer}>
        {tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
            <TouchableOpacity onPress={() => removeTag(tag)}>
              <IconSymbol name="xmark.circle.fill" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep('photo')}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Add to Wardrobe</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Ensure the modal is fully rendered with the correct step
  const renderModalContent = () => {
    if (step === 'photo') {
      return renderPhotoStep();
    } else if (image) {
      return renderDetailsStep();
    } else {
      // Fallback to photo step if something went wrong
      return renderPhotoStep();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <IconSymbol name="xmark" size={24} color="#333" />
          </TouchableOpacity>

          {renderModalContent()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  photoStep: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  detailsStep: {
    flex: 1,
  },
  detailsContent: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    width: '100%',
  },
  optionText: {
    fontSize: 18,
    marginLeft: 16,
    color: '#333',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  selectedTypeButton: {
    backgroundColor: '#000',
  },
  typeText: {
    fontSize: 14,
    color: '#666',
  },
  selectedTypeText: {
    color: '#fff',
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  addTagButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
    marginLeft: 8,
  },
  addTagText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    marginRight: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
