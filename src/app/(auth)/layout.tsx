'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      router.replace('/dashboard');
    } else {
      startTransition(() => setReady(true));
    }
  }, [router]);

  if (!ready) return null;

  return (
    <div className="min-h-screen w-full bg-surface-lowest antialiased">
      {children}
    </div>
  );
}
