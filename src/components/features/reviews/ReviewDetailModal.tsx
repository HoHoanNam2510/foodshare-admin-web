'use client';

import {
  X,
  Star,
  User,
  MessageSquareText,
  Trash2,
  Calendar,
} from 'lucide-react';
import type { IReview } from '@/lib/reviewApi';

interface ReviewDetailModalProps {
  review: IReview | null;
  onClose: () => void;
  onDelete: (reviewId: string) => void;
  formatDate: (dateStr: string) => string;
  getRatingBadge: (rating: number) => React.ReactNode;
}

export default function ReviewDetailModal({
  review,
  onClose,
  onDelete,
  formatDate,
  getRatingBadge,
}: ReviewDetailModalProps) {
  if (!review) return null;

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={20}
          className={
            star <= rating
              ? 'text-yellow-500 fill-yellow-500'
              : 'text-gray-300'
          }
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-surface-lowest w-full max-w-2xl rounded-md shadow-floating overflow-hidden animate-in slide-in-from-bottom-4 fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface/50 shrink-0">
          <div>
            <h2 className="text-lg font-sans font-bold text-gray-900 flex items-center gap-2">
              Chi tiết đánh giá
              {getRatingBadge(review.rating)}
            </h2>
            <p className="text-xs font-body text-gray-500 mt-0.5 flex items-center gap-1">
              <Calendar size={12} /> {formatDate(review.createdAt)}
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
        <div className="p-6 overflow-y-auto font-body flex-1">
          {/* Rating display */}
          <div className="flex items-center justify-center gap-4 mb-6 p-5 bg-surface rounded-md border border-outline-variant/30">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-gray-900">
                {review.rating}
              </span>
              <span className="text-xs text-gray-500 mt-1">trên 5 sao</span>
            </div>
            <div className="h-12 w-px bg-outline-variant/30" />
            <div className="flex flex-col items-center gap-1">
              {renderStars(review.rating)}
              <span className="text-xs text-gray-500 mt-0.5">
                {review.rating >= 4
                  ? 'Tích cực'
                  : review.rating >= 3
                    ? 'Trung bình'
                    : 'Tiêu cực'}
              </span>
            </div>
          </div>

          {/* Reviewer & Reviewee */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-primary/5 rounded-md border border-primary/20">
              <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                <User size={16} /> Người đánh giá
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary-container to-secondary-container flex items-center justify-center text-white font-sans text-sm font-bold shrink-0">
                  {review.reviewerId.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {review.reviewerId.fullName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {review.reviewerId.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-secondary/5 rounded-md border border-secondary/20">
              <h3 className="text-sm font-bold text-secondary mb-3 flex items-center gap-2">
                <User size={16} /> Người được đánh giá
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-secondary-container to-tertiary-T70 flex items-center justify-center text-white font-sans text-sm font-bold shrink-0">
                  {review.revieweeId.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {review.revieweeId.fullName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {review.revieweeId.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <p className="text-xs font-label text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquareText size={14} /> Nội dung đánh giá
            </p>
            {review.feedback ? (
              <p className="text-sm text-gray-800 leading-relaxed bg-surface/50 p-4 rounded-md border border-outline-variant/20 italic">
                &ldquo;{review.feedback}&rdquo;
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic bg-surface/50 p-3 rounded-md border border-outline-variant/20">
                Không có nhận xét.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-lowest shrink-0 flex justify-between">
          <button
            onClick={() => onDelete(review._id)}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-semibold bg-error/10 text-error hover:bg-error hover:text-white transition-colors"
          >
            <Trash2 size={16} /> Xóa đánh giá
          </button>
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
