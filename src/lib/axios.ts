import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đính kèm Admin Token vào mỗi request
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Xử lý token hết hạn hoặc không hợp lệ → redirect về login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== 'undefined' &&
      (error?.response?.status === 401 || error?.response?.status === 403)
    ) {
      // Chỉ redirect nếu đang ở trang admin (không phải trang login)
      if (!window.location.pathname.startsWith('/login')) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
