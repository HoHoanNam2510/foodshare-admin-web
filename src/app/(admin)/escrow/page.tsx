'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wallet, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Toolbar from '@/components/ui/Toolbar';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/ui/PageHeader';
import { formatCurrencyVND, formatDateTime } from '@/lib/formatters';
import {
  fetchAdminEscrows,
  fetchAdminEscrowStats,
  adminDisburseEscrow,
  adminRefundTransaction,
  type IEscrowLedger,
  type EscrowStats,
  type PaginationMeta,
} from '@/lib/transactionApi';

const ESCROW_STATUS_LABELS: Record<string, string> = {
  HOLDING: 'Tạm giữ',
  DISBURSED: 'Đã giải ngân',
  REFUNDED: 'Đã hoàn tiền',
};

// Map escrow statuses to StatusBadge presets
const ESCROW_STATUS_PRESET: Record<string, string> = {
  HOLDING: 'ESCROWED',
  DISBURSED: 'COMPLETED',
  REFUNDED: 'REFUNDED',
};

const escrowStatusBadge = (status: string) => (
  <StatusBadge
    status={ESCROW_STATUS_PRESET[status] ?? status}
    label={ESCROW_STATUS_LABELS[status] ?? status}
  />
);

const PAGE_LIMIT = 15;

export default function EscrowManagementPage() {
  const [escrows, setEscrows] = useState<IEscrowLedger[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [stats, setStats] = useState<EscrowStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [escrowRes, statsRes] = await Promise.all([
        fetchAdminEscrows({ status: statusFilter, page: currentPage, limit: PAGE_LIMIT }),
        fetchAdminEscrowStats(),
      ]);
      setEscrows(escrowRes.data);
      setPagination(escrowRes.pagination);
      setStats(statsRes.data);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, currentPage]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = searchQuery
    ? escrows.filter(
        (e) =>
          e.storeId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.buyerId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e._id.includes(searchQuery) ||
          e.paymentTransId?.includes(searchQuery)
      )
    : escrows;

  const handleDisburse = async (escrow: IEscrowLedger) => {
    if (!confirm(`Giải ngân ${formatCurrencyVND(escrow.netAmount)} cho ${escrow.storeId?.fullName}?`)) return;
    setActionLoading(escrow._id);
    try {
      await adminDisburseEscrow(escrow.transactionId._id);
      await loadData();
    } catch {
      alert('Giải ngân thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (escrow: IEscrowLedger) => {
    const reason = prompt('Nhập lý do hoàn tiền:');
    if (!reason) return;
    setActionLoading(escrow._id);
    try {
      await adminRefundTransaction(escrow.transactionId._id, reason);
      await loadData();
    } catch {
      alert('Hoàn tiền thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const columns: Column<IEscrowLedger>[] = [
    {
      key: 'id',
      header: 'Mã Escrow',
      render: (e) => <span className="text-xs font-mono text-gray-500">#{e._id.slice(-8)}</span>,
    },
    {
      key: 'storeId',
      header: 'Cửa hàng',
      render: (e) => <span className="text-sm font-medium text-gray-800">{e.storeId?.fullName ?? '—'}</span>,
    },
    {
      key: 'buyerId',
      header: 'Người mua',
      render: (e) => <span className="text-sm text-gray-600">{e.buyerId?.fullName ?? '—'}</span>,
    },
    {
      key: 'amount',
      header: 'Số tiền',
      render: (e) => <span className="text-sm font-bold text-gray-800">{formatCurrencyVND(e.amount)}</span>,
    },
    {
      key: 'platformFee',
      header: 'Phí',
      render: (e) => <span className="text-xs text-gray-500">{formatCurrencyVND(e.platformFee)}</span>,
    },
    {
      key: 'netAmount',
      header: 'Store nhận',
      render: (e) => <span className="text-sm font-semibold text-primary">{formatCurrencyVND(e.netAmount)}</span>,
    },
    {
      key: 'paymentMethod',
      header: 'Cổng TT',
      render: (e) => (
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{e.paymentMethod}</span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (e) => escrowStatusBadge(e.status),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (e) => <span className="text-xs text-gray-500">{formatDateTime(e.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Hành động',
      render: (e) => {
        if (e.status === 'HOLDING') {
          return (
            <div className="flex gap-1">
              <button
                onClick={() => handleDisburse(e)}
                disabled={actionLoading === e._id}
                className="px-2 py-1 text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 transition disabled:opacity-50"
              >
                Giải ngân
              </button>
              <button
                onClick={() => handleRefund(e)}
                disabled={actionLoading === e._id}
                className="px-2 py-1 text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 rounded-md hover:bg-orange-100 transition disabled:opacity-50"
              >
                Hoàn tiền
              </button>
            </div>
          );
        }
        if (e.status === 'DISBURSED') {
          return <span className="text-xs text-gray-400">{e.disbursedAt ? formatDateTime(e.disbursedAt) : '—'}</span>;
        }
        if (e.status === 'REFUNDED') {
          return (
            <span className="text-xs text-gray-400" title={e.refundReason ?? ''}>
              {e.refundedAt ? formatDateTime(e.refundedAt) : '—'}
            </span>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      <PageHeader
        title="Quản Lý Escrow"
        subtitle="Theo dõi tiền tạm giữ, giải ngân và hoàn tiền"
        action={
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition"
          >
            <RefreshCw size={16} /> Làm mới
          </button>
        }
      />

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Đang tạm giữ"
            amount={stats.holding.total}
            count={stats.holding.count}
            icon={<Wallet size={20} className="text-purple-600" />}
            bg="bg-purple-50"
            border="border-purple-200"
          />
          <StatCard
            label="Đã giải ngân"
            amount={stats.disbursed.total}
            count={stats.disbursed.count}
            icon={<ArrowUpCircle size={20} className="text-green-600" />}
            bg="bg-green-50"
            border="border-green-200"
          />
          <StatCard
            label="Đã hoàn tiền"
            amount={stats.refunded.total}
            count={stats.refunded.count}
            icon={<ArrowDownCircle size={20} className="text-orange-600" />}
            bg="bg-orange-50"
            border="border-orange-200"
          />
        </div>
      )}

      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Tìm kiếm theo tên, ID..."
        filters={[
          {
            type: 'tabs',
            value: statusFilter,
            onChange: (v) => { setStatusFilter(v); setCurrentPage(1); },
            options: [
              { value: 'ALL', label: 'Tất cả' },
              { value: 'HOLDING', label: 'Tạm giữ' },
              { value: 'DISBURSED', label: 'Đã giải ngân' },
              { value: 'REFUNDED', label: 'Đã hoàn tiền' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(e) => e._id}
        loading={isLoading}
        emptyMessage="Không tìm thấy escrow nào."
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        className="rounded-md overflow-visible relative"
        tableClassName="min-h-100"
        headerClassName="bg-surface/50 font-label text-xs uppercase text-gray-500"
        bodyClassName="divide-outline-variant/20 text-sm"
        rowClassName="hover:bg-primary/5 transition-colors"
      />
    </div>
  );
}

function StatCard({ label, amount, count, icon, bg, border }: {
  label: string; amount: number; count: number;
  icon: React.ReactNode; bg: string; border: string;
}) {
  return (
    <div className={`${bg} ${border} border rounded-xl p-5`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">{icon}</div>
        <span className="font-label text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-sans font-extrabold text-2xl text-gray-900 tracking-tight">{formatCurrencyVND(amount)}</p>
      <p className="font-body text-xs text-gray-500 mt-1">{count} giao dịch</p>
    </div>
  );
}
