import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
  KeyboardAvoidingView,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Audio } from 'expo-av';
import { useUser } from '@/contexts/UserContext';
import { sendOutfitRequest, getAudioResponse } from '@/services/voiceService';
import Voice from '@react-native-voice/voice';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hi there! I'm Lindy, your personal style assistant. How can I help you today?",
    isUser: false,
    timestamp: new Date(),
  },
  {
    id: 2,
    text: "I'm looking for a casual outfit for a weekend brunch with friends.",
    isUser: true,
    timestamp: new Date(),
  },
  {
    id: 3,
    text: "Sure! How about a pair of high-waisted jeans, a flowy blouse, and some cute sandals? I can show you some options from Lindex if you'd like.",
    isUser: false,
    timestamp: new Date(),
  },
  {
    id: 4,
    text: "Yes, please! That sounds perfect.",
    isUser: true,
    timestamp: new Date(),
  },
];

export default function LindyAIScreen() {
  const { currentUser } = useUser();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSimulation, setIsSimulation] = useState(false); // Set to false since we're using real voice recognition
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(null);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  const [outfits, setOutfits] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation values for waveform
  const waveformAnim = useRef(new Animated.Value(0)).current;
  
  // Start waveform animation when listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveformAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
          }),
          Animated.timing(waveformAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
          })
        ])
      ).start();
    } else {
      waveformAnim.setValue(0);
      // Stop any running animations
      waveformAnim.stopAnimation();
    }
  }, [isListening]);

  // Initialize voice recognition and audio playback
  useEffect(() => {
    // Set up voice recognition event handlers
    Voice.onSpeechStart = () => {
      console.log('Speech recognition started');
    };
    
    Voice.onSpeechRecognized = () => {
      console.log('Speech recognized');
    };
    
    Voice.onSpeechEnd = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
    };
    
    Voice.onSpeechError = (error) => {
      console.error('Speech recognition error:', error);
      setIsListening(false);
      Alert.alert('Recognition Error', 'There was a problem recognizing your speech. Please try again.');
    };
    
    Voice.onSpeechResults = (event) => {
      if (event.value && event.value.length > 0) {
        const recognizedText = event.value[0];
        console.log('Speech recognition result:', recognizedText);
        setTranscribedText(recognizedText);
        setShowConfirmation(true);
      }
    };
    
    // Request microphone permissions
    (async () => {
      if (Platform.OS !== 'web') {
        try {
          const { status } = await Audio.requestPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Please grant microphone permissions to use voice features');
          }
        } catch (error) {
          console.error('Error requesting microphone permission:', error);
        }
      }
    })();
    
    // Configure audio for playback
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(error => {
      console.error('Error setting audio mode:', error);
    });
    
    // Clean up on unmount
    return () => {
      Voice.destroy().then(() => {
        console.log('Voice instance destroyed');
      }).catch(e => {
        console.error('Error destroying Voice instance:', e);
      });
      
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputText,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };

  // Start real voice recognition
  const startListening = async () => {
    try {
      // Reset transcribed text
      setTranscribedText('');
      setShowConfirmation(false);
      
      // Start listening
      await Voice.start('en-US');
      setIsListening(true);
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      Alert.alert('Error', 'Failed to start voice recognition');
    }
  };

  // Stop voice recognition
  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };
  
  // Confirm transcribed text and send to processing
  const confirmTranscription = () => {
    setShowConfirmation(false);
    processTranscribedText(transcribedText);
  };
  
  // Edit transcribed text
  const editTranscription = (newText: string) => {
    setTranscribedText(newText);
  };
  
  // Cancel transcription
  const cancelTranscription = () => {
    setShowConfirmation(false);
    setTranscribedText('');
  };

  // Process transcribed text and send to API
  const processTranscribedText = async (text: string) => {
    if (!text || !currentUser) return;
    
    setIsProcessing(true);
    
    try {
      // Add user message with transcribed text
      const userMessage: Message = {
        id: messages.length + 1,
        text: text,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Send request to API
      const response = await sendOutfitRequest(currentUser.id, text);
      
      if (response.success && response.data) {
        // Format outfit data for display
        const outfitData = response.data.outfit;
        
        // Create outfit items for the carousel
        const outfitItems = [];
        
        // If the outfit has images, use them
        if (outfitData && Array.isArray(outfitData.items)) {
          outfitData.items.forEach((item: any) => {
            outfitItems.push({
              imageUrl: item.imageUrl || 'https://i8.amplience.net/i/Lindex/3006955_250_PS_F?w=1600&h=2133&fmt=auto&qlt=70&fmt.jp2.qlt=50&sm=c',
              description: item.description || 'Outfit item'
            });
          });
        } else {
          // Fallback outfit items if the API doesn't return the expected format
          outfitItems.push({
            imageUrl: 'https://i8.amplience.net/i/Lindex/3006955_250_PS_F?w=1600&h=2133&fmt=auto&qlt=70&fmt.jp2.qlt=50&sm=c',
            description: 'Outfit recommendation based on your request.'
          });
        }
        
        // Set outfits for display
        setOutfits(outfitItems);
        
        // Format the outfit description
        const outfitDescription = outfitData?.description || 'Here are some outfit suggestions based on your request.';
        
        // Add AI response with audio URL
        const aiMessage: Message = {
          id: messages.length + 2,
          text: outfitDescription,
          isUser: false,
          timestamp: new Date(),
          audioUrl: response.data.audioUrl,
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Auto-play the audio response if available
        if (response.data && response.data.audioUrl) {
          console.log('Audio URL received from API:', response.data.audioUrl);
          // Store the audio URL in a variable to use in the setTimeout callback
          const audioUrl = response.data.audioUrl;
          // Small delay to ensure UI is updated before playing audio
          setTimeout(() => {
            playAudio(audioUrl, messages.length + 2);
          }, 500);
        } else {
          console.log('No audio URL received from API');
        }
      } else {
        // Handle error
        const errorMessage: Message = {
          id: messages.length + 2,
          text: `Sorry, I couldn't process your request. ${response.message || 'Please try again.'}`,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error processing transcribed text:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: messages.length + 2,
        text: 'Sorry, there was an error processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = async (audioUrl: string, messageId: number) => {
    try {
      console.log('Playing audio from URL:', audioUrl);
      
      // Stop current sound if playing
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        
        // If the same message is clicked again, just stop playback
        if (currentPlayingId === messageId) {
          setCurrentPlayingId(null);
          return;
        }
      }

      // Configure audio session for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Load and play the new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, volume: 1.0 }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      setCurrentPlayingId(messageId);
      console.log('Audio playback started');

      // Listen for playback status
      newSound.setOnPlaybackStatusUpdate((status) => {
        if ('isLoaded' in status && status.isLoaded) {
          if ('didJustFinish' in status && status.didJustFinish) {
            console.log('Audio playback finished');
            setIsPlaying(false);
            setCurrentPlayingId(null);
          } else if ('error' in status) {
            console.error('Audio playback error:', status.error);
          }
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio response');
      setIsPlaying(false);
      setCurrentPlayingId(null);
    }
  };

  // Generate waveform bars
  const renderWaveform = () => {
    const bars = [];
    const barCount = 15;
    
    for (let i = 0; i < barCount; i++) {
      const randomHeight = Math.random() * 0.6 + 0.2; // Between 0.2 and 0.8
      const barHeight = waveformAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [randomHeight * 0.5, randomHeight, randomHeight * 0.5]
      });
      
      bars.push(
        <Animated.View 
          key={i} 
          style={[styles.waveformBar, { 
            height: 30,
            transform: [{ scaleY: barHeight }]
          }]}
        />
      );
    }
    
    return bars;
  };
  
  // Navigate through outfits
  const navigateOutfit = (direction: 'next' | 'prev') => {
    if (outfits.length === 0) return;
    
    if (direction === 'next') {
      setCurrentOutfitIndex((prev) => (prev + 1) % outfits.length);
    } else {
      setCurrentOutfitIndex((prev) => (prev - 1 + outfits.length) % outfits.length);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeAreaContainer}>

        <View style={styles.cardContainer}>
          {showConfirmation ? (
            // Confirmation state - show transcribed text and confirm/edit buttons
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Is this correct?</Text>
              
              <TextInput
                style={styles.transcriptionInput}
                value={transcribedText}
                onChangeText={editTranscription}
                multiline
                autoFocus
              />
              
              <View style={styles.confirmationButtons}>
                <TouchableOpacity 
                  style={[styles.confirmButton, styles.cancelButton]}
                  onPress={cancelTranscription}
                >
                  <Text style={styles.confirmButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={confirmTranscription}
                >
                  <Text style={styles.confirmButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : isListening || isProcessing ? (
            // Listening or processing state
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {isProcessing ? 'Processing...' : 'Listening...'}
              </Text>
              
              {isListening && (
                <View style={styles.waveformContainer}>
                  {renderWaveform()}
                </View>
              )}
              
              {isProcessing && (
                <ActivityIndicator size="large" color="#e53e3e" />
              )}
              
              {transcribedText ? (
                <Text style={styles.transcribedText}>{transcribedText}</Text>
              ) : null}
            </View>
          ) : messages.length > 0 && messages[messages.length - 1].isUser ? (
            // User just sent a message, show processing or last message
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{messages[messages.length - 1].text}</Text>
              <View style={styles.waveformContainer}>
                {renderWaveform()}
              </View>
            </View>
          ) : outfits.length > 0 ? (
            // Show outfit recommendation
            <View style={styles.card}>
              <View style={styles.outfitNavigation}>
                <TouchableOpacity 
                  style={styles.navArrow} 
                  onPress={() => navigateOutfit('prev')}
                >
                  <IconSymbol name="chevron.left" size={24} color="#000" />
                </TouchableOpacity>
                
                <View style={styles.outfitImageContainer}>
                  <Image 
                    source={{ uri: outfits[currentOutfitIndex]?.imageUrl || 'https://via.placeholder.com/150' }}
                    style={styles.outfitImage}
                    resizeMode="contain"
                  />
                </View>
                
                <TouchableOpacity 
                  style={styles.navArrow} 
                  onPress={() => navigateOutfit('next')}
                >
                  <IconSymbol name="chevron.right" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.outfitDescription}>
                {outfits[currentOutfitIndex]?.description || 'Outfit recommendation'}
              </Text>
            </View>
          ) : (
            // Default state - greeting
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Good morning {currentUser?.name?.split(' ')[0] || 'there'}</Text>
              <View style={styles.waveformContainer}>
                {renderWaveform()}
              </View>
            </View>
          )}
        </View>

      <View style={[styles.bottomNavigation, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.navButton}>
          <View style={styles.navButtonInner}>
            <Image
              source={require('@/assets/images/react-logo.png')}
              style={styles.navAvatar}
            />
          </View>
          <Text style={styles.navLabel}>You</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, styles.mainNavButton]}
          onPress={isListening ? stopListening : startListening}
        >
          <View style={[styles.navButtonInner, styles.mainNavButtonInner]}>
            <IconSymbol 
              name={isListening ? "stop.fill" : "mic.fill"} 
              size={24} 
              color="#fff" 
            />
          </View>
          <Text style={styles.navLabel}>Assistant</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton}>
          <View style={styles.navButtonInner}>
            <IconSymbol name="person.2.fill" size={20} color="#e53e3e" />
          </View>
          <Text style={styles.navLabel}>Circles</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeAreaContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFF0F0', // Light pink background
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 200,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e53e3e', // Red text
    textAlign: 'center',
    marginBottom: 20,
  },
  waveformContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    width: '80%',
    marginVertical: 20,
  },
  waveformBar: {
    width: 4,
    backgroundColor: '#e53e3e', // Red color
    marginHorizontal: 2,
    borderRadius: 2,
  },
  transcribedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  transcriptionInput: {
    width: '100%',
    minHeight: 80,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginVertical: 16,
    textAlignVertical: 'top',
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  confirmButton: {
    backgroundColor: '#e53e3e',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  outfitNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  navArrow: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outfitImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outfitImage: {
    width: '100%',
    height: '100%',
  },
  outfitDescription: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  mainNavButton: {
    transform: [{ scale: 1.2 }],
  },
  mainNavButtonInner: {
    backgroundColor: '#e53e3e', // Red background for mic button
  },
  navAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  navLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
