'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  ExternalLink,
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
import { fetchAdminPosts } from '@/lib/postApi';

const DEFAULT_SOFT_DELETE: ISoftDeleteConfig = {
  gracePeriodDays: 30,
  cleanupSchedule: 'BOTH',
};

const DEFAULT_AI_MODERATION: IAIModerationConfig = {
  enabled: false,
  intervalHours: 6,
  trustScoreThresholds: { reject: 70, approve: 90 },
};

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);

  const [softDelete, setSoftDelete] =
    useState<ISoftDeleteConfig>(DEFAULT_SOFT_DELETE);
  const [isSavingTrash, setIsSavingTrash] = useState(false);
  const [trashSavedAt, setTrashSavedAt] = useState<Date | null>(null);
  const [trashError, setTrashError] = useState<string | null>(null);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);

  const [aiModeration, setAiModeration] = useState<IAIModerationConfig>(
    DEFAULT_AI_MODERATION
  );
  const [isSavingAI, setIsSavingAI] = useState(false);
  const [aiSavedAt, setAiSavedAt] = useState<Date | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isRunningAI, setIsRunningAI] = useState(false);
  const [aiRunResult, setAiRunResult] = useState<IBatchStats | null>(null);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [pendingManualCount, setPendingManualCount] = useState(0);

  const refreshPendingCounts = async () => {
    try {
      const [reviewRes, manualRes] = await Promise.all([
        fetchAdminPosts({ status: 'PENDING_REVIEW', limit: 1 }),
        fetchAdminPosts({ status: 'PENDING_MANUAL', limit: 1 }),
      ]);
      setPendingReviewCount(reviewRes.pagination.total);
      setPendingManualCount(manualRes.pagination.total);
    } catch {
      // ignore
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
    refreshPendingCounts();
  }, []);

  useEffect(() => {
    if (!trashSavedAt) return;
    const t = setTimeout(() => setTrashSavedAt(null), 3000);
    return () => clearTimeout(t);
  }, [trashSavedAt]);

  useEffect(() => {
    if (!aiSavedAt) return;
    const t = setTimeout(() => setAiSavedAt(null), 3000);
    return () => clearTimeout(t);
  }, [aiSavedAt]);

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
      const configRes = await fetchSystemConfig();
      if (configRes.data?.aiModeration)
        setAiModeration(configRes.data.aiModeration);
      await refreshPendingCounts();
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Cài đặt hệ thống
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cấu hình thùng rác và AI kiểm duyệt bài đăng
          </p>
        </div>
      </div>

      {/* Soft Delete Config Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <Trash2 className="w-5 h-5 text-error" />
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              Cấu hình Thùng Rác
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Quản lý thời gian lưu dữ liệu đã xóa và lịch dọn dẹp tự động
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Grace Period */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Thời gian lưu trong thùng rác
            </label>
            <div className="flex gap-3">
              {([7, 30] as GracePeriodDays[]).map((days) => (
                <button
                  key={days}
                  onClick={() =>
                    setSoftDelete((prev) => ({
                      ...prev,
                      gracePeriodDays: days,
                    }))
                  }
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition ${
                    softDelete.gracePeriodDays === days
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {days} ngày
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Dữ liệu bị xóa sẽ tự động purge vĩnh viễn sau thời gian này.
            </p>
          </div>

          {/* Cleanup Schedule */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Lịch dọn dẹp tự động
            </label>
            <div className="flex gap-3">
              {(
                [
                  { value: 'WEEKLY', label: 'Hàng tuần', sub: 'CN 3:00 AM' },
                  {
                    value: 'MONTHLY',
                    label: 'Hàng tháng',
                    sub: 'Ngày 1 hàng tháng',
                  },
                  { value: 'BOTH', label: 'Cả hai', sub: 'Tuần + tháng' },
                ] as { value: CleanupSchedule; label: string; sub: string }[]
              ).map(({ value, label, sub }) => (
                <button
                  key={value}
                  onClick={() =>
                    setSoftDelete((prev) => ({
                      ...prev,
                      cleanupSchedule: value,
                    }))
                  }
                  className={`flex-1 py-3 px-2 rounded-xl border-2 text-center transition ${
                    softDelete.cleanupSchedule === value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
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
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
              <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              <span>
                Lần dọn dẹp gần nhất:{' '}
                <span className="font-semibold">
                  {new Date(softDelete.lastCleanupAt).toLocaleString('vi-VN')}
                </span>
                {softDelete.lastCleanupCount !== undefined && (
                  <span className="ml-2 text-gray-400 dark:text-gray-500">
                    — đã xóa {softDelete.lastCleanupCount} bản ghi
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Trash error */}
          {trashError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {trashError}
            </div>
          )}

          {/* Trash save success */}
          {trashSavedAt && !trashError && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-xl px-4 py-3 text-sm text-green-700 dark:text-green-400">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Đã lưu lúc {trashSavedAt.toLocaleTimeString('vi-VN')}
            </div>
          )}

          {/* Cleanup result */}
          {cleanupResult && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-yellow-900/20 border border-amber-200 dark:border-yellow-800/30 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-yellow-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {cleanupResult}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <Brain className="w-5 h-5 text-purple-500" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                AI Kiểm Duyệt Bài Đăng
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 uppercase tracking-wide">
                GPT-4o-mini
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Tự động phân tích và duyệt bài đăng bằng AI theo lịch định sẵn
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Trạng thái
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setAiModeration((prev) => ({
                    ...prev,
                    enabled: !prev.enabled,
                  }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  aiModeration.enabled
                    ? 'bg-primary'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    aiModeration.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {aiModeration.enabled
                  ? 'Đã bật — AI đang hoạt động theo lịch'
                  : 'Đã tắt — AI không tự động chạy'}
              </span>
            </div>
          </div>

          {/* Interval + Run Now */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Scheduler kiểm tra mỗi 30 phút và chạy AI khi đến interval đã cài.
            </p>
          </div>

          {/* Thresholds */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Ngưỡng quyết định (Trust Score 0–100)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs text-gray-500 dark:text-gray-400">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs text-gray-500 dark:text-gray-400">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Bài có score nằm giữa hai ngưỡng sẽ được giữ lại để admin duyệt
              thủ công.
            </p>
          </div>

          {/* AI Error */}
          {aiError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {aiError}
            </div>
          )}

          {/* AI Save success */}
          {aiSavedAt && !aiError && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-xl px-4 py-3 text-sm text-green-700 dark:text-green-400">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Đã lưu lúc {aiSavedAt.toLocaleTimeString('vi-VN')}
            </div>
          )}

          {/* Last run stats */}
          {(aiModeration.lastRunAt || aiRunResult) && (
            <div className="space-y-3">
              {aiModeration.lastRunAt && (
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
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
                      {
                        label: 'Đã xử lý',
                        key: 'processed',
                        color:
                          'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
                      },
                      {
                        label: 'Đã duyệt',
                        key: 'approved',
                        color:
                          'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30',
                      },
                      {
                        label: 'Từ chối',
                        key: 'rejected',
                        color:
                          'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30',
                      },
                      {
                        label: 'Chờ manual',
                        key: 'pendingManual',
                        color:
                          'text-amber-700 dark:text-yellow-400 bg-amber-50 dark:bg-yellow-900/20 border-amber-200 dark:border-yellow-800/30',
                      },
                    ] as {
                      label: string;
                      key: keyof IBatchStats;
                      color: string;
                    }[]
                  ).map(({ label, key, color }) => {
                    const stats = aiRunResult ?? aiModeration.lastRunStats;
                    return (
                      <div
                        key={key}
                        className={`rounded-xl border px-3 py-2.5 text-center ${color}`}
                      >
                        <div className="text-lg font-bold">
                          {stats?.[key] ?? 0}
                        </div>
                        <div className="text-[10px] font-medium mt-0.5">
                          {label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PENDING_REVIEW callout — bài chưa qua AI */}
          {pendingReviewCount > 0 && (
            <Link
              href="/posts?status=PENDING_REVIEW"
              className="flex items-center justify-between gap-3 rounded-xl border border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 transition hover:bg-blue-100 dark:hover:bg-blue-900/30"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                  {pendingReviewCount} bài chờ AI kiểm duyệt
                </span>
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Xem danh sách →
              </span>
            </Link>
          )}

          {/* PENDING_MANUAL callout — bài AI đề nghị duyệt thủ công */}
          {pendingManualCount > 0 && (
            <Link
              href="/posts?status=PENDING_MANUAL"
              className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 dark:border-yellow-800/30 bg-amber-50 dark:bg-yellow-900/20 px-4 py-3 transition hover:bg-amber-100 dark:hover:bg-yellow-900/30"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800 dark:text-yellow-300">
                  {pendingManualCount} bài chờ duyệt thủ công
                </span>
              </div>
              <span className="text-xs font-semibold text-amber-600 dark:text-yellow-400">
                Duyệt / Từ chối →
              </span>
            </Link>
          )}

          {/* Link to full log page */}
          <Link
            href="/moderation-logs"
            className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Xem lịch sử kiểm duyệt đầy đủ →
          </Link>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
          <button
            onClick={handleRunAI}
            disabled={isRunningAI}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/30 rounded-xl font-semibold text-sm hover:bg-orange-100 dark:hover:bg-orange-900/30 active:scale-95 transition disabled:opacity-60"
          >
            {isRunningAI ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunningAI ? 'Đang chạy AI...' : 'Chạy ngay'}
          </button>
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
