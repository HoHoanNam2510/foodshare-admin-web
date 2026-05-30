import axiosInstance from './axios';

export type ModerationDecision = 'APPROVED' | 'REJECTED' | 'PENDING_MANUAL';
export type ModerationTrigger =
  | 'ON_CREATE'
  | 'ON_UPDATE'
  | 'BATCH_SCHEDULER'
  | 'MANUAL_ADMIN';

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
  limit: number,
  decision?: ModerationDecision | 'ALL'
): Promise<{
  success: boolean;
  data: IAIModerationLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const params: Record<string, unknown> = { page, limit };
  if (decision && decision !== 'ALL') params.decision = decision;
  const res = await axiosInstance.get('/config/ai-moderation/logs', { params });
  return res.data;
}
