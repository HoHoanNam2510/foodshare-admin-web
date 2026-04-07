import axiosInstance from './axios';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Types ──

export interface ITransactionUser {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

export interface ITransactionPost {
  _id: string;
  title: string;
  type: 'P2P_FREE' | 'B2C_MYSTERY_BAG';
  price: number;
}

export type TransactionStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ESCROWED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ITransaction {
  _id: string;
  postId: ITransactionPost;
  requesterId: ITransactionUser; // Người nhận / người mua
  ownerId: ITransactionUser;     // Người cho / cửa hàng
  type: 'REQUEST' | 'ORDER';
  quantity: number;
  status: TransactionStatus;
  paymentMethod: 'FREE' | 'MOMO' | 'ZALOPAY';
  verificationCode?: string;
  expiredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTransactionsResponse {
  success: boolean;
  data: ITransaction[];
  pagination: PaginationMeta;
}

// ── GET /api/transactions/admin ──

export async function fetchAdminTransactions(params: {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<AdminTransactionsResponse> {
  const query = new URLSearchParams();
  if (params.type && params.type !== 'ALL') query.set('type', params.type);
  if (params.status && params.status !== 'ALL') query.set('status', params.status);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const res = await axiosInstance.get<AdminTransactionsResponse>(
    `/transactions/admin?${query.toString()}`
  );
  return res.data;
}

// ── PATCH /api/transactions/admin/:id/status ──

export async function adminForceUpdateTransactionStatus(
  transactionId: string,
  status: string
): Promise<{ success: boolean; data: ITransaction }> {
  const res = await axiosInstance.patch(
    `/transactions/admin/${transactionId}/status`,
    { status }
  );
  return res.data;
}
