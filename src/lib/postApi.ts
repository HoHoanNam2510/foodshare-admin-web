import axiosInstance from './axios';

// ── Types ──

export interface IPostOwner {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface IPost {
  _id: string;
  ownerId: IPostOwner;
  type: 'P2P_FREE' | 'B2C_MYSTERY_BAG';
  category: string;
  title: string;
  description?: string;
  images: string[];
  totalQuantity: number;
  remainingQuantity: number;
  price: number;
  expiryDate: string;
  pickupTime: {
    start: string;
    end: string;
  };
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  status:
    | 'PENDING_REVIEW'
    | 'AVAILABLE'
    | 'BOOKED'
    | 'OUT_OF_STOCK'
    | 'HIDDEN'
    | 'REJECTED';
  publishAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── GET /api/posts/admin ──

export interface AdminPostsResponse {
  success: boolean;
  data: IPost[];
  pagination: PaginationMeta;
}

export async function fetchAdminPosts(params: {
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}): Promise<AdminPostsResponse> {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'ALL')
    query.set('status', params.status);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);

  const res = await axiosInstance.get<AdminPostsResponse>(
    `/posts/admin?${query.toString()}`
  );
  return res.data;
}

// ── PUT /api/posts/admin/:id  (approve / reject / edit) ──

export async function adminUpdatePost(
  postId: string,
  updates: Partial<Pick<IPost, 'status' | 'title' | 'category' | 'description'>>
): Promise<{ success: boolean; data: IPost }> {
  const res = await axiosInstance.put(`/posts/admin/${postId}`, updates);
  return res.data;
}

// ── PATCH /api/posts/admin/:id/hide ──

export async function adminToggleHidePost(
  postId: string
): Promise<{ success: boolean; data: IPost }> {
  const res = await axiosInstance.patch(`/posts/admin/${postId}/hide`);
  return res.data;
}
