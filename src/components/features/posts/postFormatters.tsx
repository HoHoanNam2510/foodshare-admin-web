export const formatCurrency = (amount: number, type: string) => {
  if (type === 'P2P_FREE' || amount === 0)
    return <span className="text-primary font-bold">Miễn phí</span>;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: 'bg-green-50 text-primary border-primary/20',
  PENDING_REVIEW: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  BOOKED: 'bg-blue-50 text-blue-700 border-blue-200',
  OUT_OF_STOCK: 'bg-gray-100 text-gray-600 border-gray-200',
  HIDDEN: 'bg-red-50 text-error border-error/20',
  REJECTED: 'bg-red-100 text-error font-bold border-error/30',
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Đang hiển thị',
  PENDING_REVIEW: 'Chờ duyệt',
  BOOKED: 'Đã đặt',
  OUT_OF_STOCK: 'Hết hàng',
  HIDDEN: 'Đã ẩn',
  REJECTED: 'Từ chối',
};

export const getStatusBadge = (status: string) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wider ${STATUS_STYLES[status] || STATUS_STYLES.PENDING_REVIEW}`}
  >
    {STATUS_LABELS[status] || status}
  </span>
);
