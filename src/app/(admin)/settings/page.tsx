'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  CheckCircle,
  Trash2,
  Clock,
  AlertTriangle,
  Brain,
  Play,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  fetchSystemConfig,
  updateSoftDeleteConfig,
  updateAIModerationConfig,
  triggerAIModerationNow,
  type ISoftDeleteConfig,
  type GracePeriodDays,
  type CleanupSchedule,
  type IAIModerationConfig,
  type AIModerationInterval,
  type IBatchStats,
} from '@/lib/configApi';
import { triggerCleanupNow } from '@/lib/trashApi';
import {
  fetchAIModerationLogs,
  type IAIModerationLog,
  type ModerationDecision,
  type ModerationTrigger,
} from '@/lib/aiLogApi';

const DEFAULT_SOFT_DELETE: ISoftDeleteConfig = {
  gracePeriodDays: 30,
  cleanupSchedule: 'BOTH',
};

const DEFAULT_AI_MODERATION: IAIModerationConfig = {
  enabled: false,
  intervalHours: 6,
  trustScoreThresholds: { reject: 50, approve: 70 },
};

const TRIGGER_LABEL: Record<ModerationTrigger, string> = {
  ON_CREATE: 'Tạo bài',
  ON_UPDATE: 'Cập nhật',
  BATCH_SCHEDULER: 'Lịch tự động',
  MANUAL_ADMIN: 'Thủ công',
};

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);

  const [softDelete, setSoftDelete] = useState<ISoftDeleteConfig>(DEFAULT_SOFT_DELETE);
  const [isSavingTrash, setIsSavingTrash] = useState(false);
  const [trashSavedAt, setTrashSavedAt] = useState<Date | null>(null);
  const [trashError, setTrashError] = useState<string | null>(null);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);

  const [aiModeration, setAiModeration] = useState<IAIModerationConfig>(DEFAULT_AI_MODERATION);
  const [isSavingAI, setIsSavingAI] = useState(false);
  const [aiSavedAt, setAiSavedAt] = useState<Date | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isRunningAI, setIsRunningAI] = useState(false);
  const [aiRunResult, setAiRunResult] = useState<IBatchStats | null>(null);
  const [aiLogs, setAiLogs] = useState<IAIModerationLog[]>([]);
  const [aiLogPage, setAiLogPage] = useState(1);
  const [aiLogTotalPages, setAiLogTotalPages] = useState(0);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const refreshLogs = async (page: number) => {
    setIsLoadingLogs(true);
    try {
      const res = await fetchAIModerationLogs(page, 10);
      setAiLogs(res.data);
      setAiLogTotalPages(res.pagination.totalPages);
    } catch {
      // silently fail — log table is non-critical
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchSystemConfig();
        if (res.data) {
          if (res.data.softDelete) setSoftDelete(res.data.softDelete);
          if (res.data.aiModeration) setAiModeration(res.data.aiModeration);
        }
      } catch {
        // silently fail — each card has its own error handling
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    refreshLogs(aiLogPage);
  }, [aiLogPage]);

  const handleSaveTrash = async () => {
    setTrashError(null);
    setIsSavingTrash(true);
    try {
      await updateSoftDeleteConfig({
        gracePeriodDays: softDelete.gracePeriodDays,
        cleanupSchedule: softDelete.cleanupSchedule,
      });
      setTrashSavedAt(new Date());
    } catch {
      setTrashError('Lưu cấu hình thùng rác thất bại. Vui lòng thử lại.');
    } finally {
      setIsSavingTrash(false);
    }
  };

  const handleCleanupNow = async () => {
    const confirmed = confirm(
      'Dọn dẹp ngay sẽ xóa vĩnh viễn tất cả dữ liệu trong thùng rác quá thời hạn. Tiếp tục?'
    );
    if (!confirmed) return;
    setIsCleaningUp(true);
    setCleanupResult(null);
    try {
      const res = await triggerCleanupNow();
      const total = res.data.reduce((sum, r) => sum + r.purgedCount, 0);
      setCleanupResult(`Hoàn tất — đã xóa vĩnh viễn ${total} bản ghi.`);
    } catch {
      setCleanupResult('Dọn dẹp thất bại. Vui lòng thử lại.');
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleSaveAI = async () => {
    setAiError(null);
    const { reject, approve } = aiModeration.trustScoreThresholds;
    if (reject >= approve) {
      setAiError('Ngưỡng từ chối phải nhỏ hơn ngưỡng duyệt tự động.');
      return;
    }
    setIsSavingAI(true);
    try {
      const res = await updateAIModerationConfig({
        enabled: aiModeration.enabled,
        intervalHours: aiModeration.intervalHours,
        trustScoreThresholds: aiModeration.trustScoreThresholds,
      });
      if (res.data.aiModeration) setAiModeration(res.data.aiModeration);
      setAiSavedAt(new Date());
    } catch {
      setAiError('Lưu cấu hình AI thất bại. Vui lòng thử lại.');
    } finally {
      setIsSavingAI(false);
    }
  };

  const handleRunAI = async () => {
    setIsRunningAI(true);
    setAiRunResult(null);
    setAiError(null);
    try {
      const res = await triggerAIModerationNow();
      setAiRunResult(res.data);
      setAiLogPage(1);
      await refreshLogs(1);
      const configRes = await fetchSystemConfig();
      if (configRes.data?.aiModeration) setAiModeration(configRes.data.aiModeration);
    } catch {
      setAiError('Chạy AI thất bại. Vui lòng thử lại.');
    } finally {
      setIsRunningAI(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <p className="text-sm text-gray-500">
            Cấu hình thùng rác và AI kiểm duyệt bài đăng
          </p>
        </div>
      </div>

      {/* Soft Delete Config Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <Trash2 className="w-5 h-5 text-error" />
          <div>
            <h2 className="font-semibold text-gray-900">Cấu hình Thùng Rác</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Quản lý thời gian lưu dữ liệu đã xóa và lịch dọn dẹp tự động
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Grace Period */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Thời gian lưu trong thùng rác
            </label>
            <div className="flex gap-3">
              {([7, 30] as GracePeriodDays[]).map((days) => (
                <button
                  key={days}
                  onClick={() =>
                    setSoftDelete((prev) => ({ ...prev, gracePeriodDays: days }))
                  }
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition ${
                    softDelete.gracePeriodDays === days
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {days} ngày
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Dữ liệu bị xóa sẽ tự động purge vĩnh viễn sau thời gian này.
            </p>
          </div>

          {/* Cleanup Schedule */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Lịch dọn dẹp tự động
            </label>
            <div className="flex gap-3">
              {(
                [
                  { value: 'WEEKLY', label: 'Hàng tuần', sub: 'CN 3:00 AM' },
                  { value: 'MONTHLY', label: 'Hàng tháng', sub: 'Ngày 1 hàng tháng' },
                  { value: 'BOTH', label: 'Cả hai', sub: 'Tuần + tháng' },
                ] as { value: CleanupSchedule; label: string; sub: string }[]
              ).map(({ value, label, sub }) => (
                <button
                  key={value}
                  onClick={() =>
                    setSoftDelete((prev) => ({ ...prev, cleanupSchedule: value }))
                  }
                  className={`flex-1 py-3 px-2 rounded-xl border-2 text-center transition ${
                    softDelete.cleanupSchedule === value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-semibold">{label}</div>
                  <div className="text-[10px] mt-0.5 opacity-70">{sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Last Cleanup Info */}
          {softDelete.lastCleanupAt && (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <span>
                Lần dọn dẹp gần nhất:{' '}
                <span className="font-semibold">
                  {new Date(softDelete.lastCleanupAt).toLocaleString('vi-VN')}
                </span>
                {softDelete.lastCleanupCount !== undefined && (
                  <span className="ml-2 text-gray-400">
                    — đã xóa {softDelete.lastCleanupCount} bản ghi
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Trash error */}
          {trashError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {trashError}
            </div>
          )}

          {/* Trash save success */}
          {trashSavedAt && !trashError && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Đã lưu lúc {trashSavedAt.toLocaleTimeString('vi-VN')}
            </div>
          )}

          {/* Cleanup result */}
          {cleanupResult && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {cleanupResult}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          {/* Cleanup now */}
          <button
            onClick={handleCleanupNow}
            disabled={isCleaningUp}
            className="flex items-center gap-2 px-4 py-2.5 bg-error/10 text-error rounded-xl font-semibold text-sm hover:bg-error/20 active:scale-95 transition disabled:opacity-60"
          >
            {isCleaningUp ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Dọn dẹp ngay
          </button>

          {/* Save trash config */}
          <button
            onClick={handleSaveTrash}
            disabled={isSavingTrash}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 active:scale-95 transition disabled:opacity-60"
          >
            {isSavingTrash ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Lưu cấu hình
          </button>
        </div>
      </div>

      {/* AI Moderation Config Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <Brain className="w-5 h-5 text-purple-500" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900">AI Kiểm Duyệt Bài Đăng</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 uppercase tracking-wide">
                Gemini
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Tự động phân tích và duyệt bài đăng bằng AI theo lịch định sẵn
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Trạng thái
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setAiModeration((prev) => ({ ...prev, enabled: !prev.enabled }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  aiModeration.enabled ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    aiModeration.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-700">
                {aiModeration.enabled
                  ? 'Đã bật — AI đang hoạt động theo lịch'
                  : 'Đã tắt — AI không tự động chạy'}
              </span>
            </div>
          </div>

          {/* Interval */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tần suất kiểm tra tự động
            </label>
            <div className="flex gap-2 flex-wrap">
              {([1, 2, 6, 12, 24] as AIModerationInterval[]).map((h) => (
                <button
                  key={h}
                  onClick={() =>
                    setAiModeration((prev) => ({ ...prev, intervalHours: h }))
                  }
                  className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                    aiModeration.intervalHours === h
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Scheduler kiểm tra mỗi 30 phút và chạy AI khi đến interval đã cài.
            </p>
          </div>

          {/* Thresholds */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Ngưỡng quyết định (Trust Score 0–100)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs text-gray-500">
                  Ngưỡng từ chối{' '}
                  <span className="text-red-500 font-semibold">
                    (&lt; X → REJECTED)
                  </span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={aiModeration.trustScoreThresholds.reject}
                  onChange={(e) =>
                    setAiModeration((prev) => ({
                      ...prev,
                      trustScoreThresholds: {
                        ...prev.trustScoreThresholds,
                        reject: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs text-gray-500">
                  Ngưỡng duyệt tự động{' '}
                  <span className="text-green-600 font-semibold">
                    (≥ X → AVAILABLE)
                  </span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={aiModeration.trustScoreThresholds.approve}
                  onChange={(e) =>
                    setAiModeration((prev) => ({
                      ...prev,
                      trustScoreThresholds: {
                        ...prev.trustScoreThresholds,
                        approve: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Bài có score nằm giữa hai ngưỡng sẽ được giữ lại để admin duyệt thủ công.
            </p>
          </div>

          {/* AI Error */}
          {aiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {aiError}
            </div>
          )}

          {/* AI Save success */}
          {aiSavedAt && !aiError && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Đã lưu lúc {aiSavedAt.toLocaleTimeString('vi-VN')}
            </div>
          )}

          {/* Last run stats */}
          {(aiModeration.lastRunAt || aiRunResult) && (
            <div className="space-y-3">
              {aiModeration.lastRunAt && (
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>
                    Lần chạy gần nhất:{' '}
                    <span className="font-semibold">
                      {new Date(aiModeration.lastRunAt).toLocaleString('vi-VN')}
                    </span>
                  </span>
                </div>
              )}
              {(aiRunResult ?? aiModeration.lastRunStats) && (
                <div className="grid grid-cols-4 gap-2">
                  {(
                    [
                      { label: 'Đã xử lý', key: 'processed', color: 'text-gray-700 bg-gray-50 border-gray-200' },
                      { label: 'Đã duyệt', key: 'approved', color: 'text-green-700 bg-green-50 border-green-200' },
                      { label: 'Từ chối', key: 'rejected', color: 'text-red-700 bg-red-50 border-red-200' },
                      { label: 'Chờ manual', key: 'pendingManual', color: 'text-amber-700 bg-amber-50 border-amber-200' },
                    ] as { label: string; key: keyof IBatchStats; color: string }[]
                  ).map(({ label, key, color }) => {
                    const stats = aiRunResult ?? aiModeration.lastRunStats;
                    return (
                      <div
                        key={key}
                        className={`rounded-xl border px-3 py-2.5 text-center ${color}`}
                      >
                        <div className="text-lg font-bold">{stats?.[key] ?? 0}</div>
                        <div className="text-[10px] font-medium mt-0.5">{label}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Log table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Lịch sử quyết định AI
              </label>
              {isLoadingLogs && (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-gray-400" />
              )}
            </div>

            {aiLogs.length === 0 && !isLoadingLogs ? (
              <div className="text-center py-8 text-sm text-gray-400 border border-gray-100 rounded-xl">
                Chưa có lịch sử kiểm duyệt
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-3 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wider w-[38%]">
                        Bài đăng
                      </th>
                      <th className="px-3 py-2.5 text-center font-semibold text-gray-500 uppercase tracking-wider w-[10%]">
                        Score
                      </th>
                      <th className="px-3 py-2.5 text-center font-semibold text-gray-500 uppercase tracking-wider w-[20%]">
                        Kết quả
                      </th>
                      <th className="px-3 py-2.5 text-center font-semibold text-gray-500 uppercase tracking-wider w-[17%]">
                        Nguồn
                      </th>
                      <th className="px-3 py-2.5 text-right font-semibold text-gray-500 uppercase tracking-wider w-[15%]">
                        Thời gian
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {aiLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-3 py-2.5 text-gray-700 max-w-0">
                          <span className="block truncate">
                            {log.postId?.title ?? log.postTitle}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`font-bold ${
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
                        <td className="px-3 py-2.5 text-center">
                          <DecisionBadge decision={log.decision} />
                        </td>
                        <td className="px-3 py-2.5 text-center text-gray-500">
                          {TRIGGER_LABEL[log.trigger]}
                        </td>
                        <td className="px-3 py-2.5 text-right text-gray-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
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

            {/* Pagination */}
            {aiLogTotalPages > 1 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setAiLogPage((p) => Math.max(p - 1, 1))}
                  disabled={aiLogPage === 1 || isLoadingLogs}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Trước
                </button>
                <span className="text-xs text-gray-500">
                  Trang {aiLogPage} / {aiLogTotalPages}
                </span>
                <button
                  onClick={() => setAiLogPage((p) => Math.min(p + 1, aiLogTotalPages))}
                  disabled={aiLogPage === aiLogTotalPages || isLoadingLogs}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Sau
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          {/* Run now */}
          <button
            onClick={handleRunAI}
            disabled={isRunningAI}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-500/20 active:scale-95 transition disabled:opacity-60"
          >
            {isRunningAI ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunningAI ? 'Đang chạy...' : 'Chạy ngay'}
          </button>

          {/* Save AI config */}
          <button
            onClick={handleSaveAI}
            disabled={isSavingAI}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 active:scale-95 transition disabled:opacity-60"
          >
            {isSavingAI ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  );
}

function DecisionBadge({ decision }: { decision: ModerationDecision }) {
  if (decision === 'APPROVED') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
        Đã duyệt
      </span>
    );
  }
  if (decision === 'REJECTED') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">
        Từ chối
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
      Chờ duyệt
    </span>
  );
}
