import axiosInstance from './axios';

export type ModerationDecision = 'APPROVED' | 'REJECTED' | 'PENDING_MANUAL';
export type ModerationTrigger = 'ON_CREATE' | 'ON_UPDATE' | 'BATCH_SCHEDULER' | 'MANUAL_ADMIN';

export interface IAIModerationLog {
  _id: string;
  postId: { _id: string; title: string } | null;
  postTitle: string;
  trustScore: number;
  reason: string;
  decision: ModerationDecision;
  trigger: ModerationTrigger;
  createdAt: string;
}

export async function fetchAIModerationLogs(
  page: number,
  limit: number
): Promise<{
  success: boolean;
  data: IAIModerationLog[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const res = await axiosInstance.get('/config/ai-moderation/logs', {
    params: { page, limit },
  });
  return res.data;
}
