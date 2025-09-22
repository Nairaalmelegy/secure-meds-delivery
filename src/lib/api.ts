// Types for medical records
export interface ScanRecord {
  fileUrl: string;
  type?: string;
  date?: string;
  notes?: string;
}

export interface MedicalRecords {
  chronicDiseases?: string[];
  allergies?: string[];
  pastMedications?: string[];
  scans?: ScanRecord[];
}

export interface ScanUploadResponse {
  message: string;
  scan: ScanRecord;
  user: any;
}
const API_BASE_URL = 'https://medilinkback-production.up.railway.app';

// API client with error handling
class ApiClient {
  private baseURL: string;
  private csrfToken: string | null = null;

  public getBaseUrl() {
    return this.baseURL;
  }

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Fetch CSRF token from backend and cache it
  private async fetchCsrfToken(): Promise<string> {
    if (this.csrfToken) return this.csrfToken;
    const res = await fetch(`${this.baseURL}/api/csrf-token`, {
      credentials: 'include',
    });
    const data = await res.json();
    this.csrfToken = data.csrfToken;
    return this.csrfToken;
  }

  // Clear cached CSRF token (e.g. on logout or 403)
  public clearCsrfToken() {
    this.csrfToken = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Always include credentials for cookies
    const config: RequestInit = {
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available (for legacy endpoints)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    // For state-changing requests, add CSRF token
    const method = (config.method || 'GET').toUpperCase();
    if ([ 'POST', 'PUT', 'PATCH', 'DELETE' ].includes(method)) {
      if (!this.csrfToken) {
        await this.fetchCsrfToken();
      }
      (config.headers as any)['X-CSRF-Token'] = this.csrfToken;
    }

    try {
      const response = await fetch(url, config);

      // If CSRF error, clear token and retry once
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message && errorData.message.toLowerCase().includes('csrf')) {
          this.clearCsrfToken();
          // Retry with new token
          if (!config._retried) {
            (config as any)._retried = true;
            return this.request<T>(endpoint, options);
          }
        }
        throw new Error(errorData.message || `HTTP 403 Forbidden`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}


export const apiClient = new ApiClient(API_BASE_URL);

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface registerRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'patient' | 'doctor';
  nationalId?: string;
  medicalLicense?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

// Auth API functions
export const authApi = {
  login: (data: LoginRequest): Promise<AuthResponse> => 
    apiClient.post<AuthResponse>('/api/auth/login', data),
    
  register: (data: registerRequest): Promise<AuthResponse> => 
    apiClient.post<AuthResponse>('/api/auth/register', data),
    
  logout: (): Promise<void> => 
    apiClient.post<void>('/api/auth/logout'),
};

// Medicine API functions
export const medicineApi = {
  search: (query: string): Promise<any[]> => 
    apiClient.get(`/api/medicines/search/name/${encodeURIComponent(query)}`),
    
  getAll: (): Promise<any[]> => 
    apiClient.get('/api/medicines'),
    
  getById: (id: string): Promise<any> => 
    apiClient.get(`/api/medicines/${id}`),
};

// Order API functions  
export const orderApi = {
  create: (data: any): Promise<any> => 
    apiClient.post('/api/orders', data),
    
  getMyOrders: (): Promise<any[]> => 
    apiClient.get('/api/orders/my'),
    
  getById: (id: string): Promise<any> => 
    apiClient.get(`/api/orders/${id}`),
    
  updateStatus: (id: string, status: string, pharmacyId?: string): Promise<any> => {
    // If admin, pass pharmacyId in body
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user && user.role === 'admin';
    const body: any = { status };
    if (isAdmin && pharmacyId) body.id = pharmacyId;
    else body.id = id;
    return apiClient.put(`/api/orders/${id}/status`, body);
  },
};

// Prescription API functions
export const prescriptionApi = {
  // Patient confirms or rejects prescription order
  confirmPrescription: (id: string, confirm: boolean): Promise<any> =>
    apiClient.put(`/api/prescriptions/${id}/patient-confirm`, { confirm }),
  upload: async (file: File, doctorId?: string): Promise<any> => {
    const formData = new FormData();
    formData.append('prescription', file);
    if (doctorId) formData.append('doctorId', doctorId);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/prescriptions/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload prescription');
    return res.json();
  },

  // For patients only
  getMyPrescriptions: (): Promise<any[]> => 
    apiClient.get('/api/prescriptions/my'),

  // For doctors: get all prescriptions, optionally filter by doctorId
  getAll: (params?: { doctor?: string, patient?: string, status?: string }): Promise<any[]> => {
    let url = '/api/prescriptions';
    if (params) {
      const q = Object.entries(params)
        .filter(([_, v]) => v)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
        .join('&');
      if (q) url += `?${q}`;
    }
    return apiClient.get(url);
  },

  verify: (id: string, approved: boolean): Promise<any> => 
    apiClient.put(`/api/prescriptions/${id}/verify`, { approved }),

  // Delete a prescription by ID
  deletePrescription: (id: string): Promise<any> =>
    apiClient.delete(`/api/prescriptions/${id}`),
};

// User API functions
export const userApi = {
  // Upload a scan (medical record image/pdf) for current user
  uploadScan: async (file: File, meta?: { type?: string; date?: string; notes?: string }): Promise<ScanUploadResponse> => {
    const formData = new FormData();
    formData.append('scan', file);
    if (meta?.type) formData.append('type', meta.type);
    if (meta?.date) formData.append('date', meta.date);
    if (meta?.notes) formData.append('notes', meta.notes);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/users/me/scan`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload scan');
    return res.json();
  },

  // Update medical records (chronic diseases, allergies, past medications)
  updateMedicalRecords: (data: MedicalRecords): Promise<any> =>
    apiClient.put('/api/users/me/medical-records', data),
  searchDoctors: (query: string, limit = 10): Promise<{ doctors: any[], count: number }> =>
    apiClient.get(`/api/users/search/doctor?q=${encodeURIComponent(query)}&limit=${limit}`),
  // Public: search doctors by name or email (for patient prescription upload)

  getProfile: (): Promise<any> => 
    apiClient.get('/api/users/me'),
  updateProfile: (data: any): Promise<any> => 
    apiClient.put('/api/users/me', data),
  changePassword: (data: { currentPassword: string, newPassword: string }): Promise<any> => 
    apiClient.put('/api/users/me/password', data),
  search: (query: string, role?: string): Promise<{ users: any[], count: number }> => {
    let url = '/api/users';
    const params = [];
    if (query && query.trim() !== '') params.push(`q=${encodeURIComponent(query)}`);
    if (role) params.push(`role=${encodeURIComponent(role)}`);
    if (params.length > 0) url += '?' + params.join('&');
    return apiClient.get(url);
  },
  getById: (id: string): Promise<any> => 
    apiClient.get(`/api/users/${id}`),
  updateUser: (id: string, data: any): Promise<any> => 
    apiClient.put(`/api/users/${id}`, data),
  deleteUser: (id: string): Promise<any> => 
    apiClient.delete(`/api/users/${id}`),
  getPendingDoctors: (): Promise<any[]> => 
    apiClient.get('/api/users?role=doctor&status=pending'),
  approveDoctor: (id: string): Promise<any> => 
    apiClient.put(`/api/users/${id}/approve`, {}),
  rejectDoctor: (id: string): Promise<any> => 
    apiClient.put(`/api/users/${id}/reject`, {}),
};

// Doctor API functions
export const doctorApi = {
  search: (query: string): Promise<any[]> => 
    apiClient.get(`/api/doctors/search?q=${encodeURIComponent(query)}`),

  getById: (id: string): Promise<any> => 
    apiClient.get(`/api/doctors/${id}`),

  // Use the correct endpoint for doctor patient search (by nationalId)
  getPatientByNationalId: (nationalId: string): Promise<any> =>
    apiClient.get(`/api/users/search/patient?nationalId=${encodeURIComponent(nationalId)}`),
};

/**
 * Fetch prescriptions for the current user, using the correct endpoint for their role.
 * - Patients: /api/prescriptions/my
 * - Doctors: /api/prescriptions?doctor=<doctorId>
 * - Admins: /api/prescriptions
 * - Others: returns []
 */
export async function getPrescriptionsForCurrentUser(): Promise<any[]> {
  const profile = await userApi.getProfile();
  if (profile.role === 'patient') {
    return prescriptionApi.getMyPrescriptions();
  } else if (profile.role === 'doctor') {
    return prescriptionApi.getAll({ doctor: profile._id });
  } else if (profile.role === 'admin') {
    return prescriptionApi.getAll();
  } else {
    return [];
  }
}