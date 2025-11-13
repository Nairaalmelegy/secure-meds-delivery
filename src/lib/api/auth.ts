import { API_ENDPOINTS } from '@/constants';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types';
import { apiClient } from './base';

/**
 * Authentication API calls
 */
export const authApi = {
  login: (data: LoginRequest): Promise<AuthResponse> => 
    apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data),
    
  register: (data: RegisterRequest): Promise<AuthResponse> => 
    apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data),
    
  logout: (): Promise<void> => 
    apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT),
};
