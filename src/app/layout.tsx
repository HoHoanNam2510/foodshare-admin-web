import type { Metadata } from 'next';
import { Epilogue, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

// 1. Cấu hình font Epilogue cho Display & Headlines
const epilogue = Epilogue({
  subsets: ['latin'],
  variable: '--font-epilogue',
  display: 'swap',
});

// 2. Cấu hình font Be Vietnam Pro cho Titles & Body
const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'vietnamese'], // Hỗ trợ gõ tiếng Việt có dấu chuẩn xác
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FoodShare Admin',
  description: 'FoodShare Admin Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      // 3. Truyền biến CSS của font vào root HTML
      className={`${epilogue.variable} ${beVietnamPro.variable}`}
    >
      <body
        suppressHydrationWarning
        // 4. Áp dụng font-body làm font mặc định cho toàn bộ trang web
        className="font-body antialiased"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Vì đây là admin dashboard, giữ nguyên theme mặc định
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
