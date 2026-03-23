'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import Sidebar from '@/components/layout/Sidebar';
import Topbar  from '@/components/layout/Topbar';

// Derive the sidebar menu key from the current URL pathname.
// e.g. "/dashboard" → "dashboard" | "/users" → "users"
function getActiveItem(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean)[0];
  return segment ?? 'dashboard';
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { theme }                         = useTheme();
  const pathname                          = usePathname();
  const [mounted, setMounted]             = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(true);

  useEffect(() => { setMounted(true); }, []);

  // Default to dark before client hydration to match defaultTheme="dark"
  const dark         = !mounted || theme === 'dark';
  const sidebarWidth = sidebarOpen ? 260 : 0;
  const activeItem   = getActiveItem(pathname);

  // ── Derived theme tokens shared across all admin pages ──────────────────
  const bg = dark ? '#080c1f' : '#f1f5f9';

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      <Sidebar
        open={sidebarOpen}
        dark={dark}
        activeItem={activeItem}
        setActiveItem={() => {
          // Navigation is handled by Next.js <Link> inside Sidebar.
          // This prop is kept for API compatibility; no manual state needed.
        }}
      />

      <Topbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarWidth={sidebarWidth}
      />

      <main
        className="transition-all duration-300 pt-16 min-h-screen"
        style={{ marginLeft: sidebarWidth }}
      >
        {children}
      </main>
    </div>
  );
}
