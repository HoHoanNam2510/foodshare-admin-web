import { create } from 'zustand';
import { loginApi, type LoginResponse } from '@/lib/authApi';

interface AdminUser {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  [key: string]: unknown;
}

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
}

const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const data: LoginResponse = await loginApi(email, password);

      if (!data.success) {
        set({ isLoading: false, error: data.message });
        return;
      }

      // Chỉ cho phép ADMIN đăng nhập vào trang quản trị
      if (data.data.role !== 'ADMIN') {
        set({
          isLoading: false,
          error: 'Bạn không có quyền truy cập trang quản trị',
        });
        return;
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.data));

      set({
        token: data.token,
        user: data.data,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Đăng nhập thất bại';
      set({ isLoading: false, error: message });
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null, error: null });
  },

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as AdminUser;
        set({ token, user });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
  },
}));
