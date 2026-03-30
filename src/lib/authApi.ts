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
