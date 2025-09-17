/**
 * Base API service for making HTTP requests
 */

const BASE_URL = 'https://lindy-api.martinsson.io/api';
//const BASE_URL = 'http://localhost:8080/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  fromCache?: boolean;
}

export interface MockImageData {
  imageUrl: string;
}

export async function fetchMockImages(): Promise<ApiResponse<MockImageData[]>> {
  return fetchApi<MockImageData[]>('/voice/mock');
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`Making API request to: ${url}`);
    console.log('Request options:', {
      method: options.method || 'GET',
      headers: options.headers,
      bodyLength: options.body ? (options.body as string).length : 0,
    });
    
    // Prepare headers - don't set Content-Type for FormData as it needs to include the boundary
    const headers = options.body instanceof FormData
      ? { ...options.headers }
      : { 'Content-Type': 'application/json', ...options.headers };
      
    const response = await fetch(url, {
      headers,
      ...options,
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      let errorData;
      try {
        errorData = await response.json();
        console.error('Error response data:', errorData);
      } catch (e) {
        console.error('Could not parse error response as JSON');
      }
      
      return {
        success: false,
        message: errorData?.message || `Server error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('API response data:', data);
    return data as ApiResponse<T>;
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
