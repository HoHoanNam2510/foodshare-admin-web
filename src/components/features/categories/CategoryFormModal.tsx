'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';

import {
  createCategory,
  updateCategory,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
  type ICategory,
} from '@/lib/categoryApi';

interface CategoryFormModalProps {
  category: ICategory | null; // null = create mode
  onClose: () => void;
  onSaved: () => void;
}

const INPUT_CLASS =
  'w-full bg-surface dark:bg-gray-800 border border-outline-variant dark:border-gray-600 rounded-md px-3 py-2 text-sm text-neutral-T10 dark:text-gray-100 font-body placeholder:text-neutral-T60 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 disabled:opacity-60';

const SELECT_CLASS =
  'w-full bg-surface dark:bg-gray-800 border border-outline-variant dark:border-gray-600 rounded-md px-3 py-2 text-sm text-neutral-T10 dark:text-gray-100 font-body focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 cursor-pointer';

const LABEL_CLASS =
  'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1';

interface FormState {
  slug: string;
  name: string;
  icon: string;
  color: string;
  applyTo: 'P2P_FREE' | 'B2C_MYSTERY_BAG' | 'BOTH';
  sortOrder: number;
  isActive: boolean;
}

const DEFAULT_FORM: FormState = {
  slug: '',
  name: '',
  icon: '',
  color: '#296C24',
  applyTo: 'BOTH',
  sortOrder: 0,
  isActive: true,
};

export default function CategoryFormModal({
  category,
  onClose,
  onSaved,
}: CategoryFormModalProps) {
  const isEdit = category !== null;
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setForm({
        slug: category.slug,
        name: category.name,
        icon: category.icon,
        color: category.color,
        applyTo: category.applyTo,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setError(null);
  }, [category]);

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setError('Tên danh mục là bắt buộc.');
    if (!form.color.match(/^#[0-9A-Fa-f]{6}$/))
      return setError('Màu phải là mã hex hợp lệ (VD: #2E7D32).');
    if (!isEdit && !form.slug.trim()) return setError('Slug là bắt buộc.');
    if (!isEdit && !form.slug.match(/^[a-z0-9-]+$/))
      return setError('Slug chỉ được chứa chữ thường, số và dấu gạch ngang.');

    setIsSaving(true);
    setError(null);
    try {
      if (isEdit) {
        const updatePayload: UpdateCategoryPayload = {
          name: form.name.trim(),
          color: form.color,
          applyTo: form.applyTo,
          sortOrder: form.sortOrder,
          isActive: form.isActive,
        };
        if (form.icon.trim()) updatePayload.icon = form.icon.trim();
        await updateCategory(category._id, updatePayload);
      } else {
        const payload: CreateCategoryPayload = {
          slug: form.slug.trim(),
          name: form.name.trim(),
          color: form.color,
          applyTo: form.applyTo,
          sortOrder: form.sortOrder,
        };
        await createCategory(payload);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Lưu thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-surface-lowest dark:bg-gray-900 w-full max-w-lg rounded-md shadow-floating overflow-hidden animate-in slide-in-from-bottom-4 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 dark:border-gray-700 bg-surface/50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-lg font-sans font-bold text-gray-900 dark:text-gray-100">
              {isEdit ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
            </h2>
            {isEdit && (
              <p className="text-xs font-body text-gray-500 dark:text-gray-400 mt-0.5">
                {category.isSystem && (
                  <span className="mr-1.5 inline-flex items-center text-[10px] font-label font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    Hệ thống
                  </span>
                )}
                slug: <code className="font-mono">{category.slug}</code>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-surface-container dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto font-body flex flex-col gap-4">
          {/* Slug — create only */}
          {!isEdit && (
            <div>
              <label className={LABEL_CLASS}>
                Slug <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) =>
                  set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))
                }
                className={INPUT_CLASS}
                placeholder="vd: ready-to-eat"
              />
              <p className="text-xs text-gray-400 mt-1 font-body">
                Chỉ dùng chữ thường, số và dấu &quot;-&quot;. Không thể thay đổi
                sau khi tạo.
              </p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className={LABEL_CLASS}>
              Tên danh mục <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className={INPUT_CLASS}
              placeholder="VD: Rau củ quả"
              maxLength={50}
            />
          </div>

          {/* Icon */}
          <div>
            <label className={LABEL_CLASS}>Tên icon</label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => set('icon', e.target.value.trim())}
              className={INPUT_CLASS}
              placeholder="VD: sprout, bread-slice, fish (không bắt buộc)"
            />
            <p className="text-xs text-gray-400 mt-1 font-body">
              Tên icon từ thư viện MaterialCommunityIcons.
            </p>
          </div>

          {/* Color */}
          <div>
            <label className={LABEL_CLASS}>
              Màu sắc <span className="text-error">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.color}
                onChange={(e) => set('color', e.target.value)}
                className="h-9 w-12 cursor-pointer rounded-md border border-outline-variant bg-surface p-0.5"
              />
              <input
                type="text"
                value={form.color}
                onChange={(e) => set('color', e.target.value)}
                className={INPUT_CLASS}
                placeholder="#296C24"
                maxLength={7}
              />
            </div>
          </div>

          {/* applyTo + sortOrder */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Áp dụng cho</label>
              <select
                value={form.applyTo}
                onChange={(e) =>
                  set(
                    'applyTo',
                    e.target.value as 'P2P_FREE' | 'B2C_MYSTERY_BAG' | 'BOTH'
                  )
                }
                className={SELECT_CLASS}
              >
                <option value="BOTH">Tất cả</option>
                <option value="P2P_FREE">Chia sẻ (P2P)</option>
                <option value="B2C_MYSTERY_BAG">Túi mù (B2C)</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Thứ tự hiển thị</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => set('sortOrder', Number(e.target.value))}
                className={INPUT_CLASS}
                min={0}
                max={999}
              />
            </div>
          </div>

          {/* isActive — edit only */}
          {isEdit && (
            <div className="flex items-center justify-between rounded-md border border-outline-variant/30 dark:border-gray-700 bg-surface dark:bg-gray-800 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Hiển thị trong ứng dụng
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-body mt-0.5">
                  Tắt để ẩn danh mục khỏi FilterPills
                </p>
              </div>
              <button
                type="button"
                onClick={() => set('isActive', !form.isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  form.isActive ? 'bg-primary' : 'bg-outline-variant'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    form.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 px-4 py-3 text-sm text-red-700 dark:text-red-400 font-body">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/30 dark:border-gray-700 bg-surface-lowest dark:bg-gray-900 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-md font-body text-sm font-semibold text-gray-600 hover:bg-surface-container dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
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
                {isEdit ? 'Lưu thay đổi' : 'Tạo danh mục'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
