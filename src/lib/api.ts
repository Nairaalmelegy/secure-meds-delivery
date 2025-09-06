const API_BASE_URL = 'https://medilinkback-production.up.railway.app';

// API client with error handling
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
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
  role: 'patient' | 'doctor' | 'pharmacy';
  nationalId?: string;
  medicalLicense?: string;
  pharmacyName?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
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
    apiClient.get(`/api/medicines/search?q=${encodeURIComponent(query)}`),
    
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
    
  updateStatus: (id: string, status: string): Promise<any> => 
    apiClient.put(`/api/orders/${id}/status`, { status }),
};

// Prescription API functions
export const prescriptionApi = {
  upload: (file: File, doctorId?: string): Promise<any> => {
    const formData = new FormData();
    formData.append('prescription', file);
    if (doctorId) formData.append('doctorId', doctorId);
    
    return fetch(`${API_BASE_URL}/api/prescriptions/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    }).then(res => res.json());
  },
  
  getMyPrescriptions: (): Promise<any[]> => 
    apiClient.get('/api/prescriptions/my'),
    
  verify: (id: string, approved: boolean): Promise<any> => 
    apiClient.put(`/api/prescriptions/${id}/verify`, { approved }),
};

// Doctor API functions
export const doctorApi = {
  search: (query: string): Promise<any[]> => 
    apiClient.get(`/api/doctors/search?q=${encodeURIComponent(query)}`),
    
  getById: (id: string): Promise<any> => 
    apiClient.get(`/api/doctors/${id}`),
    
  getPatients: (): Promise<any[]> => 
    apiClient.get('/api/doctors/patients'),
};