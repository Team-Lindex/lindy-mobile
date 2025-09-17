import { fetchApi, ApiResponse } from './api';

export interface NewWardrobeItem {
  userId: string;
  imageUrl: string;
  type: string;
  tags: string[];
}

export interface WardrobeItem {
  _id: string;
  userId: number;
  imageUrl: string;
  type: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface UpdateWardrobeItemTags {
  tags: string[];
}

/**
 * Fetches all wardrobe items for a specific user
 * @param userId The ID of the user
 * @returns Promise with wardrobe items
 */
export async function fetchUserWardrobe(userId: string): Promise<ApiResponse<WardrobeItem[]>> {
  return fetchApi<WardrobeItem[]>(`/wardrobe/user/${userId}`);
}

/**
 * Groups wardrobe items by their type
 * @param items Array of wardrobe items
 * @returns Object with items grouped by type
 */
export function groupWardrobeItemsByType(items: WardrobeItem[]): Record<string, WardrobeItem[]> {
  return items.reduce((groups, item) => {
    // Clean up type by removing any trailing whitespace or carriage returns
    const type = item.type.trim();
    
    if (!groups[type]) {
      groups[type] = [];
    }
    
    groups[type].push(item);
    return groups;
  }, {} as Record<string, WardrobeItem[]>);
}

/**
 * Gets all unique wardrobe item types
 * @param items Array of wardrobe items
 * @returns Array of unique types
 */
export function getUniqueWardrobeTypes(items: WardrobeItem[]): string[] {
  const types = new Set<string>();
  
  items.forEach(item => {
    types.add(item.type.trim());
  });
  
  return ['All', ...Array.from(types)];
}

/**
 * Adds a new wardrobe item for a user
 * @param item The new wardrobe item to add
 * @returns Promise with the API response
 */
export async function addWardrobeItem(item: NewWardrobeItem): Promise<ApiResponse<WardrobeItem>> {
  // For file URIs, we need to convert them to a format the API can handle
  // In a real app, you'd upload the image to a storage service first
  // For this demo, we'll use a mock image URL if it's a file URI
  const processedItem = {
    ...item,
    imageUrl: processImageUrl(item.imageUrl),
  };
  
  console.log('Processed wardrobe item for API:', {
    ...processedItem,
    imageUrl: processedItem.imageUrl.substring(0, 30) + '...' // Truncate for logging
  });
  
  return fetchApi<WardrobeItem>(`/wardrobe/user/${item.userId}`, {
    method: 'POST',
    body: JSON.stringify(processedItem),
  });
}

/**
 * Process image URL to handle file URIs
 * @param imageUrl Original image URL or file URI
 * @returns Processed image URL suitable for API
 */
function processImageUrl(imageUrl: string): string {
  // Check if it's a file URI (starts with file://)
  if (imageUrl.startsWith('file://')) {
    console.log('Converting file URI to web URL');
    // In a real app, you would upload this file to a cloud storage
    // For this demo, we'll use a placeholder image URL based on the file name
    const fileName = imageUrl.split('/').pop() || 'default.jpg';
    return `https://example.com/mock-images/${fileName}`;
  }
  return imageUrl;
}

/**
 * Updates the tags for a specific wardrobe item
 * @param itemId The ID of the wardrobe item to update
 * @param tags The new tags for the item
 * @returns Promise with the API response
 */
export async function updateWardrobeItemTags(itemId: string, tags: string[]): Promise<ApiResponse<WardrobeItem>> {
  const updateData: UpdateWardrobeItemTags = { tags };
  
  console.log(`Updating tags for item ${itemId}:`, tags);
  
  return fetchApi<WardrobeItem>(`/wardrobe/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}
