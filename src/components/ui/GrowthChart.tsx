'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface ChartData {
  name: string;
  total: number;
}

interface GrowthChartProps {
  data: ChartData[];
  type?: 'bar' | 'line';
}

export default function GrowthChart({ data, type = 'bar' }: GrowthChartProps) {
  // Màu primary từ hệ thống: #296C24
  const primaryColor = '#296C24';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-lowest border border-outline-variant/50 p-3 rounded-lg shadow-hover">
          <p className="font-label text-xs text-gray-500 mb-1">{label}</p>
          <p className="font-body text-sm font-bold text-primary">
            Số lượng: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-75">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E1E3E2"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#8F9190' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#8F9190' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8F9F8' }} />
            <Bar
              dataKey="total"
              fill={primaryColor}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        ) : (
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E1E3E2"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#8F9190' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#8F9190' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="total"
              stroke={primaryColor}
              strokeWidth={3}
              dot={{ r: 4, fill: primaryColor, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
