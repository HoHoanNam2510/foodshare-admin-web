'use client';

import {
  X,
  Receipt,
  MapPin,
  Phone,
  CreditCard,
  ShieldAlert,
  Edit2,
} from 'lucide-react';
import { useState } from 'react';

interface TransactionDetailModalProps {
  transaction: any;
  onClose: () => void;
  formatDate: (date: Date) => string;
  formatCurrency: (amount: number, method: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}

export default function TransactionDetailModal({
  transaction,
  onClose,
  formatDate,
  formatCurrency,
  getStatusBadge,
}: TransactionDetailModalProps) {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(transaction?.status);

  if (!transaction) return null;

  const validStatuses = [
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'ESCROWED',
    'COMPLETED',
    'CANCELLED',
  ];

  const handleForceUpdate = () => {
    // Gọi API adminForceUpdateStatus
    alert(`Đã ép đổi trạng thái GD ${transaction._id} thành ${newStatus}`);
    setIsEditingStatus(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-surface-lowest w-full max-w-2xl rounded-md shadow-floating overflow-hidden animate-in slide-in-from-bottom-4 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface/50">
          <div>
            <h2 className="text-lg font-sans font-bold text-gray-900 flex items-center gap-2">
              Mã GD: {transaction._id}
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
          {/* Cảnh báo Admin */}
          <div className="flex items-start gap-3 p-4 mb-6 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800">
            <ShieldAlert size={20} className="shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold">Khu vực kiểm soát Admin</p>
              <p className="mt-1">
                Đây là thông tin giao dịch nhạy cảm. Bạn có thể ép đổi trạng
                thái giao dịch trong trường hợp lỗi mạng hoặc theo yêu cầu kỹ
                thuật.
              </p>
            </div>
          </div>

          {/* Grid thông tin */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-surface rounded-md border border-outline-variant/30">
            <div className="col-span-2 border-b border-outline-variant/30 pb-3 mb-1">
              <p className="text-xs font-label text-gray-500 mb-1 uppercase tracking-wider">
                Bài đăng tương ứng
              </p>
              <p className="font-semibold text-gray-900 text-base">
                {transaction.post.title}
              </p>
            </div>

            <div>
              <p className="text-xs font-label text-gray-500 mb-1 uppercase tracking-wider">
                Loại & Thanh toán
              </p>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">
                  {transaction.type === 'REQUEST'
                    ? 'Xin đồ (P2P)'
                    : 'Mua hàng (B2C)'}
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-sm font-semibold">
                  {transaction.paymentMethod}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-label text-gray-500 mb-1 uppercase tracking-wider">
                Tổng tiền (SL: {transaction.quantity})
              </p>
              <p className="font-bold text-lg text-primary">
                {formatCurrency(
                  transaction.post.price * transaction.quantity,
                  transaction.paymentMethod
                )}
              </p>
            </div>
          </div>

          {/* Thông tin 2 bên */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-surface-container/30 rounded-md border border-outline-variant/20">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin size={16} /> Người Cấp (Owner)
              </h3>
              <p className="font-semibold text-gray-800">
                {transaction.owner.fullName}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                <Phone size={14} /> {transaction.owner.phone}
              </p>
            </div>
            <div className="p-4 bg-primary/5 rounded-md border border-primary/20">
              <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                <Receipt size={16} /> Người Nhận (Requester)
              </h3>
              <p className="font-semibold text-gray-800">
                {transaction.requester.fullName}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                <Phone size={14} /> {transaction.requester.phone}
              </p>
            </div>
          </div>

          {/* Cập nhật trạng thái thủ công */}
          <div className="border-t border-outline-variant/30 pt-4 mt-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-label text-gray-500 uppercase tracking-wider">
                Ép đổi trạng thái (Force Update)
              </p>
              <button
                onClick={() => setIsEditingStatus(!isEditingStatus)}
                className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
              >
                <Edit2 size={12} /> Cập nhật
              </button>
            </div>

            {isEditingStatus && (
              <div className="flex items-center gap-3 mt-3 animate-in fade-in zoom-in-95">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1 p-2 bg-surface rounded-md border border-outline-variant/50 outline-none text-sm font-semibold"
                >
                  {validStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleForceUpdate}
                  className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-md hover:bg-primary-T30 transition-colors"
                >
                  Lưu
                </button>
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
