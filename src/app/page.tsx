import { redirect } from 'next/navigation';

export default function RootPage() {
  // Tự động chuyển hướng người dùng vào trang dashboard
  redirect('/dashboard');
}
