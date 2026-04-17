import React from 'react';

// ─── Date formatters ──────────────────────────────────────────

/** Chỉ ngày: DD/MM/YYYY */
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/** Ngày + giờ: HH:MM DD/MM/YYYY */
export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// ─── Currency formatters ──────────────────────────────────────

/** VND thuần (string), dùng trong text / title */
export const formatCurrencyVND = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    amount
  );

/**
 * Hiển thị giá bài đăng (P2P_FREE / B2C).
 * - Nếu type = 'P2P_FREE' hoặc amount = 0 → badge "Miễn phí"
 * - Ngược lại → chuỗi VND
 */
export const formatPostCurrency = (
  amount: number,
  type: string
): React.ReactNode => {
  if (type === 'P2P_FREE' || amount === 0)
    return <span className="text-primary font-bold">Miễn phí</span>;
  return formatCurrencyVND(amount);
};

/**
 * Hiển thị giá giao dịch (paymentMethod = 'FREE' hoặc amount = 0 → miễn phí).
 */
export const formatTransactionCurrency = (
  amount: number,
  paymentMethod: string
): React.ReactNode => {
  if (paymentMethod === 'FREE' || amount === 0)
    return <span className="text-primary font-bold">Miễn phí</span>;
  return formatCurrencyVND(amount);
};

/** Hiển thị mức giảm giá voucher (% hoặc VND cố định) */
export const formatDiscount = (type: string, value: number): string => {
  if (type === 'PERCENTAGE') return `${value}%`;
  return formatCurrencyVND(value);
};
