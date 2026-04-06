'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Store,
  ShieldCheck,
  Eye,
  EyeOff,
  Mail,
  Loader2,
  CheckCircle2,
  Send,
  KeyRound,
} from 'lucide-react';
import { sendRegistrationCode, verifyRegistrationCode } from '@/lib/authApi';
import { adminCreateUser } from '@/lib/userApi';

type TabRole = 'USER' | 'STORE' | 'ADMIN';

interface BaseForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  defaultAddress: string;
}

interface StoreForm extends BaseForm {
  businessName: string;
  openHours: string;
  closeHours: string;
  description: string;
  businessAddress: string;
  autoApprove: boolean;
}

const TABS: {
  id: TabRole;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { id: 'USER', label: 'Người dùng', icon: User, color: 'text-gray-600' },
  { id: 'STORE', label: 'Cửa hàng', icon: Store, color: 'text-secondary' },
  {
    id: 'ADMIN',
    label: 'Quản trị viên',
    icon: ShieldCheck,
    color: 'text-purple-600',
  },
];

const INPUT_CLASS =
  'w-full bg-surface border border-outline-variant rounded-md px-4 py-2.5 text-sm text-neutral-T10 font-body placeholder:text-neutral-T60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed';

const LABEL_CLASS =
  'block text-sm font-semibold font-label text-neutral-T20 mb-1';

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label} <span className="text-error">*</span>
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••'}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`${INPUT_CLASS} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-T50 hover:text-primary transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function CreateUserPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabRole>('USER');
  const [step, setStep] = useState<1 | 2>(1);

  // Base form (shared across tabs)
  const [base, setBase] = useState<BaseForm>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    defaultAddress: '',
  });

  // Store-specific form
  const [store, setStore] = useState<Omit<StoreForm, keyof BaseForm>>({
    businessName: '',
    openHours: '',
    closeHours: '',
    description: '',
    businessAddress: '',
    autoApprove: true,
  });

  const [otpCode, setOtpCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    email: string;
    role: TabRole;
  } | null>(null);

  const setBaseField = (field: keyof BaseForm, value: string) => {
    setBase((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const setStoreField = (
    field: keyof Omit<StoreForm, keyof BaseForm>,
    value: string | boolean
  ) => {
    setStore((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const canAutoApprove =
    store.businessName.trim() !== '' && store.businessAddress.trim() !== '';

  // Client-side validation before sending OTP
  const validateForm = (): string | null => {
    if (!base.fullName.trim()) return 'Họ tên là bắt buộc.';
    if (!base.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(base.email))
      return 'Email không hợp lệ.';
    if (base.password.length < 6) return 'Mật khẩu tối thiểu 6 ký tự.';
    if (base.password !== base.confirmPassword)
      return 'Mật khẩu xác nhận không khớp.';
    return null;
  };

  const handleSendOtp = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSending(true);
    setError(null);
    try {
      await sendRegistrationCode({
        email: base.email.trim(),
        password: base.password,
        fullName: base.fullName.trim(),
        phoneNumber: base.phoneNumber.trim() || undefined,
      });
      setStep(2);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Không thể gửi mã xác nhận. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleCreate = async () => {
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập mã xác nhận gồm 6 chữ số.');
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      // Step 1: Verify OTP
      await verifyRegistrationCode({ email: base.email.trim(), code: otpCode });

      // Step 2: Determine payload
      const isStoreAutoApproved =
        activeTab === 'STORE' && store.autoApprove && canAutoApprove;

      const payload = {
        email: base.email.trim(),
        password: base.password,
        fullName: base.fullName.trim(),
        role: (isStoreAutoApproved ? 'STORE' : activeTab) as
          | 'USER'
          | 'STORE'
          | 'ADMIN',
        isEmailVerified: true,
        isProfileCompleted: true,
        kycStatus: (activeTab === 'ADMIN' || isStoreAutoApproved
          ? 'VERIFIED'
          : 'PENDING') as 'VERIFIED' | 'PENDING',
        ...(base.phoneNumber.trim()
          ? { phoneNumber: base.phoneNumber.trim() }
          : {}),
        ...(base.defaultAddress.trim()
          ? { defaultAddress: base.defaultAddress.trim() }
          : {}),
        ...(activeTab === 'STORE'
          ? {
              storeInfo: {
                ...(store.businessName.trim()
                  ? { businessName: store.businessName.trim() }
                  : {}),
                ...(store.openHours.trim()
                  ? { openHours: store.openHours.trim() }
                  : {}),
                ...(store.closeHours.trim()
                  ? { closeHours: store.closeHours.trim() }
                  : {}),
                ...(store.description.trim()
                  ? { description: store.description.trim() }
                  : {}),
                ...(store.businessAddress.trim()
                  ? { businessAddress: store.businessAddress.trim() }
                  : {}),
              },
            }
          : {}),
      };

      await adminCreateUser(payload);
      setSuccessInfo({ email: base.email.trim(), role: activeTab });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Tạo tài khoản thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleReset = () => {
    setBase({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      defaultAddress: '',
    });
    setStore({
      businessName: '',
      openHours: '',
      closeHours: '',
      description: '',
      businessAddress: '',
      autoApprove: true,
    });
    setOtpCode('');
    setStep(1);
    setError(null);
    setSuccessInfo(null);
  };

  // — Success state —
  if (successInfo) {
    const roleLabel = {
      USER: 'Người dùng',
      STORE: 'Cửa hàng',
      ADMIN: 'Quản trị viên',
    }[successInfo.role];
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 py-16">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 size={36} className="text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-sans font-bold text-gray-900">
            Tạo tài khoản thành công!
          </h2>
          <p className="text-sm font-body text-gray-500 mt-2">
            Tài khoản{' '}
            <span className="font-semibold text-gray-800">
              {successInfo.email}
            </span>{' '}
            ({roleLabel}) đã được tạo.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/users')}
            className="px-5 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Xem danh sách tài khoản
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 rounded-md border border-outline-variant text-sm font-semibold text-gray-700 hover:bg-surface-container transition-colors"
          >
            Tạo tài khoản mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/users')}
          className="p-2 rounded-md text-gray-500 hover:bg-surface-container transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-sans font-bold text-gray-900 leading-tight">
            Tạo tài khoản mới
          </h1>
          <p className="text-sm font-body text-gray-500 mt-0.5">
            Tạo tài khoản người dùng, cửa hàng hoặc quản trị viên
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm font-body">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${step === 1 ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}
        >
          <span>1</span>
          <span>Điền thông tin</span>
        </div>
        <div className="h-px flex-1 bg-outline-variant/50" />
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${step === 2 ? 'bg-primary text-white' : 'bg-surface-container text-gray-400'}`}
        >
          <span>2</span>
          <span>Xác nhận email</span>
        </div>
      </div>

      {/* Role tab bar */}
      <div className="bg-surface-lowest rounded-md shadow-soft border border-outline-variant/30 p-1 flex gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setStep(1);
                setError(null);
                setOtpCode('');
              }}
              disabled={step === 2}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:bg-primary/5 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form card */}
      <div className="bg-surface-lowest rounded-md shadow-soft border border-outline-variant/30 p-6 flex flex-col gap-5">
        {/* Role description */}
        {activeTab === 'USER' && (
          <div className="rounded-md bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600 font-body">
            Tài khoản <strong>Người dùng</strong> — dùng để chia sẻ thực phẩm
            P2P. Email sẽ được xác nhận bằng mã OTP.
          </div>
        )}
        {activeTab === 'STORE' && (
          <div className="rounded-md bg-secondary/5 border border-secondary/20 px-4 py-3 text-sm text-secondary font-body">
            Tài khoản <strong>Cửa hàng</strong> — dùng để bán Mystery Bag. Nếu
            điền đầy đủ thông tin cửa hàng, KYC sẽ được tự động phê duyệt.
          </div>
        )}
        {activeTab === 'ADMIN' && (
          <div className="rounded-md bg-purple-50 border border-purple-200 px-4 py-3 text-sm text-purple-700 font-body">
            Tài khoản <strong>Quản trị viên</strong> — quyền truy cập toàn hệ
            thống. Chỉ tạo khi thực sự cần thiết.
          </div>
        )}

        {/* ── Thông tin cơ bản ── */}
        <div>
          <h3 className="text-xs font-label font-bold uppercase tracking-wider text-gray-400 mb-4">
            Thông tin cơ bản
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Họ tên */}
            <div className="sm:col-span-2">
              <label htmlFor="fullName" className={LABEL_CLASS}>
                Họ và tên <span className="text-error">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={base.fullName}
                onChange={(e) => setBaseField('fullName', e.target.value)}
                placeholder={
                  activeTab === 'STORE'
                    ? 'Họ tên chủ cửa hàng'
                    : 'Họ và tên đầy đủ'
                }
                disabled={step === 2}
                className={INPUT_CLASS}
              />
            </div>

            {/* Email */}
            <div className="sm:col-span-2">
              <label htmlFor="email" className={LABEL_CLASS}>
                <Mail size={13} className="inline mr-1 text-gray-400" />
                Email <span className="text-error">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={base.email}
                onChange={(e) => setBaseField('email', e.target.value)}
                placeholder="example@email.com"
                disabled={step === 2}
                autoComplete="email"
                className={INPUT_CLASS}
              />
            </div>

            {/* Password */}
            <PasswordInput
              id="password"
              label="Mật khẩu"
              value={base.password}
              onChange={(v) => setBaseField('password', v)}
              placeholder="Tối thiểu 6 ký tự"
              disabled={step === 2}
              autoComplete="new-password"
            />

            {/* Confirm password */}
            <PasswordInput
              id="confirmPassword"
              label="Xác nhận mật khẩu"
              value={base.confirmPassword}
              onChange={(v) => setBaseField('confirmPassword', v)}
              disabled={step === 2}
              autoComplete="new-password"
            />

            {/* Phone — optional, hidden for ADMIN */}
            {activeTab !== 'ADMIN' && (
              <div>
                <label htmlFor="phoneNumber" className={LABEL_CLASS}>
                  Số điện thoại{' '}
                  <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={base.phoneNumber}
                  onChange={(e) => setBaseField('phoneNumber', e.target.value)}
                  placeholder="0912 345 678"
                  disabled={step === 2}
                  className={INPUT_CLASS}
                />
              </div>
            )}

            {/* Default address — USER only, optional */}
            {(activeTab === 'USER' || activeTab === 'STORE') && (
              <div>
                <label htmlFor="defaultAddress" className={LABEL_CLASS}>
                  Địa chỉ mặc định{' '}
                  <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
                </label>
                <input
                  id="defaultAddress"
                  type="text"
                  value={base.defaultAddress}
                  onChange={(e) =>
                    setBaseField('defaultAddress', e.target.value)
                  }
                  placeholder="Số nhà, đường, quận, tỉnh/thành phố"
                  disabled={step === 2}
                  className={INPUT_CLASS}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Thông tin cửa hàng (STORE tab only) ── */}
        {activeTab === 'STORE' && (
          <div className="border-t border-outline-variant/30 pt-5">
            <h3 className="text-xs font-label font-bold uppercase tracking-wider text-gray-400 mb-4">
              Thông tin cửa hàng
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="businessName" className={LABEL_CLASS}>
                  Tên cửa hàng
                </label>
                <input
                  id="businessName"
                  type="text"
                  value={store.businessName}
                  onChange={(e) =>
                    setStoreField('businessName', e.target.value)
                  }
                  placeholder="VD: Bánh mì Huỳnh Hoa"
                  disabled={step === 2}
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="openHours" className={LABEL_CLASS}>
                  Giờ mở cửa
                </label>
                <input
                  id="openHours"
                  type="text"
                  value={store.openHours}
                  onChange={(e) => setStoreField('openHours', e.target.value)}
                  placeholder="VD: 07:00"
                  disabled={step === 2}
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="closeHours" className={LABEL_CLASS}>
                  Giờ đóng cửa
                </label>
                <input
                  id="closeHours"
                  type="text"
                  value={store.closeHours}
                  onChange={(e) => setStoreField('closeHours', e.target.value)}
                  placeholder="VD: 21:00"
                  disabled={step === 2}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="businessAddress" className={LABEL_CLASS}>
                  Địa chỉ cửa hàng
                </label>
                <input
                  id="businessAddress"
                  type="text"
                  value={store.businessAddress}
                  onChange={(e) =>
                    setStoreField('businessAddress', e.target.value)
                  }
                  placeholder="Số nhà, đường, quận, tỉnh/thành phố"
                  disabled={step === 2}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className={LABEL_CLASS}>
                  Mô tả cửa hàng{' '}
                  <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
                </label>
                <textarea
                  id="description"
                  value={store.description}
                  onChange={(e) => setStoreField('description', e.target.value)}
                  placeholder="Giới thiệu ngắn về cửa hàng..."
                  rows={3}
                  disabled={step === 2}
                  className={`${INPUT_CLASS} resize-none`}
                />
              </div>

              {/* Auto-approve toggle */}
              <div className="sm:col-span-2">
                <label
                  className={`flex items-start gap-3 cursor-pointer rounded-md p-3 border transition-colors ${
                    store.autoApprove && canAutoApprove
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-outline-variant/40 bg-surface/50'
                  } ${step === 2 ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={store.autoApprove}
                      onChange={(e) =>
                        setStoreField('autoApprove', e.target.checked)
                      }
                      disabled={step === 2}
                      className="sr-only peer"
                    />
                    <div
                      onClick={() =>
                        step !== 2 &&
                        setStoreField('autoApprove', !store.autoApprove)
                      }
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        store.autoApprove
                          ? 'bg-primary border-primary'
                          : 'bg-surface-lowest border-outline-variant'
                      }`}
                    >
                      {store.autoApprove && (
                        <svg
                          width="11"
                          height="9"
                          viewBox="0 0 11 9"
                          fill="none"
                        >
                          <path
                            d="M1 4L4 7.5L10 1"
                            stroke="white"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Tự động phê duyệt KYC
                    </p>
                    <p className="text-xs text-gray-500 font-body mt-0.5">
                      {canAutoApprove
                        ? 'Tài khoản sẽ được tạo với vai trò STORE và KYC đã duyệt ngay lập tức.'
                        : 'Cần điền Tên cửa hàng và Địa chỉ cửa hàng để bật tính năng này.'}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ── Error message ── */}
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-body">
            {error}
          </div>
        )}

        {/* ── Step 1 action: Send OTP ── */}
        {step === 1 && (
          <button
            onClick={handleSendOtp}
            disabled={isSending}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-md bg-primary text-white font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60 disabled:pointer-events-none"
          >
            {isSending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang gửi mã...
              </>
            ) : (
              <>
                <Send size={16} />
                Gửi mã xác nhận đến email
              </>
            )}
          </button>
        )}

        {/* ── Step 2: OTP input + create button ── */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 font-body">
              Mã xác nhận (6 chữ số) đã được gửi đến{' '}
              <strong>{base.email}</strong>. Mã có hiệu lực trong{' '}
              <strong>10 phút</strong>.
            </div>

            <div>
              <label htmlFor="otpCode" className={LABEL_CLASS}>
                <KeyRound size={13} className="inline mr-1 text-gray-400" />
                Mã xác nhận <span className="text-error">*</span>
              </label>
              <input
                id="otpCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setError(null);
                }}
                placeholder="000000"
                className={`${INPUT_CLASS} text-center text-xl tracking-[0.5em] font-mono`}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep(1);
                  setOtpCode('');
                  setError(null);
                }}
                disabled={isCreating}
                className="px-5 py-2.5 rounded-md border border-outline-variant text-sm font-semibold text-gray-700 hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                Quay lại
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating || otpCode.length !== 6}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-primary text-white font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60 disabled:pointer-events-none"
              >
                {isCreating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang tạo tài khoản...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Tạo tài khoản
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary card (STORE auto-approve info) */}
      {activeTab === 'STORE' && step === 1 && (
        <div className="bg-surface-lowest rounded-md border border-outline-variant/30 px-5 py-4 text-sm font-body text-gray-600">
          <p className="font-semibold text-gray-800 mb-1">Sau khi tạo:</p>
          {store.autoApprove && canAutoApprove ? (
            <ul className="list-disc list-inside space-y-0.5 text-gray-600">
              <li>
                Vai trò: <strong className="text-secondary">STORE</strong>
              </li>
              <li>
                KYC: <strong className="text-primary">Đã duyệt</strong> (tự
                động)
              </li>
              <li>Tài khoản hoạt động ngay lập tức</li>
            </ul>
          ) : (
            <ul className="list-disc list-inside space-y-0.5 text-gray-600">
              <li>
                Vai trò ban đầu: <strong>USER</strong>
              </li>
              <li>
                KYC: <strong className="text-amber-600">Chờ duyệt</strong>
              </li>
              <li>Cần duyệt KYC trước khi hoạt động như STORE</li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
