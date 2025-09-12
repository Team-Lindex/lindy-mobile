import { fetchApi, ApiResponse } from './api';

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
