'use client';

import { useState, FormEvent } from 'react';
import axios from 'axios';
import { Send, Loader2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import axiosInstance from '@/lib/axios';

type TargetRole = 'ALL' | 'USER' | 'STORE' | 'ADMIN';
type NotificationType = 'TRANSACTION' | 'RADAR' | 'SYSTEM' | 'VOUCHER';

const TARGET_ROLE_OPTIONS: { value: TargetRole; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'USER', label: 'Người dùng' },
  { value: 'STORE', label: 'Cửa hàng' },
  { value: 'ADMIN', label: 'Quản trị viên' },
];

const NOTIFICATION_TYPE_OPTIONS: { value: NotificationType; label: string }[] =
  [
    { value: 'SYSTEM', label: 'Hệ thống' },
    { value: 'RADAR', label: 'Radar' },
    { value: 'VOUCHER', label: 'Voucher' },
    { value: 'TRANSACTION', label: 'Giao dịch' },
  ];

export default function CreateNotificationPage() {
  const [targetRole, setTargetRole] = useState<TargetRole>('ALL');
  const [notificationType, setNotificationType] =
    useState<NotificationType>('SYSTEM');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axiosInstance.post('/notifications/admin/broadcast', {
        targetRole,
        type: notificationType,
        title,
        body,
      });

      setSuccess(true);
      setTitle('');
      setBody('');
      setTargetRole('ALL');
      setNotificationType('SYSTEM');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Gửi broadcast thất bại');
      } else {
        setError('Đã xảy ra lỗi');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Tạo Broadcast Thông Báo"
        subtitle="Gửi thông báo hàng loạt đến người dùng theo vai trò"
      />

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 text-sm">
          Gửi broadcast thông báo thành công!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Đối tượng nhận <span className="text-error">*</span>
          </label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value as TargetRole)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            required
          >
            {TARGET_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Loại thông báo <span className="text-error">*</span>
          </label>
          <select
            value={notificationType}
            onChange={(e) =>
              setNotificationType(e.target.value as NotificationType)
            }
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            required
          >
            {NOTIFICATION_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tiêu đề <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề thông báo"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            required
            maxLength={255}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Nội dung <span className="text-error">*</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Nhập nội dung thông báo"
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-y"
            required
            maxLength={1000}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Gửi Broadcast
          </button>
        </div>
      </form>
    </div>
  );
}
