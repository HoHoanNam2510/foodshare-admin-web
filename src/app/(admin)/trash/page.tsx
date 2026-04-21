'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Calendar,
  Users,
  FileText,
  Star,
  Ticket,
  MessageCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import DataTable, { type Column } from '@/components/ui/DataTable';
import PageHeader from '@/components/ui/PageHeader';
import UserAvatar from '@/components/ui/UserAvatar';
import { formatDateTime } from '@/lib/formatters';
import {
  getTrashItems,
  restoreTrashItem,
  purgeTrashItem,
  type ITrashItem,
  type TrashCollection,
  type TrashSingleCollectionResponse,
  type TrashPaginationMeta,
} from '@/lib/trashApi';

// ─── Tab config ───────────────────────────────────────────────

const TABS: {
  key: TrashCollection;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: 'users', label: 'Người dùng', icon: Users },
  { key: 'posts', label: 'Bài đăng', icon: FileText },
  { key: 'reviews', label: 'Đánh giá', icon: Star },
  { key: 'vouchers', label: 'Voucher', icon: Ticket },
  { key: 'conversations', label: 'Hội thoại', icon: MessageCircle },
];

const PAGE_SIZE = 15;

// ─── Helpers ──────────────────────────────────────────────────

type AnyRecord = Record<string, unknown>;

function getPrimaryLabel(tab: TrashCollection, item: ITrashItem): string {
  const d = item as AnyRecord;
  switch (tab) {
    case 'users':
      return (d.fullName as string) || (d.email as string) || '—';
    case 'posts':
      return (d.title as string) || '—';
    case 'reviews':
      return `Đánh giá ${(d.rating as number) ?? '?'}/5`;
    case 'vouchers':
      return [d.code as string, d.title as string].filter(Boolean).join(' — ');
    case 'conversations':
      return `Hội thoại #${item._id.slice(-8).toUpperCase()}`;
    case 'messages':
      return (d.text as string)?.slice(0, 50) || '[Không có nội dung]';
    default:
      return item._id.slice(-8).toUpperCase();
  }
}

function getSecondaryLabel(tab: TrashCollection, item: ITrashItem): string {
  const d = item as AnyRecord;
  switch (tab) {
    case 'users':
      return (d.email as string) || '';
    case 'posts': {
      const owner = d.ownerId as AnyRecord | null;
      if (!owner || typeof owner !== 'object') return '';
      return (owner.fullName as string) || (owner.email as string) || '';
    }
    case 'reviews': {
      const reviewer = d.reviewerId as AnyRecord | null;
      const reviewee = d.revieweeId as AnyRecord | null;
      const rName =
        typeof reviewer === 'object' && reviewer
          ? (reviewer.fullName as string)
          : null;
      const eeName =
        typeof reviewee === 'object' && reviewee
          ? (reviewee.fullName as string)
          : null;
      return [rName, eeName].filter(Boolean).join(' → ');
    }
    case 'vouchers': {
      const creator = d.creatorId as AnyRecord | null;
      if (!creator || typeof creator !== 'object') return '';
      return (creator.fullName as string) || (creator.email as string) || '';
    }
    case 'conversations': {
      const parts = d.participants as AnyRecord[] | null;
      if (parts?.length) {
        return parts
          .slice(0, 2)
          .map(
            (p) =>
              (typeof p === 'object' && p ? (p.fullName as string) : null) ||
              '?'
          )
          .join(', ');
      }
      return '';
    }
    default:
      return '';
  }
}

function isPopulated(val: unknown): val is AnyRecord {
  return (
    typeof val === 'object' && val !== null && 'fullName' in (val as object)
  );
}

function getAvatarProps(
  tab: TrashCollection,
  item: ITrashItem
): { fullName: string; avatar?: string } {
  const d = item as AnyRecord;
  switch (tab) {
    case 'users':
      return {
        fullName: (d.fullName as string) || '?',
        avatar: d.avatar as string | undefined,
      };
    case 'posts': {
      const o = d.ownerId;
      return isPopulated(o)
        ? {
            fullName: (o.fullName as string) || '?',
            avatar: o.avatar as string | undefined,
          }
        : { fullName: '?' };
    }
    case 'reviews': {
      const r = d.reviewerId;
      return isPopulated(r)
        ? {
            fullName: (r.fullName as string) || '?',
            avatar: r.avatar as string | undefined,
          }
        : { fullName: '?' };
    }
    case 'vouchers': {
      const c = d.creatorId;
      return isPopulated(c)
        ? {
            fullName: (c.fullName as string) || '?',
            avatar: c.avatar as string | undefined,
          }
        : { fullName: '?' };
    }
    case 'conversations': {
      const parts = d.participants as unknown[] | null;
      const first = parts?.[0];
      return isPopulated(first)
        ? {
            fullName: (first.fullName as string) || '?',
            avatar: first.avatar as string | undefined,
          }
        : { fullName: '?' };
    }
    default:
      return { fullName: '?' };
  }
}

// ─── Page Component ───────────────────────────────────────────

export default function TrashPage() {
  const [activeTab, setActiveTab] = useState<TrashCollection>('users');
  const [items, setItems] = useState<ITrashItem[]>([]);
  const [pagination, setPagination] = useState<TrashPaginationMeta | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [purgingId, setPurgingId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = (await getTrashItems({
        collection: activeTab,
        page: currentPage,
        limit: PAGE_SIZE,
        from: dateFrom || undefined,
        to: dateTo ? new Date(dateTo + 'T23:59:59').toISOString() : undefined,
      })) as TrashSingleCollectionResponse;
      setItems(res.data);
      setPagination(res.pagination);
    } catch {
      setError('Không thể tải dữ liệu thùng rác. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, dateFrom, dateTo]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, dateFrom, dateTo]);

  // ─── Handlers ─────────────────────────────────────────────

  const handleRestore = async (item: ITrashItem) => {
    const label = getPrimaryLabel(activeTab, item);
    if (
      !confirm(
        `Khôi phục "${label}"?\nDữ liệu sẽ hiển thị trở lại trên hệ thống.`
      )
    )
      return;

    setRestoringId(item._id);
    try {
      await restoreTrashItem(activeTab, item._id);
      await loadItems();
    } catch {
      alert('Khôi phục thất bại. Vui lòng thử lại.');
    } finally {
      setRestoringId(null);
    }
  };

  const handlePurge = async (item: ITrashItem) => {
    const label = getPrimaryLabel(activeTab, item);
    if (
      !confirm(`XÓA VĨNH VIỄN "${label}"?\n\nHành động này KHÔNG THỂ HOÀN TÁC.`)
    )
      return;

    setPurgingId(item._id);
    try {
      await purgeTrashItem(activeTab, item._id);
      await loadItems();
    } catch {
      alert('Xóa vĩnh viễn thất bại. Vui lòng thử lại.');
    } finally {
      setPurgingId(null);
    }
  };

  // ─── Columns ──────────────────────────────────────────────

  const columns: Column<ITrashItem>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (item) => (
        <span className="font-mono text-[11px] text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
          #{item._id.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'info',
      header: 'Thông tin',
      render: (item) => {
        const avatarProps = getAvatarProps(activeTab, item);
        const primary = getPrimaryLabel(activeTab, item);
        const secondary = getSecondaryLabel(activeTab, item);
        return (
          <div className="flex items-center gap-3">
            <UserAvatar
              fullName={avatarProps.fullName}
              avatar={avatarProps.avatar}
              size="md"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-gray-900 text-sm line-clamp-1">
                {primary}
              </span>
              {secondary && (
                <span className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                  {secondary}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'deletedAt',
      header: 'Ngày xóa',
      render: (item) => (
        <span className="text-sm text-gray-700">
          {item.deletedAt ? formatDateTime(item.deletedAt) : '—'}
        </span>
      ),
    },
    {
      key: 'deletedBy',
      header: 'Người xóa',
      render: (item) => (
        <span className="font-mono text-[11px] text-gray-400">
          {item.deletedBy
            ? String(item.deletedBy).slice(-8).toUpperCase()
            : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      align: 'center',
      render: (item) => {
        const isRestoring = restoringId === item._id;
        const isPurging = purgingId === item._id;
        const busy = isRestoring || isPurging;
        return (
          <div className="flex items-center justify-center gap-2">
            {/* Restore */}
            <button
              onClick={() => handleRestore(item)}
              disabled={busy}
              title="Khôi phục"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary/8 hover:bg-primary/15 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {isRestoring ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <RotateCcw size={13} />
              )}
              Khôi phục
            </button>

            {/* Purge */}
            <button
              onClick={() => handlePurge(item)}
              disabled={busy}
              title="Xóa vĩnh viễn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-error bg-error/8 hover:bg-error/15 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {isPurging ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Trash2 size={13} />
              )}
              Xóa vĩnh viễn
            </button>
          </div>
        );
      },
    },
  ];

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý thùng rác"
        subtitle="Xem, khôi phục hoặc xóa vĩnh viễn dữ liệu đã bị xóa"
        action={
          <button
            onClick={loadItems}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-primary hover:text-primary transition"
          >
            <RefreshCw size={14} />
            Làm mới
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === key
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Filters + count row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2">
          <Calendar size={14} className="text-gray-400 shrink-0" />
          <span className="text-xs text-gray-400 shrink-0">Từ</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-sm text-gray-700 bg-transparent outline-none w-32"
          />
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2">
          <Calendar size={14} className="text-gray-400 shrink-0" />
          <span className="text-xs text-gray-400 shrink-0">Đến</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-sm text-gray-700 bg-transparent outline-none w-32"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            onClick={() => {
              setDateFrom('');
              setDateTo('');
            }}
            className="text-xs text-primary hover:text-primary/80 font-medium transition"
          >
            Xóa bộ lọc
          </button>
        )}
        {pagination && (
          <span className="ml-auto text-sm text-gray-500">
            Tổng:{' '}
            <span className="font-semibold text-gray-800">
              {pagination.total.toLocaleString('vi-VN')}
            </span>{' '}
            bản ghi
          </span>
        )}
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          Dữ liệu trong thùng rác sẽ tự động bị xóa vĩnh viễn sau thời gian lưu
          trữ đã cấu hình.{' '}
          <a
            href="/settings"
            className="font-semibold underline underline-offset-2 hover:text-amber-900"
          >
            Vào Cài đặt
          </a>{' '}
          để thay đổi thời hạn hoặc dọn dẹp thủ công.
        </p>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={items}
        rowKey={(item) => item._id}
        loading={loading}
        error={error}
        emptyMessage="Thùng rác trống — không có dữ liệu đã bị xóa"
        pagination={
          pagination
            ? {
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
                totalPages: pagination.totalPages,
              }
            : null
        }
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
