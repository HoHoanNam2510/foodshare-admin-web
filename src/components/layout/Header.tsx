'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Moon,
  Sun,
} from 'lucide-react';
import { adminMenus } from '@/constants/menu';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import Image from 'next/image';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Quản trị viên',
};

function getRoleLabel(role?: string): string {
  return role ? (ROLE_LABEL[role] ?? role) : '';
}

function getInitials(fullName?: string): string {
  if (!fullName) return 'A';
  const parts = fullName.trim().split(' ');
  const last = parts[parts.length - 1]?.[0] ?? '';
  const first = parts.length > 1 ? (parts[0]?.[0] ?? '') : '';
  return (first + last).toUpperCase() || 'A';
}

function getPageTitle(pathname: string): string {
  if (pathname === '/profile') return 'Hồ sơ của tôi';

  const activeMenu = adminMenus.find((item) => item.path === pathname);
  if (activeMenu) return activeMenu.label;

  for (const item of adminMenus) {
    if (item.sub) {
      const activeSub = item.sub.find((sub) => sub.path === pathname);
      if (activeSub) return activeSub.label;
    }
  }

  return 'Trang Chủ';
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const pageTitle = getPageTitle(pathname);

  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = getInitials(user?.fullName);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 right-0 z-30 h-16 w-full flex items-center justify-between px-6 bg-surface-lowest/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-outline-variant/30 dark:border-gray-700 shadow-soft transition-all duration-300">
      {/* ── Bên Trái: Page Title ── */}
      <div className="flex flex-col">
        <h1 className="font-sans font-bold text-lg text-gray-900 dark:text-gray-100 leading-tight">
          {pageTitle}
        </h1>
      </div>

      {/* ── Bên Phải: Actions & Profile ── */}
      <div className="flex items-center gap-4">
        {/* Global Search Box */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-surface dark:bg-gray-800 rounded-lg border border-outline-variant/30 dark:border-gray-700 w-64 focus-within:ring-1 focus-within:ring-primary/50 focus-within:-translate-y-0.5 transition-all duration-200">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh (Ctrl + K)..."
            className="bg-transparent text-xs outline-none w-full font-body text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
          />
        </div>

        {/* Dark mode toggle */}
        {theme && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-primary/5 hover:text-primary dark:hover:text-primary transition-colors duration-200"
            title={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}

        {/* Notifications Bell */}
        <button className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-primary/5 hover:text-primary transition-colors duration-200">
          <Bell size={20} />
        </button>

        <div className="h-8 w-px bg-outline-variant/30 dark:bg-gray-700" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center gap-2.5 pl-2 pr-1.5 py-1 rounded-full border transition-all duration-200 ${
              profileOpen
                ? 'bg-primary/10 border-primary/30'
                : 'bg-surface-lowest dark:bg-gray-800 border-outline-variant/30 dark:border-gray-700 hover:bg-primary/5 hover:border-primary/20 hover:-translate-y-0.5'
            }`}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.fullName}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-sans text-xs font-bold text-white bg-linear-to-br from-primary-container to-secondary-container shadow-inner">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex flex-col items-start min-w-0">
              <span className="font-body text-xs font-semibold text-gray-900 truncate max-w-28">
                {user?.fullName ?? '—'}
              </span>
              <span className="font-body text-[10px] text-gray-500 -mt-0.5">
                {getRoleLabel(user?.role)}
              </span>
            </div>

            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 p-2 bg-surface-lowest dark:bg-gray-800 rounded-3xl shadow-floating animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Account info */}
              <div className="px-3 py-2.5 mb-1">
                <p className="font-body text-[11px] text-neutral-T50 dark:text-gray-400">
                  Tài khoản
                </p>
                <p className="font-body text-sm font-semibold text-neutral-T10 dark:text-gray-100 truncate mt-0.5">
                  {user?.email ?? '—'}
                </p>
              </div>

              <div className="h-px bg-neutral-T90 dark:bg-gray-700 mx-1 mb-1" />

              <Link
                href="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-primary/5 hover:text-primary transition-colors duration-150"
              >
                <User size={16} />
                Hồ sơ của tôi
              </Link>
              <Link
                href="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-primary/5 hover:text-primary transition-colors duration-150"
              >
                <Settings size={16} />
                Cấu hình hệ thống
              </Link>

              <div className="h-px bg-neutral-T90 dark:bg-gray-700 mx-1 my-1" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-error hover:bg-error/10 transition-colors duration-150"
              >
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
