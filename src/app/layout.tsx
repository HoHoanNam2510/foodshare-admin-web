import type { Metadata } from 'next';
import { Epilogue, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';

// 1. Cấu hình font Epilogue (dùng cho Heading/Display)
const epilogue = Epilogue({
  subsets: ['latin'],
  variable: '--font-epilogue',
  display: 'swap',
});

// 2. Cấu hình font Be Vietnam Pro (dùng cho Body/Text)
const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FoodShare Admin',
  description: 'FoodShare Admin Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Thêm suppressHydrationWarning vào html
    <html
      lang="vi"
      className={`${epilogue.variable} ${beVietnamPro.variable}`}
      suppressHydrationWarning
    >
      {/* Thêm suppressHydrationWarning vào body */}
      <body
        className="font-body antialiased bg-surface text-gray-900"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
