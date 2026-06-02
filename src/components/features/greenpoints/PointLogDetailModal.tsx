'use client';

import {
  X,
  TrendingUp,
  TrendingDown,
  User,
  Link,
  Calendar,
} from 'lucide-react';
import { IPointLog } from '@/lib/greenPointApi';
import UserAvatar from '@/components/ui/UserAvatar';

interface PointLogDetailModalProps {
  log: IPointLog;
  onClose: () => void;
  formatDateTime: (dateStr: string) => string;
}

export default function PointLogDetailModal({
  log,
  onClose,
  formatDateTime,
}: PointLogDetailModalProps) {
  const isPositive = log.amount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-surface-lowest dark:bg-gray-900 w-full max-w-lg rounded-md shadow-floating overflow-hidden animate-in slide-in-from-bottom-4 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 dark:border-gray-700 bg-surface/50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-lg font-sans font-bold text-gray-900 dark:text-gray-100">
              Chi tiết giao dịch điểm
            </h2>
            <p className="text-xs font-body text-gray-500 dark:text-gray-400 mt-0.5">
              ID: #{log._id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-surface-container dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 font-body">
          {/* Biến động lớn */}
          <div
            className={`flex items-center justify-center gap-3 p-6 rounded-md mb-6 ${
              isPositive
                ? 'bg-green-50 dark:bg-green-900/20 border border-primary/20 dark:border-green-800/30'
                : 'bg-red-50 dark:bg-red-900/20 border border-error/20 dark:border-red-800/30'
            }`}
          >
            <div
              className={`p-3 rounded-full ${
                isPositive ? 'bg-primary/10' : 'bg-error/10'
              }`}
            >
              {isPositive ? (
                <TrendingUp size={28} className="text-primary" />
              ) : (
                <TrendingDown size={28} className="text-error" />
              )}
            </div>
            <div className="text-center">
              <p className="text-xs font-label text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Biến động điểm
              </p>
              <p
                className={`text-3xl font-sans font-bold ${
                  isPositive ? 'text-primary' : 'text-error'
                }`}
              >
                {isPositive ? '+' : ''}
                {log.amount} điểm
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-4 p-4 bg-surface dark:bg-gray-800 rounded-md border border-outline-variant/30 dark:border-gray-700">
            {/* User */}
            <div className="flex items-center gap-3">
              <UserAvatar
                fullName={log.userId?.fullName || '?'}
                avatar={log.userId?.avatar}
                size="lg"
              />
              <div>
                <p className="text-xs font-label text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-0.5">
                  <User size={11} /> Người dùng
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {log.userId?.fullName || 'N/A'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {log.userId?.email}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-label text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Lý do
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {log.reason}
              </p>
            </div>

            {log.referenceId && (
              <div>
                <p className="text-xs font-label text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Link size={11} /> Tham chiếu (ID)
                </p>
                <p className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-surface-container dark:bg-gray-700 px-2 py-1 rounded-md break-all">
                  {log.referenceId}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-label text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Calendar size={11} /> Thời gian
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {formatDateTime(log.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/30 dark:border-gray-700 bg-surface-lowest dark:bg-gray-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md font-body text-sm font-semibold text-gray-600 hover:bg-surface-container dark:hover:bg-gray-800 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
