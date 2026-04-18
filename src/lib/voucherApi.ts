import axiosInstance from './axios';

export interface IVoucher {
  _id: string;
  creatorId: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
    storeInfo?: { businessAddress?: string };
  };
  code: string;
  title: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  pointCost: number;
  totalQuantity: number;
  remainingQuantity: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminVouchersResponse {
  success: boolean;
  data: IVoucher[];
  pagination: PaginationMeta;
}

export async function fetchAdminVouchers(params: {
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<AdminVouchersResponse> {
  const query = new URLSearchParams();
  if (params.isActive !== undefined)
    query.set('isActive', String(params.isActive));
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const res = await axiosInstance.get<AdminVouchersResponse>(
    `/vouchers/admin?${query.toString()}`
  );
  return res.data;
}

export async function toggleAdminVoucher(
  id: string
): Promise<{ success: boolean; message: string; data: IVoucher }> {
  const res = await axiosInstance.patch(`/vouchers/admin/${id}/toggle`);
  return res.data;
}
