'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AdminError]', error);
  }, [error]);

  return (
    <div className="flex min-h-100 flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-neutral-T10 dark:text-neutral-T100 text-xl font-bold">
        Có lỗi xảy ra
      </h2>
      <p className="text-neutral-T40 max-w-sm text-center text-sm">
        Trang này gặp sự cố không mong muốn. Vui lòng thử lại hoặc liên hệ quản
        trị viên.
      </p>
      <button
        onClick={reset}
        className="bg-primary-T40 hover:bg-primary-T30 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors"
      >
        Thử lại
      </button>
    </div>
  );
}
