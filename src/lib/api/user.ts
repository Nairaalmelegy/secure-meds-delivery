import { API_ENDPOINTS } from '@/constants';
import type { User, MedicalRecords, ScanUploadResponse, UserSearchResponse, ProfileUpdateData, PasswordChangeData } from '@/types';
import { apiClient } from './base';

/**
 * User API calls
 */
export const userApi = {
  // Profile management
  getProfile: (): Promise<User> => 
    apiClient.get(API_ENDPOINTS.USERS.PROFILE),
    
  updateProfile: (data: ProfileUpdateData): Promise<User> => 
    apiClient.put(API_ENDPOINTS.USERS.PROFILE, data),
    
  changePassword: (data: PasswordChangeData): Promise<void> => 
    apiClient.put(API_ENDPOINTS.USERS.PASSWORD, data),

  // Medical records
  updateMedicalRecords: (data: MedicalRecords): Promise<User> =>
    apiClient.put(API_ENDPOINTS.USERS.MEDICAL_RECORDS, data),

  uploadScan: async (
    file: File, 
    meta?: { type?: string; date?: string; notes?: string }
  ): Promise<ScanUploadResponse> => {
    const formData = new FormData();
    formData.append('scan', file);
    if (meta?.type) formData.append('type', meta.type);
    if (meta?.date) formData.append('date', meta.date);
    if (meta?.notes) formData.append('notes', meta.notes);
    
    return apiClient.uploadFile(API_ENDPOINTS.USERS.SCAN, formData);
  },

  // Search
  search: (query: string, role?: string): Promise<UserSearchResponse> => {
    let url = API_ENDPOINTS.USERS.SEARCH;
    const params = [];
    if (query && query.trim() !== '') params.push(`q=${encodeURIComponent(query)}`);
    if (role) params.push(`role=${encodeURIComponent(role)}`);
    if (params.length > 0) url += '?' + params.join('&');
    return apiClient.get(url);
  },

  searchDoctors: (query: string, limit = 10): Promise<{ doctors: User[], count: number }> =>
    apiClient.get(`${API_ENDPOINTS.USERS.SEARCH_DOCTOR}?q=${encodeURIComponent(query)}&limit=${limit}`),

  // Admin operations
  getById: (id: string): Promise<User> => 
    apiClient.get(API_ENDPOINTS.USERS.BY_ID(id)),
    
  updateUser: (id: string, data: any): Promise<User> => 
    apiClient.put(API_ENDPOINTS.USERS.BY_ID(id), data),
    
  deleteUser: (id: string): Promise<void> => 
    apiClient.delete(API_ENDPOINTS.USERS.BY_ID(id)),
    
  getPendingDoctors: (): Promise<User[]> => 
    apiClient.get(`${API_ENDPOINTS.USERS.SEARCH}?role=doctor&status=pending`),
    
  approveDoctor: (id: string): Promise<User> => 
    apiClient.put(API_ENDPOINTS.USERS.APPROVE(id), {}),
    
  rejectDoctor: (id: string): Promise<User> => 
    apiClient.put(API_ENDPOINTS.USERS.REJECT(id), {}),
};
