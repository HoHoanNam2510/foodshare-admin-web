import axiosInstance from './axios';

// =============================================
// TYPESCRIPT INTERFACES
// =============================================

export type TriggerEvent =
  | 'PROFILE_COMPLETED'
  | 'POST_CREATED'
  | 'TRANSACTION_COMPLETED'
  | 'REVIEW_RECEIVED'
  | 'GREENPOINTS_AWARDED'
  | 'KYC_APPROVED';

export type TargetRole = 'USER' | 'STORE' | 'BOTH';

export interface IBadge {
  _id: string;
  code: string;
  name: string;
  description: string;
  imageUrl: string;
  targetRole: TargetRole;
  triggerEvent: TriggerEvent;
  pointReward: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  // Enriched by adminGetAllBadges
  unlockedCount?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminBadgesResponse {
  success: boolean;
  data: {
    badges: IBadge[];
    pagination: PaginationMeta;
  };
}

export interface BadgeStat {
  badge: IBadge;
  unlockedCount: number;
  percentage: number;
}

// =============================================
// API FUNCTIONS
// =============================================

export async function fetchAdminBadges(params?: {
  targetRole?: TargetRole;
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<AdminBadgesResponse> {
  const query = new URLSearchParams();
  if (params?.targetRole) query.set('targetRole', params.targetRole);
  if (typeof params?.isActive === 'boolean')
    query.set('isActive', String(params.isActive));
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const res = await axiosInstance.get<AdminBadgesResponse>(
    `/badges/admin?${query.toString()}`
  );
  return res.data;
}

export async function fetchBadgeStats(): Promise<{
  success: boolean;
  data: BadgeStat[];
}> {
  const res = await axiosInstance.get('/badges/admin/stats');
  return res.data;
}

export async function createBadgeApi(data: {
  code: string;
  name: string;
  description: string;
  imageUrl: string;
  targetRole: TargetRole;
  triggerEvent: TriggerEvent;
  pointReward: number;
  sortOrder?: number;
}): Promise<{ success: boolean; data: IBadge }> {
  const res = await axiosInstance.post('/badges/admin', data);
  return res.data;
}

export async function updateBadgeApi(
  badgeId: string,
  data: Partial<{
    name: string;
    description: string;
    imageUrl: string;
    pointReward: number;
    sortOrder: number;
    isActive: boolean;
  }>
): Promise<{ success: boolean; data: IBadge }> {
  const res = await axiosInstance.put(`/badges/admin/${badgeId}`, data);
  return res.data;
}

export async function toggleBadgeApi(
  badgeId: string
): Promise<{ success: boolean; data: { isActive: boolean } }> {
  const res = await axiosInstance.patch(`/badges/admin/${badgeId}/toggle`);
  return res.data;
}
