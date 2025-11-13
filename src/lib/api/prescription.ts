import { API_ENDPOINTS } from '@/constants';
import type { Prescription } from '@/types';
import { apiClient } from './base';

/**
 * Prescription API calls
 */
export const prescriptionApi = {
  // Upload prescription
  upload: async (file: File, doctorId?: string): Promise<Prescription> => {
    const formData = new FormData();
    formData.append('prescription', file);
    if (doctorId) formData.append('doctorId', doctorId);
    
    return apiClient.uploadFile(API_ENDPOINTS.PRESCRIPTIONS.UPLOAD, formData);
  },

  // Patient confirms or rejects prescription order
  confirmPrescription: (id: string, confirm: boolean): Promise<Prescription> =>
    apiClient.put(API_ENDPOINTS.PRESCRIPTIONS.CONFIRM(id), { confirm }),

  // For patients only
  getMyPrescriptions: (): Promise<Prescription[]> => 
    apiClient.get(API_ENDPOINTS.PRESCRIPTIONS.MY),

  // For doctors/admins: get all prescriptions with optional filters
  getAll: (params?: { doctor?: string, patient?: string, status?: string }): Promise<Prescription[]> => {
    let url = API_ENDPOINTS.PRESCRIPTIONS.ALL;
    if (params) {
      const q = Object.entries(params)
        .filter(([_, v]) => v)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
        .join('&');
      if (q) url += `?${q}`;
    }
    return apiClient.get(url);
  },

  // Verify prescription (doctor/admin)
  verify: (id: string, approved: boolean): Promise<Prescription> => 
    apiClient.put(API_ENDPOINTS.PRESCRIPTIONS.VERIFY(id), { approved }),

  // Delete prescription
  deletePrescription: (id: string): Promise<void> =>
    apiClient.delete(API_ENDPOINTS.PRESCRIPTIONS.BY_ID(id)),
};

/**
 * Fetch prescriptions for the current user based on their role
 */
export async function getPrescriptionsForCurrentUser(): Promise<Prescription[]> {
  const { userApi } = await import('./user');
  const profile = await userApi.getProfile();
  
  if (profile.role === 'patient') {
    return prescriptionApi.getMyPrescriptions();
  } else if (profile.role === 'doctor') {
    return prescriptionApi.getAll({ doctor: profile.id });
  } else if (profile.role === 'admin') {
    return prescriptionApi.getAll();
  } else {
    return [];
  }
}
