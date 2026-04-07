'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Wallet, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import {
  fetchAdminEscrows,
  fetchAdminEscrowStats,
  adminDisburseEscrow,
  adminRefundTransaction,
  type IEscrowLedger,
  type EscrowStats,
  type PaginationMeta,
} from '@/lib/transactionApi';

// ── Helpers ──

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    HOLDING: 'bg-purple-50 text-purple-700 border-purple-200',
    DISBURSED: 'bg-green-50 text-green-700 border-green-200',
    REFUNDED: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  const labels: Record<string, string> = {
    HOLDING: 'Tạm giữ',
    DISBURSED: 'Đã giải ngân',
    REFUNDED: 'Đã hoàn tiền',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${styles[status] ?? ''}`}
    >
      {labels[status] ?? status}
    </span>
  );
};

const PAGE_LIMIT = 15;

// ── Main Page ──

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
        fetchAdminEscrows({
          status: statusFilter,
          page: currentPage,
          limit: PAGE_LIMIT,
        }),
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

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter client-side by search
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
    if (!confirm(`Giải ngân ${formatCurrency(escrow.netAmount)} cho ${escrow.storeId?.fullName}?`)) return;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans font-extrabold text-2xl text-gray-900 tracking-tight">
            Quản Lý Escrow
          </h1>
          <p className="font-body text-sm text-gray-500 mt-1">
            Theo dõi tiền tạm giữ, giải ngân và hoàn tiền
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition"
        >
          <RefreshCw size={16} />
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Status tabs */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {['ALL', 'HOLDING', 'DISBURSED', 'REFUNDED'].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                  statusFilter === s
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s === 'ALL' ? 'Tất cả' : s === 'HOLDING' ? 'Tạm giữ' : s === 'DISBURSED' ? 'Đã giải ngân' : 'Đã hoàn tiền'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 flex-1 min-w-[200px]">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên, ID..."
              className="bg-transparent text-sm outline-none w-full font-body"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-body text-sm">
            Không tìm thấy escrow nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Mã Escrow</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Cửa hàng</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Người mua</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Số tiền</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Phí</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Store nhận</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Cổng TT</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Trạng thái</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Ngày tạo</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((escrow) => (
                  <tr key={escrow._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">
                      #{escrow._id.slice(-8)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-800">{escrow.storeId?.fullName ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{escrow.buyerId?.fullName ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-800">
                      {formatCurrency(escrow.amount)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatCurrency(escrow.platformFee)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary">
                      {formatCurrency(escrow.netAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        {escrow.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(escrow.status)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDate(escrow.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {escrow.status === 'HOLDING' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDisburse(escrow)}
                            disabled={actionLoading === escrow._id}
                            className="px-2 py-1 text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 transition disabled:opacity-50"
                          >
                            Giải ngân
                          </button>
                          <button
                            onClick={() => handleRefund(escrow)}
                            disabled={actionLoading === escrow._id}
                            className="px-2 py-1 text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 rounded-md hover:bg-orange-100 transition disabled:opacity-50"
                          >
                            Hoàn tiền
                          </button>
                        </div>
                      )}
                      {escrow.status === 'DISBURSED' && (
                        <span className="text-xs text-gray-400">
                          {escrow.disbursedAt ? formatDate(escrow.disbursedAt) : '—'}
                        </span>
                      )}
                      {escrow.status === 'REFUNDED' && (
                        <span className="text-xs text-gray-400" title={escrow.refundReason ?? ''}>
                          {escrow.refundedAt ? formatDate(escrow.refundedAt) : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="border-t border-gray-100 px-4 py-3">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Stat Card ──

function StatCard({
  label,
  amount,
  count,
  icon,
  bg,
  border,
}: {
  label: string;
  amount: number;
  count: number;
  icon: React.ReactNode;
  bg: string;
  border: string;
}) {
  return (
    <div className={`${bg} ${border} border rounded-xl p-5`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <span className="font-label text-xs font-bold text-gray-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="font-sans font-extrabold text-2xl text-gray-900 tracking-tight">
        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
      </p>
      <p className="font-body text-xs text-gray-500 mt-1">
        {count} giao dịch
      </p>
    </div>
  );
}
