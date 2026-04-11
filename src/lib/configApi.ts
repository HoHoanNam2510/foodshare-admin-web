import axiosInstance from './axios';

export interface ISystemConfig {
  _id?: string;
  systemBankName: string;
  systemBankCode: string;
  systemBankAccountNumber: string;
  systemBankAccountName: string;
  updatedAt?: string;
}

// ── GET /api/config ──
export async function fetchSystemConfig(): Promise<{ success: boolean; data: ISystemConfig | null }> {
  const res = await axiosInstance.get<{ success: boolean; data: ISystemConfig | null }>('/config');
  return res.data;
}

// ── PUT /api/config ──
export async function updateSystemConfig(
  payload: Omit<ISystemConfig, '_id' | 'updatedAt'>
): Promise<{ success: boolean; data: ISystemConfig }> {
  const res = await axiosInstance.put<{ success: boolean; data: ISystemConfig }>('/config', payload);
  return res.data;
}
