import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors, LindexColors } from '@/constants/Colors';
import { useUser } from '@/contexts/UserContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { fetchMockImages } from '@/services/api';
import { Voice } from '@/services/hybridVoiceService';
import { sendOutfitRequest } from '@/services/voiceService';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Carousel constants (module-level so styles can use them)
const SCREEN_WIDTH_CONST = Dimensions.get('window').width;
const CARD_WIDTH_CONST = Math.min(260, SCREEN_WIDTH_CONST * 0.65);
const CARD_HEIGHT_CONST = CARD_WIDTH_CONST * 1.4;
const CARD_OVERLAP_CONST = -40; // negative to overlap
const SNAP_INTERVAL_CONST = CARD_WIDTH_CONST + CARD_OVERLAP_CONST; // used for snapping and index calc

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
}

const initialMessages: Message[] = [
  {
    id: 4,
    text: "Good Morning, Eva!",
    isUser: false,
    timestamp: new Date(),
  },
];

export default function LindyAIScreen() {
  const { currentUser } = useUser();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
  const [voiceAttempts, setVoiceAttempts] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Carousel constants (instance-level references to module constants)
  const SCREEN_WIDTH = SCREEN_WIDTH_CONST;
  const CARD_WIDTH = CARD_WIDTH_CONST;
  const CARD_HEIGHT = CARD_HEIGHT_CONST;
  const CARD_OVERLAP = CARD_OVERLAP_CONST;
  const SNAP_INTERVAL = SNAP_INTERVAL_CONST;
  const carouselX = useRef(new Animated.Value(0)).current;
  
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
    Voice.setHandlers({
      onSpeechStart: () => {
        console.log('Speech recognition started - listening for speech...');
      },
      
      onSpeechRecognized: () => {
        console.log('Speech recognized');
      },
      
      onSpeechEnd: () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      },
      
      onSpeechError: (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
        
        // Handle different error types with appropriate user messages
        if (error.error === 'no-speech') {
          console.log('No speech detected - attempt', voiceAttempts + 1);
          setVoiceAttempts(prev => prev + 1);
          
          // Auto-retry up to 2 times for no-speech, then give user feedback
          if (voiceAttempts < 2) {
            console.log('Auto-retrying voice recognition...');
            setTimeout(() => {
              startListening();
            }, 500);
          } else {
            console.log('Max voice attempts reached, stopping auto-retry');
            setVoiceAttempts(0); // Reset for next time
            // Don't show intrusive alert, just let user manually retry
          }
        } else if (error.error === 'not-allowed') {
          Alert.alert('Permission Denied', 'Please allow microphone access to use voice recognition.');
        } else if (error.error === 'network') {
          Alert.alert('Network Error', 'Please check your internet connection and try again.');
        } else {
          Alert.alert('Recognition Error', 'There was a problem recognizing your speech. Please try again.');
        }
      },
      
      onSpeechResults: (event) => {
        if (event.value && event.value.length > 0) {
          const recognizedText = event.value[0];
          console.log('Speech recognition result:', recognizedText);
          setTranscribedText(recognizedText);
          setShowConfirmation(true);
          setVoiceAttempts(0); // Reset attempts on successful recognition
        }
      }
    });
    
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

  // Log inputText changes
  useEffect(() => {
    console.log('inputText state changed to:', inputText);
  }, [inputText]);

  // Log transcribedText changes
  useEffect(() => {
    console.log('transcribedText state changed to:', transcribedText);
  }, [transcribedText]);

  const sendMessage = () => {
    console.log('sendMessage called with inputText:', inputText);
    if (inputText.trim()) {
      console.log('Sending message:', inputText.trim());
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputText,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputText('');
      console.log('Message sent and inputText cleared');
    } else {
      console.log('inputText is empty, not sending message');
    }
  };

  // Start real voice recognition
  const startListening = async () => {
    try {
      // MOCK MODE: Simulate voice input after 5 seconds
      console.log('Mock mode: Starting simulated voice input');
      
      // Reset transcribed text and voice attempts
      setTranscribedText('');
      setShowConfirmation(false);
      setVoiceAttempts(0);
      
      // Show listening state immediately
      setIsListening(true);
      
      // After 5 seconds, simulate the voice input
      setTimeout(() => {
        console.log('Mock: Simulating voice input after 5 seconds');
        setTranscribedText('give me casual business outfits');
        setIsListening(false);
        setShowConfirmation(true);
      }, 5000);
      
      return;
      
      // ORIGINAL CODE (commented out for mock mode)
      /*
      // Check if voice recognition is available
      if (!Voice.isAvailable()) {
        Alert.alert('Not Supported', 'Voice recognition is not available on this platform');
        return;
      }

      // Reset transcribed text and voice attempts
      setTranscribedText('');
      setShowConfirmation(false);
      setVoiceAttempts(0); // Reset attempts when manually starting
      
      // Start listening
      await Voice.start('en-US');
      setIsListening(true);
      */
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
  const confirmTranscription = async () => {
    setShowConfirmation(false);
    setIsProcessing(true);
    
    try {
      // Add user message with transcribed text
      const userMessage: Message = {
        id: messages.length + 1,
        text: transcribedText,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Fetch mock images from API
      const response = await fetchMockImages();
      
      if (response.success && response.data) {
        // Transform API data to outfit format
        const outfitItems = response.data.map((item, index) => ({
          imageUrl: item.imageUrl,
          description: `Outfit recommendation ${index + 1}`
        }));
        
        setOutfits(outfitItems);
        setCurrentOutfitIndex(0);
        
        // Add AI response
        const aiMessage: Message = {
          id: messages.length + 2,
          text: "Here are some outfit recommendations for you!",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Handle error
        const errorMessage: Message = {
          id: messages.length + 2,
          text: "Sorry, I couldn't fetch outfit recommendations. Please try again.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error fetching mock images:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: messages.length + 2,
        text: 'Sorry, there was an error fetching recommendations. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Edit transcribed text
  const editTranscription = (newText: string) => {
    console.log('editTranscription called with newText:', newText);
    setTranscribedText(newText);
    console.log('transcribedText updated to:', newText);
  };
  
  // Cancel transcription
  const cancelTranscription = () => {
    setShowConfirmation(false);
    setTranscribedText('');
  };

  // Process transcribed text and send to API
  const processTranscribedText = async (text: string) => {
    console.log('processTranscribedText called with text:', text);
    console.log('currentUser:', currentUser);
    
    if (!text || !currentUser) {
      console.log('Missing text or currentUser, returning early');
      return;
    }
    
    console.log('Starting to process transcribed text');
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
          
          // Log the response data structure for debugging
          console.log('Full API response data:', JSON.stringify(response.data));
          
          // Ensure we have a valid audio URL
          if (audioUrl) {
            // Small delay to ensure UI is updated before playing audio
            setTimeout(() => {
              console.log('Attempting to play audio after delay');
              playAudio(audioUrl, messages.length + 2);
            }, 1000); // Increased delay to 1 second for better reliability
            
            // Also try playing directly as a fallback
            playAudio(audioUrl, messages.length + 2);
          } else {
            console.error('Audio URL is empty or invalid');
          }
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

  // Fallback audio URL for testing
  const fallbackAudioUrl = 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand3.wav';
  
  const playAudio = async (audioUrl: string, messageId: number) => {
    try {
      console.log('Starting audio playback process for URL:', audioUrl);
      
      // Validate the URL
      if (!audioUrl || typeof audioUrl !== 'string') {
        console.error('Invalid audio URL, using fallback:', audioUrl);
        audioUrl = fallbackAudioUrl;
      }
      
      // Add base URL if it's a relative path
      const fullUrl = audioUrl.startsWith('http') 
        ? audioUrl 
        : `http://localhost:8080${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`;
      
      console.log('Full audio URL:', fullUrl);
      
      // Stop current sound if playing
      if (sound) {
        console.log('Stopping previous audio playback');
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (e) {
          console.error('Error stopping previous sound:', e);
        }
        setSound(null);
        setIsPlaying(false);
        
        // If the same message is clicked again, just stop playback
        if (currentPlayingId === messageId) {
          setCurrentPlayingId(null);
          return;
        }
      }

      // Configure audio session for playback
      console.log('Configuring audio session');
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.error('Error setting audio mode:', e);
      }

      console.log('Creating audio object');
      // Load and play the new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fullUrl },
        { shouldPlay: true, volume: 1.0 },
        (status) => {
          console.log('Audio loading status:', status);
        }
      );
      
      console.log('Audio object created successfully');
      setSound(newSound);
      setIsPlaying(true);
      setCurrentPlayingId(messageId);

      // Listen for playback status
      newSound.setOnPlaybackStatusUpdate((status) => {
        console.log('Audio status update:', status);
        if ('isLoaded' in status) {
          if (status.isLoaded) {
            if ('didJustFinish' in status && status.didJustFinish) {
              console.log('Audio playback finished');
              setIsPlaying(false);
              setCurrentPlayingId(null);
            } else if ('isPlaying' in status) {
              console.log('Is playing:', status.isPlaying);
            }
          } else {
            console.log('Audio not loaded');
          }
        }
        if ('error' in status && status.error) {
          console.error('Audio playback error:', status.error);
        }
      });
      
      // Ensure playback starts
      await newSound.playAsync();
      console.log('Audio playback started explicitly');
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
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeAreaContainer}>
        {/* Header with menu bar */}
        <View style={styles.header}>
            <TouchableOpacity style={styles.menuButton}>
              <View style={[styles.hamburgerLine, styles.hamburgerLineLong]} />
              <View style={[styles.hamburgerLine, styles.hamburgerLineShort]} />
            </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
          {showConfirmation ? (
            // Confirmation state - show transcribed text and confirm/edit buttons
            <View style={[styles.card, { backgroundColor: LindexColors.peach }]}>
              <Text style={[styles.cardTitle, { color: '#9F0000' }]}>Is this correct?</Text>
              
              <TextInput
                style={[styles.transcriptionInput, { backgroundColor: LindexColors.white }]}
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
                  style={[styles.confirmButton, { backgroundColor: LindexColors.red }]}
                  onPress={confirmTranscription}
                >
                  <Text style={styles.confirmButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : isListening || isProcessing ? (
            // Listening or processing state
            <View style={[styles.card, { backgroundColor: LindexColors.peach }]}>
              <Text style={[styles.cardTitle, { color: '#9F0000' }]}>
                {isProcessing ? 'Processing...' : 'Listening...'}
              </Text>
              
              {isListening && (
                <View style={styles.waveformContainer}>
                  {renderWaveform()}
                </View>
              )}
              
              {isProcessing && (
                <ActivityIndicator size="large" color={LindexColors.red} />
              )}
              
              {transcribedText ? (
                <Text style={[styles.transcribedText, { color: colors.text }]}>{transcribedText}</Text>
              ) : null}
            </View>
          ) : messages.length > 0 && messages[messages.length - 1].isUser ? (
            // User just sent a message, show processing or last message
            <View style={[styles.card, { backgroundColor: LindexColors.peach }]}>
              <Text style={[styles.cardTitle, { color: LindexColors.red }]}>{messages[messages.length - 1].text}</Text>
              <View style={styles.waveformContainer}>
                {renderWaveform()}
              </View>
            </View>
          ) : outfits.length > 0 ? (
            // Show outfit recommendation - overlapping swipeable carousel
            <View style={[styles.card, { backgroundColor: LindexColors.peach }]}> 
              <Animated.ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                bounces={false}
                contentContainerStyle={styles.carouselContent}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: carouselX } } }],
                  { useNativeDriver: false }
                )}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
                  setCurrentOutfitIndex(Math.max(0, Math.min(index, outfits.length - 1)));
                }}
                scrollEventThrottle={16}
              >
                {outfits.map((item, i) => {
                  const inputRange = [
                    (i - 1) * SNAP_INTERVAL,
                    i * SNAP_INTERVAL,
                    (i + 1) * SNAP_INTERVAL,
                  ];
                  const scale = carouselX.interpolate({
                    inputRange,
                    outputRange: [0.9, 1, 0.9],
                    extrapolate: 'clamp',
                  });
                  const elevation = carouselX.interpolate({
                    inputRange,
                    outputRange: [1, 6, 1],
                    extrapolate: 'clamp',
                  });
                  return (
                    <Animated.View key={i} style={[styles.carouselCardWrapper, { zIndex: i === currentOutfitIndex ? 2 : 1, elevation }]}>
                      <Animated.View style={[styles.carouselCard, { transform: [{ scale }] }]}> 
                        <Image
                          source={{ uri: item.imageUrl || 'https://via.placeholder.com/300' }}
                          style={{ width: '100%', height: '100%', borderRadius: 20 }}
                          resizeMode="cover"
                        />
                      </Animated.View>
                    </Animated.View>
                  );
                })}
              </Animated.ScrollView>

              {/* Dots */}
              <View style={styles.carouselDots}>
                {outfits.map((_, i) => (
                  <View
                    key={`dot-${i}`}
                    style={[styles.carouselDot, i === currentOutfitIndex ? styles.carouselDotActive : null]}
                  />
                ))}
              </View>
            </View>
          ) : (
            // Default state - greeting
            <View style={[styles.card, { backgroundColor: LindexColors.peach }]}>
              <Text style={[styles.cardTitle, { color: '#9F0000' }]}>Good morning {currentUser?.name?.split(' ')[0]}!</Text>
              <View style={styles.waveformContainer}>
                {renderWaveform()}
              </View>
            </View>
          )}
        </View>

      <View style={[styles.bottomNavigation, { paddingBottom: Math.max(insets.bottom, 16), borderTopColor: LindexColors.peach }]}>
        <TouchableOpacity style={styles.navButton}>
            <View style={[styles.navButtonInner, { backgroundColor: LindexColors.sand }]}>
          {/* SVG for "You" button, copied from assets/images/circle_design.svg */}
          <svg width="60" height="60" viewBox="0 0 49 49" fill="none">
            <path d="M24.5 49C38.031 49 49 38.031 49 24.5C49 10.969 38.031 0 24.5 0C10.969 0 0 10.969 0 24.5C0 38.031 10.969 49 24.5 49Z" fill="#9F0000"/>
            <path opacity="0.65" d="M16.4235 23.3144C20.2236 27.1145 26.3848 27.1145 30.1849 23.3144C33.985 19.5143 33.985 13.3532 30.1849 9.55306C26.3848 5.75295 20.2236 5.75295 16.4235 9.55306C12.6234 13.3532 12.6234 19.5143 16.4235 23.3144Z" fill="#F0A8B0"/>
            <path opacity="0.65" d="M25.9967 32.8877C29.7969 36.6878 35.958 36.6878 39.7581 32.8877C43.5582 29.0876 43.5582 22.9264 39.7581 19.1263C35.958 15.3262 29.7969 15.3262 25.9967 19.1263C22.1966 22.9264 22.1966 29.0876 25.9967 32.8877Z" fill="#F0A8B0"/>
            <path opacity="0.65" d="M11.8805 36.6421C15.6806 40.4422 21.8418 40.4422 25.6419 36.6421C29.442 32.842 29.442 26.6808 25.6419 22.8807C21.8418 19.0806 15.6806 19.0806 11.8805 22.8807C8.08044 26.6808 8.08044 32.842 11.8805 36.6421Z" fill="#F0A8B0"/>
          </svg>
          </View>
          <Text style={[styles.navLabel, { color: colors.text }]}>You</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, styles.mainNavButton]}
          onPress={isListening ? stopListening : startListening}
        >
          <View style={[styles.navButtonInner, styles.mainNavButtonInner, { backgroundColor: LindexColors.red }]}>
            <IconSymbol 
              name={isListening ? "stop.fill" : "mic.fill"} 
              size={34} 
              color={LindexColors.white} 
            />
          </View>
          <Text style={[styles.navLabel, { color: colors.text }]}>Assistant</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton}>
          <View style={[styles.navButtonInner, { backgroundColor: LindexColors.sand }]}>
            <svg width="60" height="60" viewBox="0 0 49 49" fill="none">
              <path d="M24.5 49C38.031 49 49 38.031 49 24.5C49 10.969 38.031 0 24.5 0C10.969 0 0 10.969 0 24.5C0 38.031 10.969 49 24.5 49Z" fill="#9F0000"/>
              <path opacity="0.65" d="M16.4235 23.3144C20.2236 27.1145 26.3848 27.1145 30.1849 23.3144C33.985 19.5143 33.985 13.3532 30.1849 9.55306C26.3848 5.75295 20.2236 5.75295 16.4235 9.55306C12.6234 13.3532 12.6234 19.5143 16.4235 23.3144Z" fill="#F0A8B0"/>
              <path opacity="0.65" d="M25.9967 32.8877C29.7969 36.6878 35.958 36.6878 39.7581 32.8877C43.5582 29.0876 43.5582 22.9264 39.7581 19.1263C35.958 15.3262 29.7969 15.3262 25.9967 19.1263C22.1966 22.9264 22.1966 29.0876 25.9967 32.8877Z" fill="#F0A8B0"/>
              <path opacity="0.65" d="M11.8805 36.6421C15.6806 40.4422 21.8418 40.4422 25.6419 36.6421C29.442 32.842 29.442 26.6808 25.6419 22.8807C21.8418 19.0806 15.6806 19.0806 11.8805 22.8807C8.08044 26.6808 8.08044 32.842 11.8805 36.6421Z" fill="#F0A8B0"/>
            </svg>
          </View>
          <Text style={[styles.navLabel, { color: colors.text }]}>Circles</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: 25,
    paddingVertical: 25,
    alignItems: 'flex-start',
  },
  menuButton: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    backgroundColor: '#000000',
    borderRadius: 3.0,
  },
  hamburgerLineLong: {
    width: 24,
    height: 4.5,
  },
  hamburgerLineShort: {
    width: 16,
    height: 4.5,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '90%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 280,
    maxWidth: 400,
  },
  cardTitle: {
    width: 226,
    height: 86,
    fontFamily: 'Lindex Sans',
    fontWeight: '400',
    fontSize: 38,
    lineHeight: 36,
    letterSpacing: 0,
    textAlign: 'center',
    marginBottom: 8,
  },
  waveformContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    width: '70%',
    marginTop: 32,
    marginBottom: 24,
  },
  waveformBar: {
    width: 4,
    backgroundColor: LindexColors.red,
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
    backgroundColor: LindexColors.red,
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
  // Carousel styles
  carouselContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  carouselCardWrapper: {
    width: 220, // SNAP_INTERVAL value (260 + (-40))
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselCard: {
    width: 260, // CARD_WIDTH value
    height: 364, // CARD_HEIGHT value (260 * 1.4)
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  carouselDot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginHorizontal: 6,
  },
  carouselDotActive: {
    backgroundColor: '#333',
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
    width: 70,
    height: 70,
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
    backgroundColor: LindexColors.red,
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
