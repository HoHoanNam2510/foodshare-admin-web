'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuthStore } from '@/stores/authStore';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const hydrate = useAuthStore((s) => s.hydrate);
  const [ready, setReady] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/login');
    } else {
      hydrate();
      startTransition(() => setReady(true));
    }
  }, [router, hydrate]);

  if (!ready) return null;

  return (
    <div className="min-h-screen flex bg-neutral-T95">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-70 min-h-screen">
        <Header />
        <main className="flex-1 p-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
