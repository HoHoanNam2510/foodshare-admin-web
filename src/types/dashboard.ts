import type React from 'react';

// ─── Chart / Data Types ───────────────────────────────────────────────────────

export interface ChartDataPoint {
  v: number;
}

export interface DonutDataPoint {
  name: string;
  value: number;
}

export interface MonthlyDataPoint {
  month: string;
  p2p: number;
  b2c: number;
}

// ─── Menu Types ───────────────────────────────────────────────────────────────

export interface SubMenuItem {
  label: string;
  icon: React.ElementType;
  path: string; // ← added: every sub-item navigates to a real route
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string; // ← added: the canonical route for this section
  sub: SubMenuItem[];
}

// ─── Component Prop Types ─────────────────────────────────────────────────────

export interface StatCardProps {
  title: string;
  value: string;
  change: string;
  chartType: 'area' | 'bar' | 'line' | 'donut';
  color: string;
  gradFrom: string;
  gradTo: string;
}

// activeItem and setActiveItem are intentionally removed —
// the Sidebar now derives active state from usePathname().
export interface SidebarProps {
  open: boolean;
  dark: boolean;
}

export interface TopbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarWidth: number;
}
