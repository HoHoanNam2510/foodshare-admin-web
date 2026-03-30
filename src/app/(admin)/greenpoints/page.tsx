'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Eye,
  RefreshCw,
  Leaf,
  ArrowUpDown,
} from 'lucide-react';
import PointLogDetailModal from '@/components/features/greenpoints/PointLogDetailModal';
import {
  IPointLog,
  PaginationMeta,
  fetchAdminPointLogs,
} from '@/lib/greenPointApi';

// --- HELPER FORMATS ---
const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getAmountBadge = (amount: number): React.ReactNode => {
  const isPositive = amount > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-bold border ${
        isPositive
          ? 'bg-green-50 text-primary border-primary/20'
          : 'bg-red-50 text-error border-error/20'
      }`}
    >
      {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
      {isPositive ? '+' : ''}
      {amount}
    </span>
  );
};

const LIMIT = 15;

export default function GreenPointsManagementPage() {
  const [logs, setLogs] = useState<IPointLog[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchUserId, setSearchUserId] = useState('');
  const [appliedUserId, setAppliedUserId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedLog, setSelectedLog] = useState<IPointLog | null>(null);

  const loadLogs = useCallback(async (page: number, userId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminPointLogs({
        userId: userId || undefined,
        page,
        limit: LIMIT,
      });
      setLogs(res.data);
      setPagination(res.pagination);
    } catch {
      setError('Không thể tải lịch sử điểm. Vui lòng kiểm tra kết nối.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs(currentPage, appliedUserId);
  }, [currentPage, appliedUserId, loadLogs]);

  const handleSearch = () => {
    setAppliedUserId(searchUserId.trim());
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-2xl font-sans font-bold text-gray-900 leading-tight flex items-center gap-3">
          <Leaf size={24} className="text-primary" />
          Quản Lý Green Points
        </h1>
        <p className="text-sm font-body text-gray-500 mt-1">
          Toàn bộ lịch sử biến động điểm xanh trên hệ thống — cộng thưởng, trừ
          phạt và đổi voucher
        </p>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-lowest p-4 rounded-md shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50 w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary/50 focus-within:-translate-y-0.5 transition-all">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Lọc theo User ID..."
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-transparent text-sm outline-none w-full font-body text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-md hover:bg-primary/90 transition-colors shrink-0"
          >
            Lọc
          </button>
          {appliedUserId && (
            <button
              onClick={() => {
                setSearchUserId('');
                setAppliedUserId('');
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-sm font-body text-gray-600 hover:bg-surface-container rounded-md transition-colors shrink-0 border border-outline-variant/50"
            >
              Xóa lọc
            </button>
          )}
        </div>

        <button
          onClick={() => loadLogs(currentPage, appliedUserId)}
          className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-md transition-colors border border-outline-variant/50 shrink-0"
          title="Làm mới"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* ── STATS SUMMARY ── */}
      {pagination && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface-lowest border border-outline-variant/30 rounded-md p-4 shadow-sm">
            <p className="text-xs font-label text-gray-500 uppercase tracking-wider mb-1">
              Tổng giao dịch
            </p>
            <p className="text-2xl font-sans font-bold text-gray-900">
              {pagination.total.toLocaleString('vi-VN')}
            </p>
          </div>
          <div className="bg-surface-lowest border border-primary/20 rounded-md p-4 shadow-sm">
            <p className="text-xs font-label text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <TrendingUp size={12} /> Cộng điểm
            </p>
            <p className="text-2xl font-sans font-bold text-primary">
              {logs.filter((l) => l.amount > 0).length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">trên trang này</p>
          </div>
          <div className="bg-surface-lowest border border-error/20 rounded-md p-4 shadow-sm">
            <p className="text-xs font-label text-error uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <TrendingDown size={12} /> Trừ điểm
            </p>
            <p className="text-2xl font-sans font-bold text-error">
              {logs.filter((l) => l.amount < 0).length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">trên trang này</p>
          </div>
        </div>
      )}

      {/* ── DATA TABLE ── */}
      <div className="bg-surface-lowest rounded-md shadow-soft border border-outline-variant/30 overflow-visible relative">
        <div className="overflow-x-auto min-h-100">
          {loading ? (
            <div className="flex items-center justify-center min-h-100">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <RefreshCw size={32} className="animate-spin" />
                <p className="font-body text-sm">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-100">
              <div className="flex flex-col items-center gap-3 text-error">
                <p className="font-body text-sm">{error}</p>
                <button
                  onClick={() => loadLogs(currentPage, appliedUserId)}
                  className="px-4 py-2 text-sm font-semibold bg-error/10 text-error rounded-md hover:bg-error hover:text-white transition-colors"
                >
                  Thử lại
                </button>
              </div>
            </div>
          ) : (
            <table className="w-full text-left font-body">
              <thead className="bg-surface/50 border-b border-outline-variant/30 font-label text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold rounded-tl-md">
                    Người dùng
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    <span className="flex items-center gap-1">
                      <ArrowUpDown size={12} /> Biến động
                    </span>
                  </th>
                  <th className="px-5 py-4 font-semibold">Lý do</th>
                  <th className="px-5 py-4 font-semibold">Tham chiếu</th>
                  <th className="px-5 py-4 font-semibold rounded-tr-md">
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr
                      key={log._id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      {/* Người dùng */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary-container to-secondary-container flex items-center justify-center text-white font-sans text-xs font-bold shrink-0">
                            {log.userId?.fullName?.charAt(0)?.toUpperCase() ??
                              '?'}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-gray-900 line-clamp-1">
                              {log.userId?.fullName || 'N/A'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {log.userId?.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Biến động */}
                      <td className="px-5 py-4">
                        {getAmountBadge(log.amount)}
                      </td>

                      {/* Lý do */}
                      <td className="px-5 py-4 max-w-xs">
                        <span className="text-gray-800 line-clamp-2">
                          {log.reason}
                        </span>
                      </td>

                      {/* Tham chiếu */}
                      <td className="px-5 py-4">
                        {log.referenceId ? (
                          <span className="font-mono text-xs text-gray-500 bg-surface-container px-2 py-1 rounded-md">
                            {log.referenceId.slice(-8)}…
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Thời gian */}
                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Leaf size={40} strokeWidth={1} />
                        <p className="font-body text-sm">
                          {appliedUserId
                            ? 'Không tìm thấy lịch sử điểm cho User ID này.'
                            : 'Chưa có lịch sử giao dịch điểm nào.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ── PAGINATION ── */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-outline-variant/30">
            <p className="text-sm font-body text-gray-500">
              Hiển thị{' '}
              <span className="font-semibold text-gray-900">
                {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              trong{' '}
              <span className="font-semibold text-gray-900">
                {pagination.total.toLocaleString('vi-VN')}
              </span>{' '}
              giao dịch
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-body rounded-md border border-outline-variant/50 text-gray-600 hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === pagination.totalPages ||
                    Math.abs(p - currentPage) <= 1
                )
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (
                    idx > 0 &&
                    typeof arr[idx - 1] === 'number' &&
                    (p as number) - (arr[idx - 1] as number) > 1
                  ) {
                    acc.push('...');
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-gray-400"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`px-3 py-1.5 text-sm font-body rounded-md transition-colors ${
                        currentPage === p
                          ? 'bg-primary text-white font-semibold'
                          : 'border border-outline-variant/50 text-gray-600 hover:bg-primary/5'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1.5 text-sm font-body rounded-md border border-outline-variant/50 text-gray-600 hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Tiếp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
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
