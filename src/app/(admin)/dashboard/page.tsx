'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Users,
  Loader2,
  FileText,
  CreditCard,
  ShieldAlert,
  AlertTriangle,
  LayoutDashboard,
} from 'lucide-react';
import StatCards from '@/components/features/dashboard/StatCards';
import ChartSection from '@/components/features/dashboard/ChartSection';
import {
  getColumnsForTab,
  getRowKey,
} from '@/components/features/dashboard/tableColumns';
import DataTable, { type SortOrder } from '@/components/ui/DataTable';
import SearchInput from '@/components/ui/SearchInput';
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
  const [tableData, setTableData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Loading
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);

  // ── Fetch stats ──
  useEffect(() => {
    setLoadingStats(true);
    fetchDashboardStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));
  }, []);

  // ── Fetch chart ──
  useEffect(() => {
    setLoadingChart(true);
    const dateStr = chartDate.toISOString().split('T')[0];
    fetchDashboardChart(activeTab, timeRange, dateStr)
      .then(setChartData)
      .catch(() => setChartData([]))
      .finally(() => setLoadingChart(false));
  }, [activeTab, timeRange, chartDate]);

  // ── Fetch table ──
  const loadTable = useCallback(() => {
    setLoadingTable(true);
    fetchDashboardTable(activeTab, currentPage, 10, tableSortOrder)
      .then(({ data, pagination: pg }) => {
        setTableData(data);
        setPagination(pg);
      })
      .catch(() => {
        setTableData([]);
        setPagination(null);
      })
      .finally(() => setLoadingTable(false));
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

  // Client-side search filter (server already paginated)
  const filteredData = searchQuery
    ? tableData.filter((row) => {
        const q = searchQuery.toLowerCase();
        const searchable = [
          row.fullName,
          row.email,
          row.title,
          row.ownerId?.fullName,
          row.requesterId?.fullName,
          row.reporterId?.fullName,
          row.targetType,
          row.reason,
          row.status,
          row.role,
          row._type,
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
            <h1 className="text-2xl font-sans font-extrabold text-neutral-T10 tracking-tight">
              Tổng quan hệ thống
            </h1>
            <p className="text-sm font-body text-neutral-T60 mt-0.5">
              Theo dõi các chỉ số tăng trưởng và hoạt động
            </p>
          </div>
        </div>
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
      <div className="flex overflow-x-auto scrollbar-none">
        <div className="flex gap-1 p-1 bg-surface rounded-xl border border-outline-variant/30">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-body font-semibold rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-linear-to-br from-primary to-primary-container text-white shadow-soft'
                    : 'text-neutral-T50 hover:text-primary hover:bg-primary/5'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
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
        {/* Table toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="font-sans font-bold text-lg text-neutral-T10 tracking-tight">
            Danh sách {tabs.find((t) => t.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-3">
            <SearchInput
              onSearch={setSearchQuery}
              placeholder={`Tìm trong ${tabs.find((t) => t.id === activeTab)?.label?.toLowerCase()}...`}
              className="w-64"
            />
          </div>
        </div>

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
