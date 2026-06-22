'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import {
  X,
  Lock,
  Unlock,
  MapPin,
  Image as ImageIcon,
  MessageSquare,
  AlertTriangle,
  Loader2,
  Package,
  FileText,
} from 'lucide-react';
import {
  fetchAdminMessages,
  adminToggleLockConversation,
  type IConversation,
  type IMessage,
  type IRelatedPost,
  type IRelatedTransaction,
} from '@/lib/chatApi';
import UserAvatar from '@/components/ui/UserAvatar';

interface ChatDetailModalProps {
  chat: IConversation | null;
  onClose: () => void;
  onToggleLock: () => void;
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function formatSessionDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
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
      toast.error('Không thể thực hiện thao tác. Vui lòng thử lại.');
    } finally {
      setIsLocking(false);
    }
  };

  const getSenderId = (msg: IMessage) =>
    typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;

  const getSenderName = (msg: IMessage) => {
    if (typeof msg.senderId === 'object') return msg.senderId.fullName;
    return (
      chat.participants.find((p) => p._id === msg.senderId)?.fullName ??
      'Unknown'
    );
  };

  const renderMessageContent = (msg: IMessage) => {
    // Tin đã thu hồi: ẩn nội dung gốc với cả admin — nhất quán với ngữ nghĩa thu
    // hồi (ẩn 2 phía) và tránh lộ URL ảnh đã xóa khỏi Cloudinary.
    if (msg.isRecalled) {
      return (
        <span className="text-sm italic text-gray-500 dark:text-gray-400 wrap-break-word">
          Tin nhắn đã được thu hồi
        </span>
      );
    }

    switch (msg.messageType) {
      case 'IMAGE': {
        // Backend đặt content = imageUrl khi ảnh không có caption → chỉ hiện
        // content khi đó là caption thật, tránh in URL Cloudinary dài gây tràn.
        const hasCaption = msg.content && msg.content !== msg.imageUrl;
        return (
          <div className="flex flex-col gap-1">
            {msg.imageUrl ? (
              <Image
                src={msg.imageUrl}
                alt="Hình ảnh"
                width={192}
                height={128}
                className="object-cover rounded-md border border-outline-variant/30 dark:border-gray-700"
                unoptimized
              />
            ) : (
              <div className="w-48 h-32 bg-surface-container rounded-md flex items-center justify-center border border-outline-variant/30 dark:border-gray-700">
                <ImageIcon size={24} className="text-gray-400" />
              </div>
            )}
            {hasCaption && (
              <span className="text-sm wrap-break-word">{msg.content}</span>
            )}
          </div>
        );
      }
      case 'LOCATION': {
        const coords = msg.location
          ? `${msg.location.latitude.toFixed(6)}, ${msg.location.longitude.toFixed(6)}`
          : msg.content;
        return (
          <div className="flex items-center gap-2 p-2 bg-surface rounded border border-outline-variant/30 dark:border-gray-700">
            <MapPin size={20} className="text-error shrink-0" />
            <div className="flex flex-col text-sm text-gray-800 dark:text-gray-200 min-w-0">
              <span className="font-semibold text-green-700">
                Vị trí được chia sẻ
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 wrap-break-word">
                {coords}
              </span>
            </div>
          </div>
        );
      }
      case 'POST': {
        const p: IRelatedPost | undefined = msg.relatedPost;
        const hasNote =
          msg.content && msg.content !== 'Bài đăng' && msg.content !== 'Post';
        return (
          <div className="flex w-64 flex-col gap-1.5">
            <div className="flex w-64 items-center gap-3 p-2.5 border border-outline-variant/30 dark:border-gray-700 rounded-xl bg-surface dark:bg-gray-800">
              {p?.images?.[0] ? (
                <Image
                  src={p.images[0]}
                  alt={p.title}
                  width={52}
                  height={52}
                  className="h-13 w-13 rounded-lg object-cover shrink-0"
                  unoptimized
                />
              ) : (
                <div className="h-13 w-13 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center shrink-0">
                  <Package
                    size={22}
                    className="text-green-600 dark:text-green-400"
                  />
                </div>
              )}
              <div className="flex flex-col min-w-0 gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                  Bài đăng
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 wrap-break-word line-clamp-2">
                  {p?.title || msg.content}
                </span>
                {p && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {p.type === 'P2P_FREE'
                      ? 'Miễn phí'
                      : p.price
                        ? `${p.price.toLocaleString('vi-VN')}đ`
                        : ''}
                  </span>
                )}
              </div>
            </div>
            {hasNote && (
              <span className="text-sm wrap-break-word whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {msg.content}
              </span>
            )}
          </div>
        );
      }
      case 'TRANSACTION': {
        const txn: IRelatedTransaction | undefined = msg.relatedTransaction;
        const txPost = txn?.postId;
        const STATUS_LABELS: Record<string, string> = {
          PENDING: 'Chờ xác nhận',
          ACCEPTED: 'Đã chấp nhận',
          COMPLETED: 'Hoàn thành',
          CANCELLED: 'Đã hủy',
          REJECTED: 'Từ chối',
        };
        const hasNote =
          msg.content &&
          msg.content !== 'Giao dịch' &&
          msg.content !== 'Transaction';
        return (
          <div className="flex w-64 flex-col gap-1.5">
            <div className="flex w-64 items-center gap-3 p-2.5 border border-outline-variant/30 dark:border-gray-700 rounded-xl bg-surface dark:bg-gray-800">
              {txPost?.images?.[0] ? (
                <Image
                  src={txPost.images[0]}
                  alt={txPost.title}
                  width={52}
                  height={52}
                  className="h-13 w-13 rounded-lg object-cover shrink-0"
                  unoptimized
                />
              ) : (
                <div className="h-13 w-13 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center shrink-0">
                  <FileText
                    size={22}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
              )}
              <div className="flex flex-col min-w-0 gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Giao dịch
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 wrap-break-word">
                  {txPost?.title ||
                    (txn?._id
                      ? `Giao dịch #${txn._id.slice(-8).toUpperCase()}`
                      : msg.content)}
                </span>
                {txn && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {txn.status ? STATUS_LABELS[txn.status] || txn.status : ''}
                    {txn.totalAmount
                      ? ` · ${txn.totalAmount.toLocaleString('vi-VN')}đ`
                      : ''}
                  </span>
                )}
              </div>
            </div>
            {hasNote && (
              <span className="text-sm wrap-break-word whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {msg.content}
              </span>
            )}
          </div>
        );
      }
      default:
        return (
          <span className="text-sm wrap-break-word whitespace-pre-wrap">
            {msg.content}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-surface-lowest dark:bg-gray-900 w-full max-w-3xl h-[85vh] rounded-md shadow-floating overflow-hidden animate-in slide-in-from-bottom-4 fade-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 dark:border-gray-700 bg-surface/50 dark:bg-gray-800/50 shrink-0">
          <div>
            <h2 className="text-lg font-sans font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              Hội thoại #{chat._id.slice(-10).toUpperCase()}
              {isLocked && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-error/10 text-error text-[10px] font-bold uppercase tracking-wider">
                  <Lock size={12} /> Đã khóa
                </span>
              )}
            </h2>
            <p className="text-xs font-body text-gray-500 dark:text-gray-400 mt-1">
              Giao dịch liên quan:{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {chat.transactionId
                  ? chat.transactionId.toString().slice(-8).toUpperCase()
                  : 'Không có'}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-surface-container dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Participants */}
        <div className="px-6 py-3 bg-surface-container/20 dark:bg-gray-800/20 border-b border-outline-variant/30 dark:border-gray-700 shrink-0 flex items-center gap-6">
          <span className="text-xs font-label text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Thành viên:
          </span>
          {chat.participants.map((p, idx) => (
            <div key={p._id} className="flex items-center gap-2">
              <UserAvatar fullName={p.fullName} avatar={p.avatar} size="sm" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {p.fullName}
                </span>
                {p.email && (
                  <span className="text-[10px] text-gray-400">{p.email}</span>
                )}
              </div>
              {idx < chat.participants.length - 1 && (
                <span className="text-gray-300 dark:text-gray-600 ml-4">|</span>
              )}
            </div>
          ))}
        </div>

        {/* Admin warning */}
        <div className="px-6 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800/30 text-yellow-800 dark:text-yellow-300 text-xs flex items-center gap-2 shrink-0">
          <AlertTriangle size={14} className="shrink-0" />
          <span>
            Bạn đang xem lịch sử trò chuyện dưới tư cách Quản trị viên để kiểm
            tra vi phạm. Vui lòng bảo mật thông tin.
          </span>
        </div>

        {/* Message Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface dark:bg-gray-800/50 space-y-4 font-body">
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
            messages.map((msg, index) => {
              const senderId = getSenderId(msg);
              const isLeft = senderId === chat.participants[0]?._id;
              const senderName = getSenderName(msg);
              const prev = messages[index - 1];
              const showSeparator =
                !prev || !isSameDay(msg.createdAt, prev.createdAt);

              return (
                <div key={msg._id}>
                  {showSeparator && (
                    <div className="my-4 flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-surface-container dark:bg-gray-700 text-[11px] font-label text-gray-500 dark:text-gray-400">
                        {formatSessionDate(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}
                  >
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 px-1 flex items-center gap-1.5">
                      <span>
                        {senderName} •{' '}
                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {msg.isEdited && !msg.isRecalled && (
                        <span className="italic text-gray-400 dark:text-gray-500">
                          · đã chỉnh sửa
                        </span>
                      )}
                      {msg.isRecalled && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-error/10 text-error text-[9px] font-bold uppercase tracking-wider">
                          Đã thu hồi
                        </span>
                      )}
                    </span>
                    <div
                      className={`max-w-[70%] min-w-0 wrap-break-word px-4 py-2.5 rounded-2xl ${
                        isLeft
                          ? 'bg-surface-lowest dark:bg-gray-900 border border-outline-variant/30 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                          : 'bg-primary/10 dark:bg-primary/20 text-gray-900 dark:text-gray-100 border border-primary/20 rounded-tr-sm'
                      }`}
                    >
                      {renderMessageContent(msg)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/30 dark:border-gray-700 bg-surface-lowest dark:bg-gray-900 shrink-0 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md font-body text-sm font-semibold text-gray-600 hover:bg-surface-container dark:hover:bg-gray-800 transition-colors"
          >
            Đóng
          </button>
          {isLocked ? (
            <button
              onClick={handleToggleLock}
              disabled={isLocking}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors shadow-sm disabled:opacity-60"
            >
              {isLocking ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Unlock size={16} />
              )}
              Mở khóa hội thoại
            </button>
          ) : (
            <button
              onClick={handleToggleLock}
              disabled={isLocking}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-bold bg-error/10 text-error hover:bg-error hover:text-white transition-colors shadow-sm disabled:opacity-60"
            >
              {isLocking ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Lock size={16} />
              )}
              Khóa khẩn cấp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
