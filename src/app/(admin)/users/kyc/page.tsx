'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
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
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import Image from 'next/image';
import Toolbar, { type ToolbarFilter } from '@/components/ui/Toolbar';
import PageHeader from '@/components/ui/PageHeader';
import { fetchUsers, reviewKyc, type IUser } from '@/lib/userApi';
import { formatDateTime } from '@/lib/formatters';

const PAGE_SIZE = 10;

type KycFilter =
  | 'NEW_REGISTRATION'
  | 'RESUBMISSION'
  | 'VERIFIED'
  | 'REJECTED'
  | 'ALL';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getKycBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-yellow-900/20 text-amber-700 dark:text-yellow-400 border border-amber-200 dark:border-yellow-800/30">
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

const getPendingKycBadge = (status: string | null) => {
  if (!status) return null;
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30">
          <RefreshCw size={12} />
          Tái duyệt đang chờ
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-error border border-error/20">
          <ShieldX size={12} />
          Tái duyệt bị từ chối
        </span>
      );
    default:
      return null;
  }
};

const getGracePeriodBadge = (endsAt: string | null) => {
  if (!endsAt) return null;
  const end = new Date(endsAt);
  const now = new Date();
  if (now >= end) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-error border border-error/30">
        <AlertTriangle size={12} />
        Hết hạn — tài khoản có thể bị khóa
      </span>
    );
  }
  const daysLeft = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/30">
      <AlertTriangle size={12} />
      Gia hạn còn {daysLeft} ngày
    </span>
  );
};

// ── Doc thumbnails ────────────────────────────────────────────────────────────

function DocThumbnails({
  docs,
  label,
  onPreview,
}: {
  docs: string[];
  label: string;
  onPreview: (url: string) => void;
}) {
  if (!docs || docs.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="font-label text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
        {label} ({docs.length})
      </p>
      <div className="flex gap-2 flex-wrap">
        {docs.map((doc, idx) => (
          <button
            key={idx}
            onClick={() => onPreview(doc)}
            className="w-20 h-14 rounded-lg overflow-hidden border border-outline-variant/30 hover:ring-2 hover:ring-primary/50 transition-all relative group"
          >
            <Image
              src={doc}
              alt={`doc ${idx + 1}`}
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
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function KycReviewPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [kycFilter, setKycFilter] = useState<KycFilter>('NEW_REGISTRATION');
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

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [kycFilter]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baseParams = {
        search: searchQuery,
        page: currentPage,
        limit: PAGE_SIZE,
        sortBy: 'updatedAt' as const,
        sortOrder: 'desc' as const,
      };

      let params: Parameters<typeof fetchUsers>[0] = { ...baseParams };

      if (kycFilter === 'NEW_REGISTRATION') {
        params = { ...params, status: 'PENDING_KYC' };
      } else if (kycFilter === 'RESUBMISSION') {
        params = { ...params, role: 'STORE', pendingKycStatus: 'PENDING' };
      } else if (kycFilter === 'VERIFIED') {
        params = { ...params, role: 'STORE', kycStatus: 'VERIFIED' };
      } else if (kycFilter === 'REJECTED') {
        params = { ...params, kycStatus: 'REJECTED' };
      }
      // ALL: no extra filters — but only show users with any KYC involvement

      const res = await fetchUsers(params);

      // For ALL tab: filter to users that have submitted KYC at some point
      const filtered =
        kycFilter === 'ALL'
          ? res.data.filter(
              (u) =>
                (u.kycDocuments && u.kycDocuments.length > 0) ||
                (u.pendingKycDocuments && u.pendingKycDocuments.length > 0)
            )
          : res.data;

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
    const isResubmission =
      user.role === 'STORE' && user.pendingKycStatus === 'PENDING';

    const confirmMsg = isResubmission
      ? action === 'APPROVE'
        ? `Duyệt hồ sơ KYC mới của cửa hàng "${user.fullName}"?\n\nHồ sơ mới sẽ thay thế hồ sơ cũ, kycStatus = VERIFIED.`
        : `Từ chối hồ sơ KYC mới của "${user.fullName}"?\n\nCửa hàng vẫn hoạt động nhưng sẽ có thêm 30 ngày để nộp lại.`
      : action === 'APPROVE'
        ? `Duyệt đăng ký cửa hàng cho "${user.fullName}"?\n\nTài khoản sẽ được nâng cấp lên STORE.`
        : `Từ chối đăng ký cửa hàng của "${user.fullName}"?\n\nNgười dùng có thể nộp lại đơn mới.`;

    if (!confirm(confirmMsg)) return;

    setReviewingId(user._id);
    try {
      await reviewKyc(user._id, action);
      await loadUsers();
    } catch {
      toast.error('Thao tác thất bại. Vui lòng thử lại.');
    } finally {
      setReviewingId(null);
    }
  };

  const isResubmission = (user: IUser) =>
    user.role === 'STORE' && user.pendingKycStatus === 'PENDING';

  const hasPendingAction = (user: IUser) =>
    user.status === 'PENDING_KYC' || isResubmission(user);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      <PageHeader
        title="Xét Duyệt KYC"
        subtitle="Duyệt hoặc từ chối đơn đăng ký và tái xét duyệt KYC từ cửa hàng"
      />

      {/* ── TOOLBAR ── */}
      <Toolbar
        onSearch={(v) => {
          setSearchQuery(v);
          setCurrentPage(1);
        }}
        placeholder="Tìm theo tên, email..."
        filters={
          [
            {
              type: 'tabs',
              value: kycFilter,
              onChange: (v) => setKycFilter(v as KycFilter),
              options: [
                {
                  value: 'NEW_REGISTRATION',
                  label: 'Đăng ký mới',
                  icon: <Store size={14} />,
                },
                {
                  value: 'RESUBMISSION',
                  label: 'Tái duyệt KYC',
                  icon: <RefreshCw size={14} />,
                },
                {
                  value: 'VERIFIED',
                  label: 'Đã duyệt',
                  icon: <CheckCircle2 size={14} />,
                },
                {
                  value: 'REJECTED',
                  label: 'Từ chối',
                  icon: <XCircle size={14} />,
                },
                { value: 'ALL', label: 'Tất cả', icon: <FileText size={14} /> },
              ],
            },
          ] satisfies ToolbarFilter[]
        }
      />

      {/* ── CARDS ── */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16 text-gray-400 dark:text-gray-500">
            <Loader2 size={28} className="animate-spin" />
            <span className="text-sm font-body">Đang tải dữ liệu...</span>
          </div>
        ) : error ? (
          <div className="py-10 text-center text-error text-sm">{error}</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldCheck size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-body text-sm">
              {kycFilter === 'NEW_REGISTRATION'
                ? 'Không có đơn đăng ký mới nào đang chờ duyệt.'
                : kycFilter === 'RESUBMISSION'
                  ? 'Không có hồ sơ tái duyệt KYC nào đang chờ.'
                  : 'Không tìm thấy kết quả phù hợp.'}
            </p>
          </div>
        ) : (
          users.map((user) => {
            const resubmit = isResubmission(user);

            return (
              <div
                key={user._id}
                className={`bg-surface-lowest dark:bg-gray-900 rounded-md shadow-sm border p-5 hover:shadow-soft transition-shadow ${
                  resubmit
                    ? 'border-blue-200 dark:border-blue-800/40 bg-blue-50/30 dark:bg-blue-900/10'
                    : 'border-outline-variant/30 dark:border-gray-800'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* ── Left: User info ── */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary-container to-secondary-container flex items-center justify-center text-white font-sans text-lg font-bold shrink-0 overflow-hidden">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.fullName}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.fullName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name + badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-sans font-bold text-gray-900 dark:text-gray-100">
                          {user.fullName}
                        </h3>
                        {resubmit ? (
                          <>
                            {getKycBadge(user.kycStatus)}
                            {getPendingKycBadge(user.pendingKycStatus)}
                          </>
                        ) : (
                          getKycBadge(user.kycStatus)
                        )}
                        {getGracePeriodBadge(user.kycGracePeriodEndsAt)}
                      </div>

                      {/* Contact */}
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-body">
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
                              <span className="text-gray-500 dark:text-gray-400">
                                Tên:{' '}
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {user.storeInfo.businessName || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Giờ:{' '}
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {user.storeInfo.openHours || '?'} –{' '}
                                {user.storeInfo.closeHours || '?'}
                              </span>
                            </div>
                            {user.storeInfo.businessAddress && (
                              <div className="col-span-2">
                                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <MapPin size={11} />{' '}
                                  {user.storeInfo.businessAddress}
                                </span>
                              </div>
                            )}
                            {user.storeInfo.description && (
                              <div className="col-span-2">
                                <span className="text-gray-500 dark:text-gray-400 italic">
                                  &quot;{user.storeInfo.description}&quot;
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* KYC docs — tái nộp: show new docs prominently, old docs as reference */}
                      {resubmit ? (
                        <>
                          <DocThumbnails
                            docs={user.pendingKycDocuments}
                            label="Hồ sơ KYC mới (cần duyệt)"
                            onPreview={setPreviewImage}
                          />
                          {user.kycDocuments &&
                            user.kycDocuments.length > 0 && (
                              <DocThumbnails
                                docs={user.kycDocuments}
                                label="Hồ sơ KYC hiện tại (đối chiếu)"
                                onPreview={setPreviewImage}
                              />
                            )}
                        </>
                      ) : (
                        <DocThumbnails
                          docs={user.kycDocuments}
                          label="Tài liệu KYC"
                          onPreview={setPreviewImage}
                        />
                      )}

                      <p className="text-[11px] text-gray-400 dark:text-gray-500 font-body mt-2">
                        Cập nhật: {formatDateTime(user.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {/* ── Right: Action buttons ── */}
                  {hasPendingAction(user) && (
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
            );
          })
        )}
      </div>

      {/* ── PAGINATION ── */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-surface-lowest dark:bg-gray-900 p-4 rounded-md shadow-sm border border-outline-variant/30 dark:border-gray-800">
          <p className="text-xs font-body text-gray-500 dark:text-gray-400">
            Hiển thị{' '}
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            trong tổng số{' '}
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {pagination.total}
            </span>
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-surface-container dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                        : 'text-gray-600 dark:text-gray-400 hover:bg-surface-container dark:hover:bg-gray-800'
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
              className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-surface-container dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
