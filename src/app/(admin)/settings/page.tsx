'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Save,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import {
  fetchSystemConfig,
  updateSystemConfig,
  type ISystemConfig,
} from '@/lib/configApi';

export default function SettingsPage() {
  const [config, setConfig] = useState<ISystemConfig>({
    systemBankName: '',
    systemBankCode: '',
    systemBankAccountNumber: '',
    systemBankAccountName: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchSystemConfig();
        if (res.data) setConfig(res.data);
      } catch (e) {
        setError('Không thể tải cấu hình. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      const res = await updateSystemConfig({
        systemBankName: config.systemBankName,
        systemBankCode: config.systemBankCode,
        systemBankAccountNumber: config.systemBankAccountNumber,
        systemBankAccountName: config.systemBankAccountName,
      });
      setConfig(res.data);
      setSavedAt(new Date());
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Lưu cấu hình thất bại';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <p className="text-sm text-gray-500">
            Cấu hình tài khoản ngân hàng nhận tiền escrow
          </p>
        </div>
      </div>

      {/* System Bank Account Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <Building2 className="w-5 h-5 text-primary" />
          <div>
            <h2 className="font-semibold text-gray-900">
              Tài khoản ngân hàng hệ thống
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Tài khoản này sẽ hiển thị trong mã QR khi người dùng thanh toán
              đơn hàng B2C
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Bank Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tên ngân hàng
            </label>
            <input
              type="text"
              value={config.systemBankName}
              onChange={(e) =>
                setConfig({ ...config, systemBankName: e.target.value })
              }
              placeholder="VD: MB Bank, Vietcombank..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-body text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition"
            />
          </div>

          {/* Bank Code */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Mã BIN ngân hàng (theo chuẩn VietQR)
            </label>
            <input
              type="text"
              value={config.systemBankCode}
              onChange={(e) =>
                setConfig({ ...config, systemBankCode: e.target.value })
              }
              placeholder="VD: 970422 (MB), 970436 (Vietcombank), 970407 (Techcombank)"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-body text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition"
            />
            <p className="text-xs text-gray-400">
              Phải là mã BIN số (6 chữ số) — Tra cứu đầy đủ tại{' '}
              <span className="text-primary font-medium">api.vietqr.io/v2/banks</span>
            </p>
          </div>

          {/* Account Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Số tài khoản
            </label>
            <input
              type="text"
              value={config.systemBankAccountNumber}
              onChange={(e) =>
                setConfig({
                  ...config,
                  systemBankAccountNumber: e.target.value,
                })
              }
              placeholder="VD: 1234567890"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-body text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition"
            />
          </div>

          {/* Account Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tên chủ tài khoản
            </label>
            <input
              type="text"
              value={config.systemBankAccountName}
              onChange={(e) =>
                setConfig({ ...config, systemBankAccountName: e.target.value })
              }
              placeholder="VD: FOODSHARE PLATFORM"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-body text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition"
            />
          </div>

          {/* Preview Card */}
          {config.systemBankAccountNumber && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-1.5">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                Xem trước thông tin hiển thị
              </p>
              <PreviewRow
                label="Ngân hàng"
                value={config.systemBankName || '—'}
              />
              <PreviewRow
                label="Số TK"
                value={config.systemBankAccountNumber || '—'}
              />
              <PreviewRow
                label="Chủ TK"
                value={config.systemBankAccountName || '—'}
              />
              <PreviewRow label="Mã NH" value={config.systemBankCode || '—'} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Success */}
          {savedAt && !error && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Đã lưu lúc {savedAt.toLocaleTimeString('vi-VN')}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 active:scale-95 transition disabled:opacity-60"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Lưu cấu hình
          </button>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-2">
        <h3 className="font-semibold text-blue-800 text-sm">
          Hướng dẫn sử dụng
        </h3>
        <ul className="text-xs text-blue-700 space-y-1.5 list-disc list-inside">
          <li>
            Khi người dùng đặt mua túi mù (B2C), hệ thống sẽ sinh mã QR VietQR
            từ tài khoản này.
          </li>
          <li>
            Người dùng quét QR và chuyển khoản vào tài khoản hệ thống ở đây.
          </li>
          <li>
            Admin vào trang Giao Dịch → tìm đơn PENDING → nhấn "Xác nhận đã nhận
            tiền".
          </li>
          <li>
            Sau khi giao nhận hoàn tất, admin giải ngân cho Store thủ công từ
            tài khoản này.
          </li>
        </ul>
      </div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}
