'use client';

import { useState } from 'react';
import {
  Calendar,
  BarChart2,
  TrendingUp,
  Users,
  FileText,
  CreditCard,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import GrowthChart from '@/components/ui/GrowthChart';
import Pagination from '@/components/ui/Pagination';

// --- MOCK DATA ---
const mockChartData = {
  day: [
    { name: '00:00', total: 12 },
    { name: '04:00', total: 5 },
    { name: '08:00', total: 45 },
    { name: '12:00', total: 80 },
    { name: '16:00', total: 65 },
    { name: '20:00', total: 30 },
  ],
  week: [
    { name: 'T2', total: 120 },
    { name: 'T3', total: 150 },
    { name: 'T4', total: 180 },
    { name: 'T5', total: 140 },
    { name: 'T6', total: 220 },
    { name: 'T7', total: 300 },
    { name: 'CN', total: 280 },
  ],
  month: [
    { name: 'Tuần 1', total: 800 },
    { name: 'Tuần 2', total: 1200 },
    { name: 'Tuần 3', total: 950 },
    { name: 'Tuần 4', total: 1500 },
  ],
};

const tabs = [
  { id: 'users', label: 'Người dùng', icon: Users },
  { id: 'posts', label: 'Bài đăng', icon: FileText },
  { id: 'transactions', label: 'Giao dịch', icon: CreditCard },
  { id: 'reports', label: 'Báo cáo', icon: AlertTriangle },
  { id: 'audits', label: 'Audit Logs', icon: ShieldAlert },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* ── HEADER & DATE PICKER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-sans font-bold text-gray-900 leading-tight">
            Tổng quan hệ thống
          </h1>
          <p className="text-sm font-body text-gray-500 mt-1">
            Theo dõi các chỉ số tăng trưởng và hoạt động
          </p>
        </div>

        {/* Giả lập Nút chọn ngày/tháng */}
        <button className="flex items-center gap-2 px-4 py-2 bg-surface-lowest border border-outline-variant/50 rounded-lg text-sm font-body font-medium text-gray-700 shadow-sm hover:bg-surface-container transition-all">
          <Calendar size={16} className="text-primary" />
          <span>Tháng 3, 2026</span>
        </button>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div className="flex overflow-x-auto scrollbar-none border-b border-outline-variant/30">
        <div className="flex gap-6 px-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 pb-3 text-sm font-body font-semibold transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'text-primary border-primary'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CHART SECTION ── */}
      <div className="bg-surface-lowest rounded-md shadow-soft border border-outline-variant/30 p-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-sans font-bold text-lg text-gray-900">
            Biểu đồ tăng trưởng ({tabs.find((t) => t.id === activeTab)?.label})
          </h2>

          <div className="flex items-center gap-4">
            {/* Time Range Toggle */}
            <div className="flex p-1 bg-surface-container rounded-lg">
              {['day', 'week', 'month'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as any)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all ${timeRange === range ? 'bg-surface-lowest text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {range === 'day'
                    ? 'Ngày'
                    : range === 'week'
                      ? 'Tuần'
                      : 'Tháng'}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-outline-variant/50" />

            {/* Chart Type Toggle */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setChartType('bar')}
                className={`p-1.5 rounded-md transition-all ${chartType === 'bar' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-surface-container'}`}
              >
                <BarChart2 size={18} />
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`p-1.5 rounded-md transition-all ${chartType === 'line' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-surface-container'}`}
              >
                <TrendingUp size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Gọi Component Chart */}
        <GrowthChart data={mockChartData[timeRange]} type={chartType} />
      </div>

      {/* ── LIST & DATA TABLE SECTION ── */}
      <div className="bg-surface-lowest rounded-md shadow-soft border border-outline-variant/30 overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface/50">
          <h2 className="font-sans font-bold text-gray-900">
            Danh sách {tabs.find((t) => t.id === activeTab)?.label} mới nhất
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-body">
            <thead className="bg-surface-lowest border-b border-outline-variant/30 font-label text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3 font-semibold">ID</th>
                <th className="px-5 py-3 font-semibold">Thông tin chung</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm">
              {/* Fake render 5 item để demo */}
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-primary/5 transition-colors">
                  <td className="px-5 py-4 text-gray-500 font-medium">
                    #{activeTab.substring(0, 3).toUpperCase()}-00{item}
                  </td>
                  <td className="px-5 py-4 text-gray-900 font-medium">
                    Bản ghi dữ liệu mẫu số {item}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-primary text-xs font-bold">
                      Hoạt động
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-gray-500">
                    28/03/2026
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Gọi Component Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={12}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}
