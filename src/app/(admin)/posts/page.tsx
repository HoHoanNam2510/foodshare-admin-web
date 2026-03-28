'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, MoreVertical, Eye, EyeOff } from 'lucide-react';
import PostDetailModal from '@/components/features/posts/PostDetailModal';
import { MOCK_POSTS } from '@/constants/mockPosts';

// --- HELPER FORMATS ---
const formatCurrency = (amount: number, type: string) => {
  if (type === 'P2P_FREE' || amount === 0)
    return <span className="text-primary font-bold">Miễn phí</span>;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const formatDate = (date: Date) => {
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    AVAILABLE: 'bg-green-50 text-primary border-primary/20',
    PENDING_REVIEW: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    BOOKED: 'bg-blue-50 text-blue-700 border-blue-200',
    OUT_OF_STOCK: 'bg-gray-100 text-gray-600 border-gray-200',
    HIDDEN: 'bg-red-50 text-error border-error/20',
    REJECTED: 'bg-red-100 text-error font-bold border-error/30',
  };

  const labels: Record<string, string> = {
    AVAILABLE: 'Đang hiển thị',
    PENDING_REVIEW: 'Chờ duyệt',
    BOOKED: 'Đã đặt',
    OUT_OF_STOCK: 'Hết hàng',
    HIDDEN: 'Đã ẩn',
    REJECTED: 'Từ chối',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wider ${styles[status] || styles.PENDING_REVIEW}`}
    >
      {labels[status] || status}
    </span>
  );
};

export default function PostsManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  const filteredPosts = useMemo(() => {
    // Sử dụng MOCK_POSTS đã import
    let result = [...MOCK_POSTS];
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(lowerQuery) ||
          p.category.toLowerCase().includes(lowerQuery)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (typeFilter !== 'ALL') {
      result = result.filter((p) => p.type === typeFilter);
    }
    return result;
  }, [searchQuery, statusFilter, typeFilter]);

  const closeDropdown = () => setOpenDropdownId(null);

  return (
    <div
      className="w-full max-w-7xl mx-auto flex flex-col gap-6"
      onClick={closeDropdown}
    >
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-2xl font-sans font-bold text-gray-900 leading-tight">
          Quản Lý Bài Đăng
        </h1>
        <p className="text-sm font-body text-gray-500 mt-1">
          Quản lý các tin chia sẻ thực phẩm và bán túi mù trên hệ thống
        </p>
      </div>

      {/* ── TOOLBAR (SEARCH & FILTERS) ── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-lowest p-4 rounded-md shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50 w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary/50 focus-within:-translate-y-0.5 transition-all">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none w-full font-body text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50">
            <Filter size={16} className="text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-sm outline-none font-body text-gray-700 cursor-pointer"
            >
              <option value="ALL">Tất cả loại hình</option>
              <option value="P2P_FREE">Chia sẻ miễn phí (P2P)</option>
              <option value="B2C_MYSTERY_BAG">Túi mù (B2C)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm outline-none font-body text-gray-700 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING_REVIEW">Chờ duyệt</option>
              <option value="AVAILABLE">Đang hiển thị</option>
              <option value="OUT_OF_STOCK">Hết hàng</option>
              <option value="HIDDEN">Đã ẩn</option>
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
                  Bài đăng
                </th>
                <th className="px-5 py-4 font-semibold">Loại hình & Giá</th>
                <th className="px-5 py-4 font-semibold text-center">
                  Số lượng
                </th>
                <th className="px-5 py-4 font-semibold">Trạng thái</th>
                <th className="px-5 py-4 font-semibold">Ngày tạo</th>
                <th className="px-3 py-4 font-semibold text-center rounded-tr-md">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <tr
                    key={post._id}
                    className="hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col min-w-50">
                        <span className="font-semibold text-gray-900 line-clamp-1">
                          {post.title}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          {post.category} • Băng: {post.ownerName}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">
                          {post.type === 'P2P_FREE'
                            ? 'P2P - Tặng'
                            : 'B2C - Túi mù'}
                        </span>
                        <span className="text-xs mt-0.5">
                          {formatCurrency(post.price, post.type)}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span className="font-semibold text-gray-900">
                        {post.remainingQuantity}
                      </span>
                      <span className="text-gray-500">
                        {' '}
                        / {post.totalQuantity}
                      </span>
                    </td>

                    <td className="px-5 py-4">{getStatusBadge(post.status)}</td>

                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {formatDate(post.createdAt)}
                    </td>

                    <td className="px-3 py-4 text-center relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(
                            openDropdownId === post._id ? null : post._id
                          );
                        }}
                        className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openDropdownId === post._id && (
                        <div className="absolute right-8 top-10 w-40 bg-surface-lowest border border-outline-variant/30 rounded-2xl shadow-hover z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                          <button
                            onClick={() => {
                              setSelectedPost(post);
                              setOpenDropdownId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                          >
                            <Eye size={16} />
                            Xem chi tiết
                          </button>
                          <button
                            onClick={() => {
                              alert(`Đã ẩn bài viết ${post._id}`);
                              setOpenDropdownId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                          >
                            <EyeOff size={16} />
                            Ẩn bài đăng
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
                    Không tìm thấy bài đăng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── HIỂN THỊ MODAL CHI TIẾT ── */}
      <PostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        getStatusBadge={getStatusBadge}
      />
    </div>
  );
}
