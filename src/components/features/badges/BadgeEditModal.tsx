'use client';

import { X, Award, Save, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  IBadge,
  TriggerEvent,
  TargetRole,
  updateBadgeApi,
  createBadgeApi,
} from '@/lib/badgeApi';

const TRIGGER_EVENT_LABELS: Record<TriggerEvent, string> = {
  PROFILE_COMPLETED: 'Hoàn thiện hồ sơ',
  POST_CREATED: 'Tạo bài đăng',
  TRANSACTION_COMPLETED: 'Hoàn thành giao dịch',
  REVIEW_RECEIVED: 'Nhận đánh giá',
  GREENPOINTS_AWARDED: 'Nhận Green Points',
  KYC_APPROVED: 'KYC được duyệt',
};

const TARGET_ROLE_LABELS: Record<TargetRole, string> = {
  BOTH: 'Tất cả (USER + STORE)',
  USER: 'User',
  STORE: 'Store',
};

interface BadgeEditModalProps {
  /** null = tạo mới */
  badge: IBadge | null;
  onClose: () => void;
  onSaved: (badge: IBadge) => void;
}

export default function BadgeEditModal({
  badge,
  onClose,
  onSaved,
}: BadgeEditModalProps) {
  const isNew = !badge;

  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    imageUrl: '',
    targetRole: 'BOTH' as TargetRole,
    triggerEvent: 'PROFILE_COMPLETED' as TriggerEvent,
    pointReward: 10,
    sortOrder: 99,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form khi edit
  useEffect(() => {
    if (badge) {
      setForm({
        code: badge.code,
        name: badge.name,
        description: badge.description,
        imageUrl: badge.imageUrl,
        targetRole: badge.targetRole,
        triggerEvent: badge.triggerEvent,
        pointReward: badge.pointReward,
        sortOrder: badge.sortOrder,
      });
    }
  }, [badge]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'pointReward' || name === 'sortOrder' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let saved: IBadge;
      if (isNew) {
        const res = await createBadgeApi(form);
        saved = res.data;
      } else {
        const { code: _code, triggerEvent: _te, targetRole: _tr, ...editableFields } = form;
        const res = await updateBadgeApi(badge!._id, editableFields);
        saved = res.data;
      }
      onSaved(saved);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Lưu thất bại. Thử lại sau.';
      setError(msg);
    } finally {
      setSaving(false);
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
      <div className="relative bg-surface-lowest w-full max-w-lg rounded-md shadow-floating overflow-hidden animate-in slide-in-from-bottom-4 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface/50">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-primary" />
            <h2 className="text-lg font-sans font-bold text-gray-900">
              {isNew ? 'Tạo huy hiệu mới' : 'Chỉnh sửa huy hiệu'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-surface-container text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {/* Image preview */}
          {form.imageUrl && (
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant/30">
                <Image
                  src={form.imageUrl}
                  alt={form.name}
                  width={56}
                  height={56}
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* Code — chỉ cho create */}
          {isNew && (
            <Field label="Mã huy hiệu (CODE)" required>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="VD: FIRST_STEPS"
                className={inputCls}
                required
              />
            </Field>
          )}

          {/* Name */}
          <Field label="Tên huy hiệu" required>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="VD: Bước Đầu Tiên"
              className={inputCls}
              required
            />
          </Field>

          {/* Description */}
          <Field label="Mô tả">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Mô tả điều kiện mở khóa..."
              className={`${inputCls} resize-none`}
            />
          </Field>

          {/* Image URL */}
          <Field label="URL hình ảnh" required>
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://res.cloudinary.com/..."
              className={inputCls}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            {/* Target Role — chỉ cho create */}
            <Field label="Đối tượng">
              {isNew ? (
                <select
                  name="targetRole"
                  value={form.targetRole}
                  onChange={handleChange}
                  className={inputCls}
                >
                  {(Object.keys(TARGET_ROLE_LABELS) as TargetRole[]).map(
                    (r) => (
                      <option key={r} value={r}>
                        {TARGET_ROLE_LABELS[r]}
                      </option>
                    )
                  )}
                </select>
              ) : (
                <p className={`${inputCls} bg-surface-container text-gray-500 cursor-not-allowed`}>
                  {TARGET_ROLE_LABELS[form.targetRole]}
                </p>
              )}
            </Field>

            {/* Trigger Event — chỉ cho create */}
            <Field label="Trigger Event">
              {isNew ? (
                <select
                  name="triggerEvent"
                  value={form.triggerEvent}
                  onChange={handleChange}
                  className={inputCls}
                >
                  {(Object.keys(TRIGGER_EVENT_LABELS) as TriggerEvent[]).map(
                    (t) => (
                      <option key={t} value={t}>
                        {TRIGGER_EVENT_LABELS[t]}
                      </option>
                    )
                  )}
                </select>
              ) : (
                <p className={`${inputCls} bg-surface-container text-gray-500 cursor-not-allowed`}>
                  {TRIGGER_EVENT_LABELS[form.triggerEvent]}
                </p>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Point Reward */}
            <Field label="Điểm thưởng">
              <input
                name="pointReward"
                type="number"
                min={0}
                value={form.pointReward}
                onChange={handleChange}
                className={inputCls}
              />
            </Field>

            {/* Sort Order */}
            <Field label="Thứ tự hiển thị">
              <input
                name="sortOrder"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={handleChange}
                className={inputCls}
              />
            </Field>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm font-body text-error bg-error/5 border border-error/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant/30 bg-surface/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-body text-gray-600 border border-outline-variant/50 rounded-md hover:bg-surface-container transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {saving ? 'Đang lưu...' : isNew ? 'Tạo mới' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helper components ───
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-label font-semibold text-gray-600 uppercase tracking-wide">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 text-sm font-body rounded-md border border-outline-variant/50 bg-surface outline-none focus:ring-2 focus:ring-primary/40 focus:-translate-y-0.5 transition-all';
