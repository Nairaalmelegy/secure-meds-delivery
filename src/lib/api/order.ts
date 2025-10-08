import { API_ENDPOINTS, STORAGE_KEYS } from '@/constants';
import type { Order } from '@/types';
import { apiClient } from './base';

/**
 * Order API calls
 */
export const orderApi = {
  create: (data: any): Promise<Order> => 
    apiClient.post(API_ENDPOINTS.ORDERS.ALL, data),
    
  getMyOrders: (): Promise<Order[]> => 
    apiClient.get(API_ENDPOINTS.ORDERS.MY),
    
  getById: (id: string): Promise<Order> => 
    apiClient.get(API_ENDPOINTS.ORDERS.BY_ID(id)),
    
  updateStatus: (id: string, status: string, pharmacyId?: string): Promise<Order> => {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
    const isAdmin = user && user.role === 'admin';
    const body: any = { status };
    if (isAdmin && pharmacyId) body.id = pharmacyId;
    else body.id = id;
    return apiClient.put(API_ENDPOINTS.ORDERS.STATUS(id), body);
  },
};
