'use client';

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export type TimeRange = 'day' | 'week' | 'month';

interface DateRangePickerProps {
  /** The anchor date */
  date: Date;
  /** Current time range mode */
  range: TimeRange;
  onDateChange: (date: Date) => void;
  onRangeChange: (range: TimeRange) => void;
}

const rangeLabels: Record<TimeRange, string> = {
  day: 'Ngày',
  week: 'Tuần',
  month: 'Tháng',
};

function formatLabel(date: Date, range: TimeRange): string {
  const opts: Intl.DateTimeFormatOptions =
    range === 'day'
      ? { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }
      : range === 'week'
        ? { day: '2-digit', month: '2-digit', year: 'numeric' }
        : { month: 'long', year: 'numeric' };

  if (range === 'week') {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} – ${end.toLocaleDateString('vi-VN', opts)}`;
  }

  return date.toLocaleDateString('vi-VN', opts);
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function navigate(date: Date, range: TimeRange, direction: -1 | 1): Date {
  const d = new Date(date);
  if (range === 'day') {
    d.setDate(d.getDate() + direction);
  } else if (range === 'week') {
    d.setDate(d.getDate() + direction * 7);
  } else {
    d.setMonth(d.getMonth() + direction);
  }
  return d;
}

function isToday(date: Date, range: TimeRange): boolean {
  const now = new Date();
  if (range === 'day') {
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }
  if (range === 'week') {
    const ws = getWeekStart(date).getTime();
    const nws = getWeekStart(now).getTime();
    return ws === nws;
  }
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function isFuture(date: Date, range: TimeRange): boolean {
  const now = new Date();
  if (range === 'day') {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const n = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d >= n;
  }
  if (range === 'week') {
    return getWeekStart(date).getTime() >= getWeekStart(now).getTime();
  }
  return (
    date.getFullYear() > now.getFullYear() ||
    (date.getFullYear() === now.getFullYear() &&
      date.getMonth() >= now.getMonth())
  );
}

export default function DateRangePicker({
  date,
  range,
  onDateChange,
  onRangeChange,
}: DateRangePickerProps) {
  const canGoForward = !isFuture(date, range);
  const current = isToday(date, range);

  return (
    <div className="flex items-center gap-3">
      {/* Range selector */}
      <div className="flex p-0.5 bg-surface rounded-xl border border-outline-variant/30">
        {(['day', 'week', 'month'] as TimeRange[]).map((r) => (
          <button
            key={r}
            onClick={() => onRangeChange(r)}
            className={`px-3 py-1.5 text-xs font-label font-semibold rounded-lg transition-all ${
              range === r
                ? 'bg-linear-to-br from-primary to-primary-container text-white shadow-soft'
                : 'text-neutral-T50 hover:text-primary hover:bg-primary/5'
            }`}
          >
            {rangeLabels[r]}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1 bg-surface-lowest rounded-xl border border-outline-variant/30 px-1 py-0.5">
        <button
          onClick={() => onDateChange(navigate(date, range, -1))}
          className="p-1.5 rounded-lg text-neutral-T50 hover:bg-primary/10 hover:text-primary transition-all"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-2 px-3 min-w-45 justify-center">
          <Calendar size={14} className="text-primary shrink-0" />
          <span className="text-sm font-body font-semibold text-neutral-T20 whitespace-nowrap capitalize">
            {formatLabel(date, range)}
          </span>
        </div>

        <button
          onClick={() => {
            if (canGoForward) onDateChange(navigate(date, range, 1));
          }}
          disabled={!canGoForward}
          className="p-1.5 rounded-lg text-neutral-T50 hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Today button */}
      {!current && (
        <button
          onClick={() => onDateChange(new Date())}
          className="px-3 py-1.5 text-xs font-label font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all"
        >
          Hôm nay
        </button>
      )}
    </div>
  );
}
