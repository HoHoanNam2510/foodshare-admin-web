'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up admin authentication logic
    console.log('Admin login:', { username, password });
  };

  return (
    // Outer wrapper: fills the full left column height and centers content
    <div className="w-full flex flex-col justify-center min-h-full py-12">

      {/* Heading */}
      <h1 className="text-3xl font-bold text-black mb-2">Welcome Back!</h1>
      <p className="text-sm text-gray-400 mb-10">
        Sign in to your admin account to continue.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Username / Email */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          className="w-full px-5 py-3.5 rounded-full border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full px-5 py-3.5 rounded-full border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
        />

        {/* Forgot password — right-aligned, sits close to the inputs */}
        <div className="flex justify-end -mt-1">
          <Link
            href="/forgot-password"
            className="text-xs text-gray-500 font-medium hover:text-black transition-colors"
          >
            Forget Password?
          </Link>
        </div>

        {/* Primary CTA — extra vertical padding to feel prominent */}
        <button
          type="submit"
          className="w-full py-4 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 active:scale-[.98] transition-all mt-2"
        >
          Login
        </button>
      </form>

      {/* Admin-only notice — replaces the removed register footer */}
      <p className="text-xs text-gray-400 text-center mt-10">
        This portal is restricted to authorized administrators only.
      </p>
    </div>
  );
}
