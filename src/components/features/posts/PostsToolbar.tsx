'use client';

import Toolbar, { type ToolbarFilter } from '@/components/ui/Toolbar';

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
  const filters: ToolbarFilter[] = [
    {
      type: 'select',
      value: typeFilter,
      onChange: onTypeFilterChange,
      options: [
        { value: 'ALL', label: 'Tất cả loại hình' },
        { value: 'P2P_FREE', label: 'Chia sẻ miễn phí (P2P)' },
        { value: 'B2C_MYSTERY_BAG', label: 'Túi mù (B2C)' },
      ],
    },
    {
      type: 'select',
      value: statusFilter,
      onChange: onStatusFilterChange,
      options: [
        { value: 'ALL', label: 'Tất cả trạng thái' },
        { value: 'PENDING_REVIEW', label: 'Chờ duyệt' },
        { value: 'AVAILABLE', label: 'Đang hiển thị' },
        { value: 'OUT_OF_STOCK', label: 'Hết hàng' },
        { value: 'HIDDEN', label: 'Đã ẩn' },
        { value: 'REJECTED', label: 'Từ chối' },
      ],
    },
  ];

  return (
    <Toolbar
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      placeholder="Tìm theo tiêu đề, danh mục..."
      filters={filters}
    />
  );
}
