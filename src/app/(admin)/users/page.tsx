'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Ban,
  Unlock,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Trash2,
  UserPlus,
} from 'lucide-react';
import UserDetailModal from '@/components/features/users/UserDetailModal';
import UserEditModal from '@/components/features/users/UserEditModal';
import {
  fetchUsers,
  updateUserStatus,
  deleteUser,
  type IUser,
} from '@/lib/userApi';
import { useAuthStore } from '@/stores/authStore';

const PAGE_SIZE = 10;

// --- HELPER FORMATS ---
const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatusBadge = (status: string) => {
  if (status === 'BANNED')
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider bg-red-50 text-error border-error/20">
        Bị khóa
      </span>
    );
  if (status === 'PENDING_KYC')
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider bg-amber-50 text-amber-700 border-amber-200">
        Chờ KYC
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider bg-green-50 text-primary border-primary/20">
      Hoạt động
    </span>
  );
};

const getRoleBadge = (role: string) => {
  const styles: Record<string, string> = {
    USER: 'bg-gray-100 text-gray-600 border-gray-200',
    STORE: 'bg-secondary/10 text-secondary border-secondary/20',
    ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${styles[role] || styles.USER}`}
    >
      {role}
    </span>
  );
};

export default function UsersManagementPage() {
  const router = useRouter();
  const { user: adminUser } = useAuthStore();

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
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

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, roleFilter]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchUsers({
        search: searchQuery,
        role: roleFilter,
        status: statusFilter,
        page: currentPage,
        limit: PAGE_SIZE,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setUsers(res.data);
      setPagination(res.pagination);
    } catch {
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter, statusFilter, currentPage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ── Ban / Unban ──
  const handleBanToggle = async (user: IUser) => {
    setTogglingId(user._id);
    setOpenDropdownId(null);
    try {
      const newStatus = user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
      await updateUserStatus(user._id, newStatus);
      await loadUsers();
      if (selectedUser?._id === user._id) {
        setSelectedUser((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
    } catch {
      alert('Thao tác thất bại. Vui lòng thử lại.');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Delete ──
  const handleDelete = async (user: IUser) => {
    setOpenDropdownId(null);

    // Guard: cannot delete ACTIVE accounts (shown by UI logic, but double-check)
    if (user.status === 'ACTIVE') {
      alert(
        'Không thể xóa tài khoản đang hoạt động. Vui lòng khóa tài khoản trước.'
      );
      return;
    }

    // Guard: cannot delete own account
    if (adminUser && user._id === adminUser._id) {
      alert('Bạn không thể xóa tài khoản của chính mình.');
      return;
    }

    const confirmed = confirm(
      `Xóa vĩnh viễn tài khoản "${user.fullName}" (${user.email})?\n\nHành động này không thể hoàn tác.`
    );
    if (!confirmed) return;

    setDeletingId(user._id);
    try {
      await deleteUser(user._id);
      await loadUsers();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Xóa tài khoản thất bại. Vui lòng thử lại.';
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  // ── After edit saved ──
  const handleUserUpdated = async (updated: IUser) => {
    await loadUsers();
    if (selectedUser?._id === updated._id) {
      setSelectedUser(updated);
    }
  };

  const closeDropdown = () => setOpenDropdownId(null);

  // KYC button: only for accounts in PENDING_KYC status
  const showKycAction = (user: IUser) => user.status === 'PENDING_KYC';

  // Delete: only BANNED accounts, and not self
  const showDeleteAction = (user: IUser) =>
    user.status === 'BANNED' && adminUser?._id !== user._id;

  return (
    <div
      className="w-full max-w-7xl mx-auto flex flex-col gap-6"
      onClick={closeDropdown}
    >
      {/* ── HEADER ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-sans font-bold text-gray-900 leading-tight">
            Quản Lý Người Dùng
          </h1>
          <p className="text-sm font-body text-gray-500 mt-1">
            Quản lý tài khoản, định danh (KYC) và trạng thái người dùng
          </p>
        </div>
        <button
          onClick={() => router.push('/users/create')}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
        >
          <UserPlus size={16} />
          Tạo tài khoản
        </button>
      </div>

      {/* ── TOOLBAR (SEARCH & FILTERS) ── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-lowest p-4 rounded-md shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50 w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary/50 focus-within:-translate-y-0.5 transition-all">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, sđt..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-transparent text-sm outline-none w-full font-body text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50">
            <Filter size={16} className="text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-sm outline-none font-body text-gray-700 cursor-pointer"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="USER">Người dùng cá nhân</option>
              <option value="STORE">Cửa hàng/Tổ chức</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm outline-none font-body text-gray-700 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="PENDING_KYC">Chờ duyệt KYC</option>
              <option value="BANNED">Đã bị khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <div className="bg-surface-lowest rounded-md shadow-soft border border-outline-variant/30 overflow-visible relative">
        <div className="overflow-x-auto min-h-100">
          <table className="w-full text-left font-body">
            <thead className="bg-surface/50 border-b border-outline-variant/30 font-label text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4 font-semibold rounded-tl-md">
                  Người dùng
                </th>
                <th className="px-5 py-4 font-semibold text-center">Vai trò</th>
                <th className="px-5 py-4 font-semibold">Liên hệ & Địa chỉ</th>
                <th className="px-5 py-4 font-semibold text-center">
                  Điểm xanh
                </th>
                <th className="px-5 py-4 font-semibold text-center">
                  Trạng thái
                </th>
                <th className="px-3 py-4 font-semibold text-center rounded-tr-md">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Loader2 size={28} className="animate-spin" />
                      <span className="text-sm font-body">
                        Đang tải dữ liệu...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-error text-sm"
                  >
                    {error}
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-primary/5 transition-colors"
                  >
                    {/* Người dùng */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary-container to-secondary-container flex items-center justify-center text-white font-sans text-xs font-bold shrink-0">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-37.5">
                          <span className="font-semibold text-gray-900 line-clamp-1">
                            {user.fullName}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Vai trò — center */}
                    <td className="px-5 py-4 text-center">
                      {getRoleBadge(user.role)}
                    </td>

                    {/* Liên hệ & Địa chỉ */}
                    <td className="px-5 py-4 max-w-50">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">
                          {user.phoneNumber || 'N/A'}
                        </span>
                        <span
                          className="text-xs text-gray-500 mt-0.5 truncate"
                          title={user.defaultAddress}
                        >
                          {user.defaultAddress || 'Chưa cập nhật'}
                        </span>
                      </div>
                    </td>

                    {/* Green Points — center */}
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold text-primary">
                        {user.greenPoints}
                      </span>
                    </td>

                    {/* Trạng thái — center */}
                    <td className="px-5 py-4 text-center">
                      {getStatusBadge(user.status)}
                    </td>

                    {/* Hành động — center */}
                    <td className="px-3 py-4 text-center relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(
                            openDropdownId === user._id ? null : user._id
                          );
                        }}
                        disabled={
                          togglingId === user._id || deletingId === user._id
                        }
                        className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors disabled:opacity-50"
                      >
                        {togglingId === user._id || deletingId === user._id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <MoreVertical size={18} />
                        )}
                      </button>

                      {openDropdownId === user._id && (
                        <div className="absolute right-8 top-10 w-52 bg-surface-lowest border border-outline-variant/30 rounded-2xl shadow-hover z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                          {/* Xem hồ sơ */}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setOpenDropdownId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                          >
                            <Eye size={16} />
                            Xem hồ sơ
                          </button>

                          {/* Chỉnh sửa */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingUser(user);
                              setOpenDropdownId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                          >
                            <Pencil size={16} />
                            Chỉnh sửa
                          </button>

                          {/* Xét duyệt KYC — only when PENDING and not ADMIN */}
                          {showKycAction(user) && (
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                router.push('/users/kyc');
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary hover:bg-secondary/10 transition-colors"
                            >
                              <ShieldAlert size={16} />
                              Xét duyệt KYC
                            </button>
                          )}

                          {/* Ban / Unban — hidden for PENDING_KYC (use KYC workflow first) */}
                          {user.status !== 'PENDING_KYC' && (
                            <>
                              <div className="h-px bg-outline-variant/20 my-1" />
                              {user.status === 'ACTIVE' ? (
                                <button
                                  onClick={() => handleBanToggle(user)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                                >
                                  <Ban size={16} />
                                  Khóa tài khoản
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBanToggle(user)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 transition-colors"
                                >
                                  <Unlock size={16} />
                                  Mở khóa tài khoản
                                </button>
                              )}
                            </>
                          )}

                          {/* Xóa tài khoản — only BANNED and not self */}
                          {showDeleteAction(user) && (
                            <>
                              <div className="h-px bg-outline-variant/20 my-1" />
                              <button
                                onClick={() => handleDelete(user)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                              >
                                <Trash2 size={16} />
                                Xóa tài khoản
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-outline-variant/30">
            <p className="text-xs font-body text-gray-500">
              Hiển thị{' '}
              <span className="font-semibold text-gray-700">
                {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              trong tổng số{' '}
              <span className="font-semibold text-gray-700">
                {pagination.total}
              </span>{' '}
              người dùng
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
                  setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={currentPage === pagination.totalPages}
                className="p-1.5 rounded-md text-gray-500 hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      <UserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onBanToggle={handleBanToggle}
        formatDate={formatDate}
        getStatusBadge={getStatusBadge}
        getRoleBadge={getRoleBadge}
      />

      {/* ── EDIT MODAL ── */}
      <UserEditModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUpdated={handleUserUpdated}
      />
    </div>
  );
}
