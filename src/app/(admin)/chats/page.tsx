'use client';

import { useState, useMemo } from 'react';
import { Eye, MessageSquare } from 'lucide-react';
import ChatDetailModal from '@/components/features/chats/ChatDetailModal';
import { MOCK_CHATS } from '@/constants/mockChats';
import { formatDateTime } from '@/lib/formatters';
import PageHeader from '@/components/ui/PageHeader';
import Toolbar, { type ToolbarFilter } from '@/components/ui/Toolbar';
import DataTable, { type Column } from '@/components/ui/DataTable';
import ActionDropdown from '@/components/ui/ActionDropdown';
import StatusBadge from '@/components/ui/StatusBadge';

type Chat = (typeof MOCK_CHATS)[number];

export default function ChatsManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const filteredChats = useMemo(() => {
    let result = [...MOCK_CHATS];
    result.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c._id.toLowerCase().includes(lowerQuery) ||
          c.participants.some((p: any) =>
            p.fullName.toLowerCase().includes(lowerQuery)
          )
      );
    }
    if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.status === statusFilter);
    }
    return result;
  }, [searchQuery, statusFilter]);

  const columns: Column<Chat>[] = [
    {
      key: 'id',
      header: 'Mã Chat & Giao dịch',
      render: (chat) => (
        <div className="flex flex-col min-w-37.5">
          <span className="font-semibold text-gray-900 flex items-center gap-1.5">
            <MessageSquare size={14} className="text-primary" />
            {chat._id}
          </span>
          <span className="text-xs text-gray-500 mt-0.5">
            Ref: {chat.transactionId || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'participants',
      header: 'Thành viên tham gia',
      render: (chat) => (
        <div className="flex flex-col gap-1">
          {chat.participants.map((p: any) => (
            <div key={p._id} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                {p.fullName.charAt(0)}
              </div>
              <span className="text-sm font-medium text-gray-800 line-clamp-1">
                {p.fullName}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'lastMessage',
      header: 'Tin nhắn mới nhất',
      maxWidth: 'max-w-[250px]',
      render: (chat) =>
        chat.lastMessage ? (
          <span className="text-gray-900 text-sm line-clamp-2 italic">
            &quot;
            {chat.lastMessage.messageType === 'IMAGE'
              ? '[Hình ảnh]'
              : chat.lastMessage.messageType === 'LOCATION'
                ? '[Định vị]'
                : chat.lastMessage.content}
            &quot;
          </span>
        ) : (
          <span className="text-gray-400 italic text-sm">
            Chưa có tin nhắn
          </span>
        ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (chat) => (
        <StatusBadge
          status={chat.status === 'LOCKED' ? 'BANNED' : 'ACTIVE'}
          label={chat.status === 'LOCKED' ? 'Đã khóa' : 'Đang hoạt động'}
        />
      ),
    },
    {
      key: 'updatedAt',
      header: 'Cập nhật',
      render: (chat) => (
        <span className="text-gray-500 text-xs">{formatDateTime(chat.updatedAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      align: 'center',
      render: (chat) => (
        <ActionDropdown
          id={chat._id}
          openId={openDropdownId}
          onToggle={(id) =>
            setOpenDropdownId(openDropdownId === id ? null : id)
          }
          actions={[
            {
              label: 'Xem & Quản lý',
              icon: <Eye size={16} />,
              onClick: () => {
                setSelectedChat(chat);
                setOpenDropdownId(null);
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div
      className="w-full max-w-7xl mx-auto flex flex-col gap-6"
      onClick={() => setOpenDropdownId(null)}
    >
      <PageHeader
        title="Quản Lý Hội Thoại"
        subtitle="Kiểm tra lịch sử trò chuyện và xử lý các cuộc hội thoại vi phạm"
      />

      <Toolbar
        onSearch={setSearchQuery}
        placeholder="Tìm theo Mã chat, Tên người dùng..."
        filters={[
          {
            type: 'select',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'ACTIVE', label: 'Đang hoạt động' },
              { value: 'LOCKED', label: 'Đã khóa' },
            ],
          },
        ] satisfies ToolbarFilter[]}
      />

      <DataTable
        columns={columns}
        data={filteredChats}
        rowKey={(chat) => chat._id}
        emptyMessage="Không tìm thấy hội thoại nào phù hợp."
        className="rounded-md overflow-visible relative"
        tableClassName="min-h-100"
        headerClassName="bg-surface/50 font-label text-xs uppercase text-gray-500"
        bodyClassName="divide-outline-variant/20 text-sm"
        rowClassName="hover:bg-primary/5 transition-colors"
        cellClassName={(col) => (col.key === 'actions' ? 'px-3' : '')}
      />

      <ChatDetailModal
        chat={selectedChat}
        onClose={() => setSelectedChat(null)}
        formatDate={formatDateTime}
      />
    </div>
  );
}
