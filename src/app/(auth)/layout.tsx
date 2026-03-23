import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-8">
      {/* Main card */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-135">
          {/* ── Left column: form children ── */}
          <div className="flex flex-col justify-center px-10 py-12 sm:px-14">
            {children}
          </div>

          {/* ── Right column: food image panel ── */}
          <div className="relative hidden md:block">
            {/* Background image via an <img> so we can use a real Unsplash food photo */}
            <img
              src="https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&auto=format&fit=crop&q=80"
              alt="Food photography"
              className="absolute inset-0 w-full h-full object-cover rounded-r-3xl"
            />

            {/* Subtle dark overlay at bottom for dot indicators */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-black/40 to-transparent rounded-br-3xl" />

            {/* Pagination dots */}
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              <span className="w-2 h-2 rounded-full bg-white/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
