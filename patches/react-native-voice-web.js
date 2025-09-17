/**
 * Web implementation for React Native Voice
 * This file provides a web-compatible version of the Voice API
 */

class WebVoiceRecognition {
  constructor() {
    console.log('WebVoiceRecognition constructor called');
    
    this._onSpeechStart = null;
    this._onSpeechEnd = null;
    this._onSpeechResults = null;
    this._onSpeechError = null;
    this._onSpeechRecognized = null;
    this._isListening = false;
    this._recognition = null;
    
    // Only initialize if we're in a browser environment
    if (typeof window !== 'undefined') {
      console.log('Browser environment detected');
      
      try {
        // Check if browser supports speech recognition
        console.log('Checking for SpeechRecognition support...');
        const hasSpeechRecognition = !!(window.SpeechRecognition);
        const hasWebkitSpeechRecognition = !!(window.webkitSpeechRecognition);
        
        console.log('SpeechRecognition support:', { 
          standard: hasSpeechRecognition, 
          webkit: hasWebkitSpeechRecognition 
        });
        
        const SpeechRecognitionAPI = window.SpeechRecognition || 
                                   window.webkitSpeechRecognition;
        
        if (SpeechRecognitionAPI) {
          console.log('Speech recognition is supported, initializing...');
          this._recognition = new SpeechRecognitionAPI();
          this._recognition.continuous = false;
          this._recognition.interimResults = false;
          this._recognition.lang = 'en-US';
          
          // Set up event handlers
          this._recognition.onstart = () => {
            console.log('Web Speech Recognition started');
            this._isListening = true;
            if (this._onSpeechStart) {
              this._onSpeechStart();
            }
          };
          
          this._recognition.onend = () => {
            console.log('Web Speech Recognition ended');
            this._isListening = false;
            if (this._onSpeechEnd) {
              this._onSpeechEnd();
            }
          };
          
          this._recognition.onresult = (event) => {
            console.log('Web Speech Recognition result received', event);
            const results = [];
            
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
                if (this._onSpeechResults) {
                  console.log('Calling onSpeechResults with:', results);
                  this._onSpeechResults({ value: results });
                }
                
                if (this._onSpeechRecognized) {
                  console.log('Calling onSpeechRecognized');
                  this._onSpeechRecognized();
                }
              } else {
                console.warn('No valid transcripts found in results');
              }
            } catch (error) {
              console.error('Error processing speech recognition results:', error);
            }
          };
          
          this._recognition.onerror = (event) => {
            console.error('Web Speech Recognition error:', event.error);
            if (this._onSpeechError) {
              this._onSpeechError(event.error);
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

  start(locale) {
    console.log('Voice.start called with locale:', locale);
    
    return new Promise((resolve, reject) => {
      // Check if speech recognition is supported
      if (!this._recognition) {
        console.error('Speech recognition not available - this._recognition is null');
        reject(new Error('Speech recognition not supported in this browser'));
        return;
      }
      
      // Check if we're already listening
      if (this._isListening) {
        console.log('Already listening, stopping current session first');
        try {
          this._recognition.stop();
        } catch (e) {
          console.warn('Error stopping existing recognition session:', e);
        }
      }
      
      // Set language if provided
      if (locale) {
        console.log(`Setting recognition language to: ${locale}`);
        this._recognition.lang = locale;
      }
      
      // Request microphone permission explicitly
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          console.log('Microphone permission granted', stream);
          
          // Keep the stream reference to avoid garbage collection
          // We'll stop it when recognition stops
          window._microphoneStream = stream;
          
          // Start recognition
          try {
            console.log('Starting speech recognition...');
            this._recognition.start();
            console.log('Speech recognition started successfully');
            resolve(true);
          } catch (error) {
            console.error('Error starting speech recognition:', error);
            reject(error);
          }
        })
        .catch(permissionError => {
          console.error('Microphone permission denied:', permissionError);
          reject(new Error('Microphone permission denied. Please allow microphone access to use voice features.'));
        });
    });
  }
  
  stop() {
    console.log('Voice.stop called');
    
    return new Promise((resolve, reject) => {
      if (!this._recognition) {
        console.log('No recognition instance to stop');
        resolve(false);
        return;
      }
      
      try {
        // Stop the recognition
        if (this._isListening) {
          console.log('Stopping speech recognition...');
          this._recognition.stop();
          console.log('Speech recognition stopped');
        } else {
          console.log('Recognition was not active, nothing to stop');
        }
        
        // Clean up the microphone stream if it exists
        if (window._microphoneStream) {
          console.log('Stopping microphone stream...');
          const stream = window._microphoneStream;
          stream.getTracks().forEach((track) => {
            console.log('Stopping track:', track.kind, track.label);
            track.stop();
          });
          delete window._microphoneStream;
          console.log('Microphone stream stopped and cleaned up');
        }
        
        resolve(true);
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        resolve(false);
      }
    });
  }
  
  destroy() {
    console.log('Voice.destroy called');
    
    return new Promise((resolve) => {
      // Stop any ongoing recognition
      if (this._isListening && this._recognition) {
        try {
          this._recognition.stop();
        } catch (e) {
          console.warn('Error stopping recognition during destroy:', e);
        }
      }
      
      // Clean up the microphone stream if it exists
      if (window._microphoneStream) {
        const stream = window._microphoneStream;
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        delete window._microphoneStream;
      }
      
      // Clear callbacks
      this._onSpeechStart = null;
      this._onSpeechEnd = null;
      this._onSpeechResults = null;
      this._onSpeechError = null;
      this._onSpeechRecognized = null;
      
      // Clear recognition instance
      this._recognition = null;
      
      console.log('Voice instance destroyed');
      resolve(true);
    });
  }
  
  isAvailable() {
    return new Promise((resolve) => {
      resolve(!!this._recognition);
    });
  }
  
  // Getters and setters for callbacks
  set onSpeechStart(fn) {
    console.log('Setting onSpeechStart callback');
    this._onSpeechStart = fn;
  }
  
  set onSpeechRecognized(fn) {
    console.log('Setting onSpeechRecognized callback');
    this._onSpeechRecognized = fn;
  }
  
  set onSpeechEnd(fn) {
    console.log('Setting onSpeechEnd callback');
    this._onSpeechEnd = fn;
  }
  
  set onSpeechError(fn) {
    console.log('Setting onSpeechError callback');
    this._onSpeechError = fn;
  }
  
  set onSpeechResults(fn) {
    console.log('Setting onSpeechResults callback');
    this._onSpeechResults = fn;
  }
  
  set onSpeechPartialResults(fn) {
    console.log('Setting onSpeechPartialResults callback');
    // Not implemented for web
  }
  
  set onSpeechVolumeChanged(fn) {
    console.log('Setting onSpeechVolumeChanged callback');
    // Not implemented for web
  }
}

// Create and export a singleton instance
const Voice = new WebVoiceRecognition();
export default Voice;
