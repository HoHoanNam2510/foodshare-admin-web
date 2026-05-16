'use client';

import { MoreVertical, Loader2 } from 'lucide-react';
import { useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // ~36px per item + 16px padding — nếu không đủ chỗ phía dưới thì mở lên trên
      const estimatedMenuHeight = visibleActions.length * 36 + 16;
      const spaceBelow = window.innerHeight - rect.bottom;
      const rightOffset = window.innerWidth - rect.right;

      if (spaceBelow < estimatedMenuHeight) {
        setMenuStyle({
          position: 'fixed',
          bottom: window.innerHeight - rect.top + 4,
          right: rightOffset,
        });
      } else {
        setMenuStyle({
          position: 'fixed',
          top: rect.bottom + 4,
          right: rightOffset,
        });
      }
    }
    onToggle(id);
  };

  const menu = (
    <div
      style={menuStyle}
      className={`${width} bg-surface-lowest border border-outline-variant/30 rounded-2xl shadow-hover z-9999 py-1 overflow-hidden animate-in fade-in zoom-in-95`}
    >
      {visibleActions.map((action) => (
        <div key={action.label}>
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
  );

  return (
    <div className="text-center">
      <button
        ref={triggerRef}
        onClick={handleToggle}
        disabled={loading}
        className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <MoreVertical size={18} />
        )}
      </button>

      {isOpen && createPortal(menu, document.body)}
    </div>
  );
}
