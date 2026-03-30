'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);

    // Nếu login thành công (token đã lưu), chuyển hướng về dashboard
    const token = localStorage.getItem('admin_token');
    if (token) {
      router.replace('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left Panel — Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Full-cover background image */}
        <Image
          src="/images/background.png"
          alt="FoodShare background"
          fill
          sizes="50vw"
          priority
          className="object-cover"
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-primary-T10/50" />

        {/* Atmospheric blobs on top of image */}
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-10%] w-100 h-100 rounded-full bg-primary-container/15 blur-3xl pointer-events-none" />

        {/* Tagline card — bottom overlay */}
        <div className="absolute bottom-10 left-8 right-8 z-10">
          <div className="bg-surface-lowest/80 backdrop-blur-sm border border-outline-variant/50 rounded-xl p-6 shadow-soft">
            <p className="font-sans font-bold text-primary text-lg mb-1 tracking-tight">
              Sustainable Growth
            </p>
            <p className="font-body text-neutral-T40 text-sm leading-relaxed">
              Join 2,400+ administrators worldwide managing local food systems
              and community harvests through the FoodShare platform.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Top bar with logo image */}
        <header className="flex items-center gap-2 px-8 pt-8 pb-4">
          <Image
            src="/images/logo.png"
            alt="FoodShare Admin Logo"
            width={60}
            height={16}
            style={{ width: 'auto', height: 'auto' }}
            className="object-contain"
            priority
          />
          <span className="font-sans font-bold text-primary text-xl">
            FoodShare Admin
          </span>
        </header>

        {/* Centered form area */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="mb-8">
              <h1 className="font-sans font-extrabold text-neutral-T10 text-4xl tracking-tight mb-2">
                Welcome back!
              </h1>
              <p className="font-body text-neutral-T40 text-base">
                Please enter your administrative credentials to manage the
                harvest.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="font-label font-semibold text-neutral-T20 text-sm"
                >
                  Email address
                </label>
                <div className="relative group">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@foodshare.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-lowest border border-outline-variant rounded-md px-4 py-3 text-neutral-T10 font-body text-sm placeholder:text-neutral-T60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="font-label font-semibold text-neutral-T20 text-sm"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="font-body text-sm text-neutral-T40 hover:text-primary hover:underline transition-colors duration-150"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-lowest border border-outline-variant rounded-md px-4 py-3 pr-12 text-neutral-T10 font-body text-sm placeholder:text-neutral-T60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-T50 hover:text-primary transition-colors duration-150 p-0.5"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} strokeWidth={1.8} />
                    ) : (
                      <Eye size={18} strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5 pt-1">
                <div className="relative flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    className="rounded-sm border-2 cursor-pointer flex items-center justify-center transition-all duration-200 border-outline-variant peer-checked:border-primary bg-surface-lowest peer-checked:bg-primary"
                    style={{ width: '18px', height: '18px' }}
                  >
                    {rememberMe && (
                      <svg
                        width="11"
                        height="9"
                        viewBox="0 0 11 9"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 4L4 7.5L10 1"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <label
                  htmlFor="remember"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="font-body text-sm text-neutral-T30 cursor-pointer select-none"
                >
                  Remember for 30 days
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white font-sans font-semibold text-base rounded-md py-3.5 mt-2 shadow-soft hover:shadow-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Đang đăng nhập...
                  </span>
                ) : (
                  'Login'
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center gap-4 py-1">
                <div className="flex-1 h-px bg-outline-variant" />
                <span className="font-body text-sm text-neutral-T50">Or</span>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 bg-surface-lowest border border-outline-variant rounded-md py-3.5 font-body font-medium text-sm text-neutral-T20 hover:bg-neutral-T95 hover:border-neutral-T70 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
                    fill="#34A853"
                  />
                  <path
                    d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
