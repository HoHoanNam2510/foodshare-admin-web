import axiosInstance from './axios';

// ─── Types ───────────────────────────────────────────────────

export interface OverviewStats {
  users: { total: number; active: number; banned: number; pendingKyc: number };
  posts: { total: number; available: number; pendingReview: number; hidden: number };
  transactions: { total: number; pending: number; completed: number; disputed: number; totalRevenue: number };
  reports: { total: number; pending: number; resolved: number; dismissed: number };
}

export interface ChartPoint {
  name: string;
  total: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type TabId = 'users' | 'posts' | 'transactions' | 'reports' | 'audits';
export type TimeRange = 'day' | 'week' | 'month';
export type SortOrder = 'asc' | 'desc';

// ─── API Calls ───────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<OverviewStats> {
  const res = await axiosInstance.get<{ success: boolean; data: OverviewStats }>('/dashboard/stats');
  return res.data.data;
}

export async function fetchDashboardChart(
  tab: TabId,
  range: TimeRange,
  date?: string
): Promise<ChartPoint[]> {
  const params = new URLSearchParams({ tab, range });
  if (date) params.set('date', date);
  const res = await axiosInstance.get<{ success: boolean; data: ChartPoint[] }>(
    `/dashboard/chart?${params.toString()}`
  );
  return res.data.data;
}

export async function fetchDashboardTable(
  tab: TabId,
  page: number = 1,
  limit: number = 10,
  sortOrder: SortOrder = 'desc'
): Promise<{ data: any[]; pagination: PaginationMeta }> {
  const res = await axiosInstance.get<{ success: boolean; data: any[]; pagination: PaginationMeta }>(
    `/dashboard/table?tab=${tab}&page=${page}&limit=${limit}&sortOrder=${sortOrder}`
  );
  return { data: res.data.data, pagination: res.data.pagination };
}
