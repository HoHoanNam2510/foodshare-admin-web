'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Layers,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
} from 'lucide-react';
import Toolbar, { type ToolbarFilter } from '@/components/ui/Toolbar';
import DataTable, { type Column } from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import ReportDetailModal from '@/components/features/reports/ReportDetailModal';
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

const formatDate = (value: string) =>
  new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

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
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
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

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, targetFilter]);

  // Client-side search on reporter name / short ID
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

  const columns: Column<IReport>[] = [
    {
      key: 'id',
      header: 'Mã & Ngày gửi',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 font-mono text-xs">
            {r._id.slice(-8).toUpperCase()}
          </span>
          <span className="text-xs text-gray-500 mt-0.5">
            {formatDate(r.createdAt)}
          </span>
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
            <span className="text-gray-900 font-medium">
              {r.reporterId.fullName}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">
              {r.reporterId.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Lý do & Đối tượng',
      render: (r) => (
        <div className="flex flex-col items-start gap-1.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${REASON_STYLES[r.reason] || REASON_STYLES.OTHER}`}
          >
            {REASON_LABELS[r.reason] || r.reason.replace(/_/g, ' ')}
          </span>
          <span className="text-xs text-gray-600">
            <strong className="text-gray-900">{r.targetType}:</strong>{' '}
            {r.targetId.slice(-8).toUpperCase()}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (r) => (
        <StatusBadge
          status={r.status}
          label={STATUS_LABELS[r.status] || r.status}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      align: 'center',
      render: (r) => (
        <div className="text-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (openDropdownId === r._id) {
                setOpenDropdownId(null);
                setDropdownPos(null);
              } else {
                const rect = e.currentTarget.getBoundingClientRect();
                setDropdownPos({
                  top: rect.bottom + 4,
                  right: window.innerWidth - rect.right,
                });
                setOpenDropdownId(r._id);
              }
            }}
            className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors"
          >
            <MoreVertical size={18} />
          </button>

          {openDropdownId === r._id && dropdownPos && (
            <div
              style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right }}
              className="w-40 bg-surface-lowest border border-outline-variant/30 rounded-2xl shadow-hover z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95"
            >
              <button
                onClick={() => {
                  setSelectedReport(r);
                  setOpenDropdownId(null);
                  setDropdownPos(null);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <Eye size={16} /> Xem & Xử lý
              </button>
            </div>
          )}
        </div>
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
      onClick={() => { setOpenDropdownId(null); setDropdownPos(null); }}
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-sans font-bold text-gray-900 leading-tight">
          Quản Lý Báo Cáo
        </h1>
        <p className="text-sm font-body text-gray-500 mt-1">
          Xử lý các tranh chấp, khiếu nại và vi phạm trên hệ thống
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-px">
        {[
          {
            value: 'ALL',
            label: 'Tất cả',
            icon: <Layers size={18} />,
            activeClass: 'border-gray-900 text-gray-900',
          },
          {
            value: 'PENDING',
            label: 'Cần xử lý',
            icon: <Clock size={18} />,
            activeClass: 'border-yellow-600 text-yellow-700',
          },
          {
            value: 'RESOLVED',
            label: 'Đã giải quyết',
            icon: <CheckCircle size={18} />,
            activeClass: 'border-primary text-primary',
          },
          {
            value: 'DISMISSED',
            label: 'Đã bác bỏ',
            icon: <XCircle size={18} />,
            activeClass: 'border-gray-400 text-gray-600',
          },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 px-4 py-2.5 font-sans font-bold text-sm border-b-2 transition-all ${
              activeTab === tab.value
                ? tab.activeClass
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
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
        className="rounded-md"
        rowClassName="hover:bg-primary/5 transition-colors"
        cellClassName={(col) => (col.key === 'actions' ? 'px-3' : '')}
      />

      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onProcessed={loadReports}
      />
    </div>
  );
}
