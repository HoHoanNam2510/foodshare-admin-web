import {
  LayoutDashboard,
  Users,
  FileText,
  AlertTriangle,
  Ticket,
  Bell,
  CreditCard,
  MessageCircle,
  Trash2,
  UserPlus,
  Edit,
  Lock,
  ShieldCheck,
  EyeOff,
  Gavel,
  Ban,
  Plus,
  List,
  Send,
  History,
  RotateCcw,
  Trash,
  MessageSquare,
} from 'lucide-react';

import type {
  ChartDataPoint,
  DonutDataPoint,
  MonthlyDataPoint,
  MenuItem,
} from '@/types/dashboard';

// ─── Mini Chart Data ──────────────────────────────────────────────────────────

export const areaData: ChartDataPoint[] = [
  { v: 30 },
  { v: 45 },
  { v: 38 },
  { v: 60 },
  { v: 52 },
  { v: 70 },
  { v: 65 },
];

export const barData: ChartDataPoint[] = [
  { v: 20 },
  { v: 35 },
  { v: 28 },
  { v: 45 },
  { v: 38 },
  { v: 55 },
  { v: 48 },
];

export const lineData: ChartDataPoint[] = [
  { v: 40 },
  { v: 55 },
  { v: 48 },
  { v: 62 },
  { v: 58 },
  { v: 75 },
  { v: 70 },
];

// ─── Donut Chart Data ─────────────────────────────────────────────────────────

export const donutData: DonutDataPoint[] = [
  { name: 'Store', value: 35 },
  { name: 'Organization', value: 28 },
  { name: 'User', value: 37 },
];

export const DONUT_COLORS: string[] = ['#a855f7', '#f59e0b', '#22d3ee'];

// ─── Monthly Bar Chart Data ───────────────────────────────────────────────────

export const monthlyData: MonthlyDataPoint[] = [
  { month: 'T1', p2p: 28, b2c: 18 },
  { month: 'T2', p2p: 35, b2c: 22 },
  { month: 'T3', p2p: 42, b2c: 30 },
  { month: 'T4', p2p: 50, b2c: 38 },
  { month: 'T5', p2p: 45, b2c: 32 },
  { month: 'T6', p2p: 38, b2c: 28 },
  { month: 'T7', p2p: 55, b2c: 42 },
  { month: 'T8', p2p: 48, b2c: 35 },
  { month: 'T9', p2p: 60, b2c: 45 },
  { month: 'T10', p2p: 52, b2c: 40 },
  { month: 'T11', p2p: 65, b2c: 50 },
  { month: 'T12', p2p: 70, b2c: 55 },
];

// ─── Sidebar Menu Items ───────────────────────────────────────────────────────
// Every top-level item has a `path` (the route it navigates to).
// Sub-items also carry their own `path` for deep-linking.

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Trang Thống Kê',
    icon: LayoutDashboard,
    path: '/dashboard',
    sub: [],
  },
  {
    id: 'users',
    label: 'Quản Lý Người Dùng',
    icon: Users,
    path: '/users',
    sub: [
      { label: 'Xem danh sách', icon: List, path: '/users' },
      { label: 'Tạo tài khoản', icon: UserPlus, path: '/users/create' },
      { label: 'Cập nhật thông tin', icon: Edit, path: '/users/update' },
      { label: 'Khóa/Mở khóa', icon: Lock, path: '/users/lock' },
      { label: 'Duyệt KYC', icon: ShieldCheck, path: '/users/kyc' },
    ],
  },
  {
    id: 'posts',
    label: 'Quản Lý Bài Đăng',
    icon: FileText,
    path: '/posts',
    sub: [
      { label: 'Xem danh sách', icon: List, path: '/posts' },
      { label: 'Cập nhật', icon: Edit, path: '/posts/update' },
      { label: 'Ẩn/Khóa', icon: EyeOff, path: '/posts/lock' },
    ],
  },
  {
    id: 'disputes',
    label: 'Quản Lý Tranh Chấp',
    icon: AlertTriangle,
    path: '/disputes',
    sub: [
      { label: 'Xem danh sách', icon: List, path: '/disputes' },
      { label: 'Cập nhật', icon: Edit, path: '/disputes/update' },
      { label: 'Phân xử', icon: Gavel, path: '/disputes/resolve' },
      { label: 'Xử phạt', icon: Ban, path: '/disputes/penalty' },
    ],
  },
  {
    id: 'vouchers',
    label: 'Quản Lý Voucher',
    icon: Ticket,
    path: '/vouchers',
    sub: [
      { label: 'Thêm mới', icon: Plus, path: '/vouchers/create' },
      { label: 'Xem danh sách', icon: List, path: '/vouchers' },
      { label: 'Cập nhật', icon: Edit, path: '/vouchers/update' },
      { label: 'Vô hiệu hóa', icon: Ban, path: '/vouchers/disable' },
    ],
  },
  {
    id: 'notifications',
    label: 'Quản Lý Thông Báo',
    icon: Bell,
    path: '/notifications',
    sub: [
      { label: 'Tạo & Gửi', icon: Send, path: '/notifications/send' },
      { label: 'Xem lịch sử', icon: History, path: '/notifications/history' },
    ],
  },
  {
    id: 'transactions',
    label: 'Quản Lý Giao Dịch',
    icon: CreditCard,
    path: '/transactions',
    sub: [
      { label: 'Xem danh sách', icon: List, path: '/transactions' },
      { label: 'Cập nhật', icon: Edit, path: '/transactions/update' },
    ],
  },
  {
    id: 'conversations',
    label: 'Quản Lý Hội Thoại',
    icon: MessageCircle,
    path: '/conversations',
    sub: [
      { label: 'Xem lịch sử', icon: History, path: '/conversations/history' },
      {
        label: 'Xóa/Gỡ tin nhắn',
        icon: MessageSquare,
        path: '/conversations/delete',
      },
    ],
  },
  {
    id: 'trash',
    label: 'Quản Lý Thùng Rác',
    icon: Trash2,
    path: '/trash',
    sub: [
      { label: 'Xem danh sách', icon: List, path: '/trash' },
      { label: 'Khôi phục', icon: RotateCcw, path: '/trash/restore' },
      { label: 'Xóa vĩnh viễn', icon: Trash, path: '/trash/purge' },
    ],
  },
];
