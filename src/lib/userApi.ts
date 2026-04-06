import axiosInstance from './axios';

export interface IUser {
  _id: string;
  email: string;
  phoneNumber?: string;
  authProvider: 'LOCAL' | 'GOOGLE';
  isEmailVerified: boolean;
  isProfileCompleted: boolean;
  role: 'USER' | 'STORE' | 'ADMIN';
  fullName: string;
  avatar?: string;
  defaultAddress?: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  kycDocuments: string[];
  storeInfo?: {
    businessName?: string;
    openHours?: string;
    closeHours?: string;
    description?: string;
    businessAddress?: string;
  };
  greenPoints: number;
  averageRating: number;
  /** PENDING_KYC: user submitted store docs, awaiting admin review */
  status: 'ACTIVE' | 'BANNED' | 'PENDING_KYC';
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsersResponse {
  success: boolean;
  data: IUser[];
  pagination: PaginationMeta;
}

export async function fetchUsers(params: {
  search?: string;
  role?: string;
  status?: string;
  kycStatus?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}): Promise<UsersResponse> {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.role && params.role !== 'ALL') query.set('role', params.role);
  if (params.status && params.status !== 'ALL') query.set('status', params.status);
  if (params.kycStatus && params.kycStatus !== 'ALL') query.set('kycStatus', params.kycStatus);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);

  const res = await axiosInstance.get<UsersResponse>(`/users?${query.toString()}`);
  return res.data;
}

export async function reviewKyc(
  id: string,
  action: 'APPROVE' | 'REJECT',
  rejectionReason?: string
): Promise<{ success: boolean; message: string; data: IUser }> {
  const res = await axiosInstance.patch(`/users/${id}/kyc-review`, {
    action,
    rejectionReason,
  });
  return res.data;
}

export async function updateUserStatus(
  id: string,
  status: 'ACTIVE' | 'BANNED' | 'PENDING_KYC'
): Promise<{ success: boolean; data: IUser }> {
  const res = await axiosInstance.put(`/users/${id}`, { status });
  return res.data;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  defaultAddress?: string;
  role?: 'USER' | 'STORE' | 'ADMIN';
  kycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  /** Admin can only set ACTIVE or BANNED — PENDING_KYC is system-managed */
  status?: 'ACTIVE' | 'BANNED';
  storeInfo?: {
    businessName?: string;
    openHours?: string;
    closeHours?: string;
    description?: string;
    businessAddress?: string;
  };
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<{ success: boolean; data: IUser }> {
  const res = await axiosInstance.put<{ success: boolean; data: IUser }>(
    `/users/${id}`,
    payload
  );
  return res.data;
}

export async function deleteUser(id: string): Promise<void> {
  await axiosInstance.delete(`/users/${id}`);
}

export interface CreateUserPayload {
  email: string;
  password: string;
  fullName: string;
  role: 'USER' | 'STORE' | 'ADMIN';
  phoneNumber?: string;
  defaultAddress?: string;
  kycStatus?: 'PENDING' | 'VERIFIED';
  storeInfo?: {
    businessName?: string;
    openHours?: string;
    closeHours?: string;
    description?: string;
    businessAddress?: string;
  };
  isEmailVerified?: boolean;
  isProfileCompleted?: boolean;
}

export async function adminCreateUser(
  payload: CreateUserPayload
): Promise<{ success: boolean; message: string; data: IUser }> {
  const res = await axiosInstance.post<{ success: boolean; message: string; data: IUser }>('/users', payload);
  return res.data;
}
