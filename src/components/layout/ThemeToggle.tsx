'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render the real toggle after client mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Pre-mount placeholder ─────────────────────────────────────────────────
  // Identical dimensions to the real button; keeps layout stable during SSR.
  if (!mounted) {
    return (
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
        style={{ width: 72, height: 30, background: 'rgba(255,255,255,0.05)' }}
        aria-hidden="true"
      />
    );
  }

  // ── Real toggle ───────────────────────────────────────────────────────────
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
      style={{
        background: isDark ? 'rgba(168,85,247,0.2)' : 'rgba(251,191,36,0.15)',
        border: `1px solid ${isDark ? 'rgba(168,85,247,0.4)' : 'rgba(251,191,36,0.4)'}`,
        color: isDark ? '#c084fc' : '#d97706',
      }}
      aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
    >
      {isDark ? <Moon size={14} /> : <Sun size={14} />}
      <span>{isDark ? 'Tối' : 'Sáng'}</span>
    </button>
  );
}
