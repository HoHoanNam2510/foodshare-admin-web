'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Camera,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  getMyProfile,
  updateMyProfile,
  changePassword,
  uploadAvatar,
  type UpdateProfilePayload,
} from '@/lib/profileApi';
import { useAuthStore } from '@/stores/authStore';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Quản trị viên',
};

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getInitials(fullName?: string): string {
  if (!fullName) return 'A';
  const parts = fullName.trim().split(' ');
  const last = parts[parts.length - 1]?.[0] ?? '';
  const first = parts.length > 1 ? (parts[0]?.[0] ?? '') : '';
  return (first + last).toUpperCase() || 'A';
}

// ── Reusable input row ──────────────────────────────────────────────────────
function InputField({
  label,
  icon: Icon,
  value,
  onChange,
  type = 'text',
  readOnly = false,
  placeholder,
  rightSlot,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  readOnly?: boolean;
  placeholder?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-neutral-T30 dark:text-gray-300 font-body">
        {label}
      </label>
      <div
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-200 ${
          readOnly
            ? 'bg-neutral-T95 dark:bg-gray-700 border-neutral-T90 dark:border-gray-600 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 border-neutral-T90 dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/50'
        }`}
      >
        <Icon
          size={16}
          className="text-neutral-T50 dark:text-gray-500 shrink-0"
        />
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          className="flex-1 bg-transparent text-sm font-body text-neutral-T10 dark:text-gray-100 placeholder:text-neutral-T70 dark:placeholder:text-gray-500 outline-none disabled:text-neutral-T50"
        />
        {rightSlot}
      </div>
    </div>
  );
}

// ── Toast ───────────────────────────────────────────────────────────────────
function Toast({
  type,
  message,
}: {
  type: 'success' | 'error';
  message: string;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-body font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
        type === 'success'
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'bg-error/10 text-error border border-error/20'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle size={16} />
      ) : (
        <AlertCircle size={16} />
      )}
      {message}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Personal info state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Revoke object URL when preview changes or component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);
  const [infoToast, setInfoToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSavingPw, setIsSavingPw] = useState(false);
  const [pwToast, setPwToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Populate form from API on mount
  useEffect(() => {
    getMyProfile()
      .then(({ data }) => {
        setFullName(data.fullName ?? '');
        setPhoneNumber(data.phoneNumber ?? '');
        setDefaultAddress(data.defaultAddress ?? '');
        setAvatarUrl(data.avatar ?? '');
      })
      .catch(() => {
        // Fallback to store data if API fails
        setFullName(user?.fullName ?? '');
        setPhoneNumber(user?.phoneNumber ?? '');
        setDefaultAddress(user?.defaultAddress ?? '');
        setAvatarUrl(user?.avatar ?? '');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayAvatar = avatarPreview || avatarUrl;
  const initials = getInitials(fullName || user?.fullName);

  // ── Avatar pick ─────────────────────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // The useEffect cleanup will revoke the previous preview URL
    setPendingAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Save personal info ───────────────────────────────────────────────────
  const handleSaveInfo = async () => {
    setIsSavingInfo(true);
    setInfoToast(null);
    try {
      let finalAvatar = avatarUrl;
      const hadPendingAvatar = !!pendingAvatarFile;

      if (pendingAvatarFile) {
        const uploadRes = await uploadAvatar(pendingAvatarFile);
        finalAvatar = uploadRes.data.url;
        // Don't commit to state yet — wait for updateMyProfile to succeed
      }

      const payload: UpdateProfilePayload = {
        fullName: fullName.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        defaultAddress: defaultAddress.trim() || undefined,
        avatar: finalAvatar || undefined,
      };

      const res = await updateMyProfile(payload);

      // Both steps succeeded — now commit avatar state
      if (hadPendingAvatar) {
        setAvatarUrl(finalAvatar);
        setAvatarPreview('');
        setPendingAvatarFile(null);
      }
      updateUser({
        fullName: res.data.fullName,
        phoneNumber: res.data.phoneNumber,
        defaultAddress: res.data.defaultAddress,
        avatar: res.data.avatar,
      });
      setInfoToast({
        type: 'success',
        message: 'Cập nhật thông tin thành công',
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Cập nhật thất bại';
      setInfoToast({ type: 'error', message: msg });
    } finally {
      setIsSavingInfo(false);
    }
  };

  // ── Change password ──────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPwToast({ type: 'error', message: 'Mật khẩu xác nhận không khớp' });
      return;
    }
    if (newPassword.length < 6) {
      setPwToast({
        type: 'error',
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      });
      return;
    }

    setIsSavingPw(true);
    setPwToast(null);
    try {
      await changePassword({ currentPassword, newPassword });
      setPwToast({ type: 'success', message: 'Đổi mật khẩu thành công' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Đổi mật khẩu thất bại';
      setPwToast({ type: 'error', message: msg });
    } finally {
      setIsSavingPw(false);
    }
  };

  const eyeButton = (show: boolean, toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
      className="text-neutral-T50 hover:text-neutral-T30 transition-colors shrink-0"
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* ── Layout grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* ── Left: Avatar card ── */}
        <div className="xl:col-span-1 bg-surface-lowest dark:bg-gray-900 dark:border dark:border-gray-800 dark:shadow-none rounded-2xl shadow-soft p-6 flex flex-col items-center gap-4">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-soft">
              {displayAvatar ? (
                <Image
                  src={displayAvatar}
                  alt={fullName || 'Avatar'}
                  width={96}
                  height={96}
                  priority
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-sans text-2xl font-bold text-white bg-linear-to-br from-primary-container to-secondary-container">
                  {initials}
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <Camera size={20} className="text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Name & Role */}
          <div className="text-center">
            <p className="font-sans font-bold text-lg text-neutral-T10 dark:text-gray-100 leading-tight">
              {fullName || user?.fullName || '—'}
            </p>
            <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold font-label">
              {ROLE_LABEL[user?.role ?? ''] ?? user?.role ?? '—'}
            </span>
          </div>

          <div className="w-full h-px bg-neutral-T90 dark:bg-gray-700" />

          {/* Meta info */}
          <div className="w-full flex flex-col gap-3 text-sm font-body">
            <div className="flex items-center gap-2.5 text-neutral-T50 dark:text-gray-500">
              <Mail size={15} className="shrink-0" />
              <span className="truncate text-neutral-T30 dark:text-gray-300">
                {user?.email ?? '—'}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-neutral-T50 dark:text-gray-500">
              <User size={15} className="shrink-0" />
              <span className="text-neutral-T30 dark:text-gray-300">
                Tham gia: {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>

          {pendingAvatarFile && (
            <p className="text-xs text-primary font-body text-center">
              Ảnh mới sẽ được lưu khi bạn nhấn Lưu thay đổi
            </p>
          )}
        </div>

        {/* ── Right: Forms ── */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Personal info card */}
          <div className="bg-surface-lowest dark:bg-gray-900 dark:border dark:border-gray-800 dark:shadow-none rounded-2xl shadow-soft p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
              <h2 className="font-sans font-bold text-base text-neutral-T10 dark:text-gray-100">
                Thông tin cá nhân
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Họ và tên"
                icon={User}
                value={fullName}
                onChange={setFullName}
                placeholder="Nhập họ và tên"
              />
              <InputField
                label="Email"
                icon={Mail}
                value={user?.email ?? ''}
                readOnly
              />
              <InputField
                label="Số điện thoại"
                icon={Phone}
                value={phoneNumber}
                onChange={setPhoneNumber}
                placeholder="Nhập số điện thoại"
              />
              <InputField
                label="Địa chỉ"
                icon={MapPin}
                value={defaultAddress}
                onChange={setDefaultAddress}
                placeholder="Nhập địa chỉ"
              />
            </div>

            {infoToast && (
              <Toast type={infoToast.type} message={infoToast.message} />
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSaveInfo}
                disabled={isSavingInfo}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-primary to-primary-container text-white text-sm font-semibold font-body shadow-soft hover:-translate-y-0.5 hover:shadow-hover transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <Save size={16} />
                {isSavingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>

          {/* Security card */}
          <div className="bg-surface-lowest dark:bg-gray-900 dark:border dark:border-gray-800 dark:shadow-none rounded-2xl shadow-soft p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock size={16} className="text-primary" />
              </div>
              <h2 className="font-sans font-bold text-base text-neutral-T10 dark:text-gray-100">
                Bảo mật
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <InputField
                label="Mật khẩu hiện tại"
                icon={Lock}
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="Nhập mật khẩu hiện tại"
                rightSlot={eyeButton(showCurrent, () =>
                  setShowCurrent((v) => !v)
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Mật khẩu mới"
                  icon={Lock}
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Tối thiểu 6 ký tự"
                  rightSlot={eyeButton(showNew, () => setShowNew((v) => !v))}
                />
                <InputField
                  label="Xác nhận mật khẩu mới"
                  icon={Lock}
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Nhập lại mật khẩu mới"
                  rightSlot={eyeButton(showConfirm, () =>
                    setShowConfirm((v) => !v)
                  )}
                />
              </div>
            </div>

            {pwToast && <Toast type={pwToast.type} message={pwToast.message} />}

            <div className="flex justify-end">
              <button
                onClick={handleChangePassword}
                disabled={
                  isSavingPw ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-primary to-primary-container text-white text-sm font-semibold font-body shadow-soft hover:-translate-y-0.5 hover:shadow-hover transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <Lock size={16} />
                {isSavingPw ? 'Đang lưu...' : 'Đổi mật khẩu'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
