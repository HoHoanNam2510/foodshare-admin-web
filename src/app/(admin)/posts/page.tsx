'use client';

import { useState, useEffect, useCallback } from 'react';
import Toolbar, { type ToolbarFilter } from '@/components/ui/Toolbar';
import DataTable, { type Column } from '@/components/ui/DataTable';
import PostDetailModal from '@/components/features/posts/PostDetailModal';
import {
  fetchAdminPosts,
  adminUpdatePost,
  adminToggleHidePost,
  type IPost,
  type PaginationMeta,
} from '@/lib/postApi';
import {
  formatDate,
  formatCurrency,
  getStatusBadge,
} from '@/components/features/posts/postFormatters';
import {
  MoreVertical,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

const PAGE_LIMIT = 10;

export default function PostsManagementPage() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminPosts({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        page: currentPage,
        limit: PAGE_LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setPosts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, currentPage]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Reset page khi đổi filter trạng thái
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Client-side filter theo search và loại hình (API chưa hỗ trợ)
  const filteredPosts = posts.filter((p) => {
    let match = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      match =
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
    }
    if (typeFilter !== 'ALL') match = match && p.type === typeFilter;
    return match;
  });

  const withActionLoading = async (
    postId: string,
    action: () => Promise<unknown>
  ) => {
    setActionLoading(postId);
    setOpenDropdownId(null);
    try {
      await action();
      await loadPosts();
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = (postId: string) =>
    withActionLoading(postId, () =>
      adminUpdatePost(postId, { status: 'AVAILABLE' })
    );

  const handleReject = (postId: string) =>
    withActionLoading(postId, () =>
      adminUpdatePost(postId, { status: 'REJECTED' })
    );

  const handleHide = (postId: string) =>
    withActionLoading(postId, () => adminToggleHidePost(postId));

  const handleDropdownToggle = (id: string) =>
    setOpenDropdownId((prev) => (prev === id ? null : id));

  return (
    <div
      className="w-full max-w-7xl mx-auto flex flex-col gap-6"
      onClick={() => setOpenDropdownId(null)}
    >
      {/* Tiêu đề trang */}
      <div>
        <h1 className="text-2xl font-sans font-bold text-gray-900 leading-tight">
          Quản Lý Bài Đăng
        </h1>
        <p className="text-sm font-body text-gray-500 mt-1">
          Quản lý các tin chia sẻ thực phẩm và bán túi mù trên hệ thống
        </p>
      </div>

      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Tìm theo tiêu đề, danh mục..."
        filters={
          [
            {
              type: 'select',
              value: typeFilter,
              onChange: setTypeFilter,
              options: [
                { value: 'ALL', label: 'Tất cả loại hình' },
                { value: 'P2P_FREE', label: 'Chia sẻ miễn phí (P2P)' },
                { value: 'B2C_MYSTERY_BAG', label: 'Túi mù (B2C)' },
              ],
            },
            {
              type: 'select',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: 'PENDING_REVIEW', label: 'Chờ duyệt' },
                { value: 'AVAILABLE', label: 'Đang hiển thị' },
                { value: 'OUT_OF_STOCK', label: 'Hết hàng' },
                { value: 'HIDDEN', label: 'Đã ẩn' },
                { value: 'REJECTED', label: 'Từ chối' },
              ],
            },
          ] satisfies ToolbarFilter[]
        }
      />

      <DataTable
        columns={
          [
            {
              key: 'post',
              header: 'Bài đăng',
              render: (post: IPost) => (
                <div className="flex flex-col min-w-50">
                  <span className="font-semibold text-gray-900 line-clamp-1">
                    {post.title}
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5">
                    {post.category} &middot; {post.ownerId?.fullName || 'N/A'}
                  </span>
                </div>
              ),
            },
            {
              key: 'typePrice',
              header: 'Loại hình & Giá',
              render: (post: IPost) => (
                <div className="flex flex-col">
                  <span className="text-gray-900 font-medium">
                    {post.type === 'P2P_FREE' ? 'P2P – Tặng' : 'B2C – Túi mù'}
                  </span>
                  <span className="text-xs mt-0.5">
                    {formatCurrency(post.price, post.type)}
                  </span>
                </div>
              ),
            },
            {
              key: 'quantity',
              header: 'Số lượng',
              align: 'center',
              render: (post: IPost) => (
                <>
                  <span className="font-semibold text-gray-900">
                    {post.remainingQuantity}
                  </span>
                  <span className="text-gray-500"> / {post.totalQuantity}</span>
                </>
              ),
            },
            {
              key: 'status',
              header: 'Trạng thái',
              render: (post: IPost) => getStatusBadge(post.status),
            },
            {
              key: 'createdAt',
              header: 'Ngày tạo',
              render: (post: IPost) => (
                <span className="text-gray-500 text-xs">
                  {formatDate(post.createdAt)}
                </span>
              ),
            },
            {
              key: 'actions',
              header: 'Hành động',
              align: 'center',
              render: (post: IPost) => (
                <div className="text-center relative">
                  {actionLoading === post._id ? (
                    <Loader2
                      size={18}
                      className="animate-spin text-gray-400 mx-auto"
                    />
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDropdownToggle(post._id);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                  )}

                  {openDropdownId === post._id && (
                    <div className="absolute right-8 top-10 w-44 bg-surface-lowest border border-outline-variant/30 rounded-2xl shadow-hover z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        <Eye size={16} />
                        Xem chi tiết
                      </button>

                      {post.status === 'PENDING_REVIEW' && (
                        <>
                          <button
                            onClick={() => handleApprove(post._id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                          >
                            <CheckCircle size={16} />
                            Duyệt bài đăng
                          </button>
                          <button
                            onClick={() => handleReject(post._id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <XCircle size={16} />
                            Từ chối
                          </button>
                        </>
                      )}

                      {post.status !== 'HIDDEN' && (
                        <button
                          onClick={() => handleHide(post._id)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                        >
                          <EyeOff size={16} />
                          Ẩn bài đăng
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ),
            },
          ] satisfies Column<IPost>[]
        }
        data={filteredPosts}
        rowKey={(post) => post._id}
        loading={isLoading}
        emptyMessage="Không tìm thấy bài đăng nào phù hợp."
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

      <PostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onHide={handleHide}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        getStatusBadge={getStatusBadge}
      />
    </div>
  );
}
