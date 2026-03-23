'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

import { areaData, barData, lineData } from '@/constants/mockData';
import type { StatCardProps } from '@/types/dashboard';

export default function StatCard({
  title,
  value,
  change,
  chartType,
  color,
  gradFrom,
  gradTo,
}: StatCardProps) {
  const miniChart = () => {
    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={56}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id={`g-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={2}
                fill={`url(#g-${title})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={56}>
            <BarChart data={barData} barSize={6}>
              <Bar dataKey="v" fill={color} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={56}>
            <LineChart data={lineData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={56}>
            <PieChart>
              <Pie
                data={[{ v: 78 }, { v: 22 }]}
                dataKey="v"
                innerRadius={16}
                outerRadius={26}
                startAngle={90}
                endAngle={-270}
              >
                <Cell fill={color} />
                <Cell fill="#1e2a4a" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden flex flex-col gap-3"
      style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
    >
      {/* Subtle grid texture overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(255,255,255,.1) 20px,rgba(255,255,255,.1) 21px),' +
            'repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(255,255,255,.1) 20px,rgba(255,255,255,.1) 21px)',
        }}
      />

      {/* Header row */}
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            {title}
          </p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <span
          className="text-xs font-semibold px-2 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
        >
          {change}
        </span>
      </div>

      {/* Mini chart */}
      <div className="relative z-10">{miniChart()}</div>
    </div>
  );
}
