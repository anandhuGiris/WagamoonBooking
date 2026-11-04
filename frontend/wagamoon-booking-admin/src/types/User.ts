export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateAdminRequest {
  name: string;
  email: string;
  password?: string;
  role?: string;
  isActive: boolean;
}
