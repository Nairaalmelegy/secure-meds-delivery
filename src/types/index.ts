/**
 * Centralized type definitions for the application
 */

// ============= User Types =============
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  nationalId?: string;
  medicalLicense?: string;
  clinic?: string;
  status?: UserStatus;
  address?: string;
  // Medical records
  chronicDiseases?: string[];
  allergies?: string[];
  pastMedications?: string[];
  scans?: ScanRecord[];
  // Patient field for doctor dashboard
  patient?: any;
  [key: string]: any; // Allow additional fields for flexibility
}

export type UserRole = 'patient' | 'doctor' | 'admin' | 'pharmacy';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'active';

// ============= Auth Types =============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
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
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// ============= Medical Records Types =============
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

// ============= Medicine Types =============
export interface Medicine {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
}

// ============= Order Types =============
export interface OrderItem {
  medicine: Medicine | string | { name: string };
  quantity: number;
  qty?: number; // Alias for quantity
  price: number;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  totalAmount: number;
  total: number; // Alias for totalAmount for compatibility
  status: OrderStatus;
  deliveryAddress?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // Allow additional fields for flexibility
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// ============= Prescription Types =============
export interface Prescription {
  _id: string;
  patient: string;
  doctor?: string;
  fileUrl: string;
  status: PrescriptionStatus;
  medicines?: Medicine[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // Allow additional fields for flexibility
}

export type PrescriptionStatus = 'pending' | 'verified' | 'rejected' | 'filled';

// ============= Profile Types =============
export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  clinic?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

// ============= Search Types =============
export interface SearchResponse<T> {
  results: T[];
  count: number;
}

export interface UserSearchResponse {
  users: User[];
  count: number;
}

export interface DoctorSearchResponse {
  doctors: User[];
  count: number;
}
