'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Layers,
  Clock,
  CheckCircle,
  RefreshCw,
  Eye,
  PlayCircle,
} from 'lucide-react';
import Toolbar, { type ToolbarFilter } from '@/components/ui/Toolbar';
import DataTable, { type Column } from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/ui/PageHeader';
import ActionDropdown, {
  type DropdownAction,
} from '@/components/ui/ActionDropdown';
import dynamic from 'next/dynamic';
const FeedbackDetailModal = dynamic(
  () => import('@/components/features/feedbacks/FeedbackDetailModal'),
  { loading: () => null }
);
import UserAvatar from '@/components/ui/UserAvatar';
import { formatDateTime } from '@/lib/formatters';
import {
  fetchAdminFeedbacks,
  assignFeedback,
  type IFeedback,
  type PaginationMeta,
} from '@/lib/feedbackApi';

const PAGE_LIMIT = 20;

const TYPE_LABELS: Record<string, string> = {
  BUG_REPORT: 'Báo lỗi',
  SUGGESTION: 'Góp ý',
};

const TYPE_STYLES: Record<string, string> = {
  BUG_REPORT: 'bg-red-50 text-red-700 border-red-200',
  SUGGESTION: 'bg-amber-50 text-amber-700 border-amber-200',
};

const PRIORITY_STYLES: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  LOW: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  CLOSED: 'Đã đóng',
};

const MS_24H = 24 * 60 * 60 * 1000;

function isHighlightRow(fb: IFeedback): boolean {
  if (fb.priority === 'CRITICAL') return true;
  if (
    fb.status === 'PENDING' &&
    Date.now() - new Date(fb.createdAt).getTime() > MS_24H
  )
    return true;
  return false;
}

export default function FeedbacksManagementPage() {
  const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<IFeedback | null>(
    null
  );

  const loadFeedbacks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAdminFeedbacks({
        status: activeTab !== 'ALL' ? activeTab : undefined,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        page: currentPage,
        limit: PAGE_LIMIT,
        search: searchQuery.trim() || undefined,
      });
      setFeedbacks(res.data);
      setPagination(res.pagination);
    } catch {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, typeFilter, currentPage, searchQuery]);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, typeFilter, searchQuery]);

  const handleAssign = useCallback(
    async (fb: IFeedback) => {
      setLoadingActionId(fb._id);
      setOpenDropdownId(null);
      try {
        await assignFeedback(fb._id);
        await loadFeedbacks();
      } catch {
        toast.error('Tiếp nhận thất bại. Vui lòng thử lại.');
      } finally {
        setLoadingActionId(null);
      }
    },
    [loadFeedbacks]
  );

  const buildActions = (fb: IFeedback): DropdownAction[] => [
    {
      label: 'Xem chi tiết',
      icon: <Eye size={16} />,
      onClick: () => {
        setSelectedFeedback(fb);
        setOpenDropdownId(null);
      },
    },
    {
      label: 'Tiếp nhận xử lý',
      icon: <PlayCircle size={16} />,
      variant: 'primary',
      hidden: fb.status !== 'PENDING',
      onClick: () => handleAssign(fb),
    },
  ];

  const columns: Column<IFeedback>[] = [
    {
      key: 'id',
      header: 'Mã ticket',
      render: (fb) => (
        <span className="font-mono text-xs font-semibold text-gray-900 dark:text-gray-100">
          #{fb._id.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'user',
      header: 'Người gửi',
      render: (fb) => (
        <div className="flex items-center gap-2.5">
          <UserAvatar
            fullName={fb.userId.fullName}
            avatar={fb.userId.avatar}
            size="md"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {fb.userId.fullName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {fb.userId.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò',
      render: (fb) => (
        <StatusBadge status={fb.userId.role} label={fb.userId.role} />
      ),
    },
    {
      key: 'type',
      header: 'Loại',
      render: (fb) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${TYPE_STYLES[fb.type] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}
        >
          {TYPE_LABELS[fb.type] ?? fb.type}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Tiêu đề',
      render: (fb) => (
        <span
          className="text-sm text-gray-800 dark:text-gray-200 line-clamp-1 max-w-50"
          title={fb.title}
        >
          {fb.title.length > 40 ? `${fb.title.slice(0, 40)}…` : fb.title}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (fb) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {formatDateTime(fb.createdAt)}
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'Độ ưu tiên',
      align: 'center',
      render: (fb) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${PRIORITY_STYLES[fb.priority] ?? PRIORITY_STYLES.LOW}`}
        >
          {fb.priority}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (fb) => (
        <StatusBadge
          status={fb.status}
          label={STATUS_LABELS[fb.status] ?? fb.status}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      align: 'center',
      render: (fb) => (
        <ActionDropdown
          id={fb._id}
          openId={openDropdownId}
          onToggle={(id) =>
            setOpenDropdownId(openDropdownId === id ? null : id)
          }
          loading={loadingActionId === fb._id}
          actions={buildActions(fb)}
          width="w-48"
        />
      ),
    },
  ];

  const toolbarFilters: ToolbarFilter[] = [
    {
      type: 'select',
      value: typeFilter,
      onChange: setTypeFilter,
      options: [
        { value: 'ALL', label: 'Tất cả loại' },
        { value: 'BUG_REPORT', label: 'Báo lỗi' },
        { value: 'SUGGESTION', label: 'Góp ý' },
      ],
    },
  ];

  return (
    <div
      className="w-full max-w-7xl mx-auto flex flex-col gap-6"
      onClick={() => setOpenDropdownId(null)}
    >
      <PageHeader
        title="Quản Lý Phản Hồi"
        subtitle="Tiếp nhận và xử lý phản hồi từ người dùng & cửa hàng"
      />

      {/* Status tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 dark:border-gray-800 pb-px">
        {[
          {
            value: 'ALL',
            label: 'Tất cả',
            icon: <Layers size={18} />,
            activeClass: 'border-gray-900 text-gray-900',
          },
          {
            value: 'PENDING',
            label: 'Chờ xử lý',
            icon: <Clock size={18} />,
            activeClass: 'border-yellow-600 text-yellow-700',
          },
          {
            value: 'PROCESSING',
            label: 'Đang xử lý',
            icon: <RefreshCw size={18} />,
            activeClass: 'border-blue-600 text-blue-700',
          },
          {
            value: 'CLOSED',
            label: 'Đã đóng',
            icon: <CheckCircle size={18} />,
            activeClass: 'border-primary text-primary',
          },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 px-4 py-2.5 font-sans font-bold text-sm border-b-2 transition-all ${
              activeTab === tab.value
                ? tab.activeClass
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Tìm theo tiêu đề..."
        filters={toolbarFilters}
      />

      <DataTable
        columns={columns}
        data={feedbacks}
        rowKey={(fb) => fb._id}
        loading={isLoading}
        error={error}
        emptyMessage="Không có phản hồi nào phù hợp."
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        className="rounded-2xl relative"
        tableClassName="min-h-100"
        headerClassName="bg-surface/50 dark:bg-gray-800/50 font-label text-xs uppercase text-gray-500"
        bodyClassName="divide-outline-variant/20 text-sm"
        rowClassName={(fb) =>
          isHighlightRow(fb)
            ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100/70 dark:hover:bg-red-900/30 transition-colors'
            : 'hover:bg-primary/5 transition-colors'
        }
        cellClassName={(col) => (col.key === 'actions' ? 'px-3' : '')}
      />

      <FeedbackDetailModal
        feedback={selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        onUpdated={loadFeedbacks}
      />
    </div>
  );
}
