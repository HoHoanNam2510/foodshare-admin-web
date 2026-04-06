'use client';

import {
  X,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Star,
  Leaf,
  Store,
  Ban,
  Unlock,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import type { IUser } from '@/lib/userApi';

interface UserDetailModalProps {
  user: IUser | null;
  onClose: () => void;
  onBanToggle: (user: IUser) => Promise<void>;
  formatDate: (date: string | Date) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  getRoleBadge: (role: string) => React.ReactNode;
}

export default function UserDetailModal({
  user,
  onClose,
  onBanToggle,
  formatDate,
  getStatusBadge,
  getRoleBadge,
}: UserDetailModalProps) {
  const [toggling, setToggling] = useState(false);

  if (!user) return null;

  const initial = user.fullName ? user.fullName.charAt(0).toUpperCase() : '?';

  const handleBanToggle = async () => {
    setToggling(true);
    try {
      await onBanToggle(user);
      onClose();
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-surface-lowest w-full max-w-2xl rounded-md shadow-floating overflow-hidden animate-in slide-in-from-bottom-4 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface/50">
          <div>
            <h2 className="text-lg font-sans font-bold text-gray-900">
              Hồ sơ người dùng #{user._id}
            </h2>
            <p className="text-xs font-body text-gray-500 mt-0.5">
              Tham gia: {formatDate(user.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto font-body">
          {/* Top Info: Avatar & Tên */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary-container to-secondary-container flex items-center justify-center text-white font-sans text-2xl font-bold shadow-sm shrink-0">
                {initial}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {user.fullName}
                  {user.kycStatus === 'VERIFIED' && (
                    <ShieldCheck size={18} className="text-primary" />
                  )}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>
              </div>
            </div>

            {/* Green Points Big Display */}
            <div className="flex flex-col items-end bg-primary/5 px-4 py-2 rounded-2xl border border-primary/20">
              <span className="text-xs font-label text-primary uppercase font-bold tracking-wider">
                Điểm xanh
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Leaf size={18} className="text-primary" />
                <span className="text-xl font-bold text-primary">
                  {user.greenPoints}
                </span>
              </div>
            </div>
          </div>

          {/* Grid Thông tin liên hệ */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-surface rounded-md border border-outline-variant/30">
            <div>
              <p className="text-xs font-label text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <Mail size={12} /> Email
              </p>
              <p className="font-semibold text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-xs font-label text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <Phone size={12} /> Số điện thoại
              </p>
              <p className="font-semibold text-gray-900">
                {user.phoneNumber || 'Chưa cập nhật'}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-label text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={12} /> Địa chỉ mặc định
              </p>
              <p className="font-semibold text-gray-900">
                {user.defaultAddress || 'Chưa cập nhật'}
              </p>
            </div>
          </div>

          {/* Thông tin cửa hàng (Nếu có) */}
          {user.role === 'STORE' && user.storeInfo && (
            <div className="mb-6 p-4 bg-secondary/5 rounded-md border border-secondary/20">
              <h4 className="text-sm font-bold text-secondary flex items-center gap-2 mb-3">
                <Store size={16} /> Thông tin Doanh nghiệp/Cửa hàng
              </h4>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <p>
                  <span className="text-gray-500 w-24 inline-block">
                    Giờ mở cửa:
                  </span>{' '}
                  <span className="font-semibold text-gray-900">
                    {user.storeInfo.openHours}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500 w-24 inline-block">
                    Đ/C Kinh doanh:
                  </span>{' '}
                  <span className="font-semibold text-gray-900">
                    {user.storeInfo.businessAddress}
                  </span>
                </p>
                <p className="text-gray-700 italic">
                  &quot;{user.storeInfo.description}&quot;
                </p>
              </div>
            </div>
          )}

          {/* Chỉ số hệ thống */}
          <div>
            <p className="text-xs font-label text-gray-500 mb-2 uppercase tracking-wider">
              Chỉ số hệ thống
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-gray-900">
                  {user.averageRating} / 5.0
                </span>
                <span className="text-gray-500">Đánh giá</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  className={
                    user.kycStatus === 'VERIFIED'
                      ? 'text-primary'
                      : 'text-gray-400'
                  }
                />
                <span className="font-semibold text-gray-900">
                  {user.kycStatus}
                </span>
                <span className="text-gray-500">Trạng thái KYC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (Actions) */}
        <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-lowest flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={toggling}
            className="px-4 py-2 rounded-md font-body text-sm font-semibold text-gray-600 hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Đóng
          </button>

          {user.status === 'ACTIVE' ? (
            <button
              onClick={handleBanToggle}
              disabled={toggling}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-semibold bg-error/10 text-error hover:bg-error hover:text-white transition-colors disabled:opacity-50"
            >
              {toggling ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Ban size={16} />
              )}
              Khóa tài khoản
            </button>
          ) : (
            <button
              onClick={handleBanToggle}
              disabled={toggling}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
            >
              {toggling ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Unlock size={16} />
              )}
              Mở khóa tài khoản
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
