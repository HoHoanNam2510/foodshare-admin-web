'use client';

import { Search, Filter } from 'lucide-react';

interface PostsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export default function PostsToolbar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
}: PostsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-lowest p-4 rounded-md shadow-sm border border-outline-variant/30">
      <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50 w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary/50 focus-within:-translate-y-0.5 transition-all">
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          placeholder="Tìm theo tiêu đề, danh mục..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-transparent text-sm outline-none w-full font-body text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50">
          <Filter size={16} className="text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="bg-transparent text-sm outline-none font-body text-gray-700 cursor-pointer"
          >
            <option value="ALL">Tất cả loại hình</option>
            <option value="P2P_FREE">Chia sẻ miễn phí (P2P)</option>
            <option value="B2C_MYSTERY_BAG">Túi mù (B2C)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-transparent text-sm outline-none font-body text-gray-700 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING_REVIEW">Chờ duyệt</option>
            <option value="AVAILABLE">Đang hiển thị</option>
            <option value="OUT_OF_STOCK">Hết hàng</option>
            <option value="HIDDEN">Đã ẩn</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>
      </div>
    </div>
  );
}
