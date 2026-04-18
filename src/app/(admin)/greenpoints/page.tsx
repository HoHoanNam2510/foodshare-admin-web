'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import PointLogDetailModal from '@/components/features/greenpoints/PointLogDetailModal';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Toolbar from '@/components/ui/Toolbar';
import PageHeader from '@/components/ui/PageHeader';
import UserAvatar from '@/components/ui/UserAvatar';
import { formatDateTime } from '@/lib/formatters';
import {
  IPointLog,
  PaginationMeta,
  fetchAdminPointLogs,
} from '@/lib/greenPointApi';

const getAmountBadge = (amount: number) => {
  const isPositive = amount > 0;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-bold border ${isPositive ? 'bg-green-50 text-primary border-primary/20' : 'bg-red-50 text-error border-error/20'}`}>
      {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
      {isPositive ? '+' : ''}{amount}
    </span>
  );
};

const LIMIT = 15;

export default function GreenPointsManagementPage() {
  const [logs, setLogs] = useState<IPointLog[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userIdFilter, setUserIdFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedLog, setSelectedLog] = useState<IPointLog | null>(null);

  const loadLogs = useCallback(async (page: number, userId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminPointLogs({ userId: userId || undefined, page, limit: LIMIT });
      setLogs(res.data);
      setPagination(res.pagination);
    } catch {
      setError('Không thể tải lịch sử điểm. Vui lòng kiểm tra kết nối.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs(currentPage, userIdFilter);
  }, [currentPage, userIdFilter, loadLogs]);

  const handleSearch = useCallback((query: string) => {
    setUserIdFilter(query);
    setCurrentPage(1);
  }, []);

  const columns: Column<IPointLog>[] = [
    {
      key: 'userId',
      header: 'Người dùng',
      render: (log) => (
        <div className="flex items-center gap-3">
          <UserAvatar fullName={log.userId?.fullName || '?'} avatar={log.userId?.avatar} size="md" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-gray-900 line-clamp-1">{log.userId?.fullName || 'N/A'}</span>
            <span className="text-xs text-gray-500">{log.userId?.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Biến động',
      render: (log) => getAmountBadge(log.amount),
    },
    {
      key: 'reason',
      header: 'Lý do',
      maxWidth: 'max-w-xs',
      render: (log) => <span className="text-gray-800 line-clamp-2">{log.reason}</span>,
    },
    {
      key: 'referenceId',
      header: 'Tham chiếu',
      render: (log) => log.referenceId
        ? <span className="font-mono text-xs text-gray-500 bg-surface-container px-2 py-1 rounded-md">{log.referenceId.slice(-8)}…</span>
        : <span className="text-gray-400 text-xs">—</span>,
    },
    {
      key: 'createdAt',
      header: 'Thời gian',
      render: (log) => <span className="text-sm text-gray-600 whitespace-nowrap">{formatDateTime(log.createdAt)}</span>,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      <PageHeader
        title="Quản Lý Green Points"
        subtitle="Toàn bộ lịch sử biến động điểm xanh trên hệ thống — cộng thưởng, trừ phạt và đổi voucher"
      />

      <Toolbar
        onSearch={handleSearch}
        placeholder="Lọc theo User ID..."
        delay={600}
      />

      {pagination && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface-lowest border border-outline-variant/30 rounded-md p-4 shadow-sm">
            <p className="text-xs font-label text-gray-500 uppercase tracking-wider mb-1">Tổng giao dịch</p>
            <p className="text-2xl font-sans font-bold text-gray-900">{pagination.total.toLocaleString('vi-VN')}</p>
          </div>
          <div className="bg-surface-lowest border border-primary/20 rounded-md p-4 shadow-sm">
            <p className="text-xs font-label text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <TrendingUp size={12} /> Cộng điểm
            </p>
            <p className="text-2xl font-sans font-bold text-primary">{logs.filter((l) => l.amount > 0).length}</p>
            <p className="text-xs text-gray-500 mt-0.5">trên trang này</p>
          </div>
          <div className="bg-surface-lowest border border-error/20 rounded-md p-4 shadow-sm">
            <p className="text-xs font-label text-error uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <TrendingDown size={12} /> Trừ điểm
            </p>
            <p className="text-2xl font-sans font-bold text-error">{logs.filter((l) => l.amount < 0).length}</p>
            <p className="text-xs text-gray-500 mt-0.5">trên trang này</p>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={logs}
        rowKey={(log) => log._id}
        loading={loading}
        error={error}
        emptyMessage={userIdFilter ? 'Không tìm thấy lịch sử điểm cho User ID này.' : 'Chưa có lịch sử giao dịch điểm nào.'}
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onRowClick={setSelectedLog}
        className="rounded-md overflow-visible relative"
        tableClassName="min-h-100"
        headerClassName="bg-surface/50 font-label text-xs uppercase text-gray-500"
        bodyClassName="divide-outline-variant/20 text-sm"
        rowClassName="hover:bg-primary/5 transition-colors cursor-pointer"
      />

      {selectedLog && (
        <PointLogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
          formatDateTime={formatDateTime}
        />
      )}
    </div>
  );
}
