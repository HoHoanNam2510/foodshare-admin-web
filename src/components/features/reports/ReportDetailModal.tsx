'use client';

import { useState } from 'react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  ImageIcon,
  MapPin,
  User,
  FileText,
  CreditCard,
  CheckCircle,
} from 'lucide-react';

interface ReportDetailModalProps {
  report: any;
  onClose: () => void;
  formatDate: (date: Date) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  getReasonBadge: (reason: string) => React.ReactNode;
}

export default function ReportDetailModal({
  report,
  onClose,
  formatDate,
  getStatusBadge,
  getReasonBadge,
}: ReportDetailModalProps) {
  const [actionTaken, setActionTaken] = useState(report?.actionTaken || 'NONE');
  const [resolutionNote, setResolutionNote] = useState(
    report?.resolutionNote || ''
  );
  const [status, setStatus] = useState(report?.status || 'PENDING');

  if (!report) return null;

  const isResolved = report.status !== 'PENDING';

  const handleProcess = () => {
    // Gọi API adminProcessReport ở đây
    alert(
      `Đã phán xử Report ${report._id}: Trạng thái ${status}, Hành động ${actionTaken}`
    );
    onClose();
  };

  const getTargetIcon = (type: string) => {
    if (type === 'POST') return <FileText size={16} className="text-primary" />;
    if (type === 'USER') return <User size={16} className="text-secondary" />;
    return <CreditCard size={16} className="text-purple-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-surface-lowest w-full max-w-3xl rounded-md shadow-floating overflow-hidden animate-in slide-in-from-bottom-4 fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface/50 shrink-0">
          <div>
            <h2 className="text-lg font-sans font-bold text-gray-900 flex items-center gap-2">
              Báo cáo vi phạm #{report._id}
              {getStatusBadge(report.status)}
            </h2>
            <p className="text-xs font-body text-gray-500 mt-0.5">
              Gửi lúc: {formatDate(report.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto font-body flex-1">
          {/* Thông tin 2 bên: Người tố cáo & Đối tượng */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-error/5 rounded-md border border-error/20">
              <h3 className="text-sm font-bold text-error mb-3 flex items-center gap-2">
                <AlertTriangle size={16} /> Người tố cáo
              </h3>
              <p className="font-semibold text-gray-800">
                {report.reporterId.fullName}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {report.reporterId.email}
              </p>
            </div>
            <div className="p-4 bg-surface-container/30 rounded-md border border-outline-variant/30">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                {getTargetIcon(report.targetType)} Đối tượng bị tố cáo
              </h3>
              <p className="font-semibold text-gray-800 line-clamp-1">
                {report.targetName}
              </p>
              <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-bold">
                ID: {report.targetId}
              </p>
            </div>
          </div>

          {/* Nội dung báo cáo */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-label text-gray-500 uppercase tracking-wider">
                Lý do & Mô tả
              </p>
              {getReasonBadge(report.reason)}
            </div>
            <p className="text-sm text-gray-800 leading-relaxed bg-surface/50 p-4 rounded-md border border-outline-variant/20">
              {report.description}
            </p>
          </div>

          {/* Hình ảnh bằng chứng */}
          <div className="mb-8">
            <p className="text-xs font-label text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon size={14} /> Bằng chứng đính kèm
            </p>
            {report.images && report.images.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {report.images.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="w-32 h-32 shrink-0 rounded-md bg-surface border border-outline-variant/30 flex flex-col items-center justify-center overflow-hidden"
                  >
                    <ImageIcon size={24} className="text-gray-300 mb-2" />
                    <span className="text-[10px] text-gray-400">
                      Image {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic bg-surface/50 p-3 rounded-md border border-outline-variant/20 inline-block">
                Không có hình ảnh đính kèm.
              </p>
            )}
          </div>

          {/* KHU VỰC ADMIN PHÁN XỬ */}
          <div className="border-t-2 border-dashed border-outline-variant/50 pt-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldAlert size={18} className="text-primary" /> Phán xử & Hành
              động
            </h3>

            {isResolved ? (
              // View mode: Nếu đã xử lý rồi thì chỉ hiển thị
              <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">
                      Kết quả phán xử:
                    </span>
                    <span className="font-bold text-gray-900">
                      {report.status === 'RESOLVED'
                        ? 'Hợp lệ (Đã giải quyết)'
                        : 'Bác bỏ (Không hợp lệ)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">
                      Hình phạt áp dụng:
                    </span>
                    <span className="font-bold text-error">
                      {report.actionTaken}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">
                    Ghi chú của Admin:
                  </span>
                  <p className="text-sm font-medium text-gray-800 bg-surface-lowest p-3 rounded border border-outline-variant/30">
                    {report.resolutionNote}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-primary/10 text-xs text-gray-500 flex justify-between">
                  <span>
                    Xử lý bởi:{' '}
                    <strong className="text-gray-900">
                      {report.resolvedBy?.fullName}
                    </strong>
                  </span>
                  <span>Lúc: {formatDate(report.resolvedAt)}</span>
                </div>
              </div>
            ) : (
              // Edit mode: Form để Admin xử lý
              <div className="bg-surface rounded-md p-5 border border-outline-variant/50">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Trạng thái quyết định
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full p-2.5 bg-surface-lowest border border-outline-variant/50 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="PENDING">-- Chọn kết luận --</option>
                      <option value="RESOLVED">Report Hợp Lệ (Xử phạt)</option>
                      <option value="DISMISSED">Report Sai (Bác bỏ)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Hình phạt áp dụng
                    </label>
                    <select
                      value={actionTaken}
                      onChange={(e) => setActionTaken(e.target.value)}
                      disabled={status !== 'RESOLVED'}
                      className="w-full p-2.5 bg-surface-lowest border border-outline-variant/50 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="NONE">Không phạt</option>
                      <option value="POST_HIDDEN">Ẩn bài viết</option>
                      <option value="USER_WARNED">Cảnh cáo User</option>
                      <option value="USER_BANNED">Khóa tài khoản</option>
                      <option value="REFUNDED">Hoàn tiền Giao dịch</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Ghi chú giải quyết (Bắt buộc)
                  </label>
                  <textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Nhập lý do phán xử, bằng chứng xác minh thêm (nếu có)..."
                    rows={3}
                    className="w-full p-3 bg-surface-lowest border border-outline-variant/50 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  ></textarea>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-lowest shrink-0 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md font-body text-sm font-semibold text-gray-600 hover:bg-surface-container transition-colors"
          >
            Đóng
          </button>
          {!isResolved && (
            <button
              onClick={handleProcess}
              disabled={status === 'PENDING' || !resolutionNote.trim()}
              className="flex items-center gap-2 px-6 py-2 rounded-md font-body text-sm font-bold bg-primary text-white hover:bg-primary-T30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <CheckCircle size={16} /> Lưu Phán Xử
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
