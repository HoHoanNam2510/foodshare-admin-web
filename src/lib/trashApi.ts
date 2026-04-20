import axiosInstance from './axios';

export type TrashCollection =
  | 'users'
  | 'posts'
  | 'reviews'
  | 'vouchers'
  | 'reports'
  | 'conversations'
  | 'messages';

export interface ITrashItem {
  _id: string;
  isDeleted: boolean;
  deletedAt: string;
  deletedBy?: string;
  [key: string]: unknown;
}

export interface TrashResult {
  collection: TrashCollection;
  data: ITrashItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TrashPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TrashSingleCollectionResponse {
  success: boolean;
  collection: string;
  data: ITrashItem[];
  pagination: TrashPaginationMeta;
}

export interface TrashAllCollectionsResponse {
  success: boolean;
  data: TrashResult[];
}

export interface CleanupResultItem {
  collection: string;
  purgedCount: number;
}

// ── GET /api/admin/trash ──
export async function getTrashItems(params: {
  collection?: TrashCollection;
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}): Promise<TrashSingleCollectionResponse | TrashAllCollectionsResponse> {
  const query = new URLSearchParams();
  if (params.collection) query.set('collection', params.collection);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);

  const res = await axiosInstance.get(`/admin/trash?${query.toString()}`);
  return res.data;
}

// ── POST /api/admin/trash/restore/:collection/:id ──
export async function restoreTrashItem(
  collection: string,
  id: string
): Promise<{ success: boolean; message: string; data: ITrashItem }> {
  const res = await axiosInstance.post(
    `/admin/trash/restore/${collection}/${id}`
  );
  return res.data;
}

// ── DELETE /api/admin/trash/purge/:collection/:id ──
export async function purgeTrashItem(
  collection: string,
  id: string
): Promise<{ success: boolean; message: string }> {
  const res = await axiosInstance.delete(
    `/admin/trash/purge/${collection}/${id}`
  );
  return res.data;
}

// ── POST /api/admin/trash/cleanup-now ──
export async function triggerCleanupNow(): Promise<{
  success: boolean;
  message: string;
  data: CleanupResultItem[];
}> {
  const res = await axiosInstance.post('/admin/trash/cleanup-now');
  return res.data;
}

// ── Admin Soft Delete ──
export async function adminSoftDeleteUser(id: string): Promise<void> {
  await axiosInstance.delete(`/admin/trash/users/${id}`);
}

export async function adminSoftDeletePost(id: string): Promise<void> {
  await axiosInstance.delete(`/admin/trash/posts/${id}`);
}

export async function adminSoftDeleteReview(id: string): Promise<void> {
  await axiosInstance.delete(`/admin/trash/reviews/${id}`);
}

export async function adminSoftDeleteVoucher(id: string): Promise<void> {
  await axiosInstance.delete(`/admin/trash/vouchers/${id}`);
}

export async function adminSoftDeleteReport(id: string): Promise<void> {
  await axiosInstance.delete(`/admin/trash/reports/${id}`);
}

export async function purgeAllTrash(): Promise<{
  success: boolean;
  message: string;
  data: CleanupResultItem[];
}> {
  const res = await axiosInstance.delete('/admin/trash/purge-all');
  return res.data;
}

export async function restoreUser(
  id: string,
  restoreAssociated = false
): Promise<{ success: boolean; message: string }> {
  const res = await axiosInstance.post(`/admin/trash/restore-user/${id}`, {
    restoreAssociated,
  });
  return res.data;
}
