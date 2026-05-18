import axiosInstance from './axios';
import type { IUser } from './userApi';

export type { IUser };

export interface UpdateProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  defaultAddress?: string;
  avatar?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function getMyProfile(): Promise<{
  success: boolean;
  data: IUser;
}> {
  const res = await axiosInstance.get<{ success: boolean; data: IUser }>(
    '/auth/me'
  );
  return res.data;
}

export async function updateMyProfile(
  payload: UpdateProfilePayload
): Promise<{ success: boolean; message: string; data: IUser }> {
  const res = await axiosInstance.put<{
    success: boolean;
    message: string;
    data: IUser;
  }>('/auth/update-profile', payload);
  return res.data;
}

export async function changePassword(
  payload: ChangePasswordPayload
): Promise<{ success: boolean; message: string }> {
  const res = await axiosInstance.put<{ success: boolean; message: string }>(
    '/auth/change-password',
    payload
  );
  return res.data;
}

export async function uploadAvatar(
  file: File
): Promise<{ success: boolean; data: { url: string } }> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await axiosInstance.post<{
    success: boolean;
    data: { url: string };
  }>('/upload/single?folder=avatars', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
