/**
 * Voice API service for Lindy AI
 */

import { fetchApi, ApiResponse } from './api';

export interface OutfitResponse {
  outfit: any;
  audioUrl: string;
  success?: boolean;
  message?: string;
}

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
