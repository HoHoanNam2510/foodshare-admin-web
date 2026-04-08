'use client';

import { BarChart2, TrendingUp, Loader2 } from 'lucide-react';
import GrowthChart from '@/components/ui/GrowthChart';
import DateRangePicker, {
  type TimeRange,
} from '@/components/ui/DateRangePicker';
import type { ChartPoint, TabId } from '@/lib/dashboardApi';

const tabLabels: Record<TabId, string> = {
  users: 'Người dùng',
  posts: 'Bài đăng',
  transactions: 'Giao dịch',
  reports: 'Báo cáo',
  audits: 'Audit Logs',
};

interface ChartSectionProps {
  activeTab: TabId;
  chartData: ChartPoint[];
  loading: boolean;
  chartType: 'bar' | 'line';
  onChartTypeChange: (type: 'bar' | 'line') => void;
  date: Date;
  timeRange: TimeRange;
  onDateChange: (date: Date) => void;
  onTimeRangeChange: (range: TimeRange) => void;
}

export default function ChartSection({
  activeTab,
  chartData,
  loading,
  chartType,
  onChartTypeChange,
  date,
  timeRange,
  onDateChange,
  onTimeRangeChange,
}: ChartSectionProps) {
  return (
    <div className="bg-surface-lowest rounded-lg shadow-soft border border-outline-variant/30 overflow-hidden">
      {/* Header with gradient accent */}
      <div className="px-6 py-5 border-b border-outline-variant/20 bg-linear-to-r from-primary/3 to-transparent">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-sans font-bold text-lg text-neutral-T10 tracking-tight">
              Biểu đồ tăng trưởng
            </h2>
            <p className="text-xs font-body text-neutral-T60 mt-0.5">
              {tabLabels[activeTab]} — theo{' '}
              {timeRange === 'day'
                ? 'giờ'
                : timeRange === 'week'
                  ? 'ngày'
                  : 'tuần'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Date navigator */}
            <DateRangePicker
              date={date}
              range={timeRange}
              onDateChange={onDateChange}
              onRangeChange={onTimeRangeChange}
            />

            {/* Chart type toggle */}
            <div className="flex items-center gap-0.5 p-0.5 bg-surface rounded-xl border border-outline-variant/30">
              <button
                onClick={() => onChartTypeChange('bar')}
                className={`p-2 rounded-lg transition-all ${
                  chartType === 'bar'
                    ? 'bg-linear-to-br from-primary to-primary-container text-white shadow-soft'
                    : 'text-neutral-T60 hover:text-primary hover:bg-primary/5'
                }`}
              >
                <BarChart2 size={16} />
              </button>
              <button
                onClick={() => onChartTypeChange('line')}
                className={`p-2 rounded-lg transition-all ${
                  chartType === 'line'
                    ? 'bg-linear-to-br from-primary to-primary-container text-white shadow-soft'
                    : 'text-neutral-T60 hover:text-primary hover:bg-primary/5'
                }`}
              >
                <TrendingUp size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-75">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
              <span className="text-sm font-body text-neutral-T60">
                Đang tải biểu đồ...
              </span>
            </div>
          </div>
        ) : (
          <GrowthChart data={chartData} type={chartType} />
        )}
      </div>
    </div>
  );
}
