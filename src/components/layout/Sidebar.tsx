'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, ChevronDown, ChevronRight, LogOut } from 'lucide-react';

import { menuItems } from '@/constants/mockData';
import type { SidebarProps } from '@/types/dashboard';

// An item is "active" when the current pathname starts with the item's path.
// Using startsWith instead of strict equality means /users/kyc also highlights
// the "Quản Lý Người Dùng" parent entry.
// Special-case: /dashboard must match exactly to avoid matching everything
// that starts with "/d".
function isPathActive(pathname: string, itemPath: string): boolean {
  if (itemPath === '/dashboard') return pathname === '/dashboard';
  return pathname === itemPath || pathname.startsWith(itemPath + '/');
}

export default function Sidebar({ open, dark }: SidebarProps) {
  const pathname = usePathname();
  const [search, setSearch] = useState<string>('');

  // Auto-expand the section that owns the current route on first render and
  // whenever the pathname changes (e.g. after a Link navigation).
  const getInitialExpanded = (): Record<string, boolean> => {
    const result: Record<string, boolean> = {};
    for (const item of menuItems) {
      // Expand if the current pathname lives under this item's path
      result[item.id] = isPathActive(pathname, item.path);
    }
    return result;
  };

  const [expanded, setExpanded] =
    useState<Record<string, boolean>>(getInitialExpanded);

  // Re-sync expanded state whenever the route changes so navigating via the
  // browser back/forward buttons still opens the right section.
  useEffect(() => {
    setExpanded(getInitialExpanded());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const filtered = menuItems.filter(
    (m) =>
      m.label.toLowerCase().includes(search.toLowerCase()) ||
      m.sub.some((s) => s.label.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <aside
      className="fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300 overflow-hidden"
      style={{
        width: open ? 260 : 0,
        background: dark
          ? 'linear-gradient(180deg,#0f1535 0%,#111827 100%)'
          : 'linear-gradient(180deg,#1e293b 0%,#0f172a 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-1 px-5 py-5 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="w-14 h-14 flex items-center justify-center shrink-0">
          <Image
            src="/images/logo.png"
            alt="FoodShare Logo"
            width={56}
            height={56}
            className="object-contain scale-110"
          />
        </div>
        <span className="text-white font-bold text-lg tracking-tight whitespace-nowrap">
          FoodShare Admin
        </span>
      </div>

      {/* ── Search ── */}
      <div className="px-4 py-3 shrink-0">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <Search size={14} color="rgba(255,255,255,0.4)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm..."
            className="bg-transparent text-sm outline-none w-full"
            style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 pb-6 scrollbar-none">
        {filtered.map((item) => {
          const Icon = item.icon;
          const isOpen = expanded[item.id];
          const isActive = isPathActive(pathname, item.path);
          const hasSub = item.sub.length > 0;

          return (
            <div key={item.id} className="mb-1">
              {/*
               * Top-level row: always a <Link> that navigates to item.path.
               * The chevron button is a separate element so clicking it only
               * toggles the sub-menu without triggering navigation.
               */}
              <div
                className="flex items-center rounded-xl transition-all duration-200"
                style={{
                  background: isActive
                    ? 'linear-gradient(90deg,rgba(124,58,237,0.3),rgba(168,85,247,0.1))'
                    : 'transparent',
                  borderLeft: isActive
                    ? '2px solid #a855f7'
                    : '2px solid transparent',
                }}
              >
                {/* Navigation link — occupies all space except the chevron */}
                <Link
                  href={item.path}
                  onClick={() => {
                    // When navigating to a section that has sub-items, also
                    // ensure its sub-menu is expanded so the user can see them.
                    if (hasSub) {
                      setExpanded((prev) => ({ ...prev, [item.id]: true }));
                    }
                  }}
                  className="flex items-center gap-3 flex-1 px-3 py-2.5 min-w-0"
                >
                  <Icon
                    size={17}
                    color={isActive ? '#a855f7' : 'rgba(255,255,255,0.5)'}
                  />
                  <span
                    className="flex-1 text-sm font-medium whitespace-nowrap"
                    style={{
                      color: isActive ? '#e2e8f0' : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {item.label}
                  </span>
                </Link>

                {/* Chevron toggle — only rendered for items with sub-menus */}
                {hasSub && (
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="pr-3 py-2.5 shrink-0"
                    aria-label={isOpen ? 'Thu gọn' : 'Mở rộng'}
                  >
                    {isOpen ? (
                      <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
                    ) : (
                      <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
                    )}
                  </button>
                )}
              </div>

              {/* Sub-menu items */}
              {hasSub && isOpen && (
                <div className="ml-6 mt-1 flex flex-col gap-0.5">
                  {item.sub.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = isPathActive(pathname, sub.path);

                    return (
                      <Link
                        key={sub.label}
                        href={sub.path}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 hover:bg-white/5"
                        style={{
                          background: isSubActive
                            ? 'rgba(168,85,247,0.12)'
                            : 'transparent',
                        }}
                      >
                        <SubIcon
                          size={13}
                          color={
                            isSubActive ? '#a855f7' : 'rgba(168,85,247,0.7)'
                          }
                        />
                        <span
                          className="text-xs whitespace-nowrap"
                          style={{
                            color: isSubActive
                              ? '#e2e8f0'
                              : 'rgba(255,255,255,0.5)',
                          }}
                        >
                          {sub.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Bottom Profile Strip ── */}
      <div
        className="px-4 py-4 shrink-0 flex items-center gap-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="w-8 h-8 rounded-full overflow-hidden shrink-0"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#f59e0b)' }}
        >
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
            JA
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            Jhon Anderson
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Super Admin
          </p>
        </div>
        <LogOut
          size={14}
          color="rgba(255,255,255,0.3)"
          className="cursor-pointer hover:text-white transition-colors"
        />
      </div>
    </aside>
  );
}
