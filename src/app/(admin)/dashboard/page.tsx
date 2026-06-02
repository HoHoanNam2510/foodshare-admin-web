'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import {
  Users,
  Loader2,
  FileText,
  CreditCard,
  ShieldAlert,
  AlertTriangle,
  LayoutDashboard,
  Download,
} from 'lucide-react';
import StatCards from '@/components/features/dashboard/StatCards';
import ChartSection from '@/components/features/dashboard/ChartSection';
import {
  getColumnsForTab,
  getRowKey,
} from '@/components/features/dashboard/tableColumns';
import DataTable, { type SortOrder } from '@/components/ui/DataTable';
import Toolbar from '@/components/ui/Toolbar';
import {
  fetchDashboardStats,
  fetchDashboardChart,
  fetchDashboardTable,
  type OverviewStats,
  type ChartPoint,
  type PaginationMeta,
  type TabId,
  type TimeRange,
} from '@/lib/dashboardApi';

// ─── Tab config ──────────────────────────────────────────────

const tabs: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: 'users', label: 'Người dùng', icon: Users },
  { id: 'posts', label: 'Bài đăng', icon: FileText },
  { id: 'transactions', label: 'Giao dịch', icon: CreditCard },
  { id: 'reports', label: 'Báo cáo', icon: AlertTriangle },
  { id: 'audits', label: 'Audit Logs', icon: ShieldAlert },
];

// ─── Main Page ───────────────────────────────────────────────

export default function DashboardPage() {
  // Tab & chart controls
  const [activeTab, setActiveTab] = useState<TabId>('users');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [chartDate, setChartDate] = useState<Date>(new Date());

  // Table controls
  const [currentPage, setCurrentPage] = useState(1);
  const [tableSortOrder, setTableSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Data
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [tableData, setTableData] = useState<unknown[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Loading via useTransition (avoids setState-in-effect cascades)
  const [loadingStats, startStatsTransition] = useTransition();
  const [loadingChart, startChartTransition] = useTransition();
  const [loadingTable, startTableTransition] = useTransition();

  // ── Fetch stats ──
  useEffect(() => {
    startStatsTransition(() => {
      void fetchDashboardStats()
        .then(setStats)
        .catch(() => setStats(null));
    });
  }, []);

  // ── Fetch chart ──
  useEffect(() => {
    const dateStr = chartDate.toISOString().split('T')[0];
    startChartTransition(() => {
      void fetchDashboardChart(activeTab, timeRange, dateStr)
        .then(setChartData)
        .catch(() => setChartData([]));
    });
  }, [activeTab, timeRange, chartDate]);

  // ── Fetch table ──
  const loadTable = useCallback(() => {
    startTableTransition(() => {
      void fetchDashboardTable(activeTab, currentPage, 10, tableSortOrder)
        .then(({ data, pagination: pg }) => {
          setTableData(data);
          setPagination(pg);
        })
        .catch(() => {
          setTableData([]);
          setPagination(null);
        });
    });
  }, [activeTab, currentPage, tableSortOrder]);

  useEffect(() => {
    loadTable();
  }, [loadTable]);

  // ── Handlers ──
  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery('');
  };

  const handleSort = (_key: string, order: SortOrder) => {
    if (order === null) {
      setTableSortOrder('desc');
    } else {
      setTableSortOrder(order);
    }
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const cols = getColumnsForTab(activeTab);
    const headerRow = cols.map((c) => c.header).join(',');
    const rows = filteredData.map((row) => {
      const r = row as Record<string, unknown>;
      return cols
        .map((c) => {
          const val = r[c.key];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') {
            const o = val as Record<string, unknown>;
            return `"${o.fullName ?? o.title ?? JSON.stringify(val)}"`;
          }
          const str = String(val).replace(/"/g, '""');
          return str.includes(',') || str.includes('\n') ? `"${str}"` : str;
        })
        .join(',');
    });
    const csv = [headerRow, ...rows].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foodshare_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Client-side search filter (server already paginated)
  const filteredData = searchQuery
    ? tableData.filter((row) => {
        const r = row as Record<string, unknown>;
        const q = searchQuery.toLowerCase();
        const owner = r.ownerId as Record<string, unknown> | undefined;
        const requester = r.requesterId as Record<string, unknown> | undefined;
        const reporter = r.reporterId as Record<string, unknown> | undefined;
        const searchable = [
          r.fullName,
          r.email,
          r.title,
          owner?.fullName,
          requester?.fullName,
          reporter?.fullName,
          r.targetType,
          r.reason,
          r.status,
          r.role,
          r._type,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return searchable.includes(q);
      })
    : tableData;

  const columns = getColumnsForTab(activeTab);
  const rowKey = getRowKey(activeTab);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-primary-container flex items-center justify-center shadow-soft">
            <LayoutDashboard size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-sans font-extrabold text-neutral-T10 dark:text-gray-100 tracking-tight">
              Tổng quan hệ thống
            </h1>
            <p className="text-sm font-body text-neutral-T60 dark:text-gray-400 mt-0.5">
              Theo dõi các chỉ số tăng trưởng và hoạt động
            </p>
          </div>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filteredData.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-T30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-soft"
        >
          <Download size={16} />
          Xuất CSV
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      {loadingStats ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-primary" />
          </div>
        </div>
      ) : stats ? (
        <StatCards stats={stats} activeTab={activeTab} />
      ) : null}

      {/* ── TABS ── */}
      <div className="flex items-center gap-1 bg-surface-lowest dark:bg-gray-900 p-1.5 rounded-xl border border-outline-variant/30 dark:border-gray-800 shadow-sm overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-neutral-T60 dark:text-gray-400 hover:bg-primary/5 hover:text-primary'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── CHART ── */}
      <ChartSection
        activeTab={activeTab}
        chartData={chartData}
        loading={loadingChart}
        chartType={chartType}
        onChartTypeChange={setChartType}
        date={chartDate}
        timeRange={timeRange}
        onDateChange={setChartDate}
        onTimeRangeChange={setTimeRange}
      />

      {/* ── DATA TABLE ── */}
      <div className="flex flex-col gap-4">
        <Toolbar
          onSearch={setSearchQuery}
          placeholder={`Tìm trong ${tabs.find((t) => t.id === activeTab)?.label?.toLowerCase()}...`}
        />

        <DataTable
          columns={columns}
          data={filteredData}
          rowKey={rowKey}
          loading={loadingTable}
          emptyMessage={
            searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có dữ liệu'
          }
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onSort={handleSort}
          sortKey="createdAt"
          sortOrder={tableSortOrder}
        />
      </div>
    </div>
  );
}
