export const MOCK_REPORTS = [
  {
    _id: 'REP-001',
    reporterId: {
      _id: 'USER123',
      fullName: 'Nguyễn Văn A',
      email: 'vana@gmail.com',
    },
    targetType: 'POST',
    targetId: 'POST-099', // Trong thực tế có thể populate thêm title của post
    targetName: 'Tặng 5 hộp cơm gà xối mỡ',
    reason: 'FOOD_SAFETY',
    description:
      'Thức ăn có mùi ôi thiu, không giống như mô tả trong bài đăng. Đề nghị admin kiểm tra lại cửa hàng này.',
    images: ['/placeholder-evidence-1.jpg', '/placeholder-evidence-2.jpg'],
    status: 'PENDING',
    actionTaken: 'NONE',
    createdAt: new Date('2026-03-29T14:30:00'),
    updatedAt: new Date('2026-03-29T14:30:00'),
  },
  {
    _id: 'REP-002',
    reporterId: {
      _id: 'USER456',
      fullName: 'Trần Thị B',
      email: 'thib@gmail.com',
    },
    targetType: 'USER',
    targetId: 'USER-888',
    targetName: 'Lê Văn Lừa Đảo',
    reason: 'SCAM',
    description:
      'Người này yêu cầu tôi chuyển khoản trước tiền ship 50k rồi block số điện thoại của tôi luôn.',
    images: ['/placeholder-evidence-3.jpg'],
    status: 'RESOLVED',
    actionTaken: 'USER_BANNED',
    resolutionNote:
      'Đã xác minh qua tin nhắn chat. Tiến hành khóa vĩnh viễn tài khoản USER-888.',
    resolvedBy: { _id: 'ADMIN01', fullName: 'Jhon Anderson' },
    resolvedAt: new Date('2026-03-28T09:15:00'),
    createdAt: new Date('2026-03-27T10:00:00'),
    updatedAt: new Date('2026-03-28T09:15:00'),
  },
  {
    _id: 'REP-003',
    reporterId: {
      _id: 'USER789',
      fullName: 'Phạm Minh C',
      email: 'minhc@gmail.com',
    },
    targetType: 'TRANSACTION',
    targetId: 'TRX-B2C-055',
    targetName: 'GD Túi mù tiệm bánh ABC',
    reason: 'NO_SHOW',
    description:
      'Đã đến tận nơi theo đúng giờ hẹn nhưng cửa hàng đóng cửa, gọi điện không ai nghe máy.',
    images: [],
    status: 'DISMISSED',
    actionTaken: 'NONE',
    resolutionNote:
      'User đến sai ngày hẹn (đến sớm 1 ngày so với lịch). Report không hợp lệ.',
    resolvedBy: { _id: 'ADMIN01', fullName: 'Jhon Anderson' },
    resolvedAt: new Date('2026-03-26T16:00:00'),
    createdAt: new Date('2026-03-26T15:00:00'),
    updatedAt: new Date('2026-03-26T16:00:00'),
  },
];
