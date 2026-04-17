'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Layers, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import Toolbar, { type ToolbarFilter } from '@/components/ui/Toolbar';
import DataTable, { type Column } from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/ui/PageHeader';
import ActionDropdown, { type DropdownAction } from '@/components/ui/ActionDropdown';
import ReportDetailModal from '@/components/features/reports/ReportDetailModal';
import { formatDateTime } from '@/lib/formatters';
import {
  fetchAdminReports,
  type IReport,
  type PaginationMeta,
} from '@/lib/reportApi';

const PAGE_LIMIT = 10;

const REASON_LABELS: Record<string, string> = {
  FOOD_SAFETY: 'An toàn thực phẩm',
  SCAM: 'Lừa đảo',
  INAPPROPRIATE_CONTENT: 'Nội dung không phù hợp',
  NO_SHOW: 'Không đến nhận',
  OTHER: 'Khác',
};

const REASON_STYLES: Record<string, string> = {
  FOOD_SAFETY: 'bg-red-50 text-error border-error/20',
  SCAM: 'bg-orange-50 text-orange-700 border-orange-200',
  INAPPROPRIATE_CONTENT: 'bg-purple-50 text-purple-700 border-purple-200',
  NO_SHOW: 'bg-blue-50 text-blue-700 border-blue-200',
  OTHER: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  RESOLVED: 'Đã giải quyết',
  DISMISSED: 'Đã bác bỏ',
  WITHDRAWN: 'Đã rút lại',
};

export default function ReportsManagementPage() {
  const [reports, setReports] = useState<IReport[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetFilter, setTargetFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<IReport | null>(null);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAdminReports({
        status: activeTab !== 'ALL' ? activeTab : undefined,
        targetType: targetFilter !== 'ALL' ? targetFilter : undefined,
        page: currentPage,
        limit: PAGE_LIMIT,
      });
      setReports(res.data);
      setPagination(res.pagination);
    } catch {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, targetFilter, currentPage]);

  useEffect(() => { loadReports(); }, [loadReports]);
  useEffect(() => { setCurrentPage(1); }, [activeTab, targetFilter]);

  const filteredReports = useMemo(() => {
    if (!searchQuery) return reports;
    const q = searchQuery.toLowerCase();
    return reports.filter(
      (r) =>
        r._id.toLowerCase().includes(q) ||
        r.reporterId.fullName.toLowerCase().includes(q) ||
        r.reporterId.email.toLowerCase().includes(q)
    );
  }, [reports, searchQuery]);

  const buildActions = (r: IReport): DropdownAction[] => [
    {
      label: 'Xem & Xử lý',
      icon: <Eye size={16} />,
      onClick: () => { setSelectedReport(r); setOpenDropdownId(null); },
    },
  ];

  const columns: Column<IReport>[] = [
    {
      key: 'id',
      header: 'Mã & Ngày gửi',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 font-mono text-xs">{r._id.slice(-8).toUpperCase()}</span>
          <span className="text-xs text-gray-500 mt-0.5">{formatDateTime(r.createdAt)}</span>
        </div>
      ),
    },
    {
      key: 'reporter',
      header: 'Người tố cáo',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 shrink-0">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary-container to-secondary-container flex items-center justify-center text-white font-sans text-xs font-bold absolute inset-0">
              {r.reporterId.fullName.charAt(0).toUpperCase()}
            </div>
            {r.reporterId.avatar && (
              <img
                src={r.reporterId.avatar}
                alt={r.reporterId.fullName}
                className="w-8 h-8 rounded-full object-cover absolute inset-0"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-gray-900 font-medium">{r.reporterId.fullName}</span>
            <span className="text-xs text-gray-500 mt-0.5">{r.reporterId.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Lý do & Đối tượng',
      render: (r) => (
        <div className="flex flex-col items-start gap-1.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${REASON_STYLES[r.reason] || REASON_STYLES.OTHER}`}>
            {REASON_LABELS[r.reason] || r.reason.replace(/_/g, ' ')}
          </span>
          <span className="text-xs text-gray-600">
            <strong className="text-gray-900">{r.targetType}:</strong> {r.targetId.slice(-8).toUpperCase()}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (r) => <StatusBadge status={r.status} label={STATUS_LABELS[r.status] || r.status} />,
    },
    {
      key: 'actions',
      header: 'Hành động',
      align: 'center',
      render: (r) => (
        <ActionDropdown
          id={r._id}
          openId={openDropdownId}
          onToggle={(id) => setOpenDropdownId(openDropdownId === id ? null : id)}
          actions={buildActions(r)}
        />
      ),
    },
  ];

  const toolbarFilters: ToolbarFilter[] = [
    {
      type: 'select',
      value: targetFilter,
      onChange: setTargetFilter,
      options: [
        { value: 'ALL', label: 'Tất cả đối tượng' },
        { value: 'POST', label: 'Bài đăng (POST)' },
        { value: 'USER', label: 'Người dùng (USER)' },
        { value: 'TRANSACTION', label: 'Giao dịch (TRANSACTION)' },
      ],
    },
  ];

  return (
    <div
      className="w-full max-w-7xl mx-auto flex flex-col gap-6"
      onClick={() => setOpenDropdownId(null)}
    >
      <PageHeader
        title="Quản Lý Báo Cáo"
        subtitle="Xử lý các tranh chấp, khiếu nại và vi phạm trên hệ thống"
      />

      {/* Tabs — giữ nguyên vì mỗi tab có màu active riêng */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-px">
        {[
          { value: 'ALL', label: 'Tất cả', icon: <Layers size={18} />, activeClass: 'border-gray-900 text-gray-900' },
          { value: 'PENDING', label: 'Cần xử lý', icon: <Clock size={18} />, activeClass: 'border-yellow-600 text-yellow-700' },
          { value: 'RESOLVED', label: 'Đã giải quyết', icon: <CheckCircle size={18} />, activeClass: 'border-primary text-primary' },
          { value: 'DISMISSED', label: 'Đã bác bỏ', icon: <XCircle size={18} />, activeClass: 'border-gray-400 text-gray-600' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 px-4 py-2.5 font-sans font-bold text-sm border-b-2 transition-all ${activeTab === tab.value ? tab.activeClass : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Tìm theo mã báo cáo, người tố cáo..."
        filters={toolbarFilters}
      />

      <DataTable
        columns={columns}
        data={filteredReports}
        rowKey={(r) => r._id}
        loading={isLoading}
        error={error}
        emptyMessage="Không có báo cáo nào phù hợp."
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        className="rounded-md overflow-visible relative"
        tableClassName="min-h-100"
        headerClassName="bg-surface/50 font-label text-xs uppercase text-gray-500"
        bodyClassName="divide-outline-variant/20 text-sm"
        rowClassName="hover:bg-primary/5 transition-colors"
        cellClassName={(col) => col.key === 'actions' ? 'px-3' : ''}
      />

      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onProcessed={loadReports}
      />
    </div>
  );
}
