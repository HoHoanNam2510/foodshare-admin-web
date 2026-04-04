'use client';

import {
  Package,
  MapPin,
  Calendar,
  Clock,
  Tag,
  X,
  EyeOff,
  CheckCircle,
  XCircle,
  User,
} from 'lucide-react';
import type { IPost } from '@/lib/postApi';

interface PostDetailModalProps {
  post: IPost | null;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onHide: (id: string) => Promise<void>;
  formatDate: (dateStr: string) => string;
  formatCurrency: (amount: number, type: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}

export default function PostDetailModal({
  post,
  onClose,
  onApprove,
  onReject,
  onHide,
  formatDate,
  formatCurrency,
  getStatusBadge,
}: PostDetailModalProps) {
  if (!post) return null;

  const owner = post.ownerId;

  const formatPickupTime = () => {
    if (!post.pickupTime?.start || !post.pickupTime?.end) return 'N/A';
    const start = new Date(post.pickupTime.start);
    const end = new Date(post.pickupTime.end);
    const timeOpts: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };
    return `${start.toLocaleTimeString('vi-VN', timeOpts)} – ${end.toLocaleTimeString('vi-VN', timeOpts)} (${start.toLocaleDateString('vi-VN')})`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Nội dung modal */}
      <div className="relative bg-surface-lowest w-full max-w-2xl rounded-md shadow-floating overflow-hidden animate-in slide-in-from-bottom-4 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface/50">
          <div>
            <h2 className="text-lg font-sans font-bold text-gray-900">
              Chi tiết bài đăng
            </h2>
            <p className="text-xs font-body text-gray-500 mt-0.5">
              Tạo lúc: {formatDate(post.createdAt)}
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
          {/* Tiêu đề & trạng thái */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 leading-tight">
                {post.title}
              </h3>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Tag size={14} /> {post.category}
                </span>
                <span className="flex items-center gap-1 text-primary font-bold">
                  <Package size={14} />{' '}
                  {post.type === 'P2P_FREE' ? 'P2P – Tặng' : 'B2C – Túi mù'}
                </span>
              </div>
            </div>
            {getStatusBadge(post.status)}
          </div>

          {/* Thông tin tổng quan */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-surface rounded-md border border-outline-variant/30">
            <div>
              <p className="text-xs font-label text-gray-500 mb-1 uppercase tracking-wider">
                Người đăng
              </p>
              <div className="flex items-center gap-2">
                <User size={14} className="text-primary" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {owner?.fullName || 'N/A'}
                  </p>
                  {owner?.email && (
                    <p className="text-xs text-gray-500">{owner.email}</p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-label text-gray-500 mb-1 uppercase tracking-wider">
                Giá & Số lượng
              </p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(post.price, post.type)}{' '}
                <span className="text-gray-500 font-normal">
                  ({post.remainingQuantity}/{post.totalQuantity} còn lại)
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs font-label text-gray-500 mb-1 uppercase tracking-wider">
                Hạn sử dụng
              </p>
              <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                <Calendar size={14} className="text-primary" />{' '}
                {formatDate(post.expiryDate)}
              </p>
            </div>
            <div>
              <p className="text-xs font-label text-gray-500 mb-1 uppercase tracking-wider">
                Khung giờ nhận
              </p>
              <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                <Clock size={14} className="text-primary" />{' '}
                {formatPickupTime()}
              </p>
            </div>
          </div>

          {/* Mô tả */}
          {post.description && (
            <div className="mb-6">
              <p className="text-xs font-label text-gray-500 mb-2 uppercase tracking-wider">
                Mô tả chi tiết
              </p>
              <p className="text-sm text-gray-700 leading-relaxed bg-surface/50 p-4 rounded-md border border-outline-variant/20">
                {post.description}
              </p>
            </div>
          )}

          {/* Tọa độ */}
          {post.location?.coordinates && (
            <div className="mb-6">
              <p className="text-xs font-label text-gray-500 mb-2 uppercase tracking-wider">
                Tọa độ lấy hàng
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-surface/50 p-3 rounded-md border border-outline-variant/20">
                <MapPin size={16} className="text-error" />
                <span>
                  Kinh độ: {post.location.coordinates[0]} – Vĩ độ:{' '}
                  {post.location.coordinates[1]}
                </span>
              </div>
            </div>
          )}

          {/* Hình ảnh */}
          <div>
            <p className="text-xs font-label text-gray-500 mb-2 uppercase tracking-wider">
              Hình ảnh đính kèm
            </p>
            {post.images.length > 0 ? (
              <div className="flex gap-3 flex-wrap">
                {post.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="w-24 h-24 rounded-md bg-surface border border-outline-variant/30 overflow-hidden"
                  >
                    <img
                      src={img}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Không có hình ảnh đính kèm.
              </p>
            )}
          </div>
        </div>

        {/* Footer – Hành động */}
        <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-lowest flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md font-body text-sm font-semibold text-gray-600 hover:bg-surface-container transition-colors"
          >
            Đóng
          </button>

          {post.status === 'PENDING_REVIEW' && (
            <>
              <button
                onClick={() => { onReject(post._id); onClose(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-semibold bg-red-50 text-error hover:bg-error hover:text-white transition-colors"
              >
                <XCircle size={16} />
                Từ chối
              </button>
              <button
                onClick={() => { onApprove(post._id); onClose(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-semibold bg-green-50 text-green-700 hover:bg-primary hover:text-white transition-colors"
              >
                <CheckCircle size={16} />
                Duyệt bài đăng
              </button>
            </>
          )}

          {post.status !== 'HIDDEN' && post.status !== 'PENDING_REVIEW' && (
            <button
              onClick={() => { onHide(post._id); onClose(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-semibold bg-error/10 text-error hover:bg-error hover:text-white transition-colors"
            >
              <EyeOff size={16} />
              Ẩn bài đăng này
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
