'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import Toolbar, { type ToolbarFilter } from '@/components/ui/Toolbar';
import DataTable, { type Column } from '@/components/ui/DataTable';
import PageHeader from '@/components/ui/PageHeader';
import ActionDropdown, {
  type DropdownAction,
} from '@/components/ui/ActionDropdown';
import PostDetailModal from '@/components/features/posts/PostDetailModal';
import {
  fetchAdminPosts,
  adminUpdatePost,
  adminToggleHidePost,
  type IPost,
  type PaginationMeta,
} from '@/lib/postApi';
import { formatDateTime, formatPostCurrency } from '@/lib/formatters';
import { getStatusBadge } from '@/components/features/posts/postFormatters';
import UserAvatar from '@/components/ui/UserAvatar';

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

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

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

  const buildActions = (post: IPost): DropdownAction[] => [
    {
      label: 'Xem chi tiết',
      icon: <Eye size={16} />,
      onClick: () => {
        setSelectedPost(post);
        setOpenDropdownId(null);
      },
    },
    {
      label: 'Duyệt bài đăng',
      icon: <CheckCircle size={16} />,
      variant: 'primary',
      hidden: post.status !== 'PENDING_REVIEW',
      onClick: () => handleApprove(post._id),
    },
    {
      label: 'Từ chối',
      icon: <XCircle size={16} />,
      variant: 'danger',
      hidden: post.status !== 'PENDING_REVIEW',
      onClick: () => handleReject(post._id),
    },
    {
      label: 'Ẩn bài đăng',
      icon: <EyeOff size={16} />,
      variant: 'danger',
      hidden: post.status === 'HIDDEN',
      onClick: () => handleHide(post._id),
    },
  ];

  const columns: Column<IPost>[] = [
    {
      key: 'post',
      header: 'Bài đăng',
      render: (post) => (
        <div className="flex flex-col min-w-50 gap-1">
          <span className="font-semibold text-gray-900 line-clamp-1">
            {post.title}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">{post.category} &middot;</span>
            {post.ownerId && (
              <>
                <UserAvatar fullName={post.ownerId.fullName} avatar={post.ownerId.avatar} size="xs" />
                <span className="text-xs text-gray-500">{post.ownerId.fullName}</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'typePrice',
      header: 'Loại hình & Giá',
      render: (post) => (
        <div className="flex flex-col">
          <span className="text-gray-900 font-medium">
            {post.type === 'P2P_FREE' ? 'P2P – Tặng' : 'B2C – Túi mù'}
          </span>
          <span className="text-xs mt-0.5">
            {formatPostCurrency(post.price, post.type)}
          </span>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Số lượng',
      align: 'center',
      render: (post) => (
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
      render: (post) => getStatusBadge(post.status),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (post) => (
        <span className="text-gray-500 text-xs">
          {formatDateTime(post.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      align: 'center',
      render: (post) => (
        <ActionDropdown
          id={post._id}
          openId={openDropdownId}
          onToggle={(id) =>
            setOpenDropdownId((prev) => (prev === id ? null : id))
          }
          loading={actionLoading === post._id}
          actions={buildActions(post)}
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
        title="Quản Lý Bài Đăng"
        subtitle="Quản lý các tin chia sẻ thực phẩm và bán túi mù trên hệ thống"
      />

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
        columns={columns}
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
        formatDate={formatDateTime}
        formatCurrency={formatPostCurrency}
        getStatusBadge={getStatusBadge}
      />
    </div>
  );
}
