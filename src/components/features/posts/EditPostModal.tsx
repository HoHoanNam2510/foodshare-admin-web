'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { IPost, AdminUpdatePostBody } from '@/lib/postApi';

const CATEGORIES = [
  'Home cooked',
  'Bakery',
  'Fruits & Vegs',
  'Dairy',
  'Beverages',
  'Packaged food',
  'Other',
];

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface EditPostModalProps {
  post: IPost | null;
  onClose: () => void;
  onSave: (id: string, updates: AdminUpdatePostBody) => Promise<void>;
}

export default function EditPostModal({
  post,
  onClose,
  onSave,
}: EditPostModalProps) {
  const [form, setForm] = useState({
    title: post?.title ?? '',
    description: post?.description ?? '',
    category: post?.category ?? 'Home cooked',
    totalQuantity: post?.totalQuantity ?? 1,
    remainingQuantity: post?.remainingQuantity ?? 0,
    price: post?.price ?? 0,
    expiryDate: post?.expiryDate ? toDatetimeLocal(post.expiryDate) : '',
    pickupStart: post?.pickupTime?.start
      ? toDatetimeLocal(post.pickupTime.start)
      : '',
    pickupEnd: post?.pickupTime?.end
      ? toDatetimeLocal(post.pickupTime.end)
      : '',
  });
  const [saving, setSaving] = useState(false);

  if (!post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates: AdminUpdatePostBody = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        totalQuantity: form.totalQuantity,
        remainingQuantity: form.remainingQuantity,
        ...(post.type === 'B2C_MYSTERY_BAG' && { price: form.price }),
        ...(form.expiryDate && {
          expiryDate: new Date(form.expiryDate).toISOString(),
        }),
        ...(form.pickupStart &&
          form.pickupEnd && {
            pickupTime: {
              start: new Date(form.pickupStart).toISOString(),
              end: new Date(form.pickupEnd).toISOString(),
            },
          }),
      };
      await onSave(post._id, updates);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, children: React.ReactNode) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-label text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );

  const inputClass =
    'w-full px-3 py-2 text-sm border border-outline-variant/50 rounded-md bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-900';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-surface-lowest w-full max-w-2xl rounded-md shadow-floating overflow-hidden animate-in slide-in-from-bottom-4 fade-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface/50">
          <div>
            <h2 className="text-lg font-sans font-bold text-gray-900">
              Chỉnh sửa bài đăng
            </h2>
            <p className="text-xs font-body text-gray-500 mt-0.5 truncate max-w-xs">
              {post.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto font-body flex flex-col gap-5">
          {field(
            'Tiêu đề',
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              className={inputClass}
            />
          )}

          {field(
            'Mô tả',
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              className={`${inputClass} resize-none`}
            />
          )}

          {field(
            'Danh mục',
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <div className="grid grid-cols-2 gap-4">
            {field(
              'Tổng số lượng',
              <input
                type="number"
                min={1}
                value={form.totalQuantity}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    totalQuantity: Number(e.target.value),
                  }))
                }
                className={inputClass}
              />
            )}
            {field(
              'Còn lại',
              <input
                type="number"
                min={0}
                max={form.totalQuantity}
                value={form.remainingQuantity}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    remainingQuantity: Number(e.target.value),
                  }))
                }
                className={inputClass}
              />
            )}
          </div>

          {post.type === 'B2C_MYSTERY_BAG' &&
            field(
              'Giá (VND)',
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: Number(e.target.value) }))
                }
                className={inputClass}
              />
            )}

          {field(
            'Hạn sử dụng',
            <input
              type="datetime-local"
              value={form.expiryDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, expiryDate: e.target.value }))
              }
              className={inputClass}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            {field(
              'Giờ nhận – Bắt đầu',
              <input
                type="datetime-local"
                value={form.pickupStart}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pickupStart: e.target.value }))
                }
                className={inputClass}
              />
            )}
            {field(
              'Giờ nhận – Kết thúc',
              <input
                type="datetime-local"
                value={form.pickupEnd}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pickupEnd: e.target.value }))
                }
                className={inputClass}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-lowest flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md font-body text-sm font-semibold text-gray-600 hover:bg-surface-container transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Save size={16} />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
