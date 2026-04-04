'use client';

import { useState, useEffect, useCallback } from 'react';
import PostsToolbar from '@/components/features/posts/PostsToolbar';
import PostsTable from '@/components/features/posts/PostsTable';
import PostDetailModal from '@/components/features/posts/PostDetailModal';
import {
  fetchAdminPosts,
  adminUpdatePost,
  adminToggleHidePost,
  type IPost,
  type PaginationMeta,
} from '@/lib/postApi';
import { formatDate, formatCurrency, getStatusBadge } from '@/components/features/posts/postFormatters';

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

      <PostsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <PostsTable
        posts={filteredPosts}
        isLoading={isLoading}
        pagination={pagination}
        currentPage={currentPage}
        actionLoading={actionLoading}
        openDropdownId={openDropdownId}
        onDropdownToggle={handleDropdownToggle}
        onViewDetail={setSelectedPost}
        onApprove={handleApprove}
        onReject={handleReject}
        onHide={handleHide}
        onPageChange={setCurrentPage}
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
