/**
 * Centralized API exports
 * 
 * Usage:
 * import { authApi, userApi, medicineApi } from '@/lib/api';
 */

export { apiClient } from './base';
export { authApi } from './auth';
export { userApi } from './user';
export { medicineApi } from './medicine';
export { orderApi } from './order';
export { prescriptionApi, getPrescriptionsForCurrentUser } from './prescription';
export { doctorApi } from './doctor';

// Re-export types
export type * from '@/types';
