import { API_ENDPOINTS } from '@/constants';
import type { Medicine } from '@/types';
import { apiClient } from './base';

/**
 * Medicine API calls
 */
export const medicineApi = {
  search: (query: string): Promise<Medicine[]> => 
    apiClient.get(API_ENDPOINTS.MEDICINES.SEARCH(query)),
    
  getAll: (): Promise<Medicine[]> => 
    apiClient.get(API_ENDPOINTS.MEDICINES.ALL),
    
  getById: (id: string): Promise<Medicine> => 
    apiClient.get(API_ENDPOINTS.MEDICINES.BY_ID(id)),
};
