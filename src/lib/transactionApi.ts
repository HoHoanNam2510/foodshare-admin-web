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
  | 'CANCELLED'
  | 'REFUNDED'
  | 'DISPUTED';

export type PaymentMethod = 'FREE' | 'MOMO'; // TODO: Re-add | 'ZALOPAY' | 'VNPAY' when ready

export interface ITransaction {
  _id: string;
  postId: ITransactionPost;
  requesterId: ITransactionUser; // Người nhận / người mua
  ownerId: ITransactionUser;     // Người cho / cửa hàng
  type: 'REQUEST' | 'ORDER';
  quantity: number;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  paymentTransId?: string;
  totalAmount?: number;
  verificationCode?: string;
  expiredAt?: string;
  pickupDeadline?: string;
  refundReason?: string;
  refundedAt?: string;
  disputeReason?: string;
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

// ── Admin Refund ──

export async function adminRefundTransaction(
  transactionId: string,
  reason: string
): Promise<{ success: boolean; data: ITransaction }> {
  const res = await axiosInstance.post(
    `/transactions/admin/${transactionId}/refund`,
    { reason }
  );
  return res.data;
}

// ── Admin Disburse ──

export async function adminDisburseEscrow(
  transactionId: string
): Promise<{ success: boolean; data: { transaction: ITransaction; escrow: IEscrowLedger } }> {
  const res = await axiosInstance.post(
    `/transactions/admin/${transactionId}/disburse`
  );
  return res.data;
}

// ── Admin Resolve Dispute ──

export async function adminResolveDispute(
  transactionId: string,
  resolution: 'REFUND' | 'DISBURSE'
): Promise<{ success: boolean; data: ITransaction }> {
  const res = await axiosInstance.patch(
    `/transactions/admin/${transactionId}/resolve-dispute`,
    { resolution }
  );
  return res.data;
}

// ── Escrow types & API ──

export interface IEscrowUser {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

export interface IEscrowTransaction {
  _id: string;
  status: TransactionStatus;
  type: 'REQUEST' | 'ORDER';
  paymentMethod: PaymentMethod;
}

export interface IEscrowLedger {
  _id: string;
  transactionId: IEscrowTransaction;
  storeId: IEscrowUser;
  buyerId: IEscrowUser;
  amount: number;
  platformFee: number;
  netAmount: number;
  paymentMethod: PaymentMethod;
  paymentTransId: string;
  status: 'HOLDING' | 'DISBURSED' | 'REFUNDED';
  disbursedAt?: string;
  refundedAt?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminEscrowsResponse {
  success: boolean;
  data: IEscrowLedger[];
  pagination: PaginationMeta;
}

export async function fetchAdminEscrows(params: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<AdminEscrowsResponse> {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'ALL') query.set('status', params.status);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const res = await axiosInstance.get<AdminEscrowsResponse>(
    `/transactions/admin/escrows?${query.toString()}`
  );
  return res.data;
}

export interface EscrowStats {
  holding: { total: number; count: number };
  disbursed: { total: number; count: number };
  refunded: { total: number; count: number };
}

export async function fetchAdminEscrowStats(): Promise<{
  success: boolean;
  data: EscrowStats;
}> {
  const res = await axiosInstance.get('/transactions/admin/escrow-stats');
  return res.data;
}
