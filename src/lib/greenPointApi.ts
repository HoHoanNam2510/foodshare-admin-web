import axiosInstance from './axios';

export interface IPointLog {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  amount: number;
  reason: string;
  referenceId?: string;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminPointLogsResponse {
  success: boolean;
  data: IPointLog[];
  pagination: PaginationMeta;
}

export async function fetchAdminPointLogs(params: {
  userId?: string;
  page?: number;
  limit?: number;
}): Promise<AdminPointLogsResponse> {
  const query = new URLSearchParams();
  if (params.userId) query.set('userId', params.userId);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const res = await axiosInstance.get<AdminPointLogsResponse>(
    `/greenpoints/admin/logs?${query.toString()}`
  );
  return res.data;
}
