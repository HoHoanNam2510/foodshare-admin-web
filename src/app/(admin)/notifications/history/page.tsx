'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { formatDateTime } from '@/lib/formatters';
import DataTable, { type Column } from '@/components/ui/DataTable';
import PageHeader from '@/components/ui/PageHeader';
import axiosInstance from '@/lib/axios';

type BroadcastTargetRole = 'ALL' | 'USER' | 'STORE' | 'ADMIN';
type NotificationType = 'TRANSACTION' | 'RADAR' | 'SYSTEM' | 'VOUCHER';

interface INotificationBroadcast {
  _id: string;
  adminId: { _id: string; fullName: string; email: string };
  title: string;
  body: string;
  type: NotificationType;
  targetRole: BroadcastTargetRole;
  recipientCount: number;
  sentAt: string;
}

const TARGET_ROLE_LABELS: Record<BroadcastTargetRole, string> = {
  ALL: 'Tất cả',
  USER: 'Người dùng',
  STORE: 'Cửa hàng',
  ADMIN: 'Quản trị viên',
};

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  TRANSACTION: 'Giao dịch',
  RADAR: 'Radar',
  SYSTEM: 'Hệ thống',
  VOUCHER: 'Voucher',
};

const PAGE_SIZE = 15;

export default function BroadcastHistoryPage() {
  const [broadcasts, setBroadcasts] = useState<INotificationBroadcast[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/notifications/admin/history', {
        params: { page: currentPage, limit: PAGE_SIZE },
      });

      setBroadcasts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || 'Không thể tải lịch sử broadcast'
        );
      } else {
        setError('Đã xảy ra lỗi');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const columns: Column<INotificationBroadcast>[] = [
    {
      key: 'id',
      header: 'Mã',
      render: (item) => (
        <span className="font-mono text-[11px] text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
          #{item._id.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Tiêu đề',
      render: (item) => (
        <span className="font-medium text-gray-900 text-sm line-clamp-1">
          {item.title}
        </span>
      ),
    },
    {
      key: 'targetRole',
      header: 'Đối tượng',
      align: 'center',
      render: (item) => (
        <span className="text-sm text-gray-700">
          {TARGET_ROLE_LABELS[item.targetRole]}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Loại',
      align: 'center',
      render: (item) => (
        <span className="text-sm text-gray-700">
          {NOTIFICATION_TYPE_LABELS[item.type]}
        </span>
      ),
    },
    {
      key: 'recipientCount',
      header: 'Số người nhận',
      align: 'center',
      render: (item) => (
        <span className="font-semibold text-gray-900 text-sm">
          {item.recipientCount.toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'admin',
      header: 'Người gửi',
      render: (item) => (
        <span className="text-sm text-gray-700">
          {item.adminId?.fullName || item.adminId?.email || '—'}
        </span>
      ),
    },
    {
      key: 'sentAt',
      header: 'Ngày gửi',
      render: (item) => (
        <span className="text-sm text-gray-700">
          {formatDateTime(item.sentAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch Sử Broadcast Thông Báo"
        subtitle="Xem các lần gửi thông báo hàng loạt trong quá khứ"
      />

      <DataTable
        columns={columns}
        data={broadcasts}
        rowKey={(item) => item._id}
        loading={loading}
        error={error}
        emptyMessage="Chưa có lịch sử broadcast thông báo nào"
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        className="rounded-md overflow-visible"
        tableClassName="min-h-100"
        headerClassName="bg-surface/50 font-label text-xs uppercase text-gray-500"
        bodyClassName="divide-outline-variant/20 text-sm"
        rowClassName="hover:bg-primary/5 transition-colors"
      />
    </div>
  );
}
