import axiosInstance from './axios';

// ── Types ─────────────────────────────────────────────────────────────────────

export type FeedbackType = 'BUG_REPORT' | 'SUGGESTION';
export type FeedbackPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FeedbackStatus = 'PENDING' | 'PROCESSING' | 'CLOSED';

export interface IFeedbackUser {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  role: string;
}

export interface IFeedback {
  _id: string;
  userId: IFeedbackUser;
  userType: 'INDIVIDUAL' | 'STORE';
  type: FeedbackType;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  title: string;
  content: string;
  attachments: string[];
  contextMetadata: {
    appVersion?: string;
    os?: 'ios' | 'android' | 'web';
    relatedEntityId?: string;
  };
  adminId?: { _id: string; fullName: string; email: string };
  adminReply?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FeedbackFilters {
  status?: string;
  type?: string;
  priority?: string;
  page?: number;
  limit?: number;
  search?: string;
}

// ── GET /api/feedbacks/admin ──────────────────────────────────────────────────

export async function fetchAdminFeedbacks(params: FeedbackFilters): Promise<{
  success: boolean;
  data: IFeedback[];
  pagination: PaginationMeta;
}> {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'ALL')
    query.set('status', params.status);
  if (params.type && params.type !== 'ALL') query.set('type', params.type);
  if (params.priority && params.priority !== 'ALL')
    query.set('priority', params.priority);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);

  const res = await axiosInstance.get(`/feedbacks/admin?${query.toString()}`);
  return res.data;
}

// ── GET /api/feedbacks/admin/:id ──────────────────────────────────────────────

export async function fetchAdminFeedbackDetail(id: string): Promise<{
  success: boolean;
  data: IFeedback;
}> {
  const res = await axiosInstance.get(`/feedbacks/admin/${id}`);
  return res.data;
}

// ── PATCH /api/feedbacks/admin/:id/assign ────────────────────────────────────

export async function assignFeedback(id: string): Promise<{
  success: boolean;
  message: string;
  data: IFeedback;
}> {
  const res = await axiosInstance.patch(`/feedbacks/admin/${id}/assign`);
  return res.data;
}

// ── PATCH /api/feedbacks/admin/:id/resolve ───────────────────────────────────

export async function resolveFeedback(
  id: string,
  adminReply: string
): Promise<{
  success: boolean;
  message: string;
  data: IFeedback;
}> {
  const res = await axiosInstance.patch(`/feedbacks/admin/${id}/resolve`, {
    adminReply,
  });
  return res.data;
}
