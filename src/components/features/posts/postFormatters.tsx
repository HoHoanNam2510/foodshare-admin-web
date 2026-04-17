import StatusBadge from '@/components/ui/StatusBadge';

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Đang hiển thị',
  PENDING_REVIEW: 'Chờ duyệt',
  BOOKED: 'Đã đặt',
  OUT_OF_STOCK: 'Hết hàng',
  HIDDEN: 'Đã ẩn',
  REJECTED: 'Từ chối',
};

export const getStatusBadge = (status: string) => (
  <StatusBadge status={status} label={STATUS_LABELS[status]} />
);
