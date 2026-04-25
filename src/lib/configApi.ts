import axiosInstance from './axios';

export type GracePeriodDays = 7 | 30;
export type CleanupSchedule = 'WEEKLY' | 'MONTHLY' | 'BOTH';
export type AIModerationInterval = 1 | 2 | 6 | 12 | 24;

export interface ISoftDeleteConfig {
  gracePeriodDays: GracePeriodDays;
  cleanupSchedule: CleanupSchedule;
  lastCleanupAt?: string;
  lastCleanupCount?: number;
}

export interface IBatchStats {
  processed: number;
  approved: number;
  rejected: number;
  pendingManual: number;
}

export interface IAIModerationConfig {
  enabled: boolean;
  intervalHours: AIModerationInterval;
  trustScoreThresholds: {
    reject: number;
    approve: number;
  };
  lastRunAt?: string;
  lastRunStats?: IBatchStats;
}

export interface ISystemConfig {
  _id?: string;
  softDelete?: ISoftDeleteConfig;
  aiModeration?: IAIModerationConfig;
  updatedAt?: string;
}

// ── GET /api/config ──
export async function fetchSystemConfig(): Promise<{ success: boolean; data: ISystemConfig | null }> {
  const res = await axiosInstance.get<{ success: boolean; data: ISystemConfig | null }>('/config');
  return res.data;
}

// ── PUT /api/config (soft delete config only) ──
export async function updateSoftDeleteConfig(
  softDelete: Pick<ISoftDeleteConfig, 'gracePeriodDays' | 'cleanupSchedule'>
): Promise<{ success: boolean; data: ISystemConfig }> {
  const res = await axiosInstance.put<{ success: boolean; data: ISystemConfig }>('/config', { softDelete });
  return res.data;
}

// ── PUT /api/config/ai-moderation ──
export async function updateAIModerationConfig(
  payload: Omit<IAIModerationConfig, 'lastRunAt' | 'lastRunStats'>
): Promise<{ success: boolean; data: ISystemConfig }> {
  const res = await axiosInstance.put<{ success: boolean; data: ISystemConfig }>(
    '/config/ai-moderation',
    payload
  );
  return res.data;
}

// ── POST /api/config/ai-moderation/run ──
export async function triggerAIModerationNow(): Promise<{ success: boolean; data: IBatchStats }> {
  const res = await axiosInstance.post<{ success: boolean; data: IBatchStats }>(
    '/config/ai-moderation/run'
  );
  return res.data;
}
