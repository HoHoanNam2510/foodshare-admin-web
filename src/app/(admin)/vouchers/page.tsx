'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Ticket,
} from 'lucide-react';
import VoucherDetailModal from '@/components/features/vouchers/VoucherDetailModal';
import {
  IVoucher,
  PaginationMeta,
  fetchAdminVouchers,
  toggleAdminVoucher,
} from '@/lib/voucherApi';

// --- HELPER FORMATS ---
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatDiscount = (type: string, value: number): string => {
  if (type === 'PERCENTAGE') return `${value}%`;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

const getStatusBadge = (
  isActive: boolean,
  validUntil: string,
  remaining: number
): React.ReactNode => {
  const isExpired = new Date(validUntil) < new Date();
  const isOutOfStock = remaining === 0;

  if (!isActive) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider bg-red-50 text-error border-error/20">
        Đã khóa
      </span>
    );
  }
  if (isExpired) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider bg-gray-100 text-gray-600 border-gray-200">
        Hết hạn
      </span>
    );
  }
  if (isOutOfStock) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider bg-yellow-50 text-yellow-700 border-yellow-200">
        Hết lượt
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider bg-green-50 text-primary border-primary/20">
      Hoạt động
    </span>
  );
};

const LIMIT = 15;

export default function VouchersManagementPage() {
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'true' | 'false'>(
    'ALL'
  );
  const [currentPage, setCurrentPage] = useState(1);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadVouchers = useCallback(async (page: number, isActive?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminVouchers({
        isActive,
        page,
        limit: LIMIT,
      });
      setVouchers(res.data);
      setPagination(res.pagination);
    } catch {
      setError('Không thể tải danh sách voucher. Vui lòng kiểm tra kết nối.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const isActive =
      statusFilter === 'ALL' ? undefined : statusFilter === 'true';
    loadVouchers(currentPage, isActive);
  }, [currentPage, statusFilter, loadVouchers]);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await toggleAdminVoucher(id);
      // Cập nhật inline để UI phản hồi ngay
      setVouchers((prev) =>
        prev.map((v) =>
          v._id === id ? { ...v, isActive: res.data.isActive } : v
        )
      );
      if (selectedVoucher?._id === id) {
        setSelectedVoucher((prev) =>
          prev ? { ...prev, isActive: res.data.isActive } : prev
        );
      }
    } catch {
      alert('Thao tác thất bại. Vui lòng thử lại.');
    } finally {
      setTogglingId(null);
    }
  };

  // Client-side search filter
  const filteredVouchers = searchQuery
    ? vouchers.filter(
        (v) =>
          v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.creatorId?.fullName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : vouchers;

  const closeDropdown = () => setOpenDropdownId(null);

  return (
    <div
      className="w-full max-w-7xl mx-auto flex flex-col gap-6"
      onClick={closeDropdown}
    >
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-2xl font-sans font-bold text-gray-900 leading-tight">
          Quản Lý Voucher
        </h1>
        <p className="text-sm font-body text-gray-500 mt-1">
          Giám sát và xử lý các mã giảm giá từ cửa hàng trên toàn hệ thống
        </p>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-lowest p-4 rounded-md shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50 w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary/50 focus-within:-translate-y-0.5 transition-all">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã, tiêu đề, cửa hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none w-full font-body text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'ALL' | 'true' | 'false');
                setCurrentPage(1);
              }}
              className="bg-transparent text-sm outline-none font-body text-gray-700 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Đã khóa</option>
            </select>
          </div>

          <button
            onClick={() => {
              const isActive =
                statusFilter === 'ALL' ? undefined : statusFilter === 'true';
              loadVouchers(currentPage, isActive);
            }}
            className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-md transition-colors border border-outline-variant/50"
            title="Làm mới"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <div className="bg-surface-lowest rounded-md shadow-soft border border-outline-variant/30 overflow-visible relative">
        <div className="overflow-x-auto min-h-100">
          {loading ? (
            <div className="flex items-center justify-center min-h-100">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <RefreshCw size={32} className="animate-spin" />
                <p className="font-body text-sm">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-100">
              <div className="flex flex-col items-center gap-3 text-error">
                <p className="font-body text-sm">{error}</p>
                <button
                  onClick={() => loadVouchers(currentPage)}
                  className="px-4 py-2 text-sm font-semibold bg-error/10 text-error rounded-md hover:bg-error hover:text-white transition-colors"
                >
                  Thử lại
                </button>
              </div>
            </div>
          ) : (
            <table className="w-full text-left font-body">
              <thead className="bg-surface/50 border-b border-outline-variant/30 font-label text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold rounded-tl-md">
                    Mã & Tiêu đề
                  </th>
                  <th className="px-5 py-4 font-semibold">Cửa hàng</th>
                  <th className="px-5 py-4 font-semibold">Mức giảm</th>
                  <th className="px-5 py-4 font-semibold text-center">
                    Điểm đổi
                  </th>
                  <th className="px-5 py-4 font-semibold text-center">
                    Còn lại
                  </th>
                  <th className="px-5 py-4 font-semibold">Hết hạn</th>
                  <th className="px-5 py-4 font-semibold">Trạng thái</th>
                  <th className="px-3 py-4 font-semibold text-center rounded-tr-md">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {filteredVouchers.length > 0 ? (
                  filteredVouchers.map((voucher) => (
                    <tr
                      key={voucher._id}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      {/* Mã & Tiêu đề */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-secondary/10 flex items-center justify-center shrink-0">
                            <Ticket size={16} className="text-secondary" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-secondary tracking-wider text-xs mb-0.5">
                              {voucher.code}
                            </span>
                            <span className="font-semibold text-gray-900 text-sm line-clamp-1">
                              {voucher.title}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cửa hàng */}
                      <td className="px-5 py-4">
                        <span className="font-medium text-gray-900">
                          {voucher.creatorId?.fullName || 'N/A'}
                        </span>
                      </td>

                      {/* Mức giảm */}
                      <td className="px-5 py-4">
                        <span className="font-semibold text-secondary">
                          {formatDiscount(
                            voucher.discountType,
                            voucher.discountValue
                          )}
                        </span>
                        <span className="ml-1.5 text-xs text-gray-400">
                          {voucher.discountType === 'PERCENTAGE'
                            ? '%'
                            : 'cố định'}
                        </span>
                      </td>

                      {/* Điểm đổi */}
                      <td className="px-5 py-4 text-center">
                        <span className="font-bold text-primary">
                          {voucher.pointCost}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">đ</span>
                      </td>

                      {/* Còn lại */}
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`font-bold ${
                            voucher.remainingQuantity === 0
                              ? 'text-error'
                              : voucher.remainingQuantity <= 5
                                ? 'text-yellow-600'
                                : 'text-gray-900'
                          }`}
                        >
                          {voucher.remainingQuantity}
                        </span>
                        <span className="text-xs text-gray-400">
                          /{voucher.totalQuantity}
                        </span>
                      </td>

                      {/* Hết hạn */}
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(voucher.validUntil)}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-5 py-4">
                        {getStatusBadge(
                          voucher.isActive,
                          voucher.validUntil,
                          voucher.remainingQuantity
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-4 text-center relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(
                              openDropdownId === voucher._id
                                ? null
                                : voucher._id
                            );
                          }}
                          className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openDropdownId === voucher._id && (
                          <div className="absolute right-8 top-10 w-48 bg-surface-lowest border border-outline-variant/30 rounded-2xl shadow-hover z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                            <button
                              onClick={() => {
                                setSelectedVoucher(voucher);
                                setOpenDropdownId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                            >
                              <Eye size={16} />
                              Xem chi tiết
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggle(voucher._id);
                                setOpenDropdownId(null);
                              }}
                              disabled={togglingId === voucher._id}
                              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors disabled:opacity-60 ${
                                voucher.isActive
                                  ? 'text-error hover:bg-error/10'
                                  : 'text-primary hover:bg-primary/10'
                              }`}
                            >
                              {voucher.isActive ? (
                                <>
                                  <ToggleLeft size={16} />
                                  Vô hiệu hóa
                                </>
                              ) : (
                                <>
                                  <ToggleRight size={16} />
                                  Kích hoạt lại
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Ticket size={40} strokeWidth={1} />
                        <p className="font-body text-sm">
                          {searchQuery
                            ? 'Không tìm thấy voucher phù hợp.'
                            : 'Chưa có voucher nào.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ── PAGINATION ── */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-outline-variant/30">
            <p className="text-sm font-body text-gray-500">
              Hiển thị{' '}
              <span className="font-semibold text-gray-900">
                {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              trong tổng số{' '}
              <span className="font-semibold text-gray-900">
                {pagination.total}
              </span>{' '}
              voucher
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-body rounded-md border border-outline-variant/50 text-gray-600 hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === pagination.totalPages ||
                    Math.abs(p - currentPage) <= 1
                )
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (
                    idx > 0 &&
                    typeof arr[idx - 1] === 'number' &&
                    (p as number) - (arr[idx - 1] as number) > 1
                  ) {
                    acc.push('...');
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-gray-400"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`px-3 py-1.5 text-sm font-body rounded-md transition-colors ${
                        currentPage === p
                          ? 'bg-primary text-white font-semibold'
                          : 'border border-outline-variant/50 text-gray-600 hover:bg-primary/5'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1.5 text-sm font-body rounded-md border border-outline-variant/50 text-gray-600 hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Tiếp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      {selectedVoucher && (
        <VoucherDetailModal
          voucher={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
          onToggle={handleToggle}
          isToggling={togglingId === selectedVoucher._id}
          formatDate={formatDate}
          formatDiscount={formatDiscount}
          getStatusBadge={getStatusBadge}
        />
      )}
    </div>
  );
}
