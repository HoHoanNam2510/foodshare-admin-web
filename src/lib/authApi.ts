import axiosInstance from './axios';

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  data: {
    _id: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
    [key: string]: unknown;
  };
}

export async function loginApi(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await axiosInstance.post<LoginResponse>('/auth/login', {
    email,
    password,
  });
  return res.data;
}

export async function sendRegistrationCode(params: {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}): Promise<{ success: boolean; message: string; data?: { expiresInMinutes: number } }> {
  const res = await axiosInstance.post('/auth/register/send-code', params);
  return res.data;
}

export async function verifyRegistrationCode(params: {
  email: string;
  code: string;
}): Promise<{ success: boolean; message: string }> {
  const res = await axiosInstance.post('/auth/register/verify-code', params);
  return res.data;
}
