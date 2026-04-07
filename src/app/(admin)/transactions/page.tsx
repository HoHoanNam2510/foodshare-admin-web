'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  HeartHandshake,
  ShoppingBag,
  Layers,
} from 'lucide-react';
import TransactionDetailModal from '@/components/features/transactions/TransactionDetailModal';
import Pagination from '@/components/ui/Pagination';
import {
  fetchAdminTransactions,
  adminForceUpdateTransactionStatus,
  type ITransaction,
  type PaginationMeta,
} from '@/lib/transactionApi';

// --- HELPER FORMATS ---
const formatCurrency = (amount: number, method: string) => {
  if (method === 'FREE' || amount === 0)
    return <span className="text-primary font-bold">Miễn phí</span>;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

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
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    ACCEPTED: 'bg-blue-50 text-blue-700 border-blue-200',
    ESCROWED: 'bg-purple-50 text-purple-700 border-purple-200',
    COMPLETED: 'bg-green-50 text-primary border-primary/20',
    CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
    REJECTED: 'bg-red-50 text-error border-error/20',
    REFUNDED: 'bg-orange-50 text-orange-700 border-orange-200',
    DISPUTED: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${styles[status] ?? styles.PENDING}`}
    >
      {status}
    </span>
  );
};

const PAGE_LIMIT = 15;

export default function TransactionsManagementPage() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'ALL' | 'REQUEST' | 'ORDER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<ITransaction | null>(null);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminTransactions({
        type: activeTab !== 'ALL' ? activeTab : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        page: currentPage,
        limit: PAGE_LIMIT,
      });
      setTransactions(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, statusFilter, currentPage]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, statusFilter]);

  // Client-side search on the current page's data
  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx._id.toLowerCase().includes(q) ||
        tx.postId.title.toLowerCase().includes(q) ||
        tx.requesterId.fullName.toLowerCase().includes(q) ||
        tx.ownerId.fullName.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  const handleTabChange = (tab: 'ALL' | 'REQUEST' | 'ORDER') => {
    setActiveTab(tab);
    setStatusFilter('ALL');
    setSearchQuery('');
  };

  const handleStatusUpdate = async (transactionId: string, newStatus: string) => {
    await adminForceUpdateTransactionStatus(transactionId, newStatus);
    // Refresh list and update selected modal item
    await loadTransactions();
    setSelectedTx((prev) =>
      prev?._id === transactionId ? { ...prev, status: newStatus as ITransaction['status'] } : prev
    );
  };

  const closeDropdown = () => setOpenDropdownId(null);

  return (
    <div
      className="w-full max-w-7xl mx-auto flex flex-col gap-6"
      onClick={closeDropdown}
    >
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-2xl font-sans font-bold text-gray-900 leading-tight">
          Quản Lý Giao Dịch
        </h1>
        <p className="text-sm font-body text-gray-500 mt-1">
          Quản lý và giải quyết sự cố đơn xin đồ (P2P) và đơn mua túi mù (B2C)
        </p>
      </div>

      {/* ── TABS ── */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-px">
        <button
          onClick={() => handleTabChange('ALL')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans font-bold text-sm border-b-2 transition-all ${activeTab === 'ALL' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          <Layers size={18} /> Tất cả giao dịch
        </button>
        <button
          onClick={() => handleTabChange('REQUEST')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans font-bold text-sm border-b-2 transition-all ${activeTab === 'REQUEST' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          <HeartHandshake size={18} /> P2P - Xin đồ miễn phí
        </button>
        <button
          onClick={() => handleTabChange('ORDER')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans font-bold text-sm border-b-2 transition-all ${activeTab === 'ORDER' ? 'border-secondary text-secondary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          <ShoppingBag size={18} /> B2C - Mua túi mù
        </button>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-lowest p-4 rounded-md shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50 w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary/50 focus-within:-translate-y-0.5 transition-all">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo Mã GD, Tên bài, Tên người..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none w-full font-body text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm outline-none font-body text-gray-700 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="ACCEPTED">Đã chấp nhận</option>
            <option value="ESCROWED">Đã thanh toán (Giữ tiền)</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="REJECTED">Đã từ chối</option>
            <option value="REFUNDED">Đã hoàn tiền</option>
            <option value="DISPUTED">Đang khiếu nại</option>
          </select>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <div className="bg-surface-lowest rounded-md shadow-soft border border-outline-variant/30 overflow-visible relative">
        <div className="overflow-x-auto min-h-100">
          <table className="w-full text-left font-body">
            <thead className="bg-surface/50 border-b border-outline-variant/30 font-label text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4 font-semibold rounded-tl-md">Mã GD & Bài đăng</th>
                <th className="px-5 py-4 font-semibold">Giao dịch giữa</th>
                <th className="px-5 py-4 font-semibold text-right">Tổng thanh toán</th>
                <th className="px-5 py-4 font-semibold">Trạng thái</th>
                <th className="px-5 py-4 font-semibold">Ngày tạo</th>
                <th className="px-3 py-4 font-semibold text-center rounded-tr-md">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                      <div className="h-3 bg-gray-100 rounded w-48" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-3 bg-gray-200 rounded w-28 mb-1" />
                      <div className="h-3 bg-gray-100 rounded w-24" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="h-4 bg-gray-200 rounded w-20 ml-auto" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-5 bg-gray-200 rounded w-20" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-3 bg-gray-200 rounded w-28" />
                    </td>
                    <td className="px-3 py-4 text-center">
                      <div className="h-8 w-8 bg-gray-200 rounded-md mx-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex flex-col min-w-50">
                        <span className="font-semibold text-gray-900 flex items-center gap-2 font-mono text-xs">
                          {tx._id.slice(-8).toUpperCase()}
                          {activeTab === 'ALL' && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${tx.type === 'REQUEST' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}
                            >
                              {tx.type === 'REQUEST' ? 'P2P' : 'B2C'}
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {tx.postId.title}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col text-xs gap-0.5">
                        <span className="text-gray-800">
                          <strong className="text-gray-500 font-medium">Nhận:</strong>{' '}
                          {tx.requesterId.fullName}
                        </span>
                        <span className="text-gray-800">
                          <strong className="text-gray-500 font-medium">Cấp:</strong>{' '}
                          {tx.ownerId.fullName}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-semibold">
                          {formatCurrency(tx.postId.price * tx.quantity, tx.paymentMethod)}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          SL: {tx.quantity} • {tx.paymentMethod}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">{getStatusBadge(tx.status)}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {formatDate(tx.createdAt)}
                    </td>

                    <td className="px-3 py-4 text-center relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === tx._id ? null : tx._id);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openDropdownId === tx._id && (
                        <div className="absolute right-8 top-10 w-44 bg-surface-lowest border border-outline-variant/30 rounded-2xl shadow-hover z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                          <button
                            onClick={() => {
                              setSelectedTx(tx);
                              setOpenDropdownId(null);
                            }}
                            className="w-full flex justify-center items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                          >
                            <Eye size={16} /> Xem & Cập nhật
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                    Không có giao dịch nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <TransactionDetailModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onStatusUpdate={handleStatusUpdate}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        getStatusBadge={getStatusBadge}
      />
    </div>
  );
}
