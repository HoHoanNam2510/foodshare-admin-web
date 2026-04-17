import axiosInstance from './axios';

// ── Types ──

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED' | 'WITHDRAWN';
export type ReportTargetType = 'POST' | 'USER' | 'TRANSACTION' | 'REVIEW';
export type ReportReason =
  | 'FOOD_SAFETY'
  | 'SCAM'
  | 'INAPPROPRIATE_CONTENT'
  | 'NO_SHOW'
  | 'OTHER';
export type ReportAction =
  | 'NONE'
  | 'POST_HIDDEN'
  | 'USER_WARNED'
  | 'USER_BANNED'
  | 'REFUNDED'
  | 'REVIEW_DELETED';

export interface IReporter {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

export interface IReport {
  _id: string;
  reporterId: IReporter;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description: string;
  images: string[];
  status: ReportStatus;
  actionTaken: ReportAction;
  resolutionNote?: string;
  resolvedBy?: { _id: string; fullName: string; email?: string };
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

export interface AdminReportsResponse {
  success: boolean;
  data: IReport[];
  pagination: PaginationMeta;
}

// ── GET /api/reports/admin ──

export async function fetchAdminReports(params: {
  status?: string;
  targetType?: string;
  page?: number;
  limit?: number;
}): Promise<AdminReportsResponse> {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'ALL') query.set('status', params.status);
  if (params.targetType && params.targetType !== 'ALL') query.set('targetType', params.targetType);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const res = await axiosInstance.get<AdminReportsResponse>(
    `/reports/admin?${query.toString()}`
  );
  return res.data;
}

// ── PUT /api/reports/admin/:id/process ──

export async function adminProcessReport(
  reportId: string,
  payload: {
    status: 'RESOLVED' | 'DISMISSED';
    actionTaken: ReportAction;
    resolutionNote: string;
  }
): Promise<{ success: boolean; data: IReport }> {
  const res = await axiosInstance.put(
    `/reports/admin/${reportId}/process`,
    payload
  );
  return res.data;
}
