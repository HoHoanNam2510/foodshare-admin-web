'use client';

import { useState } from 'react';
import {
  Eye,
  X,
  Search,
  SlidersHorizontal,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Star,
  Leaf,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Store,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ─── Types (mirrors User.ts model) ───────────────────────────────────────────

interface StoreInfo {
  openHours?: string;
  description?: string;
  businessAddress?: string;
}

interface UserLocation {
  type: 'Point';
  coordinates: [number, number];
}

interface IUser {
  _id: string;
  email: string;
  phoneNumber?: string;
  role: 'USER' | 'STORE' | 'ADMIN';
  fullName: string;
  avatar?: string;
  defaultAddress?: string;
  location?: UserLocation;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  kycDocuments: string[];
  storeInfo?: StoreInfo;
  greenPoints: number;
  averageRating: number;
  status: 'ACTIVE' | 'BANNED';
  createdAt: Date;
  updatedAt: Date;
  // UI-only helper
  isOnline?: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_USERS: IUser[] = [
  {
    _id: '1',
    fullName: 'Nguyễn Thị Lan',
    email: 'lan.nguyen@foodshare.vn',
    phoneNumber: '0901 234 567',
    role: 'ADMIN',
    avatar: 'https://i.pravatar.cc/150?img=47',
    defaultAddress: '123 Lê Lợi, Quận 1, TP.HCM',
    kycStatus: 'VERIFIED',
    kycDocuments: ['doc1.pdf', 'doc2.pdf'],
    greenPoints: 1250,
    averageRating: 4.9,
    status: 'ACTIVE',
    isOnline: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-03-04'),
    location: { type: 'Point', coordinates: [106.6997, 10.7769] },
  },
  {
    _id: '2',
    fullName: 'Trần Minh Khoa',
    email: 'khoa.tran@foodshare.vn',
    phoneNumber: '0912 345 678',
    role: 'STORE',
    avatar: 'https://i.pravatar.cc/150?img=12',
    defaultAddress: '45 Nguyễn Huệ, Quận 1, TP.HCM',
    kycStatus: 'VERIFIED',
    kycDocuments: ['kyc1.pdf'],
    greenPoints: 3480,
    averageRating: 4.7,
    status: 'ACTIVE',
    isOnline: true,
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2024-03-06'),
    storeInfo: {
      openHours: '08:00 - 22:00',
      description: 'Cửa hàng thực phẩm sạch organic',
      businessAddress: '45 Nguyễn Huệ, Q1',
    },
    location: { type: 'Point', coordinates: [106.7032, 10.7731] },
  },
  {
    _id: '3',
    fullName: 'Phạm Thị Hoa',
    email: 'hoa.pham@gmail.com',
    phoneNumber: '0923 456 789',
    role: 'USER',
    avatar: 'https://i.pravatar.cc/150?img=32',
    defaultAddress: '78 Trần Hưng Đạo, Quận 5, TP.HCM',
    kycStatus: 'PENDING',
    kycDocuments: [],
    greenPoints: 220,
    averageRating: 4.2,
    status: 'ACTIVE',
    isOnline: false,
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2024-02-28'),
    location: { type: 'Point', coordinates: [106.6819, 10.753] },
  },
  {
    _id: '4',
    fullName: 'Lê Văn Đức',
    email: 'duc.le@gmail.com',
    phoneNumber: '0934 567 890',
    role: 'USER',
    avatar: 'https://i.pravatar.cc/150?img=15',
    defaultAddress: '12 Cách Mạng Tháng 8, Q3, TP.HCM',
    kycStatus: 'REJECTED',
    kycDocuments: ['attempt1.pdf'],
    greenPoints: 50,
    averageRating: 3.8,
    status: 'BANNED',
    isOnline: false,
    createdAt: new Date('2023-08-05'),
    updatedAt: new Date('2024-01-15'),
    location: { type: 'Point', coordinates: [106.6875, 10.7812] },
  },
  {
    _id: '5',
    fullName: 'Võ Thị Bích Ngọc',
    email: 'ngoc.vo@foodshare.vn',
    phoneNumber: '0945 678 901',
    role: 'STORE',
    avatar: 'https://i.pravatar.cc/150?img=25',
    defaultAddress: '200 Hoàng Văn Thụ, Tân Bình, TP.HCM',
    kycStatus: 'VERIFIED',
    kycDocuments: ['store_license.pdf', 'id_card.pdf'],
    greenPoints: 5120,
    averageRating: 4.95,
    status: 'ACTIVE',
    isOnline: true,
    storeInfo: {
      openHours: '06:00 - 20:00',
      description: 'Bánh mì & thực phẩm tươi sống',
      businessAddress: '200 Hoàng Văn Thụ, Tân Bình',
    },
    createdAt: new Date('2022-11-01'),
    updatedAt: new Date('2024-03-08'),
    location: { type: 'Point', coordinates: [106.6535, 10.8012] },
  },
  {
    _id: '6',
    fullName: 'Đặng Quốc Hùng',
    email: 'hung.dang@gmail.com',
    phoneNumber: '0956 789 012',
    role: 'USER',
    avatar: 'https://i.pravatar.cc/150?img=53',
    defaultAddress: '55 Đinh Tiên Hoàng, Bình Thạnh, TP.HCM',
    kycStatus: 'PENDING',
    kycDocuments: [],
    greenPoints: 760,
    averageRating: 4.5,
    status: 'ACTIVE',
    isOnline: true,
    createdAt: new Date('2023-09-14'),
    updatedAt: new Date('2024-03-02'),
    location: { type: 'Point', coordinates: [106.7134, 10.8017] },
  },
  {
    _id: '7',
    fullName: 'Bùi Thị Thu Hương',
    email: 'huong.bui@foodshare.vn',
    phoneNumber: '0967 890 123',
    role: 'USER',
    avatar: 'https://i.pravatar.cc/150?img=41',
    defaultAddress: '9 Lý Thường Kiệt, Quận 10, TP.HCM',
    kycStatus: 'VERIFIED',
    kycDocuments: ['id_front.jpg', 'id_back.jpg'],
    greenPoints: 1890,
    averageRating: 4.6,
    status: 'ACTIVE',
    isOnline: false,
    createdAt: new Date('2023-04-22'),
    updatedAt: new Date('2024-03-01'),
    location: { type: 'Point', coordinates: [106.664, 10.771] },
  },
  {
    _id: '8',
    fullName: 'Hoàng Minh Tú',
    email: 'tu.hoang@gmail.com',
    role: 'USER',
    avatar: 'https://i.pravatar.cc/150?img=60',
    defaultAddress: '301 Nguyễn Văn Cừ, Quận 5, TP.HCM',
    kycStatus: 'PENDING',
    kycDocuments: [],
    greenPoints: 30,
    averageRating: 4.0,
    status: 'ACTIVE',
    isOnline: false,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-02-20'),
    location: { type: 'Point', coordinates: [106.6713, 10.7541] },
  },
];

// ─── Helper Badges ────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: IUser['role'] }) {
  const map = {
    ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
    STORE: 'bg-blue-100 text-blue-700 border-blue-200',
    USER: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  const labels = { ADMIN: 'Admin', STORE: 'Cửa hàng', USER: 'Người dùng' };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[role]}`}
    >
      {labels[role]}
    </span>
  );
}

function KycBadge({ status }: { status: IUser['kycStatus'] }) {
  const map = {
    VERIFIED: {
      cls: 'bg-green-100 text-green-700',
      label: 'Đã xác minh',
      Icon: ShieldCheck,
    },
    PENDING: {
      cls: 'bg-yellow-100 text-yellow-700',
      label: 'Chờ duyệt',
      Icon: Clock,
    },
    REJECTED: {
      cls: 'bg-red-100 text-red-700',
      label: 'Từ chối',
      Icon: ShieldAlert,
    },
  };
  const { cls, label, Icon } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}
    >
      <Icon size={11} /> {label}
    </span>
  );
}

function StatusDot({
  status,
  isOnline,
}: {
  status: IUser['status'];
  isOnline?: boolean;
}) {
  if (status === 'BANNED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        Bị khóa
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${isOnline ? 'text-green-600' : 'text-gray-400'}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}
      />
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
}

// ─── Profile Modal ────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number;
}) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={15} className="text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800 wrap-break-word">
          {value}
        </p>
      </div>
    </div>
  );
}

function ProfileModal({ user, onClose }: { user: IUser; onClose: () => void }) {
  const joinDate = new Date(user.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-gray-100 transition-colors"
          aria-label="Đóng"
        >
          <X size={16} className="text-gray-500" />
        </button>

        {/* Hero header */}
        <div
          className="relative pt-10 pb-6 px-6 flex flex-col items-center text-center"
          style={{
            background: 'linear-gradient(160deg, #f0f4ff 0%, #faf5ff 100%)',
          }}
        >
          {/* Avatar */}
          <div className="relative mb-3">
            <img
              src={
                user.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=7c3aed&color=fff`
              }
              alt={user.fullName}
              className="w-20 h-20 rounded-2xl object-cover shadow-lg ring-4 ring-white"
            />
            {/* Online indicator */}
            {user.status === 'ACTIVE' && user.isOnline && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 ring-2 ring-white" />
            )}
          </div>

          <h2 className="text-lg font-bold text-gray-900">{user.fullName}</h2>
          <p className="text-sm text-gray-400 mb-3">{user.email}</p>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <RoleBadge role={user.role} />
            <KycBadge status={user.kycStatus} />
            {user.status === 'BANNED' && (
              <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full border border-red-200">
                Bị khóa
              </span>
            )}
          </div>

          {/* Stats row */}
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                <Leaf size={14} className="text-green-500" />
                {user.greenPoints.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">Green Points</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 flex items-center gap-1 justify-center">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                {user.averageRating.toFixed(1)}
              </p>
              <p className="text-xs text-gray-400">Đánh giá</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{joinDate}</p>
              <p className="text-xs text-gray-400">Ngày tham gia</p>
            </div>
          </div>
        </div>

        {/* Scrollable detail body */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {/* Contact info */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-5 mb-1">
            Thông tin liên hệ
          </p>
          <div className="bg-gray-50 rounded-2xl px-4">
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow
              icon={Phone}
              label="Số điện thoại"
              value={user.phoneNumber}
            />
            <InfoRow
              icon={MapPin}
              label="Địa chỉ mặc định"
              value={user.defaultAddress}
            />
          </div>

          {/* Store info (only for STORE role) */}
          {user.role === 'STORE' && user.storeInfo && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-5 mb-1">
                Thông tin cửa hàng
              </p>
              <div className="bg-gray-50 rounded-2xl px-4">
                <InfoRow
                  icon={Store}
                  label="Địa chỉ kinh doanh"
                  value={user.storeInfo.businessAddress}
                />
                <InfoRow
                  icon={Clock}
                  label="Giờ mở cửa"
                  value={user.storeInfo.openHours}
                />
                <InfoRow
                  icon={Store}
                  label="Mô tả"
                  value={user.storeInfo.description}
                />
              </div>
            </>
          )}

          {/* KYC documents */}
          {user.kycDocuments.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-5 mb-2">
                Hồ sơ KYC ({user.kycDocuments.length} tài liệu)
              </p>
              <div className="flex flex-wrap gap-2">
                {user.kycDocuments.map((doc, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg font-medium"
                  >
                    📄 {doc}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Location coordinates */}
          {user.location && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-5 mb-1">
                Vị trí
              </p>
              <div className="bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-600 font-mono">
                {user.location.coordinates[1].toFixed(5)}°N,{' '}
                {user.location.coordinates[0].toFixed(5)}°E
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

export default function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<'ALL' | IUser['role']>('ALL');

  // Filter + search
  const filtered = MOCK_USERS.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Quản Lý Người Dùng</h1>
        <p className="text-sm text-gray-400 mt-1">
          Quản lý tài khoản, phân quyền và trạng thái người dùng trong hệ thống.
        </p>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Tìm tên hoặc email..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-1">
          {(['ALL', 'USER', 'STORE', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                setRoleFilter(r);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                roleFilter === r
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r === 'ALL'
                ? 'Tất cả'
                : r === 'USER'
                  ? 'Người dùng'
                  : r === 'STORE'
                    ? 'Cửa hàng'
                    : 'Admin'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors">
            <SlidersHorizontal size={15} />
            Bộ lọc
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors">
            <UserPlus size={15} />
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-semibold text-gray-900">
          Tất cả người dùng
        </span>
        <span className="text-sm font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {filtered.length}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3.5 w-10">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3.5">
                  Người dùng
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3.5">
                  Vai trò
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3.5 hidden md:table-cell">
                  Điện thoại
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3.5 hidden lg:table-cell">
                  Địa chỉ
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3.5">
                  Trạng thái
                </th>
                <th className="px-4 py-3.5 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50/60 transition-colors group"
                >
                  {/* Checkbox */}
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                  </td>

                  {/* User name + email */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={
                            user.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=7c3aed&color=fff`
                          }
                          alt={user.fullName}
                          className="w-9 h-9 rounded-xl object-cover"
                        />
                        {user.isOnline && user.status === 'ACTIVE' && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 ring-2 ring-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-4">
                    <RoleBadge role={user.role} />
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-sm text-gray-600">
                      {user.phoneNumber ?? '—'}
                    </span>
                  </td>

                  {/* Address */}
                  <td className="px-4 py-4 hidden lg:table-cell max-w-50">
                    <span className="text-sm text-gray-600 truncate block">
                      {user.defaultAddress ?? '—'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <StatusDot status={user.status} isOnline={user.isOnline} />
                  </td>

                  {/* Action */}
                  <td className="px-4 py-4">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
                      aria-label={`Xem hồ sơ ${user.fullName}`}
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-sm text-gray-400"
                  >
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} /{' '}
              {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      page === currentPage
                        ? 'bg-black text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Profile Modal ── */}
      {selectedUser && (
        <ProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
