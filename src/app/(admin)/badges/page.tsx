'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Award,
  RefreshCw,
  Plus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Filter,
} from 'lucide-react';
import dynamic from 'next/dynamic';
const BadgeEditModal = dynamic(
  () => import('@/components/features/badges/BadgeEditModal'),
  { loading: () => null }
);
import DataTable, { type Column } from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/ui/PageHeader';
import {
  IBadge,
  BadgeStat,
  TargetRole,
  fetchAdminBadges,
  fetchBadgeStats,
  toggleBadgeApi,
} from '@/lib/badgeApi';

const TARGET_ROLE_LABELS: Record<TargetRole, string> = {
  BOTH: 'Tất cả',
  USER: 'User',
  STORE: 'Store',
};

const TRIGGER_LABELS: Record<string, string> = {
  PROFILE_COMPLETED: 'Hoàn thiện hồ sơ',
  POST_CREATED: 'Tạo bài đăng',
  TRANSACTION_COMPLETED: 'Hoàn thành GD',
  REVIEW_RECEIVED: 'Nhận đánh giá',
  GREENPOINTS_AWARDED: 'Nhận điểm',
  KYC_APPROVED: 'KYC duyệt',
};

const ROLE_FILTER_OPTIONS = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'USER', value: 'USER' },
  { label: 'STORE', value: 'STORE' },
  { label: 'BOTH', value: 'BOTH' },
];

const ACTIVE_FILTER_OPTIONS = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Đang hoạt động', value: 'true' },
  { label: 'Đã tắt', value: 'false' },
];

const LIMIT = 20;

export default function BadgesManagementPage() {
  const [badges, setBadges] = useState<IBadge[]>([]);
  const [stats, setStats] = useState<BadgeStat[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [roleFilter, setRoleFilter] = useState('ALL');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const [editTarget, setEditTarget] = useState<IBadge | null | undefined>(
    undefined
  );

  const loadBadges = useCallback(
    async (page: number) => {
      setLoading(true);
      setError(null);
      try {
        const params: Parameters<typeof fetchAdminBadges>[0] = {
          page,
          limit: LIMIT,
        };
        if (roleFilter !== 'ALL') params.targetRole = roleFilter as TargetRole;
        if (activeFilter !== 'ALL') params.isActive = activeFilter === 'true';
        const res = await fetchAdminBadges(params);
        setBadges(res.data.badges);
        setPagination(res.data.pagination);
      } catch {
        setError('Không thể tải danh sách huy hiệu.');
      } finally {
        setLoading(false);
      }
    },
    [roleFilter, activeFilter]
  );

  const loadStats = useCallback(async () => {
    try {
      const res = await fetchBadgeStats();
      setStats(res.data);
    } catch {
      // stats are non-critical
    }
  }, []);

  useEffect(() => {
    loadBadges(currentPage);
  }, [currentPage, loadBadges]);
  useEffect(() => {
    loadStats();
  }, [loadStats]);
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, activeFilter]);

  const handleToggle = async (badge: IBadge) => {
    setTogglingId(badge._id);
    try {
      const res = await toggleBadgeApi(badge._id);
      setBadges((prev) =>
        prev.map((b) =>
          b._id === badge._id ? { ...b, isActive: res.data.isActive } : b
        )
      );
    } catch {
      // silent
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaved = (saved: IBadge) => {
    setEditTarget(undefined);
    setBadges((prev) => {
      const idx = prev.findIndex((b) => b._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...saved };
        return next;
      }
      loadBadges(currentPage);
      return prev;
    });
    loadStats();
  };

  const totalBadges = pagination?.total ?? 0;
  const activeBadges = badges.filter((b) => b.isActive).length;
  const topBadge = stats[0];

  const columns: Column<IBadge>[] = [
    {
      key: 'name',
      header: 'Huy hiệu',
      render: (badge) => (
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden shrink-0">
            <Image
              src={badge.imageUrl}
              alt={badge.name}
              width={32}
              height={32}
              className="object-contain"
              unoptimized
            />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {badge.name}
            </p>
            <p className="text-xs font-mono text-gray-400 dark:text-gray-500">
              {badge.code}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'targetRole',
      header: 'Đối tượng',
      render: (badge) => (
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-secondary/10 text-secondary">
          {TARGET_ROLE_LABELS[badge.targetRole]}
        </span>
      ),
    },
    {
      key: 'triggerEvent',
      header: 'Trigger',
      render: (badge) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {TRIGGER_LABELS[badge.triggerEvent] ?? badge.triggerEvent}
        </span>
      ),
    },
    {
      key: 'pointReward',
      header: 'Thưởng',
      align: 'center',
      render: (badge) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-green-50 text-primary border border-primary/15">
          +{badge.pointReward}
        </span>
      ),
    },
    {
      key: 'unlockedCount',
      header: 'Đã mở',
      align: 'center',
      render: (badge) => (
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {badge.unlockedCount ?? 0}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (badge) => (
        <StatusBadge
          status={badge.isActive ? 'ACTIVE' : 'HIDDEN'}
          label={badge.isActive ? 'Hoạt động' : 'Đã tắt'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      align: 'center',
      render: (badge) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setEditTarget(badge)}
            className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
            title="Chỉnh sửa"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => handleToggle(badge)}
            disabled={togglingId === badge._id}
            className={`p-1.5 rounded-md transition-colors ${badge.isActive ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'} disabled:opacity-50`}
            title={badge.isActive ? 'Tắt' : 'Bật'}
          >
            {togglingId === badge._id ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : badge.isActive ? (
              <ToggleRight size={18} />
            ) : (
              <ToggleLeft size={18} />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      <PageHeader
        title="Quản Lý Huy Hiệu"
        subtitle="Toàn bộ catalog huy hiệu gamification — tạo, chỉnh sửa, bật/tắt"
        action={
          <button
            onClick={() => setEditTarget(null)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} /> Tạo huy hiệu
          </button>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Award size={18} className="text-primary" />}
          label="Tổng huy hiệu"
          value={totalBadges}
          bg="bg-primary/5 border-primary/15"
        />
        <StatCard
          icon={<ToggleRight size={18} className="text-green-600" />}
          label="Đang hoạt động"
          value={activeBadges}
          bg="bg-green-50 dark:bg-green-900/20 border-green-200/60 dark:border-green-800/30"
        />
        <StatCard
          icon={
            topBadge ? (
              <Image
                src={topBadge.badge.imageUrl}
                alt={topBadge.badge.name}
                width={28}
                height={28}
                className="object-contain"
                unoptimized
              />
            ) : (
              <TrendingUp size={18} className="text-secondary" />
            )
          }
          label="Phổ biến nhất"
          value={topBadge?.unlockedCount ?? 0}
          bg="bg-secondary/5 dark:bg-secondary/10 border-secondary/20"
          subtitle={topBadge?.badge.name}
        />
      </div>

      {/* Toolbar — filter-only, không có search nên giữ custom */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-surface-lowest dark:bg-gray-900 p-4 rounded-md shadow-sm border border-outline-variant/30 dark:border-gray-800">
        <Filter size={15} className="text-gray-400 shrink-0 hidden sm:block" />
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs font-label text-gray-500 dark:text-gray-400 mr-1">
            Role:
          </span>
          {ROLE_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRoleFilter(opt.value)}
              className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${roleFilter === opt.value ? 'bg-primary text-white border-primary' : 'border-outline-variant/50 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-primary/5'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-outline-variant/40 hidden sm:block" />
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs font-label text-gray-500 dark:text-gray-400 mr-1">
            Trạng thái:
          </span>
          {ACTIVE_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${activeFilter === opt.value ? 'bg-primary text-white border-primary' : 'border-outline-variant/50 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-primary/5'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => loadBadges(currentPage)}
          className="ml-auto p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-md transition-colors border border-outline-variant/50 shrink-0"
          title="Làm mới"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      <DataTable
        columns={columns}
        data={badges}
        rowKey={(b) => b._id}
        loading={loading}
        error={error}
        emptyMessage="Không có huy hiệu nào phù hợp với bộ lọc."
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        className="rounded-2xl relative"
        tableClassName="min-h-80"
        headerClassName="bg-surface/50 dark:bg-gray-800/50 font-label text-xs uppercase text-gray-500"
        bodyClassName="divide-outline-variant/20 text-sm"
        rowClassName="hover:bg-primary/5 transition-colors"
        cellClassName={(col) => (col.key === 'actions' ? 'px-3' : '')}
      />

      {/* Top badges stats */}
      {stats.length > 0 && (
        <div className="bg-surface-lowest dark:bg-gray-900 rounded-md shadow-soft dark:shadow-none border border-outline-variant/30 dark:border-gray-800 p-5">
          <h3 className="font-sans font-bold text-base text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            Top huy hiệu được mở khóa nhiều nhất
          </h3>
          <div className="flex flex-col gap-3">
            {stats.slice(0, 5).map((stat, idx) => (
              <div key={stat.badge._id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 dark:text-gray-500 w-5 text-right shrink-0">
                  {idx + 1}
                </span>
                <Image
                  src={stat.badge.imageUrl}
                  alt={stat.badge.name}
                  width={28}
                  height={28}
                  className="object-contain shrink-0"
                  unoptimized
                />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 w-40 truncate shrink-0">
                  {stat.badge.name}
                </span>
                <div className="flex-1 h-2 bg-surface-container dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-label text-gray-500 dark:text-gray-400 w-20 text-right shrink-0">
                  {stat.unlockedCount} ({stat.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {editTarget !== undefined && (
        <BadgeEditModal
          badge={editTarget}
          onClose={() => setEditTarget(undefined)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bg: string;
  subtitle?: string;
}) {
  return (
    <div
      className={`bg-surface-lowest dark:bg-gray-900 border rounded-md p-4 shadow-sm flex items-center gap-4 ${bg}`}
    >
      <div className="w-10 h-10 rounded-xl bg-surface-container dark:bg-gray-700/60 flex items-center justify-center shrink-0 overflow-hidden">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-label text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-2xl font-sans font-bold text-gray-900 dark:text-gray-100">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
