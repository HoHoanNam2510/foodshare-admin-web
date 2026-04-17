'use client';

import { useState, useEffect, useCallback } from 'react';
import { MoreVertical, Eye, Trash2, Star, Loader2 } from 'lucide-react';
import Toolbar, { type ToolbarFilter } from '@/components/ui/Toolbar';
import DataTable, { type Column } from '@/components/ui/DataTable';
import ReviewDetailModal from '@/components/features/reviews/ReviewDetailModal';
import {
  fetchAdminReviews,
  adminDeleteReview,
  type IReview,
} from '@/lib/reviewApi';

const PAGE_SIZE = 15;

// --- HELPERS ---
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getRatingBadge = (rating: number) => {
  const styles: Record<number, string> = {
    5: 'bg-green-50 text-primary border-primary/20',
    4: 'bg-blue-50 text-blue-700 border-blue-200',
    3: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    2: 'bg-orange-50 text-orange-700 border-orange-200',
    1: 'bg-red-50 text-error border-error/20',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${styles[rating] ?? styles[3]}`}
    >
      <Star size={10} className="fill-current" /> {rating}/5
    </span>
  );
};

const renderStarsInline = (rating: number) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={14}
        className={
          star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
        }
      />
    ))}
  </div>
);

export default function ReviewsManagementPage() {
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const [reviews, setReviews] = useState<IReview[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<IReview | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [ratingFilter]);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminReviews({
        rating: ratingFilter !== 'ALL' ? Number(ratingFilter) : undefined,
        page: currentPage,
        limit: PAGE_SIZE,
      });
      setReviews(res.data);
      setPagination(res.pagination);
    } catch {
      setError('Không thể tải danh sách đánh giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [ratingFilter, currentPage]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleDelete = async (reviewId: string) => {
    const confirmed = confirm('Bạn có chắc chắn muốn xóa đánh giá này?');
    if (!confirmed) return;

    setDeletingId(reviewId);
    setOpenDropdownId(null);
    try {
      await adminDeleteReview(reviewId);
      if (selectedReview?._id === reviewId) setSelectedReview(null);
      await loadReviews();
    } catch {
      alert('Xóa đánh giá thất bại. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  const closeDropdown = () => setOpenDropdownId(null);

  const columns: Column<IReview>[] = [
    {
      key: 'id',
      header: 'Mã & Ngày tạo',
      render: (review) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 font-mono text-xs">
            {review._id.slice(-8).toUpperCase()}
          </span>
          <span className="text-xs text-gray-500 mt-0.5">
            {formatDate(review.createdAt)}
          </span>
        </div>
      ),
    },
    {
      key: 'reviewer',
      header: 'Người đánh giá',
      render: (review) => (
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 shrink-0">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary-container to-secondary-container flex items-center justify-center text-white font-sans text-xs font-bold absolute inset-0">
              {review.reviewerId.fullName.charAt(0).toUpperCase()}
            </div>
            {review.reviewerId.avatar && (
              <img
                src={review.reviewerId.avatar}
                alt={review.reviewerId.fullName}
                className="w-8 h-8 rounded-full object-cover absolute inset-0"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 line-clamp-1">
              {review.reviewerId.fullName}
            </span>
            <span className="text-xs text-gray-500">
              {review.reviewerId.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'reviewee',
      header: 'Người được đánh giá',
      render: (review) => (
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 shrink-0">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-secondary-container to-tertiary-T70 flex items-center justify-center text-white font-sans text-xs font-bold absolute inset-0">
              {review.revieweeId.fullName.charAt(0).toUpperCase()}
            </div>
            {review.revieweeId.avatar && (
              <img
                src={review.revieweeId.avatar}
                alt={review.revieweeId.fullName}
                className="w-8 h-8 rounded-full object-cover absolute inset-0"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 line-clamp-1">
              {review.revieweeId.fullName}
            </span>
            <span className="text-xs text-gray-500">
              {review.revieweeId.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Đánh giá',
      align: 'center',
      render: (review) => (
        <div className="flex flex-col items-center gap-1">
          {renderStarsInline(review.rating)}
          {getRatingBadge(review.rating)}
        </div>
      ),
    },
    {
      key: 'feedback',
      header: 'Nhận xét',
      maxWidth: 'max-w-52',
      render: (review) => (
        <p className="text-gray-700 text-xs line-clamp-2 italic">
          {review.feedback || 'Không có nhận xét'}
        </p>
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      align: 'center',
      render: (review) => (
        <div className="text-center relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdownId(
                openDropdownId === review._id ? null : review._id
              );
            }}
            disabled={deletingId === review._id}
            className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors disabled:opacity-50"
          >
            {deletingId === review._id ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <MoreVertical size={18} />
            )}
          </button>

          {openDropdownId === review._id && (
            <div className="absolute right-8 top-10 w-44 bg-surface-lowest border border-outline-variant/30 rounded-2xl shadow-hover z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  setSelectedReview(review);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <Eye size={16} /> Xem chi tiết
              </button>
              <div className="h-px bg-outline-variant/20 my-1" />
              <button
                onClick={() => handleDelete(review._id)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
              >
                <Trash2 size={16} /> Xóa đánh giá
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div
      className="w-full max-w-7xl mx-auto flex flex-col gap-6"
      onClick={closeDropdown}
    >
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-2xl font-sans font-bold text-gray-900 leading-tight">
          Quản Lý Đánh Giá
        </h1>
        <p className="text-sm font-body text-gray-500 mt-1">
          Xem và quản lý các đánh giá của người dùng sau giao dịch
        </p>
      </div>

      {/* ── TOOLBAR ── */}
      <Toolbar
        filters={
          [
            {
              type: 'select',
              value: ratingFilter,
              onChange: setRatingFilter,
              options: [
                { value: 'ALL', label: 'Tất cả đánh giá' },
                { value: '5', label: '5 sao' },
                { value: '4', label: '4 sao' },
                { value: '3', label: '3 sao' },
                { value: '2', label: '2 sao' },
                { value: '1', label: '1 sao' },
              ],
            },
          ] satisfies ToolbarFilter[]
        }
      />

      {/* ── DATA TABLE ── */}
      <DataTable
        columns={columns}
        data={reviews}
        rowKey={(review) => review._id}
        loading={loading}
        error={error}
        emptyMessage="Không có đánh giá nào phù hợp."
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        className="rounded-md overflow-visible relative"
        tableClassName="min-h-100"
        headerClassName="bg-surface/50 font-label text-xs uppercase text-gray-500"
        bodyClassName="divide-outline-variant/20 text-sm"
        rowClassName="hover:bg-primary/5 transition-colors"
        cellClassName={(col) => (col.key === 'actions' ? 'px-3' : '')}
      />

      {/* ── DETAIL MODAL ── */}
      <ReviewDetailModal
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
        onDelete={handleDelete}
        formatDate={formatDate}
        getRatingBadge={getRatingBadge}
      />
    </div>
  );
}
