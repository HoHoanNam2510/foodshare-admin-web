import axiosInstance from './axios';

// ── Types ──

export interface IParticipant {
  _id: string;
  fullName: string;
  email?: string;
  avatar?: string;
}

export interface ILastMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  messageType: 'TEXT' | 'IMAGE' | 'LOCATION';
  content: string;
  imageUrl?: string;
  location?: { latitude: number; longitude: number };
  createdAt: string;
}

export interface IConversation {
  _id: string;
  transactionId?: string;
  participants: IParticipant[];
  lastMessage?: ILastMessage;
  status: 'ACTIVE' | 'LOCKED';
  createdAt: string;
  updatedAt: string;
}

export interface IMessage {
  _id: string;
  conversationId: string;
  senderId: { _id: string; fullName: string; avatar?: string } | string;
  messageType: 'TEXT' | 'IMAGE' | 'LOCATION';
  content: string;
  imageUrl?: string;
  location?: { latitude: number; longitude: number };
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminConversationsResponse {
  success: boolean;
  data: IConversation[];
  pagination: PaginationMeta;
}

// ── GET /api/chat/admin/conversations ──

export async function fetchAdminConversations(params: {
  page?: number;
  limit?: number;
  participantId?: string;
}): Promise<AdminConversationsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.participantId) query.set('participantId', params.participantId);

  const res = await axiosInstance.get<AdminConversationsResponse>(
    `/chat/admin/conversations?${query.toString()}`
  );
  return res.data;
}

// ── GET /api/chat/admin/conversations/:id/messages ──

export async function fetchAdminMessages(
  conversationId: string
): Promise<{ success: boolean; data: IMessage[] }> {
  const res = await axiosInstance.get<{ success: boolean; data: IMessage[] }>(
    `/chat/admin/conversations/${conversationId}/messages`
  );
  return res.data;
}

// ── PUT /api/chat/admin/conversations/:id/lock ──

export async function adminToggleLockConversation(
  conversationId: string
): Promise<{ success: boolean; message: string; data: IConversation }> {
  const res = await axiosInstance.put(
    `/chat/admin/conversations/${conversationId}/lock`
  );
  return res.data;
}
