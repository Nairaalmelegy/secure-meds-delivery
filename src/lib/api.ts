/**
 * @deprecated This file is deprecated. Use individual API modules from @/lib/api instead.
 * 
 * New imports:
 * import { authApi, userApi, medicineApi, orderApi, prescriptionApi, doctorApi } from '@/lib/api';
 * 
 * This file is kept for backward compatibility only.
 */

// Re-export everything from the new API structure
export * from './api/index';
export { apiClient } from './api/base';

// Re-export types
export type * from '@/types';
