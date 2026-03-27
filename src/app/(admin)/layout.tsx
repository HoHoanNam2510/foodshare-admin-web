import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-surface-container">
      {/* Cột trái: Sidebar cố định (280px) */}
      <Sidebar />

      {/* Cột phải: Main Content Area */}
      <div className="flex-1 flex flex-col ml-70 min-h-screen">
        {/* Header cố định trên cùng */}
        <Header />

        {/* Nội dung các trang sẽ được đổ vào đây, có padding thích hợp */}
        <main className="flex-1 p-8">{children}</main>

        {/* Footer ở dưới cùng */}
        <Footer />
      </div>
    </div>
  );
}
