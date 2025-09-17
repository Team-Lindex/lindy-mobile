/**
 * Hybrid voice service that uses the appropriate voice recognition library
 * based on the platform (web vs native)
 */

import { Platform } from 'react-native';
import { Voice as CrossPlatformVoice, VoiceEventHandlers } from './crossPlatformVoice';

// For native platforms, we'll dynamically import the native voice library
let NativeVoice: any = null;

// Lazy load the native voice library only when needed
const getNativeVoice = async () => {
  if (Platform.OS !== 'web' && !NativeVoice) {
    try {
      // Use require for better compatibility with React Native
      const voiceModule = require('@react-native-voice/voice');
      NativeVoice = voiceModule.default || voiceModule;
    } catch (error) {
      console.error('Failed to load native voice library:', error);
      throw new Error('Native voice recognition not available');
    }
  }
  return NativeVoice;
};

class HybridVoiceService {
  private isListening = false;
  private handlers: VoiceEventHandlers = {};
  private nativeVoice: any = null;

  constructor() {
    this.initializeNativeVoice();
  }

  private async initializeNativeVoice() {
    if (Platform.OS !== 'web') {
      try {
        this.nativeVoice = await getNativeVoice();
        this.setupNativeEventHandlers();
      } catch (error) {
        console.warn('Native voice recognition not available:', error);
      }
    }
  }

  private setupNativeEventHandlers() {
    if (this.nativeVoice) {
      this.nativeVoice.onSpeechStart = () => {
        console.log('Native speech recognition started');
        this.handlers.onSpeechStart?.();
      };
      
      this.nativeVoice.onSpeechRecognized = () => {
        console.log('Native speech recognized');
        this.handlers.onSpeechRecognized?.();
      };
      
      this.nativeVoice.onSpeechEnd = () => {
        console.log('Native speech recognition ended');
        this.isListening = false;
        this.handlers.onSpeechEnd?.();
      };
      
      this.nativeVoice.onSpeechError = (error: any) => {
        console.error('Native speech recognition error:', error);
        this.isListening = false;
        this.handlers.onSpeechError?.(error);
      };
      
      this.nativeVoice.onSpeechResults = (event: any) => {
        if (event.value && event.value.length > 0) {
          console.log('Native speech recognition result:', event.value[0]);
          this.handlers.onSpeechResults?.(event);
        }
      };
    }
  }

  // Set event handlers
  setHandlers(handlers: VoiceEventHandlers) {
    this.handlers = { ...this.handlers, ...handlers };
    
    if (Platform.OS === 'web') {
      CrossPlatformVoice.setHandlers(handlers);
    }
  }

  // Start listening
  async start(language: string = 'en-US'): Promise<void> {
    if (Platform.OS === 'web') {
      return CrossPlatformVoice.start(language);
    } else {
      if (!this.nativeVoice) {
        throw new Error('Native voice recognition not available');
      }
      
      if (this.isListening) {
        console.warn('Already listening');
        return;
      }

      try {
        await this.nativeVoice.start(language);
        this.isListening = true;
      } catch (error) {
        console.error('Error starting native voice recognition:', error);
        throw error;
      }
    }
  }

  // Stop listening
  async stop(): Promise<void> {
    if (Platform.OS === 'web') {
      return CrossPlatformVoice.stop();
    } else {
      if (this.nativeVoice && this.isListening) {
        try {
          await this.nativeVoice.stop();
          this.isListening = false;
        } catch (error) {
          console.error('Error stopping native voice recognition:', error);
          throw error;
        }
      }
    }
  }

  // Check if currently listening
  isCurrentlyListening(): boolean {
    if (Platform.OS === 'web') {
      return CrossPlatformVoice.isCurrentlyListening();
    }
    return this.isListening;
  }

  // Check if speech recognition is available
  isAvailable(): boolean {
    if (Platform.OS === 'web') {
      return CrossPlatformVoice.isAvailable();
    }
    return this.nativeVoice !== null;
  }

  // Destroy the recognition instance
  async destroy(): Promise<void> {
    if (Platform.OS === 'web') {
      return CrossPlatformVoice.destroy();
    } else if (this.nativeVoice) {
      try {
        await this.nativeVoice.destroy();
        this.isListening = false;
      } catch (error) {
        console.error('Error destroying native voice recognition:', error);
      }
    }
  }
}

// Create and export a singleton instance
export const Voice = new HybridVoiceService();

// Export the class for testing or multiple instances
export { HybridVoiceService };
