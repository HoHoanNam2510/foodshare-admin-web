'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  MessageSquare,
  User,
  Paperclip,
  ExternalLink,
  CheckCircle,
  Loader2,
  PlayCircle,
  ImageIcon,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import UserAvatar from '@/components/ui/UserAvatar';
import { formatDateTime } from '@/lib/formatters';
import {
  assignFeedback,
  resolveFeedback,
  type IFeedback,
} from '@/lib/feedbackApi';

interface FeedbackDetailModalProps {
  feedback: IFeedback | null;
  onClose: () => void;
  onUpdated?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  CLOSED: 'Đã đóng',
};

const TYPE_LABELS: Record<string, string> = {
  BUG_REPORT: 'Báo lỗi ứng dụng',
  SUGGESTION: 'Góp ý',
};

const PRIORITY_STYLES: Record<string, string> = {
  CRITICAL:
    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-300 dark:border-red-800/50',
  HIGH: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/30',
  MEDIUM:
    'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/30',
  LOW: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
};

export default function FeedbackDetailModal({
  feedback,
  onClose,
  onUpdated,
}: FeedbackDetailModalProps) {
  const [adminReply, setAdminReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    setAdminReply('');
    setError(null);
  }, [feedback?._id]);

  if (!feedback) return null;

  const handleAssign = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await assignFeedback(feedback._id);
      onUpdated?.();
      onClose();
    } catch {
      setError('Tiếp nhận thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (adminReply.trim().length < 10) {
      setError('Phản hồi tối thiểu 10 ký tự.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await resolveFeedback(feedback._id, adminReply.trim());
      onUpdated?.();
      onClose();
    } catch {
      setError('Đóng ticket thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-surface-lowest dark:bg-gray-900 w-full max-w-4xl rounded-md shadow-floating overflow-hidden animate-in slide-in-from-bottom-4 fade-in flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 dark:border-gray-700 bg-surface/50 dark:bg-gray-800/50 shrink-0">
            <div>
              <h2 className="text-lg font-sans font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <MessageSquare size={18} className="text-primary" />
                Ticket #{feedback._id.slice(-8).toUpperCase()}
                <StatusBadge
                  status={feedback.status}
                  label={STATUS_LABELS[feedback.status] ?? feedback.status}
                />
              </h2>
              <p className="text-xs font-body text-gray-500 dark:text-gray-400 mt-0.5">
                Gửi lúc: {formatDateTime(feedback.createdAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-surface-container dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body — 2-column */}
          <div className="flex flex-1 overflow-hidden">
            {/* ── Left column: Info ── */}
            <div className="flex-1 overflow-y-auto p-6 border-r border-outline-variant/20 flex flex-col gap-5">
              {/* User info */}
              <div className="p-4 bg-surface-container/30 dark:bg-gray-800/30 rounded-md border border-outline-variant/30 dark:border-gray-700">
                <h3 className="text-xs font-label font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User size={13} /> Người gửi
                </h3>
                <div className="flex items-center gap-3">
                  <UserAvatar
                    fullName={feedback.userId.fullName}
                    avatar={feedback.userId.avatar}
                    size="lg"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-sans font-bold text-gray-900 dark:text-gray-100">
                      {feedback.userId.fullName}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {feedback.userId.email}
                    </span>
                    {feedback.userId.phoneNumber && (
                      <span className="text-xs text-gray-400">
                        {feedback.userId.phoneNumber}
                      </span>
                    )}
                    <StatusBadge
                      status={feedback.userId.role}
                      label={feedback.userId.role}
                      className="mt-1 self-start"
                    />
                  </div>
                </div>
              </div>

              {/* Type + Priority */}
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-xs text-gray-400 block mb-1">Loại</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                    {TYPE_LABELS[feedback.type] ?? feedback.type}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block mb-1">
                    Độ ưu tiên
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${PRIORITY_STYLES[feedback.priority] ?? PRIORITY_STYLES.LOW}`}
                  >
                    {feedback.priority}
                  </span>
                </div>
              </div>

              {/* Title + Content */}
              <div>
                <p className="text-xs font-label text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Tiêu đề
                </p>
                <p className="font-sans font-bold text-gray-900 dark:text-gray-100 text-base">
                  {feedback.title}
                </p>
              </div>
              <div>
                <p className="text-xs font-label text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Nội dung
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-surface/50 dark:bg-gray-800/50 p-4 rounded-md border border-outline-variant/20 whitespace-pre-wrap">
                  {feedback.content}
                </p>
              </div>

              {/* Attachments */}
              <div>
                <p className="text-xs font-label text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Paperclip size={13} /> Ảnh đính kèm (
                  {feedback.attachments.length})
                </p>
                {feedback.attachments.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {feedback.attachments.map((url, idx) => (
                      <button
                        key={`${url}-${idx}`}
                        onClick={() => setLightboxUrl(url)}
                        className="w-24 h-24 rounded-md overflow-hidden border border-outline-variant/30 dark:border-gray-700 hover:border-primary/50 hover:ring-2 hover:ring-primary/20 transition-all"
                      >
                        <Image
                          src={url}
                          alt={`attachment-${idx + 1}`}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic flex items-center gap-1.5">
                    <ImageIcon size={14} /> Không có ảnh đính kèm
                  </p>
                )}
              </div>

              {/* Related entity */}
              {feedback.contextMetadata?.relatedEntityId && (
                <div>
                  <a
                    href={`/transactions?id=${feedback.contextMetadata.relatedEntityId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"
                  >
                    <ExternalLink size={14} />
                    Xem chi tiết đơn hàng →
                  </a>
                </div>
              )}

              {/* Context metadata */}
              {(feedback.contextMetadata?.appVersion ||
                feedback.contextMetadata?.os) && (
                <div className="bg-surface/50 dark:bg-gray-800/50 rounded-md border border-outline-variant/20 p-3 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-4">
                  {feedback.contextMetadata.os && (
                    <span>
                      Hệ điều hành:{' '}
                      <strong className="text-gray-700 dark:text-gray-300 uppercase">
                        {feedback.contextMetadata.os}
                      </strong>
                    </span>
                  )}
                  {feedback.contextMetadata.appVersion && (
                    <span>
                      Phiên bản app:{' '}
                      <strong className="text-gray-700 dark:text-gray-300">
                        {feedback.contextMetadata.appVersion}
                      </strong>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* ── Right column: Action form ── */}
            <div className="w-80 shrink-0 p-6 flex flex-col gap-5 overflow-y-auto">
              <div>
                <p className="text-xs font-label text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Trạng thái hiện tại
                </p>
                <StatusBadge
                  status={feedback.status}
                  label={STATUS_LABELS[feedback.status] ?? feedback.status}
                />
              </div>

              {/* PENDING: assign button */}
              {feedback.status === 'PENDING' && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Tiếp nhận ticket để bắt đầu xử lý phản hồi này.
                  </p>
                  <button
                    onClick={handleAssign}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-body text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <PlayCircle size={16} />
                    )}
                    Tiếp nhận xử lý
                  </button>
                </div>
              )}

              {/* PROCESSING: reply + resolve */}
              {feedback.status === 'PROCESSING' && (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Phản hồi cho người dùng{' '}
                      <span className="text-error">*</span>
                    </label>
                    <textarea
                      value={adminReply}
                      onChange={(e) => {
                        setAdminReply(e.target.value);
                        setError(null);
                      }}
                      placeholder="Nhập nội dung phản hồi (tối thiểu 10 ký tự)..."
                      rows={6}
                      className="w-full p-3 bg-surface-lowest dark:bg-gray-900 border border-outline-variant/50 dark:border-gray-600 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                    <p className="text-right text-xs text-gray-400 mt-1">
                      {adminReply.length} ký tự
                    </p>
                  </div>
                  <button
                    onClick={handleResolve}
                    disabled={adminReply.trim().length < 10 || isSubmitting}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-body text-sm font-bold bg-primary text-white hover:bg-primary-T30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Xác nhận hoàn tất & Đóng ticket
                  </button>
                </div>
              )}

              {/* CLOSED: read-only */}
              {feedback.status === 'CLOSED' && (
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-label text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Phản hồi của Admin
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800/30 whitespace-pre-wrap">
                      {feedback.adminReply ?? '—'}
                    </p>
                  </div>
                  {feedback.resolvedAt && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Đóng lúc:{' '}
                      <strong className="text-gray-600 dark:text-gray-300">
                        {formatDateTime(feedback.resolvedAt)}
                      </strong>
                    </p>
                  )}
                  {feedback.adminId && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Xử lý bởi:{' '}
                      <strong className="text-gray-600 dark:text-gray-300">
                        {feedback.adminId.fullName}
                      </strong>
                    </p>
                  )}
                </div>
              )}

              {error && (
                <p className="text-xs text-error bg-error/5 border border-error/20 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-outline-variant/30 dark:border-gray-700 bg-surface-lowest dark:bg-gray-900 shrink-0 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md font-body text-sm font-semibold text-gray-600 hover:bg-surface-container dark:hover:bg-gray-800 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors"
            onClick={() => setLightboxUrl(null)}
          >
            <X size={24} />
          </button>
          <Image
            src={lightboxUrl}
            alt="attachment full size"
            width={900}
            height={700}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            unoptimized
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
