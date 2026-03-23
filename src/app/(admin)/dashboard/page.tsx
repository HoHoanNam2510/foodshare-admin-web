'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

import StatCard from '@/components/common/StatCard';
import { donutData, DONUT_COLORS, monthlyData } from '@/constants/mockData';

export default function DashboardPage() {
  const { theme }             = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const dark = !mounted || theme === 'dark';

  // ── Theme tokens scoped to page-level content ────────────────────────────
  const cardBg        = dark ? 'rgba(255,255,255,0.03)' : '#fff';
  const cardBorder    = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const textPrimary   = dark ? '#e2e8f0'                : '#1e293b';
  const textSecondary = dark ? 'rgba(255,255,255,0.5)'  : '#64748b';

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">

      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: textPrimary }}>
          Trang Thống Kê
        </h1>
        <p className="text-sm mt-1" style={{ color: textSecondary }}>
          Tổng quan hệ thống FoodShare
        </p>
      </div>

      {/* ── Section 1: KPI stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Người Dùng"
          value="42,500"
          change="+12.5%"
          chartType="area"
          color="#a855f7"
          gradFrom="#1e1040"
          gradTo="#2d1b69"
        />
        <StatCard
          title="Bài Đăng"
          value="15,200"
          change="+8.3%"
          chartType="bar"
          color="#22d3ee"
          gradFrom="#0a2030"
          gradTo="#0e3a5a"
        />
        <StatCard
          title="Thực Phẩm Đã Cứu"
          value="8,400 kg"
          change="+34.5%"
          chartType="donut"
          color="#22c55e"
          gradFrom="#052014"
          gradTo="#0a3a24"
        />
        <StatCard
          title="Phí Tạm Giữ"
          value="$1,250K"
          change="+23.7%"
          chartType="line"
          color="#f59e0b"
          gradFrom="#1f1205"
          gradTo="#3a2208"
        />
      </div>

      {/* ── Section 2: Detail charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Chart 1: Monthly P2P vs B2C */}
        <div
          className="rounded-2xl p-5"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: textPrimary }}>
                Biểu Đồ Phân Bố Bài Đăng P2P &amp; B2C
              </h2>
              <p className="text-xs mt-0.5" style={{ color: textSecondary }}>
                ADM_D02 · Theo tháng
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: textSecondary }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#22d3ee' }} />
                P2P
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#a855f7' }} />
                B2C
              </span>
            </div>
          </div>

          <div className="mt-1 flex items-center gap-6 mb-4">
            <div>
              <span className="text-2xl font-bold" style={{ color: '#22d3ee' }}>
                68.9%
              </span>
              <span className="ml-2 text-xs font-semibold" style={{ color: '#22c55e' }}>
                ▲ 34.5%
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={10} barGap={3}>
              <XAxis
                dataKey="month"
                tick={{ fill: textSecondary, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: textSecondary, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: dark ? '#1e2a4a' : '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: textPrimary }}
              />
              <Bar dataKey="p2p" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              <Bar dataKey="b2c" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: User-type donut */}
        <div
          className="rounded-2xl p-5"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: textPrimary }}>
                Phân Bố Loại Người Dùng
              </h2>
              <p className="text-xs mt-0.5" style={{ color: textSecondary }}>
                Tỷ lệ theo loại tài khoản
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 mt-4">
            {/* Donut */}
            <div className="relative">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={3}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold" style={{ color: textPrimary }}>
                  68%
                </span>
                <span className="text-xs" style={{ color: textSecondary }}>
                  Người dùng
                </span>
              </div>
            </div>

            {/* Legend + progress bars */}
            <div className="flex flex-col gap-4 flex-1">
              {donutData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ background: DONUT_COLORS[i] }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: textPrimary }}>
                        {d.name}
                      </span>
                      <span className="text-sm font-bold" style={{ color: DONUT_COLORS[i] }}>
                        {d.value}%
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${d.value}%`, background: DONUT_COLORS[i] }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Summary card */}
              <div
                className="mt-2 p-3 rounded-xl"
                style={{
                  background: dark ? 'rgba(168,85,247,0.1)' : 'rgba(168,85,247,0.08)',
                  border: '1px solid rgba(168,85,247,0.2)',
                }}
              >
                <p className="text-xs" style={{ color: textSecondary }}>
                  Tổng người dùng đã đăng ký
                </p>
                <p className="text-lg font-bold mt-0.5" style={{ color: textPrimary }}>
                  42,500{' '}
                  <span className="text-xs font-normal text-green-400">
                    ↑ 12.5% tháng này
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-center mt-6" style={{ color: textSecondary }}>
        Dữ liệu được cập nhật lần cuối: 20/03/2026 · FoodShare Admin Panel v1.0
      </p>
    </div>
  );
}
