'use client';

import {
  X,
  Tag,
  Ticket,
  Calendar,
  Coins,
  Building2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { IVoucher } from '@/lib/voucherApi';

interface VoucherDetailModalProps {
  voucher: IVoucher;
  onClose: () => void;
  onToggle: (id: string) => void;
  isToggling: boolean;
  formatDate: (dateStr: string) => string;
  formatDiscount: (type: string, value: number) => string;
  getStatusBadge: (
    isActive: boolean,
    validUntil: string,
    remaining: number
  ) => React.ReactNode;
}

export default function VoucherDetailModal({
  voucher,
  onClose,
  onToggle,
  isToggling,
  formatDate,
  formatDiscount,
  getStatusBadge,
}: VoucherDetailModalProps) {
  const usedQty = voucher.totalQuantity - voucher.remainingQuantity;
  const usagePercent =
    voucher.totalQuantity > 0
      ? Math.round((usedQty / voucher.totalQuantity) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-surface-lowest w-full max-w-2xl rounded-md shadow-floating overflow-hidden animate-in slide-in-from-bottom-4 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface/50">
          <div>
            <h2 className="text-lg font-sans font-bold text-gray-900">
              Chi tiết Voucher
            </h2>
            <p className="text-xs font-body text-gray-500 mt-0.5">
              Tạo lúc: {formatDate(voucher.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto font-body">
          {/* Top: Code badge + Title + Status */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 text-secondary font-sans font-bold text-sm rounded-md border border-secondary/20 tracking-widest">
                  <Ticket size={14} />
                  {voucher.code}
                </span>
                {getStatusBadge(
                  voucher.isActive,
                  voucher.validUntil,
                  voucher.remainingQuantity
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 leading-tight">
                {voucher.title}
              </h3>
              {voucher.description && (
                <p className="text-sm text-gray-500 mt-1 italic">
                  "{voucher.description}"
                </p>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-surface rounded-md border border-outline-variant/30">
            <div>
              <p className="text-xs font-label text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={12} /> Loại giảm giá
              </p>
              <p className="font-semibold text-gray-900">
                {voucher.discountType === 'PERCENTAGE'
                  ? 'Phần trăm (%)'
                  : 'Số tiền cố định'}
              </p>
            </div>
            <div>
              <p className="text-xs font-label text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <Coins size={12} /> Mức giảm & Điểm đổi
              </p>
              <p className="font-semibold text-gray-900">
                <span className="text-secondary">
                  {formatDiscount(voucher.discountType, voucher.discountValue)}
                </span>
                <span className="text-gray-500 font-normal mx-2">·</span>
                <span className="text-primary">{voucher.pointCost} điểm</span>
              </p>
            </div>
            <div>
              <p className="text-xs font-label text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={12} /> Hiệu lực
              </p>
              <p className="font-semibold text-gray-900 text-sm">
                {formatDate(voucher.validFrom)} →{' '}
                {formatDate(voucher.validUntil)}
              </p>
            </div>
            <div>
              <p className="text-xs font-label text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={12} /> Cửa hàng phát hành
              </p>
              <p className="font-semibold text-gray-900">
                {voucher.creatorId?.fullName || 'N/A'}
              </p>
              <p className="text-xs text-gray-500">
                {voucher.creatorId?.email}
              </p>
            </div>
          </div>

          {/* Usage Progress */}
          <div className="mb-6 p-4 bg-surface rounded-md border border-outline-variant/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-label text-gray-500 uppercase tracking-wider">
                Lượt đã đổi / Tổng số lượng
              </p>
              <span className="text-sm font-bold text-gray-900">
                {usedQty} / {voucher.totalQuantity}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-secondary rounded-full h-2 transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Còn lại:{' '}
              <span className="font-semibold text-gray-900">
                {voucher.remainingQuantity}
              </span>{' '}
              lượt
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-lowest flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md font-body text-sm font-semibold text-gray-600 hover:bg-surface-container transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={() => onToggle(voucher._id)}
            disabled={isToggling}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-semibold transition-colors disabled:opacity-60 ${
              voucher.isActive
                ? 'bg-error/10 text-error hover:bg-error hover:text-white'
                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
            }`}
          >
            {voucher.isActive ? (
              <>
                <ToggleLeft size={16} />
                Vô hiệu hóa
              </>
            ) : (
              <>
                <ToggleRight size={16} />
                Kích hoạt lại
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
