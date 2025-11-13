/**
 * Application-wide constants
 */

// ============= API Configuration =============
// Use empty string to make requests relative, allowing Vercel proxy to work
// The vercel.json file proxies /api/* to the Railway backend
export const API_BASE_URL = '';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
  },
  USERS: {
    PROFILE: '/api/users/me',
    PASSWORD: '/api/users/me/password',
    MEDICAL_RECORDS: '/api/users/me/medical-records',
    SCAN: '/api/users/me/scan',
    SEARCH: '/api/users',
    SEARCH_DOCTOR: '/api/users/search/doctor',
    SEARCH_PATIENT: '/api/users/search/patient',
    BY_ID: (id: string) => `/api/users/${id}`,
    APPROVE: (id: string) => `/api/users/${id}/approve`,
    REJECT: (id: string) => `/api/users/${id}/reject`,
  },
  MEDICINES: {
    ALL: '/api/medicines',
    SEARCH: (query: string) => `/api/medicines/search/name/${encodeURIComponent(query)}`,
    BY_ID: (id: string) => `/api/medicines/${id}`,
  },
  ORDERS: {
    ALL: '/api/orders',
    MY: '/api/orders/my',
    BY_ID: (id: string) => `/api/orders/${id}`,
    STATUS: (id: string) => `/api/orders/${id}/status`,
  },
  PRESCRIPTIONS: {
    ALL: '/api/prescriptions',
    MY: '/api/prescriptions/my',
    UPLOAD: '/api/prescriptions/upload',
    BY_ID: (id: string) => `/api/prescriptions/${id}`,
    VERIFY: (id: string) => `/api/prescriptions/${id}/verify`,
    CONFIRM: (id: string) => `/api/prescriptions/${id}/patient-confirm`,
  },
  DOCTORS: {
    SEARCH: '/api/doctors/search',
    BY_ID: (id: string) => `/api/doctors/${id}`,
  },
} as const;

// ============= Local Storage Keys =============
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CSRF_TOKEN: 'csrf_token',
} as const;

// ============= File Upload Configuration =============
export const FILE_UPLOAD = {
  MAX_SIZE_MB: {
    IMAGE: 5,
    PDF: 10,
    SCAN: 10,
  },
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/jpg', 'image/png'],
    PDF: ['application/pdf'],
    PRESCRIPTION: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  },
} as const;

// ============= Validation Rules =============
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 100,
  },
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  EMAIL: {
    MAX_LENGTH: 255,
  },
  PHONE: {
    PATTERN: /^\+?[\d\s()-]{10,20}$/,
  },
  SEARCH_QUERY: {
    MAX_LENGTH: 100,
  },
} as const;

// ============= User Roles =============
export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
  PHARMACY: 'pharmacy',
} as const;

// ============= Status Types =============
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const PRESCRIPTION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  FILLED: 'filled',
} as const;

export const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
} as const;

// ============= UI Constants =============
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000,
} as const;

export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const;

// ============= Routes =============
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  DOCTOR_DASHBOARD: '/doctor-dashboard',
  ADMIN_DASHBOARD: '/admin',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ORDERS: '/orders',
  PRESCRIPTIONS: '/prescriptions',
  MEDICINES: '/medicines',
} as const;
