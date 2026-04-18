'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  Ban,
  Unlock,
  ShieldAlert,
  Pencil,
  Trash2,
  UserPlus,
} from 'lucide-react';
import Toolbar, { type ToolbarFilter } from '@/components/ui/Toolbar';
import DataTable, { type Column } from '@/components/ui/DataTable';
import PageHeader from '@/components/ui/PageHeader';
import ActionDropdown, {
  type DropdownAction,
} from '@/components/ui/ActionDropdown';
import StatusBadge from '@/components/ui/StatusBadge';
import UserAvatar from '@/components/ui/UserAvatar';
import UserDetailModal from '@/components/features/users/UserDetailModal';
import UserEditModal from '@/components/features/users/UserEditModal';
import { formatDate } from '@/lib/formatters';
import {
  fetchUsers,
  updateUserStatus,
  deleteUser,
  type IUser,
} from '@/lib/userApi';
import { useAuthStore } from '@/stores/authStore';

const PAGE_SIZE = 10;

// ─── Badge helpers (dùng StatusBadge + label tiếng Việt) ─────

const USER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Hoạt động',
  PENDING_KYC: 'Chờ KYC',
  BANNED: 'Bị khóa',
};

const getStatusBadge = (status: string) => (
  <StatusBadge status={status} label={USER_STATUS_LABELS[status]} />
);

const getRoleBadge = (role: string) => <StatusBadge status={role} />;

// ─────────────────────────────────────────────────────────────

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

  const handleDelete = async (user: IUser) => {
    setOpenDropdownId(null);

    if (user.status === 'ACTIVE') {
      alert(
        'Không thể xóa tài khoản đang hoạt động. Vui lòng khóa tài khoản trước.'
      );
      return;
    }
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

  const handleUserUpdated = async (updated: IUser) => {
    await loadUsers();
    if (selectedUser?._id === updated._id) setSelectedUser(updated);
  };

  const buildActions = (user: IUser): DropdownAction[] => [
    {
      label: 'Xem hồ sơ',
      icon: <Eye size={16} />,
      onClick: () => {
        setSelectedUser(user);
        setOpenDropdownId(null);
      },
    },
    {
      label: 'Chỉnh sửa',
      icon: <Pencil size={16} />,
      onClick: () => {
        setEditingUser(user);
        setOpenDropdownId(null);
      },
    },
    {
      label: 'Xét duyệt KYC',
      icon: <ShieldAlert size={16} />,
      variant: 'secondary',
      hidden: user.status !== 'PENDING_KYC',
      onClick: () => {
        setOpenDropdownId(null);
        router.push('/users/kyc');
      },
    },
    {
      label: user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
      icon: user.status === 'ACTIVE' ? <Ban size={16} /> : <Unlock size={16} />,
      variant: user.status === 'ACTIVE' ? 'danger' : 'primary',
      dividerBefore: true,
      hidden: user.status === 'PENDING_KYC',
      onClick: () => handleBanToggle(user),
    },
    {
      label: 'Xóa tài khoản',
      icon: <Trash2 size={16} />,
      variant: 'danger',
      dividerBefore: true,
      hidden: user.status !== 'BANNED' || adminUser?._id === user._id,
      onClick: () => handleDelete(user),
    },
  ];

  const columns: Column<IUser>[] = [
    {
      key: 'user',
      header: 'Người dùng',
      render: (user) => (
        <div className="flex items-center gap-3">
          <UserAvatar fullName={user.fullName} avatar={user.avatar} size="md" />
          <div className="flex flex-col min-w-37.5">
            <span className="font-semibold text-gray-900 line-clamp-1">
              {user.fullName}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">{user.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò',
      align: 'center',
      render: (user) => getRoleBadge(user.role),
    },
    {
      key: 'contact',
      header: 'Liên hệ & Địa chỉ',
      render: (user) => (
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
      render: (user) => (
        <span className="font-bold text-primary">{user.greenPoints}</span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (user) => getStatusBadge(user.status),
    },
    {
      key: 'actions',
      header: 'Hành động',
      align: 'center',
      render: (user) => (
        <ActionDropdown
          id={user._id}
          openId={openDropdownId}
          onToggle={(id) =>
            setOpenDropdownId((prev) => (prev === id ? null : id))
          }
          loading={togglingId === user._id || deletingId === user._id}
          width="w-52"
          actions={buildActions(user)}
        />
      ),
    },
  ];

  return (
    <div
      className="w-full max-w-7xl mx-auto flex flex-col gap-6"
      onClick={() => setOpenDropdownId(null)}
    >
      <PageHeader
        title="Quản Lý Người Dùng"
        subtitle="Quản lý tài khoản, định danh (KYC) và trạng thái người dùng"
        action={
          <button
            onClick={() => router.push('/users/create')}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <UserPlus size={16} />
            Tạo tài khoản
          </button>
        }
      />

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

      <DataTable
        columns={columns}
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

      <UserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onBanToggle={handleBanToggle}
        formatDate={formatDate}
        getStatusBadge={getStatusBadge}
        getRoleBadge={getRoleBadge}
      />

      <UserEditModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUpdated={handleUserUpdated}
      />
    </div>
  );
}
