'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Ban,
  Unlock,
  ShieldAlert,
} from 'lucide-react';
import UserDetailModal from '@/components/features/users/UserDetailModal';
import { MOCK_USERS } from '@/constants/mockUsers';

// --- HELPER FORMATS ---
const formatDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatusBadge = (status: string) => {
  const isBanned = status === 'BANNED';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
        isBanned
          ? 'bg-red-50 text-error border-error/20'
          : 'bg-green-50 text-primary border-primary/20'
      }`}
    >
      {isBanned ? 'Bị khóa' : 'Hoạt động'}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const filteredUsers = useMemo(() => {
    let result = [...MOCK_USERS];
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(lowerQuery) ||
          u.email.toLowerCase().includes(lowerQuery) ||
          (u.phoneNumber && u.phoneNumber.includes(lowerQuery))
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((u) => u.status === statusFilter);
    }
    if (roleFilter !== 'ALL') {
      result = result.filter((u) => u.role === roleFilter);
    }
    return result;
  }, [searchQuery, statusFilter, roleFilter]);

  const closeDropdown = () => setOpenDropdownId(null);

  return (
    <div
      className="w-full max-w-7xl mx-auto flex flex-col gap-6"
      onClick={closeDropdown}
    >
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-2xl font-sans font-bold text-gray-900 leading-tight">
          Quản Lý Người Dùng
        </h1>
        <p className="text-sm font-body text-gray-500 mt-1">
          Quản lý tài khoản, định danh (KYC) và trạng thái người dùng
        </p>
      </div>

      {/* ── TOOLBAR (SEARCH & FILTERS) ── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-lowest p-4 rounded-md shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50 w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary/50 focus-within:-translate-y-0.5 transition-all">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, sđt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                <th className="px-5 py-4 font-semibold">Vai trò</th>
                <th className="px-5 py-4 font-semibold">Liên hệ & Địa chỉ</th>
                <th className="px-5 py-4 font-semibold text-center">
                  Điểm xanh
                </th>
                <th className="px-5 py-4 font-semibold">Trạng thái</th>
                <th className="px-3 py-4 font-semibold text-center rounded-tr-md">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-primary/5 transition-colors"
                  >
                    {/* Người dùng: Gom Tên + Email */}
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

                    {/* Vai trò */}
                    <td className="px-5 py-4">{getRoleBadge(user.role)}</td>

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

                    {/* Green Points */}
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold text-primary">
                        {user.greenPoints}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-5 py-4">{getStatusBadge(user.status)}</td>

                    {/* Action 3 chấm */}
                    <td className="px-3 py-4 text-center relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(
                            openDropdownId === user._id ? null : user._id
                          );
                        }}
                        className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openDropdownId === user._id && (
                        <div className="absolute right-8 top-10 w-48 bg-surface-lowest border border-outline-variant/30 rounded-2xl shadow-hover z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95">
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

                          {user.kycStatus === 'PENDING' && (
                            <button
                              onClick={() => setOpenDropdownId(null)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary hover:bg-secondary/10 transition-colors"
                            >
                              <ShieldAlert size={16} />
                              Duyệt KYC
                            </button>
                          )}

                          <div className="h-px bg-outline-variant/20 my-1"></div>

                          {user.status === 'ACTIVE' ? (
                            <button
                              onClick={() => {
                                alert(`Đã khóa user ${user._id}`);
                                setOpenDropdownId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                            >
                              <Ban size={16} />
                              Khóa tài khoản
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                alert(`Đã mở khóa user ${user._id}`);
                                setOpenDropdownId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 transition-colors"
                            >
                              <Unlock size={16} />
                              Mở khóa tài khoản
                            </button>
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
      </div>

      {/* ── HIỂN THỊ MODAL CHI TIẾT ── */}
      <UserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        formatDate={formatDate}
        getStatusBadge={getStatusBadge}
        getRoleBadge={getRoleBadge}
      />
    </div>
  );
}
