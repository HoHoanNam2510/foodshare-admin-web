import axiosInstance from './axios';

export interface ICategory {
  _id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  applyTo: 'P2P_FREE' | 'B2C_MYSTERY_BAG' | 'BOTH';
  isSystem: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  slug: string;
  name: string;
  icon?: string;
  color: string;
  applyTo: 'P2P_FREE' | 'B2C_MYSTERY_BAG' | 'BOTH';
  sortOrder?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  icon?: string;
  color?: string;
  applyTo?: 'P2P_FREE' | 'B2C_MYSTERY_BAG' | 'BOTH';
  sortOrder?: number;
  isActive?: boolean;
}

interface AdminCategoriesResult {
  categories: ICategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchAdminCategories(): Promise<ICategory[]> {
  const res = await axiosInstance.get<{
    success: boolean;
    data: AdminCategoriesResult;
  }>('/categories/admin');
  return res.data.data.categories;
}

export async function createCategory(
  payload: CreateCategoryPayload
): Promise<ICategory> {
  const res = await axiosInstance.post<{ success: boolean; data: ICategory }>(
    '/categories/admin',
    payload
  );
  return res.data.data;
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload
): Promise<ICategory> {
  const res = await axiosInstance.put<{ success: boolean; data: ICategory }>(
    `/categories/admin/${id}`,
    payload
  );
  return res.data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await axiosInstance.delete(`/categories/admin/${id}`);
}
