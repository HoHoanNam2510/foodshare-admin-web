// src/constants/mockChats.ts

export const MOCK_CHATS = [
  {
    _id: 'CHAT-001',
    transactionId: 'TRX-P2P-001',
    participants: [
      { _id: 'USER123', fullName: 'Lê Văn D', avatar: '' },
      { _id: 'USER456', fullName: 'Nguyễn Văn A', avatar: '' },
    ],
    lastMessage: {
      content: 'Cảm ơn bạn nhiều nha!',
      messageType: 'TEXT',
      createdAt: new Date('2026-03-29T10:15:00'),
    },
    status: 'ACTIVE',
    createdAt: new Date('2026-03-28T10:00:00'),
    updatedAt: new Date('2026-03-29T10:15:00'),
  },
  {
    _id: 'CHAT-002',
    transactionId: 'TRX-B2C-001',
    participants: [
      { _id: 'USER999', fullName: 'Trần Thị E', avatar: '' },
      { _id: 'STORE001', fullName: 'Cửa hàng Bánh Mì B', avatar: '' },
    ],
    lastMessage: {
      content: 'Bạn gửi định vị qua nhé.',
      messageType: 'TEXT',
      createdAt: new Date('2026-03-28T20:30:00'),
    },
    status: 'LOCKED',
    createdAt: new Date('2026-03-28T20:00:00'),
    updatedAt: new Date('2026-03-28T21:00:00'),
  },
];

// Mock Data chi tiết đoạn chat cho CHAT-002
export const MOCK_MESSAGES_CHAT_002 = [
  {
    _id: 'MSG-001',
    senderId: 'USER999',
    messageType: 'TEXT',
    content: 'Shop ơi, mình đến nơi rồi mà không thấy quán.',
    createdAt: new Date('2026-03-28T20:10:00'),
  },
  {
    _id: 'MSG-002',
    senderId: 'STORE001',
    messageType: 'IMAGE',
    content: 'Quán mình nằm trong hẻm nha, bạn xem hình hướng dẫn nhé.',
    imageUrl: '/placeholder-alley.jpg',
    createdAt: new Date('2026-03-28T20:12:00'),
  },
  {
    _id: 'MSG-003',
    senderId: 'STORE001',
    messageType: 'TEXT',
    content: 'Bạn gửi định vị qua nhé.',
    createdAt: new Date('2026-03-28T20:30:00'),
  },
  {
    _id: 'MSG-004',
    senderId: 'USER999',
    messageType: 'LOCATION',
    content: 'Định vị của tôi',
    location: { latitude: 10.772622, longitude: 106.670172 },
    createdAt: new Date('2026-03-28T20:31:00'),
  },
];
