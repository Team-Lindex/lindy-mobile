/**
 * Voice API service for Lindy AI
 */

import { fetchApi, ApiResponse } from './api';

export interface OutfitResponse {
  outfit: any;
  audioUrl: string;
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
  // Send the request as JSON
  return fetchApi<OutfitResponse>('/voice/text-outfit', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      question: text
    }),
  });
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
