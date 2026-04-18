'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, ToggleLeft, ToggleRight, Ticket } from 'lucide-react';
import VoucherDetailModal from '@/components/features/vouchers/VoucherDetailModal';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Toolbar from '@/components/ui/Toolbar';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionDropdown, { type DropdownAction } from '@/components/ui/ActionDropdown';
import PageHeader from '@/components/ui/PageHeader';
import UserAvatar from '@/components/ui/UserAvatar';
import { formatDate, formatDiscount } from '@/lib/formatters';
import {
  IVoucher,
  PaginationMeta,
  fetchAdminVouchers,
  toggleAdminVoucher,
} from '@/lib/voucherApi';

const getVoucherStatusBadge = (isActive: boolean, validUntil: string, remaining: number) => {
  const isExpired = new Date(validUntil) < new Date();
  if (!isActive) return <StatusBadge status="BANNED" label="Đã khóa" />;
  if (isExpired) return <StatusBadge status="CANCELLED" label="Hết hạn" />;
  if (remaining === 0) return <StatusBadge status="OUT_OF_STOCK" label="Hết lượt" />;
  return <StatusBadge status="ACTIVE" label="Hoạt động" />;
};

const LIMIT = 15;

export default function VouchersManagementPage() {
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'true' | 'false'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadVouchers = useCallback(async (page: number, isActive?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminVouchers({ isActive, page, limit: LIMIT });
      setVouchers(res.data);
      setPagination(res.pagination);
    } catch {
      setError('Không thể tải danh sách voucher. Vui lòng kiểm tra kết nối.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const isActive = statusFilter === 'ALL' ? undefined : statusFilter === 'true';
    loadVouchers(currentPage, isActive);
  }, [currentPage, statusFilter, loadVouchers]);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await toggleAdminVoucher(id);
      setVouchers((prev) =>
        prev.map((v) => v._id === id ? { ...v, isActive: res.data.isActive } : v)
      );
      if (selectedVoucher?._id === id)
        setSelectedVoucher((prev) => prev ? { ...prev, isActive: res.data.isActive } : prev);
    } catch {
      alert('Thao tác thất bại. Vui lòng thử lại.');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredVouchers = searchQuery
    ? vouchers.filter(
        (v) =>
          v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.creatorId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : vouchers;

  const buildActions = (voucher: IVoucher): DropdownAction[] => [
    {
      label: 'Xem chi tiết',
      icon: <Eye size={16} />,
      onClick: () => { setSelectedVoucher(voucher); setOpenDropdownId(null); },
    },
    {
      label: voucher.isActive ? 'Vô hiệu hóa' : 'Kích hoạt lại',
      icon: voucher.isActive ? <ToggleLeft size={16} /> : <ToggleRight size={16} />,
      variant: voucher.isActive ? 'danger' : 'primary',
      onClick: () => { handleToggle(voucher._id); setOpenDropdownId(null); },
    },
  ];

  const columns: Column<IVoucher>[] = [
    {
      key: 'code',
      header: 'Mã & Tiêu đề',
      render: (voucher) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-secondary/10 flex items-center justify-center shrink-0">
            <Ticket size={16} className="text-secondary" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-secondary tracking-wider text-xs mb-0.5">{voucher.code}</span>
            <span className="font-semibold text-gray-900 text-sm line-clamp-1">{voucher.title}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'creatorId',
      header: 'Cửa hàng',
      render: (voucher) =>
        voucher.creatorId ? (
          <div className="flex items-center gap-2">
            <UserAvatar fullName={voucher.creatorId.fullName} avatar={voucher.creatorId.avatar} size="sm" />
            <span className="font-medium text-gray-900">{voucher.creatorId.fullName}</span>
          </div>
        ) : (
          <span className="text-gray-400">N/A</span>
        ),
    },
    {
      key: 'discount',
      header: 'Mức giảm',
      render: (voucher) => (
        <>
          <span className="font-semibold text-secondary">{formatDiscount(voucher.discountType, voucher.discountValue)}</span>
          <span className="ml-1.5 text-xs text-gray-400">{voucher.discountType === 'PERCENTAGE' ? '%' : 'cố định'}</span>
        </>
      ),
    },
    {
      key: 'pointCost',
      header: 'Điểm đổi',
      align: 'center',
      render: (voucher) => (
        <>
          <span className="font-bold text-primary">{voucher.pointCost}</span>
          <span className="text-xs text-gray-400 ml-1">đ</span>
        </>
      ),
    },
    {
      key: 'remaining',
      header: 'Còn lại',
      align: 'center',
      render: (voucher) => (
        <>
          <span className={`font-bold ${voucher.remainingQuantity === 0 ? 'text-error' : voucher.remainingQuantity <= 5 ? 'text-yellow-600' : 'text-gray-900'}`}>
            {voucher.remainingQuantity}
          </span>
          <span className="text-xs text-gray-400">/{voucher.totalQuantity}</span>
        </>
      ),
    },
    {
      key: 'validUntil',
      header: 'Hết hạn',
      render: (voucher) => <span className="text-sm text-gray-600">{formatDate(voucher.validUntil)}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (voucher) => getVoucherStatusBadge(voucher.isActive, voucher.validUntil, voucher.remainingQuantity),
    },
    {
      key: 'actions',
      header: 'Hành động',
      align: 'center',
      render: (voucher) => (
        <ActionDropdown
          id={voucher._id}
          openId={openDropdownId}
          onToggle={(id) => setOpenDropdownId(openDropdownId === id ? null : id)}
          loading={togglingId === voucher._id}
          actions={buildActions(voucher)}
        />
      ),
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6" onClick={() => setOpenDropdownId(null)}>
      <PageHeader
        title="Quản Lý Voucher"
        subtitle="Giám sát và xử lý các mã giảm giá từ cửa hàng trên toàn hệ thống"
      />

      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Tìm theo mã, tiêu đề, cửa hàng..."
        filters={[
          {
            type: 'select',
            value: statusFilter,
            onChange: (v) => { setStatusFilter(v as 'ALL' | 'true' | 'false'); setCurrentPage(1); },
            options: [
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'true', label: 'Đang hoạt động' },
              { value: 'false', label: 'Đã khóa' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filteredVouchers}
        rowKey={(v) => v._id}
        loading={loading}
        error={error}
        emptyMessage={searchQuery ? 'Không tìm thấy voucher phù hợp.' : 'Chưa có voucher nào.'}
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

      {selectedVoucher && (
        <VoucherDetailModal
          voucher={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
          onToggle={handleToggle}
          isToggling={togglingId === selectedVoucher._id}
          formatDate={formatDate}
          formatDiscount={formatDiscount}
          getStatusBadge={getVoucherStatusBadge}
        />
      )}
    </div>
  );
}
