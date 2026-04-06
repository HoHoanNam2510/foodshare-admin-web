'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Save, Store } from 'lucide-react';
import { updateUser, type IUser, type UpdateUserPayload } from '@/lib/userApi';

interface UserEditModalProps {
  user: IUser | null;
  onClose: () => void;
  onUpdated: (updated: IUser) => void;
}

const INPUT_CLASS =
  'w-full bg-surface border border-outline-variant rounded-md px-3 py-2 text-sm text-neutral-T10 font-body placeholder:text-neutral-T60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 disabled:opacity-60';

const SELECT_CLASS =
  'w-full bg-surface border border-outline-variant rounded-md px-3 py-2 text-sm text-neutral-T10 font-body focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 cursor-pointer';

const LABEL_CLASS =
  'block text-xs font-semibold font-label text-gray-500 mb-1 uppercase tracking-wider';

export default function UserEditModal({
  user,
  onClose,
  onUpdated,
}: UserEditModalProps) {
  const [form, setForm] = useState<
    UpdateUserPayload & { role: 'USER' | 'STORE' | 'ADMIN' }
  >({
    fullName: '',
    email: '',
    phoneNumber: '',
    defaultAddress: '',
    role: 'USER',
    kycStatus: 'PENDING',
    status: 'ACTIVE',
    storeInfo: {
      businessName: '',
      openHours: '',
      closeHours: '',
      description: '',
      businessAddress: '',
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill when user changes
  useEffect(() => {
    if (!user) return;
    setForm({
      fullName: user.fullName ?? '',
      email: user.email ?? '',
      phoneNumber: user.phoneNumber ?? '',
      defaultAddress: user.defaultAddress ?? '',
      role: user.role,
      kycStatus: user.kycStatus,
      // PENDING_KYC is system-managed; default dropdown to ACTIVE when in that state
      status: user.status === 'PENDING_KYC' ? 'ACTIVE' : user.status,
      storeInfo: {
        businessName: user.storeInfo?.businessName ?? '',
        openHours: user.storeInfo?.openHours ?? '',
        closeHours: user.storeInfo?.closeHours ?? '',
        description: user.storeInfo?.description ?? '',
        businessAddress: user.storeInfo?.businessAddress ?? '',
      },
    });
    setError(null);
  }, [user]);

  if (!user) return null;

  const set = (field: keyof UpdateUserPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const setStore = (
    field: keyof NonNullable<UpdateUserPayload['storeInfo']>,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      storeInfo: { ...prev.storeInfo, [field]: value },
    }));
  };

  const handleSave = async () => {
    if (!form.fullName?.trim()) {
      setError('Họ tên là bắt buộc.');
      return;
    }
    if (!form.email?.trim()) {
      setError('Email là bắt buộc.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      // Build clean payload — kycStatus is read-only (managed via KYC workflow)
      const payload: UpdateUserPayload = {
        fullName: form.fullName!.trim(),
        email: form.email!.trim(),
        role: form.role,
        status: form.status,
        ...(form.phoneNumber?.trim()
          ? { phoneNumber: form.phoneNumber.trim() }
          : { phoneNumber: '' }),
        ...(form.defaultAddress?.trim()
          ? { defaultAddress: form.defaultAddress.trim() }
          : { defaultAddress: '' }),
      };

      if (form.role === 'STORE') {
        payload.storeInfo = {
          businessName: form.storeInfo?.businessName?.trim() || '',
          openHours: form.storeInfo?.openHours?.trim() || '',
          closeHours: form.storeInfo?.closeHours?.trim() || '',
          description: form.storeInfo?.description?.trim() || '',
          businessAddress: form.storeInfo?.businessAddress?.trim() || '',
        };
      }

      const res = await updateUser(user._id, payload);
      onUpdated(res.data);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Cập nhật thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface-lowest w-full max-w-2xl rounded-md shadow-floating overflow-hidden animate-in slide-in-from-bottom-4 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface/50">
          <div>
            <h2 className="text-lg font-sans font-bold text-gray-900">
              Chỉnh sửa tài khoản
            </h2>
            <p className="text-xs font-body text-gray-500 mt-0.5">
              {user.email}
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
        <div className="p-6 max-h-[70vh] overflow-y-auto font-body flex flex-col gap-5">
          {/* ── Thông tin cơ bản ── */}
          <section>
            <p className={LABEL_CLASS}>Thông tin cơ bản</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Họ và tên <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={form.fullName ?? ''}
                  onChange={(e) => set('fullName', e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Họ và tên đầy đủ"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  value={form.email ?? ''}
                  onChange={(e) => set('email', e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={form.phoneNumber ?? ''}
                  onChange={(e) => set('phoneNumber', e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="0912 345 678"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Địa chỉ mặc định
                </label>
                <input
                  type="text"
                  value={form.defaultAddress ?? ''}
                  onChange={(e) => set('defaultAddress', e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Số nhà, đường, quận..."
                />
              </div>
            </div>
          </section>

          {/* ── Cài đặt tài khoản ── */}
          <section className="border-t border-outline-variant/30 pt-5">
            <p className={LABEL_CLASS}>Cài đặt tài khoản</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Vai trò
                </label>
                <select
                  value={form.role}
                  onChange={(e) => set('role', e.target.value)}
                  className={SELECT_CLASS}
                >
                  <option value="USER">USER — Người dùng</option>
                  <option value="STORE">STORE — Cửa hàng</option>
                  <option value="ADMIN">ADMIN — Quản trị viên</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Trạng thái tài khoản
                  {user.status === 'PENDING_KYC' && (
                    <span className="ml-1.5 text-[10px] font-normal text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                      Hiện: Chờ KYC
                    </span>
                  )}
                </label>
                <select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                  className={SELECT_CLASS}
                >
                  <option value="ACTIVE">ACTIVE — Hoạt động</option>
                  <option value="BANNED">BANNED — Đã khóa</option>
                </select>
              </div>

              {/* KYC Status — read-only; only visible for STORE or PENDING_KYC */}
              {(form.role === 'STORE' || user.status === 'PENDING_KYC') && (
                <div>
                  <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1">
                    Trạng thái KYC{' '}
                    <span className="text-[10px] font-normal text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                      (Chỉ đọc)
                    </span>
                  </label>
                  <select
                    value={form.kycStatus}
                    disabled
                    className={`${SELECT_CLASS} opacity-60 cursor-not-allowed`}
                  >
                    <option value="PENDING">PENDING — Chờ duyệt</option>
                    <option value="VERIFIED">VERIFIED — Đã duyệt</option>
                    <option value="REJECTED">REJECTED — Từ chối</option>
                  </select>
                </div>
              )}
            </div>
          </section>

          {/* ── Thông tin cửa hàng (STORE only) ── */}
          {form.role === 'STORE' && (
            <section className="border-t border-outline-variant/30 pt-5">
              <p className={`${LABEL_CLASS} flex items-center gap-1.5`}>
                <Store size={12} /> Thông tin cửa hàng
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Tên cửa hàng
                  </label>
                  <input
                    type="text"
                    value={form.storeInfo?.businessName ?? ''}
                    onChange={(e) => setStore('businessName', e.target.value)}
                    className={INPUT_CLASS}
                    placeholder="VD: Bánh mì Huỳnh Hoa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Giờ mở cửa
                  </label>
                  <input
                    type="text"
                    value={form.storeInfo?.openHours ?? ''}
                    onChange={(e) => setStore('openHours', e.target.value)}
                    className={INPUT_CLASS}
                    placeholder="07:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Giờ đóng cửa
                  </label>
                  <input
                    type="text"
                    value={form.storeInfo?.closeHours ?? ''}
                    onChange={(e) => setStore('closeHours', e.target.value)}
                    className={INPUT_CLASS}
                    placeholder="21:00"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Địa chỉ cửa hàng
                  </label>
                  <input
                    type="text"
                    value={form.storeInfo?.businessAddress ?? ''}
                    onChange={(e) =>
                      setStore('businessAddress', e.target.value)
                    }
                    className={INPUT_CLASS}
                    placeholder="Số nhà, đường, quận, tỉnh/thành phố"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={form.storeInfo?.description ?? ''}
                    onChange={(e) => setStore('description', e.target.value)}
                    rows={2}
                    className={`${INPUT_CLASS} resize-none`}
                    placeholder="Giới thiệu ngắn về cửa hàng..."
                  />
                </div>
              </div>
            </section>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-lowest flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-md font-body text-sm font-semibold text-gray-600 hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-md font-body text-sm font-semibold bg-primary text-white hover:opacity-90 transition-opacity disabled:opacity-60 disabled:pointer-events-none"
          >
            {isSaving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save size={15} />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
