import axiosInstance from './axios';

export type GracePeriodDays = 7 | 30;
export type CleanupSchedule = 'WEEKLY' | 'MONTHLY' | 'BOTH';

export interface ISoftDeleteConfig {
  gracePeriodDays: GracePeriodDays;
  cleanupSchedule: CleanupSchedule;
  lastCleanupAt?: string;
  lastCleanupCount?: number;
}

export interface ISystemConfig {
  _id?: string;
  systemBankName: string;
  systemBankCode: string;
  systemBankAccountNumber: string;
  systemBankAccountName: string;
  softDelete?: ISoftDeleteConfig;
  updatedAt?: string;
}

// ── GET /api/config ──
export async function fetchSystemConfig(): Promise<{ success: boolean; data: ISystemConfig | null }> {
  const res = await axiosInstance.get<{ success: boolean; data: ISystemConfig | null }>('/config');
  return res.data;
}

// ── PUT /api/config (full update) ──
export async function updateSystemConfig(
  payload: Omit<ISystemConfig, '_id' | 'updatedAt'>
): Promise<{ success: boolean; data: ISystemConfig }> {
  const res = await axiosInstance.put<{ success: boolean; data: ISystemConfig }>('/config', payload);
  return res.data;
}

// ── PUT /api/config (soft delete config only) ──
export async function updateSoftDeleteConfig(
  softDelete: Pick<ISoftDeleteConfig, 'gracePeriodDays' | 'cleanupSchedule'>
): Promise<{ success: boolean; data: ISystemConfig }> {
  const res = await axiosInstance.put<{ success: boolean; data: ISystemConfig }>('/config', { softDelete });
  return res.data;
}
