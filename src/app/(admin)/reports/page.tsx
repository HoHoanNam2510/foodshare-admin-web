'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  AlertTriangle,
  Layers,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { MOCK_REPORTS } from '@/constants/mockReports';
import ReportDetailModal from '@/components/features/reports/ReportDetailModal';

// --- HELPER FORMATS ---
const formatDate = (date: Date) => {
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    RESOLVED: 'bg-green-50 text-primary border-primary/20',
    DISMISSED: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  const labels: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    RESOLVED: 'Đã giải quyết',
    DISMISSED: 'Đã bác bỏ',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

const getReasonBadge = (reason: string) => {
  const styles: Record<string, string> = {
    FOOD_SAFETY: 'bg-red-50 text-error border-error/20',
    SCAM: 'bg-orange-50 text-orange-700 border-orange-200',
    INAPPROPRIATE_CONTENT: 'bg-purple-50 text-purple-700 border-purple-200',
    NO_SHOW: 'bg-blue-50 text-blue-700 border-blue-200',
    OTHER: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${styles[reason] || styles.OTHER}`}
    >
      {reason.replace(/_/g, ' ')}
    </span>
  );
};

export default function ReportsManagementPage() {
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'PENDING' | 'RESOLVED' | 'DISMISSED'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetFilter, setTargetFilter] = useState('ALL');

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const filteredReports = useMemo(() => {
    let result = [...MOCK_REPORTS];

    // 1. Lọc theo Tab Trạng thái
    if (activeTab !== 'ALL') {
      result = result.filter((r) => r.status === activeTab);
    }

    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // 2. Lọc theo Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r._id.toLowerCase().includes(lowerQuery) ||
          r.reporterId.fullName.toLowerCase().includes(lowerQuery)
      );
    }

    // 3. Lọc theo Đối tượng bị tố cáo
    if (targetFilter !== 'ALL') {
      result = result.filter((r) => r.targetType === targetFilter);
    }
    return result;
  }, [activeTab, searchQuery, targetFilter]);

  const closeDropdown = () => setOpenDropdownId(null);

  return (
    <div
      className="w-full max-w-7xl mx-auto flex flex-col gap-6"
      onClick={closeDropdown}
    >
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-2xl font-sans font-bold text-gray-900 leading-tight">
          Quản Lý Báo Cáo
        </h1>
        <p className="text-sm font-body text-gray-500 mt-1">
          Xử lý các tranh chấp, khiếu nại và vi phạm trên hệ thống
        </p>
      </div>

      {/* ── TABS NỘI BỘ (Lọc theo Status) ── */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-px">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans font-bold text-sm border-b-2 transition-all ${activeTab === 'ALL' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          <Layers size={18} /> Tất cả
        </button>
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans font-bold text-sm border-b-2 transition-all ${activeTab === 'PENDING' ? 'border-yellow-600 text-yellow-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          <Clock size={18} /> Cần xử lý
        </button>
        <button
          onClick={() => setActiveTab('RESOLVED')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans font-bold text-sm border-b-2 transition-all ${activeTab === 'RESOLVED' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          <CheckCircle size={18} /> Đã giải quyết
        </button>
        <button
          onClick={() => setActiveTab('DISMISSED')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans font-bold text-sm border-b-2 transition-all ${activeTab === 'DISMISSED' ? 'border-gray-400 text-gray-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          <XCircle size={18} /> Đã bác bỏ
        </button>
      </div>

      {/* ── TOOLBAR (SEARCH & FILTERS) ── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-lowest p-4 rounded-md shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50 w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary/50 focus-within:-translate-y-0.5 transition-all">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo Mã báo cáo, Người tố cáo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none w-full font-body text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50">
            <Filter size={16} className="text-gray-400" />
            <select
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
              className="bg-transparent text-sm outline-none font-body text-gray-700 cursor-pointer"
            >
              <option value="ALL">Tất cả đối tượng</option>
              <option value="POST">Bài đăng (POST)</option>
              <option value="USER">Người dùng (USER)</option>
              <option value="TRANSACTION">Giao dịch (TRANSACTION)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <div className="bg-surface-lowest rounded-md shadow-soft border border-outline-variant/30 overflow-visible relative">
        <div className="overflow-x-auto min-h-100">
          <table className="w-full text-left font-body">
            <thead className="bg-surface/50 border-b border-outline-variant/30 font-label text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4 font-semibold rounded-tl-md">
                  Mã & Ngày gửi
                </th>
                <th className="px-5 py-4 font-semibold">Người tố cáo</th>
                <th className="px-5 py-4 font-semibold">Lý do & Đối tượng</th>
                <th className="px-5 py-4 font-semibold text-center">
                  Trạng thái
                </th>
                <th className="px-3 py-4 font-semibold text-center rounded-tr-md">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr
                    key={report._id}
                    className="hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          {report._id}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          {formatDate(report.createdAt)}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">
                          {report.reporterId.fullName}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          {report.reporterId.email}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-1.5">
                        {getReasonBadge(report.reason)}
                        <span className="text-xs text-gray-600">
                          <strong className="text-gray-900">
                            {report.targetType}:
                          </strong>{' '}
                          {report.targetName}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      {getStatusBadge(report.status)}
                    </td>

                    <td className="px-3 py-4 text-center relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(
                            openDropdownId === report._id ? null : report._id
                          );
                        }}
                        className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openDropdownId === report._id && (
                        <div className="absolute right-8 top-10 w-40 bg-surface-lowest border border-outline-variant/30 rounded-2xl shadow-hover z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setOpenDropdownId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                          >
                            <Eye size={16} /> Xem & Xử lý
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    Không có báo cáo nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        formatDate={formatDate}
        getStatusBadge={getStatusBadge}
        getReasonBadge={getReasonBadge}
      />
    </div>
  );
}
