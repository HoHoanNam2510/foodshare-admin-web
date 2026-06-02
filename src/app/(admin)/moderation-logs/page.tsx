'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
} from 'lucide-react';
import {
  fetchAIModerationLogs,
  type IAIModerationLog,
  type ModerationDecision,
  type ModerationTrigger,
} from '@/lib/aiLogApi';
import PageHeader from '@/components/ui/PageHeader';

const TRIGGER_LABEL: Record<ModerationTrigger, string> = {
  ON_CREATE: 'Tạo bài',
  ON_UPDATE: 'Cập nhật',
  BATCH_SCHEDULER: 'Lịch tự động',
  MANUAL_ADMIN: 'Thủ công',
};

const PAGE_LIMIT = 20;

function DecisionBadge({ decision }: { decision: ModerationDecision }) {
  if (decision === 'APPROVED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
        Đã duyệt
      </span>
    );
  }
  if (decision === 'REJECTED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">
        Từ chối
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
      Chờ duyệt
    </span>
  );
}

export default function ModerationLogsPage() {
  const [logs, setLogs] = useState<IAIModerationLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [decisionFilter, setDecisionFilter] = useState<
    ModerationDecision | 'ALL'
  >('ALL');

  const loadLogs = useCallback(
    async (p: number, filter: ModerationDecision | 'ALL') => {
      setIsLoading(true);
      try {
        const res = await fetchAIModerationLogs(p, PAGE_LIMIT, filter);
        setLogs(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadLogs(page, decisionFilter);
  }, [page, decisionFilter, loadLogs]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Lịch Sử Kiểm Duyệt AI"
        subtitle="Toàn bộ quyết định AI đối với bài đăng trên hệ thống"
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">
            Lọc theo kết quả:
          </span>
          {(
            [
              { value: 'ALL', label: 'Tất cả' },
              { value: 'APPROVED', label: 'Đã duyệt' },
              { value: 'REJECTED', label: 'Từ chối' },
              { value: 'PENDING_MANUAL', label: 'Chờ duyệt' },
            ] as { value: ModerationDecision | 'ALL'; label: string }[]
          ).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => {
                setDecisionFilter(value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                decisionFilter === value
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {total > 0 && (
            <span className="text-sm text-gray-400 dark:text-gray-500">
              {total} bản ghi
            </span>
          )}
          <button
            onClick={() => loadLogs(page, decisionFilter)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
            />
            Tải lại
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-sm text-gray-400">
            <Brain className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            Chưa có lịch sử kiểm duyệt
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                    Bài đăng
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider w-20">
                    Score
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider w-32">
                    Kết quả
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                    Lý do
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider w-28">
                    Nguồn
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider w-36">
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium max-w-xs">
                      <span className="block truncate">
                        {log.postId?.title ?? log.postTitle}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-base font-bold ${
                          log.trustScore >= 70
                            ? 'text-green-600'
                            : log.trustScore < 50
                              ? 'text-red-500'
                              : 'text-amber-600'
                        }`}
                      >
                        {log.trustScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DecisionBadge decision={log.decision} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-xs">
                      <span className="block truncate">
                        {log.reason || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">
                      {TRIGGER_LABEL[log.trigger]}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1 || isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Trước
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Sau
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
