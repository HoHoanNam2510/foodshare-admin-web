'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Eye, HeartHandshake, ShoppingBag, Layers, CheckCircle } from 'lucide-react';
import TransactionDetailModal from '@/components/features/transactions/TransactionDetailModal';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Toolbar from '@/components/ui/Toolbar';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionDropdown, { type DropdownAction } from '@/components/ui/ActionDropdown';
import PageHeader from '@/components/ui/PageHeader';
import UserAvatar from '@/components/ui/UserAvatar';
import { formatDateTime, formatTransactionCurrency } from '@/lib/formatters';
import {
  fetchAdminTransactions,
  adminForceUpdateTransactionStatus,
  adminConfirmPayment,
  type ITransaction,
  type PaginationMeta,
} from '@/lib/transactionApi';

const TX_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  ACCEPTED: 'Đã chấp nhận',
  ESCROWED: 'Đang giữ tiền',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  REJECTED: 'Đã từ chối',
  REFUNDED: 'Đã hoàn tiền',
  DISPUTED: 'Khiếu nại',
};

const txStatusBadge = (status: string) => (
  <StatusBadge status={status} label={TX_STATUS_LABELS[status]} />
);

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

  useEffect(() => { loadTransactions(); }, [loadTransactions]);
  useEffect(() => { setCurrentPage(1); }, [activeTab, statusFilter]);

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
    await loadTransactions();
    setSelectedTx((prev) =>
      prev?._id === transactionId ? { ...prev, status: newStatus as ITransaction['status'] } : prev
    );
  };

  const handleConfirmPayment = async (transactionId: string) => {
    try {
      await adminConfirmPayment(transactionId);
      await loadTransactions();
    } catch (err) {
      console.error('Confirm payment failed:', err);
    }
    setOpenDropdownId(null);
  };

  const buildActions = (tx: ITransaction): DropdownAction[] => [
    {
      label: 'Xem & Cập nhật',
      icon: <Eye size={16} />,
      onClick: () => { setSelectedTx(tx); setOpenDropdownId(null); },
    },
    {
      label: 'Xác nhận đã nhận tiền',
      icon: <CheckCircle size={16} />,
      variant: 'primary',
      dividerBefore: true,
      hidden: !(tx.type === 'ORDER' && tx.status === 'PENDING'),
      onClick: () => handleConfirmPayment(tx._id),
    },
  ];

  const columns: Column<ITransaction>[] = [
    {
      key: 'id',
      header: 'Mã GD & Bài đăng',
      render: (tx) => (
        <div className="flex flex-col min-w-50">
          <span className="font-semibold text-gray-900 flex items-center gap-2 font-mono text-sm">
            {tx._id.slice(-8).toUpperCase()}
            {activeTab === 'ALL' && (
              <span className={`text-xs px-1.5 py-0.5 rounded uppercase font-bold ${tx.type === 'REQUEST' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                {tx.type === 'REQUEST' ? 'P2P' : 'B2C'}
              </span>
            )}
          </span>
          <span className="text-sm text-gray-500 mt-0.5 line-clamp-1">{tx.postId.title}</span>
        </div>
      ),
    },
    {
      key: 'parties',
      header: 'Giao dịch giữa',
      render: (tx) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 font-medium w-7 shrink-0">Nhận</span>
            <UserAvatar fullName={tx.requesterId.fullName} avatar={tx.requesterId.avatar} size="sm" />
            <span className="text-sm text-gray-800">{tx.requesterId.fullName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 font-medium w-7 shrink-0">Cấp</span>
            <UserAvatar fullName={tx.ownerId.fullName} avatar={tx.ownerId.avatar} size="sm" />
            <span className="text-sm text-gray-800">{tx.ownerId.fullName}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Tổng thanh toán',
      align: 'right',
      render: (tx) => (
        <div className="flex flex-col">
          <span className="text-base text-gray-900 font-semibold">{formatTransactionCurrency(tx.postId.price * tx.quantity, tx.paymentMethod)}</span>
          <span className="text-sm text-gray-500 mt-0.5">SL: {tx.quantity} • {tx.paymentMethod}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (tx) => txStatusBadge(tx.status),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (tx) => <span className="text-gray-500 text-sm">{formatDateTime(tx.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Hành động',
      align: 'center',
      render: (tx) => (
        <ActionDropdown
          id={tx._id}
          openId={openDropdownId}
          onToggle={(id) => setOpenDropdownId(openDropdownId === id ? null : id)}
          actions={buildActions(tx)}
          width="w-52"
        />
      ),
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6" onClick={() => setOpenDropdownId(null)}>
      <PageHeader
        title="Quản Lý Giao Dịch"
        subtitle="Quản lý và giải quyết sự cố đơn xin đồ (P2P) và đơn mua túi mù (B2C)"
      />

      {/* Tabs — giữ nguyên vì mỗi tab có màu active riêng (Toolbar không hỗ trợ) */}
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

      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Tìm theo Mã GD, Tên bài, Tên người..."
        filters={[
          {
            type: 'select',
            value: statusFilter,
            onChange: (v) => setStatusFilter(v),
            options: [
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'PENDING', label: 'Chờ xác nhận' },
              { value: 'ACCEPTED', label: 'Đã chấp nhận' },
              { value: 'ESCROWED', label: 'Đã thanh toán (Giữ tiền)' },
              { value: 'COMPLETED', label: 'Hoàn thành' },
              { value: 'CANCELLED', label: 'Đã hủy' },
              { value: 'REJECTED', label: 'Đã từ chối' },
              { value: 'REFUNDED', label: 'Đã hoàn tiền' },
              { value: 'DISPUTED', label: 'Đang khiếu nại' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filteredTransactions}
        rowKey={(tx) => tx._id}
        loading={isLoading}
        emptyMessage="Không có giao dịch nào phù hợp."
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        className="rounded-md overflow-visible relative"
        tableClassName="min-h-100"
        headerClassName="bg-surface/50 font-label text-xs uppercase text-gray-500"
        bodyClassName="divide-outline-variant/20 text-sm"
        rowClassName="hover:bg-primary/5 transition-colors"
        cellClassName={(col) => col.key === 'actions' ? 'px-3' : ''}
      />

      <TransactionDetailModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onStatusUpdate={handleStatusUpdate}
        formatDate={formatDateTime}
        formatCurrency={formatTransactionCurrency}
        getStatusBadge={txStatusBadge}
      />
    </div>
  );
}
