'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Toolbar from '@/components/ui/Toolbar';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/ui/PageHeader';
import UserAvatar from '@/components/ui/UserAvatar';
import { formatDateTime } from '@/lib/formatters';
import {
  fetchAdminStatusLogs,
  type ITransactionStatusLogAdmin,
  type PaginationMeta,
  type TransactionStatus,
} from '@/lib/transactionApi';

const TX_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  ACCEPTED: 'Đã chấp nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  REJECTED: 'Đã từ chối',
};

const txStatusBadge = (status: TransactionStatus) => (
  <StatusBadge status={status} label={TX_STATUS_LABELS[status]} />
);

const PAGE_LIMIT = 15;

export default function TransactionStatusHistoryPage() {
  const [logs, setLogs] = useState<ITransactionStatusLogAdmin[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminStatusLogs({
        transactionId: searchQuery.trim() || undefined,
        page: currentPage,
        limit: PAGE_LIMIT,
      });
      setLogs(res.data);
      setPagination(res.pagination);
    } catch {
      setError('Không thể tải lịch sử cập nhật. Vui lòng kiểm tra kết nối.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const columns: Column<ITransactionStatusLogAdmin>[] = [
    {
      key: 'transactionId',
      header: 'Mã giao dịch',
      render: (log) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-sm font-semibold text-gray-900">
            #{log.transactionId?._id?.slice(-8).toUpperCase() ?? '—'}
          </span>
          <span
            className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded w-fit ${
              log.transactionId?.type === 'REQUEST'
                ? 'bg-primary/10 text-primary'
                : log.transactionId?.type === 'ORDER'
                  ? 'bg-secondary/10 text-secondary'
                  : 'bg-neutral-T90 text-neutral-T50'
            }`}
          >
            {log.transactionId?.type === 'REQUEST'
              ? 'P2P'
              : log.transactionId?.type === 'ORDER'
                ? 'B2C'
                : (log.transactionId?.type ?? '—')}
          </span>
        </div>
      ),
    },
    {
      key: 'statusChange',
      header: 'Thay đổi trạng thái',
      render: (log) => (
        <div className="flex items-center gap-2 flex-wrap">
          {txStatusBadge(log.previousStatus)}
          <ArrowRight size={14} className="text-gray-400 shrink-0" />
          {txStatusBadge(log.newStatus)}
        </div>
      ),
    },
    {
      key: 'changedBy',
      header: 'Admin thực hiện',
      render: (log) => (
        <div className="flex items-center gap-2">
          <UserAvatar
            fullName={log.changedBy?.fullName ?? '?'}
            avatar={log.changedBy?.avatar}
            size="sm"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-gray-900 line-clamp-1">
              {log.changedBy?.fullName ?? '—'}
            </span>
            <span className="text-xs text-gray-500 line-clamp-1">
              {log.changedBy?.email ?? ''}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Thời gian',
      render: (log) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {formatDateTime(log.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      <PageHeader
        title="Lịch Sử Cập Nhật Giao Dịch"
        subtitle="Audit log ghi lại các lần Admin force-update trạng thái giao dịch — chỉ xem, không chỉnh sửa"
      />

      <Toolbar
        onSearch={handleSearch}
        placeholder="Lọc theo Transaction ID..."
        delay={600}
      />

      {pagination && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface-lowest border border-outline-variant/30 rounded-md p-4 shadow-sm">
            <p className="text-xs font-label text-gray-500 uppercase tracking-wider mb-1">
              Tổng lượt cập nhật
            </p>
            <p className="text-2xl font-sans font-bold text-gray-900">
              {pagination.total.toLocaleString('vi-VN')}
            </p>
          </div>
          <div className="bg-surface-lowest border border-outline-variant/30 rounded-md p-4 shadow-sm">
            <p className="text-xs font-label text-gray-500 uppercase tracking-wider mb-1">
              Trang hiện tại
            </p>
            <p className="text-2xl font-sans font-bold text-gray-900">
              {currentPage} / {pagination.totalPages}
            </p>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={logs}
        rowKey={(log) => log._id}
        loading={loading}
        error={error}
        emptyMessage={
          searchQuery
            ? 'Không tìm thấy lịch sử cập nhật cho giao dịch này.'
            : 'Chưa có lịch sử cập nhật trạng thái nào.'
        }
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        className="rounded-md overflow-visible"
        tableClassName="min-h-100"
        headerClassName="bg-surface/50 font-label text-xs uppercase text-gray-500"
        bodyClassName="divide-outline-variant/20 text-sm"
        rowClassName="hover:bg-primary/5 transition-colors"
      />
    </div>
  );
}
