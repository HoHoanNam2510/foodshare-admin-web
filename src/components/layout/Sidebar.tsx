'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, ChevronDown, ChevronRight, LogOut } from 'lucide-react';

import { menuItems } from '@/constants/mockData';
import type { SidebarProps } from '@/types/dashboard';

function isPathActive(pathname: string, itemPath: string): boolean {
  if (itemPath === '/dashboard') return pathname === '/dashboard';
  return pathname === itemPath || pathname.startsWith(itemPath + '/');
}

export default function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname();
  const [search, setSearch] = useState<string>('');

  const getInitialExpanded = (): Record<string, boolean> => {
    const result: Record<string, boolean> = {};
    for (const item of menuItems) {
      if (item.path) {
        result[item.id] = isPathActive(pathname, item.path);
      }
    }
    return result;
  };

  const [expanded, setExpanded] =
    useState<Record<string, boolean>>(getInitialExpanded);

  useEffect(() => {
    setExpanded(getInitialExpanded());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const filtered = menuItems.filter(
    (m) =>
      m.label.toLowerCase().includes(search.toLowerCase()) ||
      m.sub?.some((s) => s.label.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <aside
      className="fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300 overflow-hidden bg-surface dark:bg-dark-bg border-r border-outline-variant dark:border-dark-hover"
      style={{ width: open ? 264 : 0 }}
    >
      {/* ── Logo / Brand Header ── */}
      <div className="flex items-center gap-3 px-5 py-5 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-surface-container dark:bg-dark-card flex items-center justify-center shrink-0 overflow-hidden">
          <Image
            src="/images/logo.png"
            alt="FoodShare Logo"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        <div className="min-w-0">
          {/* Cập nhật Brand Name: font-black text-lg */}
          <span className="block font-sans text-lg font-black tracking-tight whitespace-nowrap leading-tight text-primary dark:text-primary-container">
            FoodShare
          </span>
          <span className="block font-body text-xs whitespace-nowrap leading-tight text-gray-500 dark:text-dark-text-secondary">
            Admin Dashboard
          </span>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="px-4 pb-2 shrink-0">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-surface-container dark:bg-dark-card focus-within:ring-2 focus-within:ring-primary transition-all duration-200">
          <Search
            size={14}
            className="shrink-0 text-gray-400 dark:text-dark-text-secondary"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm..."
            className="bg-transparent text-sm outline-none w-full font-body text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* ── Section label ── */}
      <p className="px-5 pt-4 pb-1 font-label text-xs font-semibold uppercase tracking-widest shrink-0 text-gray-400 dark:text-dark-text-secondary">
        Menu
      </p>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-none">
        {filtered.map((item) => {
          const Icon = item.icon;
          const isOpen = expanded[item.id];
          const isActive = item.path
            ? isPathActive(pathname, item.path)
            : false;
          const hasSub = item.sub && item.sub.length > 0;

          return (
            <div key={item.id} className="mb-0.5">
              {/* Top-level row */}
              <div
                className={`flex items-center rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-md dark:bg-primary dark:text-white' // Solid block color
                    : 'hover:bg-surface-container dark:hover:bg-dark-hover'
                }`}
              >
                <Link
                  href={item.path || '#'}
                  onClick={() => {
                    if (hasSub)
                      setExpanded((prev) => ({ ...prev, [item.id]: true }));
                  }}
                  className="flex items-center gap-3 flex-1 px-3 py-2.5 min-w-0"
                >
                  <Icon
                    size={17}
                    className={`shrink-0 transition-colors duration-150 ${
                      isActive
                        ? 'text-white dark:text-white' // Icon trắng
                        : 'text-gray-500 dark:text-dark-text-secondary'
                    }`}
                  />
                  <span
                    className={`flex-1 font-body text-sm whitespace-nowrap transition-colors duration-150 ${
                      isActive
                        ? 'text-white font-bold dark:text-white' // Text trắng
                        : 'text-gray-700 dark:text-dark-text-primary font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>

                {hasSub && (
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="pr-3 py-2.5 shrink-0"
                    aria-label={isOpen ? 'Thu gọn' : 'Mở rộng'}
                  >
                    {isOpen ? (
                      <ChevronDown
                        size={14}
                        className={
                          isActive
                            ? 'text-white dark:text-white'
                            : 'text-gray-400 dark:text-dark-text-secondary'
                        } // Chevron trắng
                      />
                    ) : (
                      <ChevronRight
                        size={14}
                        className={
                          isActive
                            ? 'text-white dark:text-white'
                            : 'text-gray-400 dark:text-dark-text-secondary'
                        } // Chevron trắng
                      />
                    )}
                  </button>
                )}
              </div>

              {/* Sub-menu */}
              {hasSub && isOpen && (
                <div className="ml-5 mt-0.5 mb-1 flex flex-col gap-px pl-3 border-l border-outline-variant dark:border-dark-hover">
                  {item.sub.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = sub.path
                      ? isPathActive(pathname, sub.path)
                      : false;

                    return (
                      <Link
                        key={sub.label}
                        href={sub.path || '#'}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 ${
                          isSubActive
                            ? 'bg-secondary/10 text-secondary font-bold dark:bg-secondary/20 dark:text-secondary-container' // Sub-menu active
                            : 'hover:bg-surface-container dark:hover:bg-dark-hover'
                        }`}
                      >
                        <SubIcon
                          size={13}
                          className={`shrink-0 ${
                            isSubActive
                              ? 'text-secondary dark:text-secondary-container'
                              : 'text-gray-400 dark:text-dark-text-secondary'
                          }`}
                        />
                        <span
                          className={`font-body text-xs whitespace-nowrap transition-colors ${
                            isSubActive
                              ? 'font-bold text-secondary dark:text-secondary-container'
                              : 'font-normal text-gray-600 dark:text-dark-text-primary'
                          }`}
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

      {/* ── Bottom Profile Card ── */}
      <div className="px-3 pb-4 pt-2 shrink-0">
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-surface-container dark:bg-dark-card shadow-soft dark:shadow-none">
          <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center bg-linear-to-br from-primary-container to-secondary-container text-white font-sans text-xs font-bold">
            JA
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-xs font-semibold truncate leading-tight text-gray-900 dark:text-dark-text-primary">
              Jhon Anderson
            </p>
            <p className="font-body text-xs leading-tight mt-0.5 text-gray-500 dark:text-dark-text-secondary">
              Super Admin
            </p>
          </div>
          <button
            className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150 text-gray-400 dark:text-dark-text-secondary hover:bg-red-50 dark:hover:bg-red-950 hover:text-error dark:hover:text-error"
            aria-label="Đăng xuất"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
