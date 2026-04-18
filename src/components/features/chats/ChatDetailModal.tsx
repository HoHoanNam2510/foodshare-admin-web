'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  MapPin,
  Image as ImageIcon,
  MessageSquare,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  fetchAdminMessages,
  adminToggleLockConversation,
  type IConversation,
  type IMessage,
} from '@/lib/chatApi';

interface ChatDetailModalProps {
  chat: IConversation | null;
  onClose: () => void;
  onToggleLock: () => void;
}

export default function ChatDetailModal({
  chat,
  onClose,
  onToggleLock,
}: ChatDetailModalProps) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  useEffect(() => {
    if (!chat) {
      setMessages([]);
      return;
    }
    setIsLoadingMessages(true);
    fetchAdminMessages(chat._id)
      .then((res) => setMessages(res.data))
      .catch(() => setMessages([]))
      .finally(() => setIsLoadingMessages(false));
  }, [chat]);

  if (!chat) return null;

  const isLocked = chat.status === 'LOCKED';

  const handleToggleLock = async () => {
    setIsLocking(true);
    try {
      await adminToggleLockConversation(chat._id);
      onToggleLock();
      onClose();
    } catch {
      alert('Không thể thực hiện thao tác. Vui lòng thử lại.');
    } finally {
      setIsLocking(false);
    }
  };

  const getSenderId = (msg: IMessage) =>
    typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;

  const getSenderName = (msg: IMessage) => {
    if (typeof msg.senderId === 'object') return msg.senderId.fullName;
    return chat.participants.find((p) => p._id === msg.senderId)?.fullName ?? 'Unknown';
  };

  const renderMessageContent = (msg: IMessage) => {
    switch (msg.messageType) {
      case 'IMAGE':
        return (
          <div className="flex flex-col gap-1">
            {msg.imageUrl ? (
              <img
                src={msg.imageUrl}
                alt="Hình ảnh"
                className="w-48 h-32 object-cover rounded-md border border-outline-variant/30"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="w-48 h-32 bg-surface-container rounded-md flex items-center justify-center border border-outline-variant/30">
                <ImageIcon size={24} className="text-gray-400" />
              </div>
            )}
            {msg.content && <span className="text-sm">{msg.content}</span>}
          </div>
        );
      case 'LOCATION':
        return (
          <div className="flex items-center gap-2 p-2 bg-surface rounded border border-outline-variant/30">
            <MapPin size={20} className="text-error" />
            <div className="flex flex-col text-sm text-gray-800">
              <span className="font-semibold">{msg.content}</span>
              {msg.location && (
                <span className="text-xs text-gray-500">
                  {msg.location.latitude}, {msg.location.longitude}
                </span>
              )}
            </div>
          </div>
        );
      default:
        return <span className="text-sm">{msg.content}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-surface-lowest w-full max-w-3xl h-[85vh] rounded-md shadow-floating overflow-hidden animate-in slide-in-from-bottom-4 fade-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface/50 shrink-0">
          <div>
            <h2 className="text-lg font-sans font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              Hội thoại #{chat._id.slice(-10).toUpperCase()}
              {isLocked && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-error/10 text-error text-[10px] font-bold uppercase tracking-wider">
                  <Lock size={12} /> Đã khóa
                </span>
              )}
            </h2>
            <p className="text-xs font-body text-gray-500 mt-1">
              Giao dịch liên quan:{' '}
              <span className="font-semibold text-gray-800">
                {chat.transactionId ? chat.transactionId.toString().slice(-8).toUpperCase() : 'Không có'}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-800 hover:bg-surface-container rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Participants */}
        <div className="px-6 py-3 bg-surface-container/20 border-b border-outline-variant/30 shrink-0 flex items-center gap-6">
          <span className="text-xs font-label text-gray-500 uppercase tracking-wider">
            Thành viên:
          </span>
          {chat.participants.map((p, idx) => (
            <div key={p._id} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                {p.fullName.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">{p.fullName}</span>
                {p.email && <span className="text-[10px] text-gray-400">{p.email}</span>}
              </div>
              {idx < chat.participants.length - 1 && (
                <span className="text-gray-300 ml-4">|</span>
              )}
            </div>
          ))}
        </div>

        {/* Admin warning */}
        <div className="px-6 py-2 bg-yellow-50 border-b border-yellow-200 text-yellow-800 text-xs flex items-center gap-2 shrink-0">
          <AlertTriangle size={14} className="shrink-0" />
          <span>
            Bạn đang xem lịch sử trò chuyện dưới tư cách Quản trị viên để kiểm
            tra vi phạm. Vui lòng bảo mật thông tin.
          </span>
        </div>

        {/* Message Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface space-y-4 font-body">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full text-gray-400 gap-2">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Đang tải tin nhắn...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Chưa có tin nhắn nào.
            </div>
          ) : (
            messages.map((msg) => {
              const senderId = getSenderId(msg);
              const isLeft = senderId === chat.participants[0]?._id;
              const senderName = getSenderName(msg);

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}
                >
                  <span className="text-[11px] text-gray-500 mb-1 px-1">
                    {senderName} •{' '}
                    {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <div
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                      isLeft
                        ? 'bg-surface-lowest border border-outline-variant/30 text-gray-800 rounded-tl-sm'
                        : 'bg-primary/10 text-gray-900 border border-primary/20 rounded-tr-sm'
                    }`}
                  >
                    {renderMessageContent(msg)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-lowest shrink-0 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md font-body text-sm font-semibold text-gray-600 hover:bg-surface-container transition-colors"
          >
            Đóng
          </button>
          {isLocked ? (
            <button
              onClick={handleToggleLock}
              disabled={isLocking}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors shadow-sm disabled:opacity-60"
            >
              {isLocking ? <Loader2 size={16} className="animate-spin" /> : <Unlock size={16} />}
              Mở khóa hội thoại
            </button>
          ) : (
            <button
              onClick={handleToggleLock}
              disabled={isLocking}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-bold bg-error/10 text-error hover:bg-error hover:text-white transition-colors shadow-sm disabled:opacity-60"
            >
              {isLocking ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              Khóa khẩn cấp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
