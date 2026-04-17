import axiosInstance from './axios';

// ── Types ──

export interface IReviewUser {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

export interface IReview {
  _id: string;
  reviewerId: IReviewUser;
  revieweeId: IReviewUser;
  transactionId: string;
  rating: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminReviewsResponse {
  success: boolean;
  data: IReview[];
  pagination: PaginationMeta;
}

// ── GET /api/reviews/admin ──

export async function fetchAdminReviews(params: {
  rating?: number;
  revieweeId?: string;
  page?: number;
  limit?: number;
}): Promise<AdminReviewsResponse> {
  const query = new URLSearchParams();
  if (params.rating) query.set('rating', String(params.rating));
  if (params.revieweeId) query.set('revieweeId', params.revieweeId);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const res = await axiosInstance.get<AdminReviewsResponse>(
    `/reviews/admin?${query.toString()}`
  );
  return res.data;
}

// ── DELETE /api/reviews/admin/:reviewId ──

export async function adminDeleteReview(reviewId: string): Promise<void> {
  await axiosInstance.delete(`/reviews/admin/${reviewId}`);
}
