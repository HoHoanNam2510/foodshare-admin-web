'use client';

import { MoreVertical, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

export interface DropdownAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  /** Màu sắc của item */
  variant?: 'default' | 'danger' | 'primary' | 'secondary';
  /** Thêm đường kẻ ngăn cách phía trên item này */
  dividerBefore?: boolean;
  /** Ẩn item (không render) */
  hidden?: boolean;
}

interface ActionDropdownProps {
  id: string;
  openId: string | null;
  /** Gọi khi user click nút trigger — truyền id để toggle */
  onToggle: (id: string) => void;
  loading?: boolean;
  actions: DropdownAction[];
  /** Tailwind width class, mặc định "w-44" */
  width?: string;
}

const VARIANT_CLASS: Record<string, string> = {
  default: 'text-gray-700 hover:bg-primary/5 hover:text-primary',
  danger: 'text-error hover:bg-error/10',
  primary: 'text-primary hover:bg-primary/10',
  secondary: 'text-secondary hover:bg-secondary/10',
};

export default function ActionDropdown({
  id,
  openId,
  onToggle,
  loading = false,
  actions,
  width = 'w-44',
}: ActionDropdownProps) {
  const isOpen = openId === id;
  const visibleActions = actions.filter((a) => !a.hidden);

  return (
    <div className="text-center relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(id);
        }}
        disabled={loading}
        className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <MoreVertical size={18} />
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute right-8 top-10 ${width} bg-surface-lowest border border-outline-variant/30 rounded-2xl shadow-hover z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95`}
        >
          {visibleActions.map((action, idx) => (
            <div key={idx}>
              {action.dividerBefore && (
                <div className="h-px bg-outline-variant/20 my-1" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${VARIANT_CLASS[action.variant ?? 'default']}`}
              >
                {action.icon}
                {action.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
