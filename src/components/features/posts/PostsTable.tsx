'use client';

import {
  MoreVertical,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { IPost, PaginationMeta } from '@/lib/postApi';
import { formatCurrency, formatDate, getStatusBadge } from './postFormatters';

interface PostsTableProps {
  posts: IPost[];
  isLoading: boolean;
  pagination: PaginationMeta | null;
  currentPage: number;
  actionLoading: string | null;
  openDropdownId: string | null;
  onDropdownToggle: (id: string) => void;
  onViewDetail: (post: IPost) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onHide: (id: string) => void;
  onPageChange: (page: number) => void;
}

export default function PostsTable({
  posts,
  isLoading,
  pagination,
  currentPage,
  actionLoading,
  openDropdownId,
  onDropdownToggle,
  onViewDetail,
  onApprove,
  onReject,
  onHide,
  onPageChange,
}: PostsTableProps) {
  return (
    <div className="bg-surface-lowest rounded-md shadow-soft border border-outline-variant/30 overflow-visible relative">
      <div className="overflow-x-auto min-h-100">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
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
              {posts.length > 0 ? (
                posts.map((post) => (
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
                          {post.category} &middot;{' '}
                          {post.ownerId?.fullName || 'N/A'}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">
                          {post.type === 'P2P_FREE' ? 'P2P – Tặng' : 'B2C – Túi mù'}
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
                        {' '}/ {post.totalQuantity}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {getStatusBadge(post.status)}
                    </td>

                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {formatDate(post.createdAt)}
                    </td>

                    <td className="px-3 py-4 text-center relative">
                      {actionLoading === post._id ? (
                        <Loader2
                          size={18}
                          className="animate-spin text-gray-400 mx-auto"
                        />
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDropdownToggle(post._id);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>
                      )}

                      {openDropdownId === post._id && (
                        <div className="absolute right-8 top-10 w-44 bg-surface-lowest border border-outline-variant/30 rounded-2xl shadow-hover z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                          <button
                            onClick={() => onViewDetail(post)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                          >
                            <Eye size={16} />
                            Xem chi tiết
                          </button>

                          {post.status === 'PENDING_REVIEW' && (
                            <>
                              <button
                                onClick={() => onApprove(post._id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                              >
                                <CheckCircle size={16} />
                                Duyệt bài đăng
                              </button>
                              <button
                                onClick={() => onReject(post._id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <XCircle size={16} />
                                Từ chối
                              </button>
                            </>
                          )}

                          {post.status !== 'HIDDEN' && (
                            <button
                              onClick={() => onHide(post._id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                            >
                              <EyeOff size={16} />
                              Ẩn bài đăng
                            </button>
                          )}
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
        )}
      </div>

      {/* Phân trang */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-outline-variant/30 text-sm font-body text-gray-600">
          <span>
            Trang {pagination.page} / {pagination.totalPages} &middot;{' '}
            {pagination.total} bài đăng
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-md hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() =>
                onPageChange(Math.min(pagination.totalPages, currentPage + 1))
              }
              disabled={currentPage >= pagination.totalPages}
              className="p-1.5 rounded-md hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
