'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
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
import Toolbar, { type ToolbarFilter } from '@/components/ui/Toolbar';
import DataTable, { type Column } from '@/components/ui/DataTable';
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
      <Toolbar
        onSearch={(v) => {
          setSearchQuery(v);
          setCurrentPage(1);
        }}
        placeholder="Tìm theo tên, email, sđt..."
        filters={
          [
            {
              type: 'select',
              value: roleFilter,
              onChange: setRoleFilter,
              options: [
                { value: 'ALL', label: 'Tất cả vai trò' },
                { value: 'USER', label: 'Người dùng cá nhân' },
                { value: 'STORE', label: 'Cửa hàng/Tổ chức' },
                { value: 'ADMIN', label: 'Quản trị viên' },
              ],
            },
            {
              type: 'select',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: 'ACTIVE', label: 'Đang hoạt động' },
                { value: 'PENDING_KYC', label: 'Chờ duyệt KYC' },
                { value: 'BANNED', label: 'Đã bị khóa' },
              ],
            },
          ] satisfies ToolbarFilter[]
        }
      />

      {/* ── DATA TABLE ── */}
      <DataTable
        columns={
          [
            {
              key: 'user',
              header: 'Người dùng',
              render: (user: IUser) => (
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
              ),
            },
            {
              key: 'role',
              header: 'Vai trò',
              align: 'center',
              render: (user: IUser) => getRoleBadge(user.role),
            },
            {
              key: 'contact',
              header: 'Liên hệ & Địa chỉ',
              render: (user: IUser) => (
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
              ),
            },
            {
              key: 'greenPoints',
              header: 'Điểm xanh',
              align: 'center',
              render: (user: IUser) => (
                <span className="font-bold text-primary">
                  {user.greenPoints}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Trạng thái',
              align: 'center',
              render: (user: IUser) => getStatusBadge(user.status),
            },
            {
              key: 'actions',
              header: 'Hành động',
              align: 'center',
              render: (user: IUser) => (
                <div className="text-center relative">
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
                </div>
              ),
            },
          ] satisfies Column<IUser>[]
        }
        data={users}
        rowKey={(user) => user._id}
        loading={loading}
        error={error}
        emptyMessage="Không tìm thấy người dùng nào phù hợp."
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        className="rounded-md overflow-visible relative"
        tableClassName="min-h-100"
        headerClassName="bg-surface/50 font-label text-xs uppercase text-gray-500"
        bodyClassName="divide-outline-variant/20 text-sm"
        rowClassName="hover:bg-primary/5 transition-colors"
        cellClassName={(col) => (col.key === 'actions' ? 'px-3' : '')}
      />

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
