'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import Toolbar, { type ToolbarFilter } from '@/components/ui/Toolbar';
import DataTable, { type Column } from '@/components/ui/DataTable';
import PageHeader from '@/components/ui/PageHeader';
import ActionDropdown, {
  type DropdownAction,
} from '@/components/ui/ActionDropdown';
import dynamic from 'next/dynamic';
const ReviewDetailModal = dynamic(
  () => import('@/components/features/reviews/ReviewDetailModal'),
  { loading: () => null }
);
import UserAvatar from '@/components/ui/UserAvatar';
import { formatDateTime } from '@/lib/formatters';
import { fetchAdminReviews, type IReview } from '@/lib/reviewApi';
import { adminSoftDeleteReview } from '@/lib/trashApi';

const PAGE_SIZE = 15;

// ─── Rating helpers ───────────────────────────────────────────

const RATING_STYLES: Record<number, string> = {
  5: 'bg-green-50 dark:bg-green-900/20 text-primary dark:text-green-400 border-primary/20 dark:border-green-800/30',
  4: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/30',
  3: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/30',
  2: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/30',
  1: 'bg-red-50 dark:bg-red-900/20 text-error dark:text-red-400 border-error/20 dark:border-red-800/30',
};

const getRatingBadge = (rating: number) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${RATING_STYLES[rating] ?? RATING_STYLES[3]}`}
  >
    <Star size={10} className="fill-current" /> {rating}/5
  </span>
);

const renderStarsInline = (rating: number) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={14}
        className={
          star <= rating
            ? 'text-yellow-500 fill-yellow-500'
            : 'text-gray-300 dark:text-gray-600'
        }
      />
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────

export default function ReviewsManagementPage() {
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
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
  }, [ratingFilter, searchQuery]);

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
    const confirmed = confirm(
      'Chuyển đánh giá vào thùng rác? Admin có thể khôi phục trong trang Thùng Rác.'
    );
    if (!confirmed) return;

    setDeletingId(reviewId);
    setOpenDropdownId(null);
    try {
      await adminSoftDeleteReview(reviewId);
      if (selectedReview?._id === reviewId) setSelectedReview(null);
      await loadReviews();
    } catch {
      toast.error('Xóa đánh giá thất bại. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReviews = searchQuery
    ? reviews.filter((r) => {
        const q = searchQuery.toLowerCase();
        return (
          r.reviewerId.fullName.toLowerCase().includes(q) ||
          r.revieweeId.fullName.toLowerCase().includes(q) ||
          (r.feedback ?? '').toLowerCase().includes(q)
        );
      })
    : reviews;

  const buildActions = (review: IReview): DropdownAction[] => [
    {
      label: 'Xem chi tiết',
      icon: <Eye size={16} />,
      onClick: () => {
        setSelectedReview(review);
        setOpenDropdownId(null);
      },
    },
    {
      label: 'Xóa đánh giá',
      icon: <Trash2 size={16} />,
      variant: 'danger',
      dividerBefore: true,
      onClick: () => handleDelete(review._id),
    },
  ];

  const columns: Column<IReview>[] = [
    {
      key: 'id',
      header: 'Mã & Ngày tạo',
      render: (review) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-gray-100 font-mono text-xs">
            {review._id.slice(-8).toUpperCase()}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {formatDateTime(review.createdAt)}
          </span>
        </div>
      ),
    },
    {
      key: 'reviewer',
      header: 'Người đánh giá',
      render: (review) => (
        <div className="flex items-center gap-3">
          <UserAvatar
            fullName={review.reviewerId.fullName}
            avatar={review.reviewerId.avatar}
            size="md"
          />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
              {review.reviewerId.fullName}
            </span>
            {review.reviewerId.email && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {review.reviewerId.email}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'reviewee',
      header: 'Người được đánh giá',
      render: (review) => (
        <div className="flex items-center gap-3">
          <UserAvatar
            fullName={review.revieweeId.fullName}
            avatar={review.revieweeId.avatar}
            size="md"
          />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
              {review.revieweeId.fullName}
            </span>
            {review.revieweeId.email && (
              <span className="text-xs text-gray-500">
                {review.revieweeId.email}
              </span>
            )}
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
        <p className="text-gray-700 dark:text-gray-300 text-xs line-clamp-2 italic">
          {review.feedback || 'Không có nhận xét'}
        </p>
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      align: 'center',
      render: (review) => (
        <ActionDropdown
          id={review._id}
          openId={openDropdownId}
          onToggle={(id) =>
            setOpenDropdownId((prev) => (prev === id ? null : id))
          }
          loading={deletingId === review._id}
          actions={buildActions(review)}
        />
      ),
    },
  ];

  return (
    <div
      className="w-full max-w-7xl mx-auto flex flex-col gap-6"
      onClick={() => setOpenDropdownId(null)}
    >
      <PageHeader
        title="Quản Lý Đánh Giá"
        subtitle="Xem và quản lý các đánh giá của người dùng sau giao dịch"
      />

      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={(v) => {
          setSearchQuery(v);
          setCurrentPage(1);
        }}
        placeholder="Tìm theo tên người đánh giá, nhận xét..."
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

      <DataTable
        columns={columns}
        data={filteredReviews}
        rowKey={(review) => review._id}
        loading={loading}
        error={error}
        emptyMessage={
          searchQuery
            ? 'Không tìm thấy đánh giá phù hợp.'
            : 'Không có đánh giá nào phù hợp.'
        }
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        className="rounded-2xl relative"
        tableClassName="min-h-100"
        headerClassName="bg-surface/50 dark:bg-gray-800/50 font-label text-xs uppercase text-gray-500"
        bodyClassName="divide-outline-variant/20 text-sm"
        rowClassName="hover:bg-primary/5 transition-colors"
        cellClassName={(col) => (col.key === 'actions' ? 'px-3' : '')}
      />

      <ReviewDetailModal
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
        onDelete={handleDelete}
        formatDate={formatDateTime}
        getRatingBadge={getRatingBadge}
      />
    </div>
  );
}
