'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Menu, Search, Bell, ChevronDown, LogIn } from 'lucide-react';

import ThemeToggle from '@/components/layout/ThemeToggle';
import type { TopbarProps } from '@/types/dashboard';

export default function Topbar({
  sidebarOpen,
  setSidebarOpen,
  sidebarWidth,
}: TopbarProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to dark appearance before client mount to match defaultTheme="dark"
  const isDark = !mounted || theme === 'dark';

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center gap-4 px-5 h-16 transition-all duration-300"
      style={{
        left: sidebarWidth,
        background: isDark ? 'rgba(10,14,35,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${
          isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
        }`,
      }}
    >
      {/* Sidebar toggle */}
      <button
        onClick={() => setSidebarOpen((p) => !p)}
        className="p-2 rounded-lg transition-colors hover:bg-white/10"
        aria-label={sidebarOpen ? 'Đóng menu' : 'Mở menu'}
      >
        <Menu size={20} color={isDark ? 'rgba(255,255,255,0.7)' : '#334155'} />
      </button>

      {/* Search bar */}
      <div
        className="flex-1 max-w-lg flex items-center gap-2 rounded-xl px-4 py-2.5"
        style={{
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
        }}
      >
        <Search
          size={16}
          color={isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8'}
        />
        <input
          placeholder="Tìm kiếm..."
          className="bg-transparent text-sm outline-none flex-1"
          style={{
            color: isDark ? 'rgba(255,255,255,0.7)' : '#334155',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Right-side actions */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Vietnam flag */}
        <div className="w-8 h-6 rounded overflow-hidden shadow-sm border border-white/10 text-center text-sm text-blue-500">
          🇻🇳
        </div>

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Thông báo"
        >
          <Bell
            size={20}
            color={isDark ? 'rgba(255,255,255,0.7)' : '#334155'}
          />
          <span
            className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
            style={{ background: '#ef4444' }}
          >
            5
          </span>
        </button>

        {/* Theme toggle — fully isolated in its own component */}
        <ThemeToggle />

        {/* === NÚT ĐĂNG NHẬP (Dùng để test) === */}
        <Link
          href="/login"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-black hover:bg-gray-800 transition-colors"
          style={{
            background: isDark ? '#fff' : '#000',
            color: isDark ? '#000' : '#fff',
          }}
        >
          <LogIn size={16} />
          Đăng Nhập
        </Link>
        {/* ===================================== */}

        {/* User profile */}
        {/* <div className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-xl hover:bg-white/5 transition-colors">
          <div
            className="w-8 h-8 rounded-full overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#f59e0b)' }}
          >
            <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
              JA
            </div>
          </div>
          <span
            className="text-sm font-medium whitespace-nowrap"
            style={{ color: isDark ? 'rgba(255,255,255,0.8)' : '#334155' }}
          >
            Jhon Anderson!
          </span>
          <ChevronDown
            size={14}
            color={isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8'}
          />
        </div> */}
      </div>
    </header>
  );
}
