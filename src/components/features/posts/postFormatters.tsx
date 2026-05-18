import type { JSX } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import type { IPost } from '@/lib/postApi';

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Đang hiển thị',
  PENDING_REVIEW: 'Chờ duyệt',
  BOOKED: 'Đã đặt',
  OUT_OF_STOCK: 'Hết hàng',
  HIDDEN: 'Đã ẩn',
  REJECTED: 'Từ chối',
};

export const getStatusBadge = (status: string): JSX.Element => (
  <StatusBadge status={status} label={STATUS_LABELS[status]} />
);

export const getHiddenReason = (post: IPost): string => {
  const expired = !!post.expiryDate && new Date(post.expiryDate) < new Date();
  const outOfStock = post.remainingQuantity <= 0;
  if (expired && outOfStock) return 'Hết hàng · Hết hạn';
  if (expired) return 'Hết hạn sử dụng';
  if (outOfStock) return 'Hết hàng';
  return 'Admin ẩn thủ công';
};
