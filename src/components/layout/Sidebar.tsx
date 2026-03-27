'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import { adminMenus } from '@/constants/menu';

function isPathActive(pathname: string, itemPath: string): boolean {
  if (itemPath === '/dashboard') return pathname === '/dashboard';
  return pathname === itemPath || pathname.startsWith(itemPath + '/');
}

export default function Sidebar() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Tự động mở menu cha nếu đang ở trang con
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    adminMenus.forEach((item) => {
      if (isPathActive(pathname, item.path)) {
        initialExpanded[item.id] = true;
      }
    });
    setExpanded((prev) => ({ ...prev, ...initialExpanded }));
  }, [pathname]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredMenus = adminMenus.filter(
    (m) =>
      m.label.toLowerCase().includes(search.toLowerCase()) ||
      m.sub?.some((s) => s.label.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <aside className="fixed top-0 left-0 h-screen w-70 z-40 flex flex-col bg-surface border-r border-outline-variant/50 transition-all duration-300">
      {/* ── 1. Logo & Brand ── */}
      <div className="flex items-center gap-3 px-6 py-6 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-surface-lowest shadow-sm border border-outline-variant/30 flex items-center justify-center overflow-hidden shrink-0">
          <Image
            src="/images/logo.png"
            alt="FoodShare Logo"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-sans font-extrabold tracking-tight text-xl text-primary leading-tight">
            FoodShare
          </span>
          <span className="font-label text-[10px] font-bold tracking-widest text-gray-400 uppercase mt-0.5">
            Admin Website
          </span>
        </div>
      </div>

      {/* ── 2. Search Input (Elevated) ── */}
      <div className="px-5 pb-4 shrink-0">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-surface-lowest rounded-lg shadow-sm border border-outline-variant/30 focus-within:ring-2 focus-within:ring-primary/50 focus-within:-translate-y-0.5 transition-all duration-200">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm chức năng..."
            className="bg-transparent text-sm outline-none w-full font-body text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* ── 3. Navigation Menu ── */}
      <div className="px-6 pt-2 pb-1 shrink-0">
        <p className="font-label text-xs font-semibold uppercase tracking-widest text-gray-400">
          Menu
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-none">
        {filteredMenus.map((item) => {
          const Icon = item.icon;
          const isActive = isPathActive(pathname, item.path);
          const isOpen = expanded[item.id];
          const hasSub = item.sub && item.sub.length > 0;

          return (
            <div key={item.id} className="mb-1">
              <div
                className={`flex items-center rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary text-white shadow-soft'
                    : 'hover:bg-primary/5 text-gray-600 hover:text-primary'
                }`}
              >
                <Link
                  href={hasSub ? '#' : item.path}
                  onClick={(e) => hasSub && toggleExpand(item.id, e)}
                  className="flex items-center gap-3 flex-1 px-3 py-2.5 min-w-0"
                >
                  <Icon
                    size={18}
                    className={`shrink-0 transition-colors ${isActive ? 'text-white' : ''}`}
                  />
                  <span
                    className={`flex-1 font-body text-sm whitespace-nowrap transition-colors ${isActive ? 'font-bold' : 'font-medium'}`}
                  >
                    {item.label}
                  </span>
                </Link>

                {hasSub && (
                  <button
                    onClick={(e) => toggleExpand(item.id, e)}
                    className="pr-3 py-2.5 shrink-0"
                  >
                    {isOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                )}
              </div>

              {/* Sub-menu */}
              {hasSub && isOpen && (
                <div className="ml-5 mt-1 mb-2 flex flex-col gap-0.5 pl-3 border-l-2 border-outline-variant/30">
                  {item.sub.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = pathname === sub.path;

                    return (
                      <Link
                        key={sub.label}
                        href={sub.path}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isSubActive
                            ? 'bg-secondary/10 text-secondary font-bold'
                            : 'text-gray-500 hover:bg-primary/5 hover:text-primary'
                        }`}
                      >
                        <SubIcon size={14} className="shrink-0" />
                        <span className="font-body text-xs whitespace-nowrap">
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

      {/* ── 4. Bottom Logout / Profile ── */}
      <div className="px-4 py-2.5 shrink-0 border-t border-outline-variant/50">
        <button className="flex items-center justify-center gap-2 w-full py-2 rounded-xl font-body text-sm font-semibold text-gray-600 hover:bg-error/10 hover:text-error transition-all duration-200">
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
