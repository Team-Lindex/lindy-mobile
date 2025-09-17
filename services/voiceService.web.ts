/**
 * Voice API service for Lindy AI - Web Implementation
 */

import { fetchApi, ApiResponse } from './api';

export interface OutfitResponse {
  outfit: any;
  audioUrl: string;
  success?: boolean;
  message?: string;
}

// Create a mock of the React Native Voice API for web
class WebVoiceRecognition {
  private recognition: any = null;
  private isListening: boolean = false;
  private onSpeechStartCallback: (() => void) | null = null;
  private onSpeechEndCallback: (() => void) | null = null;
  private onSpeechResultsCallback: ((event: { value: string[] }) => void) | null = null;
  private onSpeechErrorCallback: ((error: any) => void) | null = null;
  private onSpeechRecognizedCallback: (() => void) | null = null;

  constructor() {
    console.log('WebVoiceRecognition constructor called');
    
    // Only initialize if we're in a browser environment
    if (typeof window !== 'undefined') {
      console.log('Browser environment detected');
      
      try {
        // Check if browser supports speech recognition
        console.log('Checking for SpeechRecognition support...');
        const hasSpeechRecognition = !!(window as any).SpeechRecognition;
        const hasWebkitSpeechRecognition = !!(window as any).webkitSpeechRecognition;
        
        console.log('SpeechRecognition support:', { 
          standard: hasSpeechRecognition, 
          webkit: hasWebkitSpeechRecognition 
        });
        
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || 
                                   (window as any).webkitSpeechRecognition;
        
        if (SpeechRecognitionAPI) {
          console.log('Speech recognition is supported, initializing...');
          this.recognition = new SpeechRecognitionAPI();
          this.recognition.continuous = false;
          this.recognition.interimResults = false;
          this.recognition.lang = 'en-US';
          
          // Set up event handlers
          this.recognition.onstart = () => {
            console.log('Web Speech Recognition started');
            this.isListening = true;
            if (this.onSpeechStartCallback) {
              this.onSpeechStartCallback();
            }
          };
          
          this.recognition.onend = () => {
            console.log('Web Speech Recognition ended');
            this.isListening = false;
            if (this.onSpeechEndCallback) {
              this.onSpeechEndCallback();
            }
          };
          
          this.recognition.onresult = (event: any) => {
            console.log('Web Speech Recognition result received', event);
            const results: string[] = [];
            
            try {
              // Extract transcripts from the results
              for (let i = 0; i < event.results.length; i++) {
                // Check if this is a final result
                const isFinal = event.results[i].isFinal;
                if (event.results[i][0] && event.results[i][0].transcript) {
                  const transcript = event.results[i][0].transcript;
                  const confidence = event.results[i][0].confidence;
                  console.log(`Transcript ${i}: "${transcript}" (confidence: ${confidence}, final: ${isFinal})`);
                  results.push(transcript);
                }
              }
              
              console.log('Processed results:', results);
              
              if (results.length > 0) {
                // Only send final results or the best result if we have any
                if (this.onSpeechResultsCallback) {
                  console.log('Calling onSpeechResults with:', results);
                  this.onSpeechResultsCallback({ value: results });
                }
                
                if (this.onSpeechRecognizedCallback) {
                  console.log('Calling onSpeechRecognized');
                  this.onSpeechRecognizedCallback();
                }
              } else {
                console.warn('No valid transcripts found in results');
              }
            } catch (error) {
              console.error('Error processing speech recognition results:', error);
            }
          };
          
          this.recognition.onerror = (event: any) => {
            console.error('Web Speech Recognition error:', event.error);
            if (this.onSpeechErrorCallback) {
              this.onSpeechErrorCallback(event.error);
            }
          };
        } else {
          console.error('Speech recognition not supported in this browser');
        }
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
      }
    }
  }

  // Match the React Native Voice API
  set onSpeechStart(callback: () => void) {
    console.log('Setting onSpeechStart callback');
    this.onSpeechStartCallback = callback;
  }
  
  set onSpeechEnd(callback: () => void) {
    console.log('Setting onSpeechEnd callback');
    this.onSpeechEndCallback = callback;
  }
  
  set onSpeechResults(callback: (event: { value: string[] }) => void) {
    console.log('Setting onSpeechResults callback');
    this.onSpeechResultsCallback = callback;
  }
  
  set onSpeechError(callback: (error: any) => void) {
    console.log('Setting onSpeechError callback');
    this.onSpeechErrorCallback = callback;
  }
  
  set onSpeechRecognized(callback: () => void) {
    console.log('Setting onSpeechRecognized callback');
    this.onSpeechRecognizedCallback = callback;
  }
  
  // This is the method that's being called in the app
  async start(locale?: string): Promise<boolean> {
    console.log('WebVoiceRecognition.start called with locale:', locale);
    
    // Check if speech recognition is supported
    if (!this.recognition) {
      console.error('Speech recognition not available - this.recognition is null');
      throw new Error('Speech recognition not supported in this browser');
    }
    
    // Check if we're already listening
    if (this.isListening) {
      console.log('Already listening, stopping current session first');
      try {
        await this.stop();
      } catch (e) {
        console.warn('Error stopping existing recognition session:', e);
      }
    }
    
    // Set language if provided
    if (locale) {
      console.log(`Setting recognition language to: ${locale}`);
      this.recognition.lang = locale;
    }
    
    // Request microphone permission explicitly
    try {
      console.log('Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone permission granted', stream);
      
      // Keep the stream reference to avoid garbage collection
      // We'll stop it when recognition stops
      (window as any)._microphoneStream = stream;
    } catch (permissionError) {
      console.error('Microphone permission denied:', permissionError);
      throw new Error('Microphone permission denied. Please allow microphone access to use voice features.');
    }
    
    // Start recognition
    try {
      console.log('Starting speech recognition...');
      this.recognition.start();
      console.log('Speech recognition started successfully');
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      throw error;
    }
  }
  
  async stop(): Promise<boolean> {
    console.log('WebVoiceRecognition.stop called');
    
    if (!this.recognition) {
      console.log('No recognition instance to stop');
      return false;
    }
    
    try {
      // Stop the recognition
      if (this.isListening) {
        console.log('Stopping speech recognition...');
        this.recognition.stop();
        console.log('Speech recognition stopped');
      } else {
        console.log('Recognition was not active, nothing to stop');
      }
      
      // Clean up the microphone stream if it exists
      if ((window as any)._microphoneStream) {
        console.log('Stopping microphone stream...');
        const stream = (window as any)._microphoneStream;
        stream.getTracks().forEach((track: MediaStreamTrack) => {
          console.log('Stopping track:', track.kind, track.label);
          track.stop();
        });
        delete (window as any)._microphoneStream;
        console.log('Microphone stream stopped and cleaned up');
      }
      
      return true;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      return false;
    }
  }
  
  async destroy(): Promise<boolean> {
    console.log('WebVoiceRecognition.destroy called');
    
    // Stop any ongoing recognition
    try {
      await this.stop();
    } catch (e) {
      console.warn('Error stopping recognition during destroy:', e);
    }
    
    // Clear callbacks
    this.onSpeechStartCallback = null;
    this.onSpeechEndCallback = null;
    this.onSpeechResultsCallback = null;
    this.onSpeechErrorCallback = null;
    this.onSpeechRecognizedCallback = null;
    
    // Clear recognition instance
    this.recognition = null;
    
    console.log('WebVoiceRecognition destroyed');
    return true;
  }
  
  isAvailable(): boolean {
    return !!this.recognition;
  }
}

// Create and export a singleton instance that matches the React Native Voice API
const Voice = new WebVoiceRecognition();
export default Voice;

/**
 * Send transcribed text to the API for outfit recommendation
 * @param userId - The user's ID
 * @param text - The transcribed text from voice input
 * @returns Promise with outfit recommendation and audio response URL
 */
export async function sendOutfitRequest(
  userId: string,
  text: string
): Promise<ApiResponse<OutfitResponse>> {
  console.log(`Sending outfit request for user ${userId} with text: ${text}`);
  
  // Send the request as JSON
  const response = await fetchApi<OutfitResponse>('/voice/text-outfit', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      question: text
    }),
  });
  
  console.log('Outfit request response:', JSON.stringify(response));
  
  // Ensure the audioUrl is properly formatted
  if (response.success && response.data && response.data.audioUrl) {
    console.log('Original audio URL:', response.data.audioUrl);
    
    // If the audioUrl is a relative path, make sure it starts with a slash
    if (!response.data.audioUrl.startsWith('http') && !response.data.audioUrl.startsWith('/')) {
      response.data.audioUrl = '/' + response.data.audioUrl;
      console.log('Fixed audio URL:', response.data.audioUrl);
    }
  }
  
  return response;
}

/**
 * Get audio response for a text
 * @param userId - The user's ID
 * @param text - The text to convert to speech
 * @returns Promise with audio URL
 */
export async function getAudioResponse(
  userId: string,
  text: string
): Promise<ApiResponse<{audioUrl: string}>> {
  return fetchApi<{audioUrl: string}>('/text-to-speech', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      text
    }),
  });
}
