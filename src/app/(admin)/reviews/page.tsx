'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
  Star,
  Layers,
} from 'lucide-react';
import { MOCK_REVIEWS } from '@/constants/mockReviews';
import ReviewDetailModal from '@/components/features/reviews/ReviewDetailModal';

// --- HELPER FORMATS ---
const formatDate = (date: Date) => {
  return date.toLocaleString('vi-VN', {
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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${styles[rating] || styles[3]}`}
    >
      <Star size={10} className="fill-current" /> {rating}/5
    </span>
  );
};

const renderStarsInline = (rating: number) => {
  return (
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
};

export default function ReviewsManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'POSITIVE' | 'NEGATIVE'>(
    'ALL'
  );

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  const filteredReviews = useMemo(() => {
    let result = [...MOCK_REVIEWS];

    // 1. Lọc theo Tab
    if (activeTab === 'POSITIVE') {
      result = result.filter((r) => r.rating >= 4);
    } else if (activeTab === 'NEGATIVE') {
      result = result.filter((r) => r.rating <= 2);
    }

    // 2. Sắp xếp mới nhất lên đầu
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // 3. Lọc theo Search (Tên người đánh giá, người được đánh giá, ID)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r._id.toLowerCase().includes(lowerQuery) ||
          r.reviewer.fullName.toLowerCase().includes(lowerQuery) ||
          r.reviewee.fullName.toLowerCase().includes(lowerQuery)
      );
    }

    // 4. Lọc theo Rating cụ thể
    if (ratingFilter !== 'ALL') {
      result = result.filter((r) => r.rating === Number(ratingFilter));
    }

    return result;
  }, [activeTab, searchQuery, ratingFilter]);

  const closeDropdown = () => setOpenDropdownId(null);

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

      {/* ── TABS NỘI BỘ (Lọc theo mức đánh giá) ── */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-px">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans font-bold text-sm border-b-2 transition-all ${activeTab === 'ALL' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          <Layers size={18} /> Tất cả
        </button>
        <button
          onClick={() => setActiveTab('POSITIVE')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans font-bold text-sm border-b-2 transition-all ${activeTab === 'POSITIVE' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          <Star size={18} /> Tích cực (4-5★)
        </button>
        <button
          onClick={() => setActiveTab('NEGATIVE')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans font-bold text-sm border-b-2 transition-all ${activeTab === 'NEGATIVE' ? 'border-error text-error' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          <Star size={18} /> Tiêu cực (1-2★)
        </button>
      </div>

      {/* ── TOOLBAR (SEARCH & FILTERS) ── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-lowest p-4 rounded-md shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50 w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary/50 focus-within:-translate-y-0.5 transition-all">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên người dùng, mã đánh giá..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none w-full font-body text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50">
            <Filter size={16} className="text-gray-400" />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="bg-transparent text-sm outline-none font-body text-gray-700 cursor-pointer"
            >
              <option value="ALL">Tất cả đánh giá</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <div className="bg-surface-lowest rounded-md shadow-soft border border-outline-variant/30 overflow-visible relative">
        <div className="overflow-x-auto min-h-100">
          <table className="w-full text-left font-body">
            <thead className="bg-surface/50 border-b border-outline-variant/30 font-label text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4 font-semibold rounded-tl-md">
                  Mã & Ngày tạo
                </th>
                <th className="px-5 py-4 font-semibold">Người đánh giá</th>
                <th className="px-5 py-4 font-semibold">Người được đánh giá</th>
                <th className="px-5 py-4 font-semibold text-center">
                  Đánh giá
                </th>
                <th className="px-5 py-4 font-semibold">Nhận xét</th>
                <th className="px-3 py-4 font-semibold text-center rounded-tr-md">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <tr
                    key={review._id}
                    className="hover:bg-primary/5 transition-colors"
                  >
                    {/* Mã & Ngày tạo */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          {review._id}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* Người đánh giá */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary-container to-secondary-container flex items-center justify-center text-white font-sans text-xs font-bold shrink-0">
                          {review.reviewer.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 line-clamp-1">
                            {review.reviewer.fullName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {review.reviewer._id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Người được đánh giá */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-secondary-container to-tertiary-T70 flex items-center justify-center text-white font-sans text-xs font-bold shrink-0">
                          {review.reviewee.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 line-clamp-1">
                            {review.reviewee.fullName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {review.reviewee._id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Đánh giá */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {renderStarsInline(review.rating)}
                        {getRatingBadge(review.rating)}
                      </div>
                    </td>

                    {/* Nhận xét */}
                    <td className="px-5 py-4 max-w-52">
                      <p className="text-gray-700 text-xs line-clamp-2 italic">
                        {review.feedback || 'Không có nhận xét'}
                      </p>
                    </td>

                    {/* Action 3 chấm */}
                    <td className="px-3 py-4 text-center relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(
                            openDropdownId === review._id ? null : review._id
                          );
                        }}
                        className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors"
                      >
                        <MoreVertical size={18} />
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

                          <div className="h-px bg-outline-variant/20 my-1"></div>

                          <button
                            onClick={() => {
                              alert(`Đã xóa đánh giá ${review._id}`);
                              setOpenDropdownId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                          >
                            <Trash2 size={16} /> Xóa đánh giá
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    Không có đánh giá nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── HIỂN THỊ MODAL CHI TIẾT ── */}
      <ReviewDetailModal
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
        formatDate={formatDate}
        getRatingBadge={getRatingBadge}
      />
    </div>
  );
}
