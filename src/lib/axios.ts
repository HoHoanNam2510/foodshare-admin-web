import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Bạn có thể thêm Interceptors ở đây sau này để tự động đính kèm Token đăng nhập vào header
// axiosInstance.interceptors.request.use(...)

export default axiosInstance;
