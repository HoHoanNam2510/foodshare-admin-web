'use client';

import {
  X,
  Lock,
  Unlock,
  MapPin,
  Image as ImageIcon,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { MOCK_MESSAGES_CHAT_002 } from '@/constants/mockChats';

interface ChatDetailModalProps {
  chat: any;
  onClose: () => void;
  formatDate: (date: Date) => string;
}

export default function ChatDetailModal({
  chat,
  onClose,
  formatDate,
}: ChatDetailModalProps) {
  if (!chat) return null;

  const isLocked = chat.status === 'LOCKED';
  const messages = MOCK_MESSAGES_CHAT_002;

  const handleToggleLock = () => {
    alert(`Đã ${isLocked ? 'mở khóa' : 'khóa'} cuộc hội thoại ${chat._id}`);
    onClose();
  };

  const renderMessageContent = (msg: any) => {
    switch (msg.messageType) {
      case 'IMAGE':
        return (
          <div className="flex flex-col gap-1">
            <div className="w-48 h-32 bg-surface-container rounded-md flex items-center justify-center border border-outline-variant/30">
              <ImageIcon size={24} className="text-gray-400" />
            </div>
            <span className="text-sm">{msg.content}</span>
          </div>
        );
      case 'LOCATION':
        return (
          <div className="flex items-center gap-2 p-2 bg-surface rounded border border-outline-variant/30">
            <MapPin size={20} className="text-error" />
            <div className="flex flex-col text-sm text-gray-800">
              <span className="font-semibold">{msg.content}</span>
              <span className="text-xs text-gray-500">
                {msg.location?.latitude}, {msg.location?.longitude}
              </span>
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
      ></div>

      <div className="relative bg-surface-lowest w-full max-w-3xl h-[85vh] rounded-md shadow-floating overflow-hidden animate-in slide-in-from-bottom-4 fade-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface/50 shrink-0">
          <div>
            <h2 className="text-lg font-sans font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              Hội thoại #{chat._id}
              {isLocked && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-error/10 text-error text-[10px] font-bold uppercase tracking-wider">
                  <Lock size={12} /> Đã khóa
                </span>
              )}
            </h2>
            <p className="text-xs font-body text-gray-500 mt-1">
              Giao dịch liên quan:{' '}
              <span className="font-semibold text-gray-800">
                {chat.transactionId || 'Không có'}
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

        {/* Thông tin người tham gia */}
        <div className="px-6 py-3 bg-surface-container/20 border-b border-outline-variant/30 shrink-0 flex items-center gap-6">
          <span className="text-xs font-label text-gray-500 uppercase tracking-wider">
            Thành viên:
          </span>
          {chat.participants.map((p: any, idx: number) => (
            <div key={p._id} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                {p.fullName.charAt(0)}
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {p.fullName}
              </span>
              {idx === 0 && <span className="text-gray-300 ml-4">|</span>}
            </div>
          ))}
        </div>

        {/* Cảnh báo Admin */}
        <div className="px-6 py-2 bg-yellow-50 border-b border-yellow-200 text-yellow-800 text-xs flex items-center gap-2 shrink-0">
          <AlertTriangle size={14} className="shrink-0" />
          <span>
            Bạn đang xem lịch sử trò chuyện dưới tư cách Quản trị viên để kiểm
            tra vi phạm. Vui lòng bảo mật thông tin.
          </span>
        </div>

        {/* Message Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface space-y-4 font-body">
          {messages.map((msg) => {
            const isLeft = msg.senderId === chat.participants[0]._id;
            const senderName =
              chat.participants.find((p: any) => p._id === msg.senderId)
                ?.fullName || 'Unknown';

            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}
              >
                <span className="text-[11px] text-gray-500 mb-1 px-1">
                  {senderName} •{' '}
                  {msg.createdAt.toLocaleTimeString('vi-VN', {
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
          })}
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
              className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors shadow-sm"
            >
              <Unlock size={16} /> Mở khóa hội thoại
            </button>
          ) : (
            <button
              onClick={handleToggleLock}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-bold bg-error/10 text-error hover:bg-error hover:text-white transition-colors shadow-sm"
            >
              <Lock size={16} /> Khóa khẩn cấp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
