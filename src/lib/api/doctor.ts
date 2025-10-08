import { API_ENDPOINTS } from '@/constants';
import type { User } from '@/types';
import { apiClient } from './base';

/**
 * Doctor API calls
 */
export const doctorApi = {
  search: (query: string): Promise<User[]> => 
    apiClient.get(`${API_ENDPOINTS.DOCTORS.SEARCH}?q=${encodeURIComponent(query)}`),

  getById: (id: string): Promise<User> => 
    apiClient.get(API_ENDPOINTS.DOCTORS.BY_ID(id)),

  // Get patient by national ID (for doctor's patient search)
  getPatientByNationalId: (nationalId: string): Promise<User> =>
    apiClient.get(`${API_ENDPOINTS.USERS.SEARCH_PATIENT}?nationalId=${encodeURIComponent(nationalId)}`),
};
