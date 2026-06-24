'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
  X,
  Clock,
  Zap,
  MessageSquare,
  Hash,
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

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 90 ? 'bg-green-500' : score >= 70 ? 'bg-amber-400' : 'bg-red-500';
  const textColor =
    score >= 90
      ? 'text-green-600 dark:text-green-400'
      : score >= 70
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400';

  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Trust Score
        </span>
        <span className={`text-2xl font-bold ${textColor}`}>
          {score}
          <span className="text-sm font-normal text-gray-400 dark:text-gray-500">
            /100
          </span>
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-600">
        <span>0</span>
        <span className="text-red-400">70 (từ chối)</span>
        <span className="text-green-500">90 (duyệt)</span>
        <span>100</span>
      </div>
    </div>
  );
}

function ModerationLogDetailModal({
  log,
  onClose,
}: {
  log: IAIModerationLog;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const title = log.postId?.title ?? log.postTitle;
  const formattedDate = new Date(log.createdAt).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
              Chi tiết kiểm duyệt AI
            </p>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight wrap-break-word">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 mt-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Score bar */}
          <ScoreBar score={log.trustScore} />

          {/* Decision + Trigger row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                <Zap className="w-3 h-3" />
                Quyết định
              </div>
              <div className="pt-0.5">
                <DecisionBadge decision={log.decision} />
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                <Hash className="w-3 h-3" />
                Nguồn kích hoạt
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 pt-0.5">
                {TRIGGER_LABEL[log.trigger]}
              </p>
            </div>
          </div>

          {/* Reason */}
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              <MessageSquare className="w-3 h-3" />
              Lý do từ AI
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {log.reason || '(Không có lý do cụ thể)'}
            </p>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
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
  const [selectedLog, setSelectedLog] = useState<IAIModerationLog | null>(null);

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
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
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
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium max-w-xs">
                      <span className="block truncate group-hover:text-primary transition-colors">
                        {log.postId?.title ?? log.postTitle}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-base font-bold ${
                          log.trustScore >= 90
                            ? 'text-green-600 dark:text-green-400'
                            : log.trustScore >= 70
                              ? 'text-amber-500 dark:text-amber-400'
                              : 'text-red-500 dark:text-red-400'
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
                    <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-xs">
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

            {/* Hint */}
            <p className="px-4 py-2.5 text-[11px] text-gray-400 dark:text-gray-600 border-t border-gray-50 dark:border-gray-800">
              Bấm vào hàng để xem chi tiết lý do kiểm duyệt
            </p>
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

      {/* Detail Modal */}
      {selectedLog && (
        <ModerationLogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}
