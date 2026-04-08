'use client';

import {
  Users,
  FileText,
  CreditCard,
  AlertTriangle,
  Activity,
  TrendingUp,
  ShieldCheck,
  Ban,
  Clock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertOctagon,
  XCircle,
} from 'lucide-react';
import type { OverviewStats, TabId } from '@/lib/dashboardApi';

interface StatCardDef {
  label: string;
  value: number;
  icon: typeof Users;
  gradient: string;
  iconBg: string;
}

function buildCards(stats: OverviewStats, tab: TabId): StatCardDef[] {
  const map: Record<TabId, StatCardDef[]> = {
    users: [
      {
        label: 'Tổng người dùng',
        value: stats.users.total,
        icon: Users,
        gradient: 'from-primary to-primary-container',
        iconBg: 'bg-primary/15',
      },
      {
        label: 'Đang hoạt động',
        value: stats.users.active,
        icon: ShieldCheck,
        gradient: 'from-primary-T50 to-primary-T70',
        iconBg: 'bg-primary-T90',
      },
      {
        label: 'Bị khóa',
        value: stats.users.banned,
        icon: Ban,
        gradient: 'from-error to-red-400',
        iconBg: 'bg-red-50',
      },
      {
        label: 'Chờ duyệt KYC',
        value: stats.users.pendingKyc,
        icon: Clock,
        gradient: 'from-secondary to-secondary-container',
        iconBg: 'bg-secondary-T95',
      },
    ],
    posts: [
      {
        label: 'Tổng bài đăng',
        value: stats.posts.total,
        icon: FileText,
        gradient: 'from-primary to-primary-container',
        iconBg: 'bg-primary/15',
      },
      {
        label: 'Đang hiển thị',
        value: stats.posts.available,
        icon: Eye,
        gradient: 'from-primary-T50 to-primary-T70',
        iconBg: 'bg-primary-T90',
      },
      {
        label: 'Chờ duyệt',
        value: stats.posts.pendingReview,
        icon: Clock,
        gradient: 'from-secondary to-secondary-container',
        iconBg: 'bg-secondary-T95',
      },
      {
        label: 'Đã ẩn',
        value: stats.posts.hidden,
        icon: EyeOff,
        gradient: 'from-error to-red-400',
        iconBg: 'bg-red-50',
      },
    ],
    transactions: [
      {
        label: 'Tổng giao dịch',
        value: stats.transactions.total,
        icon: CreditCard,
        gradient: 'from-primary to-primary-container',
        iconBg: 'bg-primary/15',
      },
      {
        label: 'Hoàn thành',
        value: stats.transactions.completed,
        icon: CheckCircle,
        gradient: 'from-primary-T50 to-primary-T70',
        iconBg: 'bg-primary-T90',
      },
      {
        label: 'Đang chờ',
        value: stats.transactions.pending,
        icon: Clock,
        gradient: 'from-secondary to-secondary-container',
        iconBg: 'bg-secondary-T95',
      },
      {
        label: 'Tranh chấp',
        value: stats.transactions.disputed,
        icon: AlertOctagon,
        gradient: 'from-error to-red-400',
        iconBg: 'bg-red-50',
      },
    ],
    reports: [
      {
        label: 'Tổng báo cáo',
        value: stats.reports.total,
        icon: AlertTriangle,
        gradient: 'from-primary to-primary-container',
        iconBg: 'bg-primary/15',
      },
      {
        label: 'Chờ xử lý',
        value: stats.reports.pending,
        icon: Clock,
        gradient: 'from-secondary to-secondary-container',
        iconBg: 'bg-secondary-T95',
      },
      {
        label: 'Đã giải quyết',
        value: stats.reports.resolved,
        icon: CheckCircle,
        gradient: 'from-primary-T50 to-primary-T70',
        iconBg: 'bg-primary-T90',
      },
      {
        label: 'Đã bác bỏ',
        value: stats.reports.dismissed,
        icon: XCircle,
        gradient: 'from-neutral-T50 to-neutral-T70',
        iconBg: 'bg-neutral-T95',
      },
    ],
    audits: [
      {
        label: 'Người dùng',
        value: stats.users.total,
        icon: Users,
        gradient: 'from-primary to-primary-container',
        iconBg: 'bg-primary/15',
      },
      {
        label: 'Bài đăng',
        value: stats.posts.total,
        icon: FileText,
        gradient: 'from-primary-T50 to-primary-T70',
        iconBg: 'bg-primary-T90',
      },
      {
        label: 'Giao dịch',
        value: stats.transactions.total,
        icon: CreditCard,
        gradient: 'from-secondary to-secondary-container',
        iconBg: 'bg-secondary-T95',
      },
      {
        label: 'Báo cáo',
        value: stats.reports.total,
        icon: AlertTriangle,
        gradient: 'from-error to-red-400',
        iconBg: 'bg-red-50',
      },
    ],
  };
  return map[tab];
}

interface StatCardsProps {
  stats: OverviewStats;
  activeTab: TabId;
}

export default function StatCards({ stats, activeTab }: StatCardsProps) {
  const cards = buildCards(stats, activeTab);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="group relative bg-surface-lowest rounded-lg border border-outline-variant/30 p-5 shadow-soft hover:shadow-hover hover:-translate-y-0.5 transition-all overflow-hidden"
          >
            {/* Atmospheric blob */}
            <div
              className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-linear-to-br ${card.gradient} opacity-[0.07] blur-2xl group-hover:opacity-[0.12] transition-opacity`}
            />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[11px] font-label uppercase tracking-wider text-neutral-T50 mb-2">
                  {card.label}
                </p>
                <p className="text-3xl font-sans font-extrabold tracking-tight text-neutral-T10">
                  {card.value.toLocaleString('vi-VN')}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}
              >
                <Icon size={20} className="text-primary" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
