/**
 * Cross-platform voice recognition service
 * Works on web, iOS, and Android
 */

import { Platform } from 'react-native';

// Web Speech API types
interface WebSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: WebSpeechRecognition, ev: Event) => any) | null;
  onend: ((this: WebSpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: WebSpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: WebSpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: WebSpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onspeechstart: ((this: WebSpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: WebSpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: WebSpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: WebSpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: WebSpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: WebSpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => WebSpeechRecognition;
    webkitSpeechRecognition: new () => WebSpeechRecognition;
  }
}

// Voice recognition event handlers
export interface VoiceEventHandlers {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onSpeechResults?: (event: { value: string[] }) => void;
  onSpeechError?: (error: any) => void;
  onSpeechRecognized?: () => void;
}

class CrossPlatformVoice {
  private isListening = false;
  private recognition: WebSpeechRecognition | null = null;
  private handlers: VoiceEventHandlers = {};

  constructor() {
    this.setupWebRecognition();
  }

  private setupWebRecognition() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true; // Show interim results for better UX
        this.recognition.lang = 'en-US';
        

        this.recognition.onstart = () => {
          console.log('Web speech recognition started');
          this.handlers.onSpeechStart?.();
        };

        this.recognition.onend = () => {
          console.log('Web speech recognition ended');
          this.isListening = false;
          this.handlers.onSpeechEnd?.();
        };

        this.recognition.onresult = (event) => {
          const results = event.results;
          if (results && results.length > 0) {
            // Get the latest result
            const lastResultIndex = results.length - 1;
            const result = results[lastResultIndex];
            
            if (result && result.length > 0) {
              const transcript = result[0].transcript;
              const isFinal = result.isFinal;
              
              console.log('Web speech recognition result:', transcript, 'Final:', isFinal);
              
              // Only send final results to avoid multiple partial results
              if (isFinal) {
                this.handlers.onSpeechResults?.({ value: [transcript] });
              }
            }
          }
        };

        this.recognition.onerror = (event) => {
          console.error('Web speech recognition error:', event.error);
          this.isListening = false;
          
          // Handle different types of errors
          if (event.error === 'no-speech') {
            console.log('No speech detected, user might want to try again');
            // Don't treat no-speech as a critical error - just log it
          } else if (event.error === 'not-allowed') {
            console.error('Microphone permission denied');
          } else if (event.error === 'network') {
            console.error('Network error during speech recognition');
          } else {
            console.error('Unknown speech recognition error:', event.error);
          }
          
          this.handlers.onSpeechError?.(event);
        };

        this.recognition.onspeechstart = () => {
          console.log('Web speech recognized');
          this.handlers.onSpeechRecognized?.();
        };
      } else {
        console.warn('Speech recognition not supported on this browser');
      }
    }
  }

  // Set event handlers
  setHandlers(handlers: VoiceEventHandlers) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  // Start listening
  async start(language: string = 'en-US'): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (!this.recognition) {
        throw new Error('Speech recognition not supported on this browser');
      }
      
      if (this.isListening) {
        console.warn('Already listening');
        return;
      }

      try {
        this.recognition.lang = language;
        this.recognition.start();
        this.isListening = true;
      } catch (error) {
        console.error('Error starting web speech recognition:', error);
        throw error;
      }
    } else {
      // For native platforms, we'll use a fallback or the original voice library
      throw new Error('Native voice recognition not implemented in this wrapper. Use @react-native-voice/voice directly for native platforms.');
    }
  }

  // Stop listening
  async stop(): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (this.recognition && this.isListening) {
        this.recognition.stop();
        this.isListening = false;
      }
    } else {
      throw new Error('Native voice recognition not implemented in this wrapper. Use @react-native-voice/voice directly for native platforms.');
    }
  }

  // Check if currently listening
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  // Check if speech recognition is available
  isAvailable(): boolean {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    }
    return false; // For now, we only support web
  }

  // Destroy the recognition instance
  async destroy(): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && this.recognition) {
      this.recognition.abort();
      this.isListening = false;
    }
  }
}

// Create and export a singleton instance
export const Voice = new CrossPlatformVoice();

// Export the class for testing or multiple instances
export { CrossPlatformVoice };
