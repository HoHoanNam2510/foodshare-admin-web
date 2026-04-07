'use client';

import {
  X,
  Receipt,
  Mail,
  CreditCard,
  ShieldAlert,
  Edit2,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import type { ITransaction } from '@/lib/transactionApi';

interface TransactionDetailModalProps {
  transaction: ITransaction | null;
  onClose: () => void;
  onStatusUpdate: (transactionId: string, newStatus: string) => Promise<void>;
  formatDate: (date: string | Date) => string;
  formatCurrency: (amount: number, method: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}

const VALID_STATUSES = [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'ESCROWED',
  'COMPLETED',
  'CANCELLED',
] as const;

export default function TransactionDetailModal({
  transaction,
  onClose,
  onStatusUpdate,
  formatDate,
  formatCurrency,
  getStatusBadge,
}: TransactionDetailModalProps) {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(transaction?.status ?? 'PENDING');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!transaction) return null;

  const handleForceUpdate = async () => {
    if (newStatus === transaction.status) {
      setIsEditingStatus(false);
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      await onStatusUpdate(transaction._id, newStatus);
      setIsEditingStatus(false);
    } catch {
      setSaveError('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-surface-lowest w-full max-w-2xl rounded-md shadow-floating overflow-hidden animate-in slide-in-from-bottom-4 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface/50">
          <div>
            <h2 className="text-lg font-sans font-bold text-gray-900 flex items-center gap-2">
              <span className="font-mono text-sm text-gray-500">
                #{transaction._id.slice(-8).toUpperCase()}
              </span>
              {getStatusBadge(transaction.status)}
            </h2>
            <p className="text-xs font-body text-gray-500 mt-0.5">
              Thời gian tạo: {formatDate(transaction.createdAt)}
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
          {/* Admin warning */}
          <div className="flex items-start gap-3 p-4 mb-6 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800">
            <ShieldAlert size={20} className="shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold">Khu vực kiểm soát Admin</p>
              <p className="mt-1">
                Đây là thông tin giao dịch nhạy cảm. Bạn có thể ép đổi trạng
                thái giao dịch trong trường hợp lỗi mạng hoặc theo yêu cầu kỹ thuật.
              </p>
            </div>
          </div>

          {/* Transaction info grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-surface rounded-md border border-outline-variant/30">
            <div className="col-span-2 border-b border-outline-variant/30 pb-3 mb-1">
              <p className="text-xs font-label text-gray-500 mb-1 uppercase tracking-wider">
                Bài đăng tương ứng
              </p>
              <p className="font-semibold text-gray-900 text-base">
                {transaction.postId.title}
              </p>
            </div>

            <div>
              <p className="text-xs font-label text-gray-500 mb-1 uppercase tracking-wider">
                Loại & Thanh toán
              </p>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">
                  {transaction.type === 'REQUEST' ? 'Xin đồ (P2P)' : 'Mua hàng (B2C)'}
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-sm font-semibold flex items-center gap-1">
                  <CreditCard size={13} /> {transaction.paymentMethod}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-label text-gray-500 mb-1 uppercase tracking-wider">
                Tổng tiền (SL: {transaction.quantity})
              </p>
              <p className="font-bold text-lg text-primary">
                {formatCurrency(
                  transaction.postId.price * transaction.quantity,
                  transaction.paymentMethod
                )}
              </p>
            </div>

            {transaction.verificationCode && (
              <div className="col-span-2">
                <p className="text-xs font-label text-gray-500 mb-1 uppercase tracking-wider">
                  Mã xác minh QR
                </p>
                <p className="font-mono text-xs text-gray-700 bg-gray-100 px-3 py-1.5 rounded break-all">
                  {transaction.verificationCode}
                </p>
              </div>
            )}
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-surface-container/30 rounded-md border border-outline-variant/20">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Người Cấp (Owner / Donor)
              </h3>
              <p className="font-semibold text-gray-800">
                {transaction.ownerId.fullName}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                <Mail size={13} /> {transaction.ownerId.email}
              </p>
            </div>
            <div className="p-4 bg-primary/5 rounded-md border border-primary/20">
              <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                <Receipt size={16} /> Người Nhận (Requester)
              </h3>
              <p className="font-semibold text-gray-800">
                {transaction.requesterId.fullName}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                <Mail size={13} /> {transaction.requesterId.email}
              </p>
            </div>
          </div>

          {/* Force-update status */}
          <div className="border-t border-outline-variant/30 pt-4 mt-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-label text-gray-500 uppercase tracking-wider">
                Ép đổi trạng thái (Force Update)
              </p>
              <button
                onClick={() => {
                  setNewStatus(transaction.status);
                  setSaveError(null);
                  setIsEditingStatus(!isEditingStatus);
                }}
                className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
              >
                <Edit2 size={12} /> Cập nhật
              </button>
            </div>

            {isEditingStatus && (
              <div className="flex flex-col gap-2 mt-3 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ITransaction['status'])}
                    className="flex-1 p-2 bg-surface rounded-md border border-outline-variant/50 outline-none text-sm font-semibold"
                  >
                    {VALID_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleForceUpdate}
                    disabled={isSaving}
                    className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-md hover:bg-primary-T30 transition-colors disabled:opacity-60 flex items-center gap-2"
                  >
                    {isSaving && <Loader2 size={14} className="animate-spin" />}
                    Lưu
                  </button>
                </div>
                {saveError && (
                  <p className="text-xs text-error">{saveError}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-lowest flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md font-body text-sm font-semibold text-gray-600 hover:bg-surface-container transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
