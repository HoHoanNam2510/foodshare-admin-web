'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, ChevronDown, LogOut, Settings } from 'lucide-react';
import { adminMenus } from '@/constants/menu';
import Link from 'next/link';

// Helper để lấy tên trang hiện tại từ URL và danh sách menu
function getPageTitle(pathname: string): string {
  // 1. Check menu cấp 1
  const activeMenu = adminMenus.find((item) => item.path === pathname);
  if (activeMenu) return activeMenu.label;

  // 2. Check menu cấp 2
  for (const item of adminMenus) {
    if (item.sub) {
      const activeSub = item.sub.find((sub) => sub.path === pathname);
      if (activeSub) return activeSub.label;
    }
  }

  return 'Trang Chủ'; // Fallback
}

export default function Header() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  // State quản lý Dropdown Profile
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 right-0 z-30 h-16 w-full flex items-center justify-between px-6 bg-surface-lowest/95 backdrop-blur-sm border-b border-outline-variant/30 shadow-soft transition-all duration-300">
      {/* ── Bên Trái: Page Title / Breadcrumbs ── */}
      <div className="flex flex-col">
        <h1 className="font-sans font-bold text-lg text-gray-900 leading-tight">
          {pageTitle}
        </h1>
        {/* Sau này có thể thêm Breadcrumbs ở đây (Ví dụ: Users > Danh sách) */}
      </div>

      {/* ── Bên Phải: Actions & Profile ── */}
      <div className="flex items-center gap-4">
        {/* Global Search Box (Enterprise style) */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-lg border border-outline-variant/30 w-64 focus-within:ring-1 focus-within:ring-primary/50 focus-within:-translate-y-0.5 transition-all duration-200">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh (Ctrl + K)..."
            className="bg-transparent text-xs outline-none w-full font-body text-gray-900 placeholder:text-gray-400"
          />
        </div>
        {/* Notifications Bell */}
        <button className="relative p-2 rounded-xl text-gray-500 hover:bg-primary/5 hover:text-primary transition-colors duration-200">
          <Bell size={20} />
          {/* Badge thông báo */}
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center bg-error text-white font-sans text-[9px] font-bold">
            3
          </span>
        </button>
        <div className="h-8 w-px bg-outline-variant/30" /> {/* Phân cách */}
        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center gap-2.5 pl-2 pr-1.5 py-1 rounded-full border transition-all duration-200 ${profileOpen ? 'bg-primary/10 border-primary/30' : 'bg-surface-lowest border-outline-variant/30 hover:bg-primary/5 hover:border-primary/20 hover:-translate-y-0.5'}`}
          >
            {/* Avatar với Gradient chuẩn instructions */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-sans text-xs font-bold text-white bg-linear-to-br from-primary-container to-secondary-container shadow-inner">
              JA
            </div>

            <div className="flex flex-col items-start min-w-0">
              <span className="font-body text-xs font-semibold text-gray-900 truncate">
                Jhon Anderson
              </span>
              <span className="font-body text-[10px] text-gray-500 -mt-0.5">
                Super Admin
              </span>
            </div>

            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu (Animate show/hide) */}
          {profileOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 p-2 bg-surface-lowest rounded-xl shadow-hover border border-outline-variant/30 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 border-b border-outline-variant/20 mb-1">
                <p className="font-body text-[11px] text-gray-500">Tài khoản</p>
                <p className="font-body text-sm font-medium text-gray-900 truncate">
                  jhon.a@foodshare.vn
                </p>
              </div>

              <Link
                href="/profile/settings"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <Settings size={16} />
                Thiết lập tài khoản
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <Settings size={16} />
                Cấu hình hệ thống
              </Link>

              <div className="h-px bg-outline-variant/20 my-1" />

              <button className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-error hover:bg-error/10 transition-colors">
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
