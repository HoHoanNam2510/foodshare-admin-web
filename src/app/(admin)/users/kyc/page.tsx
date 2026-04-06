'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ShieldCheck,
  ShieldX,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Store,
  Mail,
  Phone,
  MapPin,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { fetchUsers, reviewKyc, type IUser } from '@/lib/userApi';

const PAGE_SIZE = 10;

const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getKycBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={12} />
          Chờ duyệt
        </span>
      );
    case 'VERIFIED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-50 text-primary border border-primary/20">
          <ShieldCheck size={12} />
          Đã duyệt
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-error border border-error/20">
          <ShieldX size={12} />
          Từ chối
        </span>
      );
    default:
      return null;
  }
};

type KycFilter = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'ALL';

export default function KycReviewPage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [kycFilter, setKycFilter] = useState<KycFilter>('PENDING');
  const [currentPage, setCurrentPage] = useState(1);

  const [users, setUsers] = useState<IUser[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail modal
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [kycFilter]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Parameters<typeof fetchUsers>[0] = {
        search: searchQuery,
        page: currentPage,
        limit: PAGE_SIZE,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      };

      // Fetch users that have KYC docs — filter by kycStatus on backend
      if (kycFilter !== 'ALL') {
        // Use the query param for kycStatus filtering
        (params as Record<string, unknown>).kycStatus = kycFilter;
      }

      const res = await fetchUsers(params);
      // Only show users that actually have KYC documents or store info
      const filtered = res.data.filter(
        (u) => u.kycDocuments && u.kycDocuments.length > 0
      );
      setUsers(filtered);
      setPagination(res.pagination);
    } catch {
      setError('Không thể tải danh sách. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, kycFilter, currentPage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleReview = async (user: IUser, action: 'APPROVE' | 'REJECT') => {
    const confirmMsg =
      action === 'APPROVE'
        ? `Duyệt đăng ký cửa hàng cho "${user.fullName}"?\n\nTài khoản sẽ được nâng cấp lên STORE.`
        : `Từ chối đăng ký cửa hàng của "${user.fullName}"?\n\nNgười dùng có thể nộp lại đơn mới.`;

    if (!confirm(confirmMsg)) return;

    setReviewingId(user._id);
    try {
      await reviewKyc(user._id, action);
      await loadUsers();
      setSelectedUser(null);
    } catch {
      alert('Thao tác thất bại. Vui lòng thử lại.');
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-2xl font-sans font-bold text-gray-900 leading-tight flex items-center gap-3">
          <ShieldCheck size={28} className="text-primary" />
          Xét Duyệt KYC
        </h1>
        <p className="text-sm font-body text-gray-500 mt-1">
          Duyệt hoặc từ chối đơn đăng ký cửa hàng từ người dùng
        </p>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-lowest p-4 rounded-md shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50 w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary/50 focus-within:-translate-y-0.5 transition-all">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-transparent text-sm outline-none w-full font-body text-gray-900 placeholder:text-gray-400"
          />
        </div>

        {/* KYC status tabs */}
        <div className="flex items-center gap-1 bg-surface rounded-lg border border-outline-variant/50 p-1">
          {(
            [
              { value: 'PENDING', label: 'Chờ duyệt', icon: Clock },
              { value: 'VERIFIED', label: 'Đã duyệt', icon: CheckCircle2 },
              { value: 'REJECTED', label: 'Từ chối', icon: XCircle },
              { value: 'ALL', label: 'Tất cả', icon: FileText },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = kycFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setKycFilter(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-500 hover:bg-primary/5 hover:text-primary'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── KYC CARDS ── */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
            <Loader2 size={28} className="animate-spin" />
            <span className="text-sm font-body">Đang tải dữ liệu...</span>
          </div>
        ) : error ? (
          <div className="py-10 text-center text-error text-sm">{error}</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldCheck size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-body text-sm">
              {kycFilter === 'PENDING'
                ? 'Không có đơn nào đang chờ duyệt.'
                : 'Không tìm thấy kết quả phù hợp.'}
            </p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="bg-surface-lowest rounded-md shadow-sm border border-outline-variant/30 p-5 hover:shadow-soft transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: User info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary-container to-secondary-container flex items-center justify-center text-white font-sans text-lg font-bold shrink-0">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-sans font-bold text-gray-900">
                        {user.fullName}
                      </h3>
                      {getKycBadge(user.kycStatus)}
                    </div>

                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 font-body">
                      <span className="flex items-center gap-1">
                        <Mail size={12} /> {user.email}
                      </span>
                      {user.phoneNumber && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} /> {user.phoneNumber}
                        </span>
                      )}
                    </div>

                    {/* Store info preview */}
                    {user.storeInfo && (
                      <div className="mt-3 p-3 bg-secondary/5 rounded-lg border border-secondary/15">
                        <div className="flex items-center gap-2 mb-2">
                          <Store size={14} className="text-secondary" />
                          <span className="font-label text-xs font-bold text-secondary uppercase tracking-wider">
                            Thông tin cửa hàng
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-body">
                          <div>
                            <span className="text-gray-500">Tên: </span>
                            <span className="font-semibold text-gray-900">
                              {user.storeInfo.businessName || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Giờ: </span>
                            <span className="font-semibold text-gray-900">
                              {user.storeInfo.openHours || '?'} –{' '}
                              {user.storeInfo.closeHours || '?'}
                            </span>
                          </div>
                          {user.storeInfo.businessAddress && (
                            <div className="col-span-2">
                              <span className="text-gray-500 flex items-center gap-1">
                                <MapPin size={11} /> {user.storeInfo.businessAddress}
                              </span>
                            </div>
                          )}
                          {user.storeInfo.description && (
                            <div className="col-span-2">
                              <span className="text-gray-500 italic">
                                &quot;{user.storeInfo.description}&quot;
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* KYC documents thumbnails */}
                    {user.kycDocuments && user.kycDocuments.length > 0 && (
                      <div className="mt-3">
                        <p className="font-label text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Tài liệu KYC ({user.kycDocuments.length})
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {user.kycDocuments.map((doc, idx) => (
                            <button
                              key={idx}
                              onClick={() => setPreviewImage(doc)}
                              className="w-20 h-14 rounded-lg overflow-hidden border border-outline-variant/30 hover:ring-2 hover:ring-primary/50 transition-all relative group"
                            >
                              <Image
                                src={doc}
                                alt={`KYC document ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <Eye
                                  size={16}
                                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] text-gray-400 font-body mt-2">
                      Ngày gửi: {formatDate(user.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Right: Action buttons */}
                {user.kycStatus === 'PENDING' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleReview(user, 'APPROVE')}
                      disabled={reviewingId === user._id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                    >
                      {reviewingId === user._id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      Duyệt
                    </button>
                    <button
                      onClick={() => handleReview(user, 'REJECT')}
                      disabled={reviewingId === user._id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-error/10 text-error hover:bg-error hover:text-white transition-colors disabled:opacity-50"
                    >
                      {reviewingId === user._id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <XCircle size={16} />
                      )}
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── PAGINATION ── */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-surface-lowest p-4 rounded-md shadow-sm border border-outline-variant/30">
          <p className="text-xs font-body text-gray-500">
            Hiển thị{' '}
            <span className="font-semibold text-gray-700">
              {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(
                pagination.page * pagination.limit,
                pagination.total
              )}
            </span>{' '}
            trong tổng số{' '}
            <span className="font-semibold text-gray-700">
              {pagination.total}
            </span>
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md text-gray-500 hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - currentPage) <= 1
              )
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                  acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === '...' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-gray-400 text-sm"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                      currentPage === p
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-surface-container'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(pagination.totalPages, p + 1)
                )
              }
              disabled={currentPage === pagination.totalPages}
              className="p-1.5 rounded-md text-gray-500 hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── IMAGE PREVIEW MODAL ── */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          />
          <div className="relative max-w-3xl max-h-[80vh] w-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
            <Image
              src={previewImage}
              alt="KYC Document Preview"
              width={800}
              height={600}
              className="rounded-lg object-contain w-full max-h-[80vh]"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}
