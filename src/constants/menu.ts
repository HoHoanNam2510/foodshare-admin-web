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
  List,
  UserPlus,
  Edit,
  Lock,
  ShieldCheck,
  EyeOff,
  Gavel,
  Ban,
  Plus,
  Send,
  History,
  MessageSquare,
  RotateCcw,
  Trash,
} from 'lucide-react';

export interface SubMenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
  sub: SubMenuItem[];
}

export const adminMenus: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Trang Thống Kê',
    path: '/dashboard',
    icon: LayoutDashboard,
    sub: [],
  },
  {
    // Checked
    id: 'users',
    label: 'Quản Lý Người Dùng',
    path: '/users',
    icon: Users,
    sub: [
      { label: 'Danh sách tài khoản', path: '/users', icon: List },
      { label: 'Tạo mới', path: '/users/create', icon: UserPlus },
      { label: 'Xét duyệt KYC', path: '/users/kyc', icon: ShieldCheck },
    ],
  },
  {
    id: 'posts',
    label: 'Quản Lý Bài Đăng',
    path: '/posts',
    icon: FileText,
    sub: [
      { label: 'Xem danh sách', path: '/posts', icon: List },
      { label: 'Cập nhật', path: '/posts/edit', icon: Edit },
      { label: 'Ẩn/Khóa', path: '/posts/status', icon: EyeOff },
    ],
  },
  {
    // Checked
    id: 'transactions',
    label: 'Quản Lý Giao Dịch',
    path: '/transactions',
    icon: CreditCard,
    sub: [
      { label: 'Xem danh sách', path: '/transactions', icon: List },
      {
        label: 'Lịch sử cập nhật',
        path: '/transactions/history',
        icon: History,
      },
    ],
  },
  {
    // Checked
    id: 'reports',
    label: 'Quản Lý Báo Cáo',
    path: '/reports',
    icon: AlertTriangle,
    sub: [{ label: 'Xem danh sách', path: '/reports', icon: List }],
  },
  {
    // Checked
    id: 'chats',
    label: 'Quản Lý Hội Thoại',
    path: '/chats',
    icon: MessageCircle,
    sub: [{ label: 'Xem danh sách', path: '/chats', icon: List }],
  },
  {
    id: 'vouchers',
    label: 'Quản Lý Voucher',
    path: '/vouchers',
    icon: Ticket,
    sub: [
      { label: 'Xem danh sách', path: '/vouchers', icon: List },
      { label: 'Thêm mới', path: '/vouchers/create', icon: Plus },
      { label: 'Vô hiệu hóa', path: '/vouchers/status', icon: Ban },
    ],
  },
  {
    id: 'notifications',
    label: 'Quản Lý Thông Báo',
    path: '/notifications',
    icon: Bell,
    sub: [
      { label: 'Tạo & Gửi', path: '/notifications/create', icon: Send },
      { label: 'Xem lịch sử', path: '/notifications/history', icon: History },
    ],
  },
  {
    id: 'trash',
    label: 'Quản Lý Thùng Rác',
    path: '/trash',
    icon: Trash2,
    sub: [
      { label: 'Xem danh sách', path: '/trash', icon: List },
      { label: 'Khôi phục', path: '/trash/restore', icon: RotateCcw },
      { label: 'Xóa vĩnh viễn', path: '/trash/delete', icon: Trash },
    ],
  },
];
