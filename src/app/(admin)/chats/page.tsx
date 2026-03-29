'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, MoreVertical, Eye, MessageSquare } from 'lucide-react';
import ChatDetailModal from '@/components/features/chats/ChatDetailModal';
import { MOCK_CHATS } from '@/constants/mockChats';

// --- HELPER FORMATS ---
const formatDate = (date: Date) => {
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatusBadge = (status: string) => {
  const isLocked = status === 'LOCKED';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
        isLocked
          ? 'bg-error/10 text-error border-error/20'
          : 'bg-green-50 text-primary border-primary/20'
      }`}
    >
      {isLocked ? 'Đã khóa' : 'Đang hoạt động'}
    </span>
  );
};

export default function ChatsManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);

  const filteredChats = useMemo(() => {
    let result = [...MOCK_CHATS];

    // Sắp xếp theo thời gian cập nhật (tin nhắn mới nhất lên đầu)
    result.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    // 1. Lọc theo Search (Mã Chat, Tên người tham gia)
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

    // 2. Lọc theo Trạng thái (Hoạt động / Bị khóa)
    if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.status === statusFilter);
    }

    return result;
  }, [searchQuery, statusFilter]);

  const closeDropdown = () => setOpenDropdownId(null);

  return (
    <div
      className="w-full max-w-7xl mx-auto flex flex-col gap-6"
      onClick={closeDropdown}
    >
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-2xl font-sans font-bold text-gray-900 leading-tight">
          Quản Lý Hội Thoại
        </h1>
        <p className="text-sm font-body text-gray-500 mt-1">
          Kiểm tra lịch sử trò chuyện và xử lý các cuộc hội thoại vi phạm
        </p>
      </div>

      {/* ── TOOLBAR (SEARCH & FILTERS) ── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-lowest p-4 rounded-md shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50 w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary/50 focus-within:-translate-y-0.5 transition-all">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo Mã chat, Tên người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none w-full font-body text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm outline-none font-body text-gray-700 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="LOCKED">Đã khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <div className="bg-surface-lowest rounded-md shadow-soft border border-outline-variant/30 overflow-visible relative">
        <div className="overflow-x-auto min-h-100">
          <table className="w-full text-left font-body">
            <thead className="bg-surface/50 border-b border-outline-variant/30 font-label text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4 font-semibold rounded-tl-md">
                  Mã Chat & Giao dịch
                </th>
                <th className="px-5 py-4 font-semibold">Thành viên tham gia</th>
                <th className="px-5 py-4 font-semibold">Tin nhắn mới nhất</th>
                <th className="px-5 py-4 font-semibold text-center">
                  Trạng thái
                </th>
                <th className="px-5 py-4 font-semibold">Cập nhật</th>
                <th className="px-3 py-4 font-semibold text-center rounded-tr-md">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm">
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <tr
                    key={chat._id}
                    className="hover:bg-primary/5 transition-colors"
                  >
                    {/* Mã Chat */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col min-w-37.5">
                        <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                          <MessageSquare size={14} className="text-primary" />
                          {chat._id}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          Ref: {chat.transactionId || 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Thành viên tham gia */}
                    <td className="px-5 py-4">
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
                    </td>

                    {/* Tin nhắn mới nhất */}
                    <td className="px-5 py-4 max-w-62.5">
                      {chat.lastMessage ? (
                        <div className="flex flex-col">
                          <span className="text-gray-900 text-sm line-clamp-2 italic">
                            "
                            {chat.lastMessage.messageType === 'IMAGE'
                              ? '[Hình ảnh]'
                              : chat.lastMessage.messageType === 'LOCATION'
                                ? '[Định vị]'
                                : chat.lastMessage.content}
                            "
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-sm">
                          Chưa có tin nhắn
                        </span>
                      )}
                    </td>

                    {/* Trạng thái */}
                    <td className="px-5 py-4 text-center">
                      {getStatusBadge(chat.status)}
                    </td>

                    {/* Ngày cập nhật */}
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {formatDate(chat.updatedAt)}
                    </td>

                    {/* Action */}
                    <td className="px-3 py-4 text-center relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(
                            openDropdownId === chat._id ? null : chat._id
                          );
                        }}
                        className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openDropdownId === chat._id && (
                        <div className="absolute right-8 top-10 w-44 bg-surface-lowest border border-outline-variant/30 rounded-2xl shadow-hover z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                          <button
                            onClick={() => {
                              setSelectedChat(chat);
                              setOpenDropdownId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                          >
                            <Eye size={16} /> Xem & Quản lý
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    Không tìm thấy hội thoại nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── HIỂN THỊ MODAL CHI TIẾT ── */}
      <ChatDetailModal
        chat={selectedChat}
        onClose={() => setSelectedChat(null)}
        formatDate={formatDate}
      />
    </div>
  );
}
