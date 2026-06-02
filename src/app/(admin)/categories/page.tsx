'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';

import CategoryFormModal from '@/components/features/categories/CategoryFormModal';
import ActionDropdown, {
  type DropdownAction,
} from '@/components/ui/ActionDropdown';
import DataTable, { type Column } from '@/components/ui/DataTable';
import PageHeader from '@/components/ui/PageHeader';
import {
  deleteCategory,
  fetchAdminCategories,
  updateCategory,
  type ICategory,
} from '@/lib/categoryApi';

const APPLY_TO_MAP = {
  P2P_FREE: {
    label: 'Chia sẻ',
    cls: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  B2C_MYSTERY_BAG: {
    label: 'Túi mù',
    cls: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  BOTH: {
    label: 'Tất cả',
    cls: 'bg-primary/10 text-primary border-primary/20',
  },
} as const;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminCategories();
      setCategories(data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch {
      setError('Không thể tải danh sách danh mục. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleToggleActive = async (cat: ICategory) => {
    setTogglingId(cat._id);
    setOpenDropdownId(null);
    try {
      await updateCategory(cat._id, { isActive: !cat.isActive });
      await loadCategories();
    } catch {
      alert('Thao tác thất bại. Vui lòng thử lại.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (cat: ICategory) => {
    setOpenDropdownId(null);
    const confirmed = confirm(
      `Xóa danh mục "${cat.name}"?\n\nDanh mục sẽ bị ẩn khỏi ứng dụng và không thể chọn cho bài đăng mới.`
    );
    if (!confirmed) return;

    setDeletingId(cat._id);
    try {
      await deleteCategory(cat._id);
      await loadCategories();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Xóa thất bại. Vui lòng thử lại.';
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const buildActions = (cat: ICategory): DropdownAction[] => [
    {
      label: 'Chỉnh sửa',
      icon: <Pencil size={16} />,
      onClick: () => {
        setEditingCategory(cat);
        setOpenDropdownId(null);
      },
    },
    {
      label: 'Xóa danh mục',
      icon: <Trash2 size={16} />,
      variant: 'danger',
      dividerBefore: true,
      hidden: cat.isSystem,
      onClick: () => handleDelete(cat),
    },
  ];

  const columns: Column<ICategory>[] = [
    {
      key: 'sortOrder',
      header: '#',
      align: 'center',
      render: (cat) => (
        <span className="font-mono text-xs text-neutral-T50">
          {cat.sortOrder}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Danh mục',
      render: (cat) => (
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 shrink-0 rounded-xl"
            style={{ backgroundColor: cat.color + '28' }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {cat.name}
              </span>
              {cat.isSystem && (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold font-label text-primary">
                  Hệ thống
                </span>
              )}
            </div>
            <code className="text-[11px] font-mono text-neutral-T50">
              {cat.icon}
            </code>
          </div>
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (cat) => (
        <code className="rounded bg-surface-container px-2 py-0.5 text-xs font-mono text-neutral-T30">
          {cat.slug}
        </code>
      ),
    },
    {
      key: 'applyTo',
      header: 'Áp dụng',
      align: 'center',
      render: (cat) => {
        const { label, cls } = APPLY_TO_MAP[cat.applyTo];
        return (
          <span
            className={`rounded border px-2 py-0.5 text-xs font-semibold font-label ${cls}`}
          >
            {label}
          </span>
        );
      },
    },
    {
      key: 'color',
      header: 'Màu',
      align: 'center',
      render: (cat) => (
        <div className="flex items-center justify-center gap-2">
          <div
            className="h-4 w-4 rounded-full border border-outline-variant/40 shadow-sm"
            style={{ backgroundColor: cat.color }}
          />
          <code className="text-xs font-mono text-neutral-T50">
            {cat.color}
          </code>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Trạng thái',
      align: 'center',
      render: (cat) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleActive(cat);
          }}
          disabled={togglingId === cat._id}
          title={cat.isActive ? 'Nhấn để ẩn' : 'Nhấn để hiện'}
          className="transition-opacity hover:opacity-80"
        >
          {togglingId === cat._id ? (
            <Loader2 size={16} className="animate-spin text-neutral-T50" />
          ) : cat.isActive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Hiển thị
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/30 bg-surface-container px-2.5 py-1 text-xs font-semibold text-neutral-T50">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-T60" />
              Ẩn
            </span>
          )}
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      align: 'center',
      render: (cat) => (
        <ActionDropdown
          id={cat._id}
          openId={openDropdownId}
          onToggle={(id) =>
            setOpenDropdownId((prev) => (prev === id ? null : id))
          }
          loading={deletingId === cat._id}
          actions={buildActions(cat)}
        />
      ),
    },
  ];

  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-6"
      onClick={() => setOpenDropdownId(null)}
    >
      <PageHeader
        title="Quản Lý Danh Mục"
        subtitle="Quản lý danh mục thực phẩm hiển thị trong FilterPills của ứng dụng"
        action={
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Tạo danh mục
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={categories}
        rowKey={(cat) => cat._id}
        loading={loading}
        error={error}
        emptyMessage="Chưa có danh mục nào."
        className="rounded-2xl relative"
        headerClassName="bg-surface/50 dark:bg-gray-800/50 font-label text-xs uppercase text-gray-500"
        bodyClassName="divide-outline-variant/20 text-sm"
        rowClassName="hover:bg-primary/5 transition-colors"
        cellClassName={(col) => (col.key === 'actions' ? 'px-3' : '')}
      />

      {/* Create modal */}
      {isCreating && (
        <CategoryFormModal
          category={null}
          onClose={() => setIsCreating(false)}
          onSaved={() => {
            loadCategories();
          }}
        />
      )}

      {/* Edit modal */}
      {editingCategory && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSaved={() => {
            loadCategories();
          }}
        />
      )}
    </div>
  );
}
