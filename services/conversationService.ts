/**
 * Conversation API service for Lindy AI
 */

import { fetchApi, ApiResponse } from './api';

/**
 * Interface for a chat message in a conversation
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

/**
 * Interface for a conversation
 */
export interface Conversation {
  _id: string;
  userId: string;
  name: string;
  chatHistory: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for creating a new conversation
 */
export interface NewConversation {
  userId: string;
  name: string;
  chatHistory?: ChatMessage[];
}

/**
 * Interface for updating a conversation
 */
export interface UpdateConversation {
  name?: string;
  chatHistory?: ChatMessage[];
}

/**
 * Fetches all conversations for a specific user
 * @param userId The ID of the user
 * @returns Promise with conversations
 */
export async function fetchUserConversations(userId: string): Promise<ApiResponse<Conversation[]>> {
  return fetchApi<Conversation[]>(`/conversations/user/${userId}`);
}

/**
 * Fetches a specific conversation by ID
 * @param conversationId The ID of the conversation
 * @returns Promise with the conversation
 */
export async function fetchConversation(conversationId: string): Promise<ApiResponse<Conversation>> {
  return fetchApi<Conversation>(`/conversations/${conversationId}`);
}

/**
 * Creates a new conversation
 * @param conversation The conversation to create
 * @returns Promise with the created conversation
 */
export async function createConversation(conversation: NewConversation): Promise<ApiResponse<Conversation>> {
  return fetchApi<Conversation>('/conversations', {
    method: 'POST',
    body: JSON.stringify(conversation),
  });
}

/**
 * Updates an existing conversation
 * @param conversationId The ID of the conversation to update
 * @param updates The updates to apply
 * @returns Promise with the updated conversation
 */
export async function updateConversation(
  conversationId: string,
  updates: UpdateConversation
): Promise<ApiResponse<Conversation>> {
  return fetchApi<Conversation>(`/conversations/${conversationId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * Adds a message to a conversation
 * @param conversationId The ID of the conversation
 * @param message The message to add
 * @returns Promise with the updated conversation
 */
export async function addMessageToConversation(
  conversationId: string,
  message: ChatMessage
): Promise<ApiResponse<Conversation>> {
  return fetchApi<Conversation>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify(message),
  });
}

/**
 * Deletes a conversation
 * @param conversationId The ID of the conversation to delete
 * @returns Promise with the deletion result
 */
export async function deleteConversation(conversationId: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return fetchApi<{ deleted: boolean }>(`/conversations/${conversationId}`, {
    method: 'DELETE',
  });
}
