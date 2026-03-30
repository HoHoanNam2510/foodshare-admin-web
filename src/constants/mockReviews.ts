export const MOCK_REVIEWS = [
  {
    _id: 'REV-001',
    transactionId: {
      _id: 'TRX-P2P-001',
      type: 'REQUEST',
      post: { title: 'Tặng 5 hộp cơm gà còn dư' },
    },
    reviewer: {
      _id: 'USER123',
      fullName: 'Lê Văn D',
      avatar: '',
    },
    reviewee: {
      _id: 'USER456',
      fullName: 'Nguyễn Văn A',
      avatar: '',
    },
    rating: 5,
    feedback:
      'Anh/chị rất nhiệt tình, đồ ăn còn tươi ngon. Rất cảm ơn vì đã chia sẻ!',
    createdAt: new Date('2026-03-29T16:00:00'),
  },
  {
    _id: 'REV-002',
    transactionId: {
      _id: 'TRX-B2C-001',
      type: 'ORDER',
      post: { title: 'Túi mù bánh mì cuối ngày' },
    },
    reviewer: {
      _id: 'USER123',
      fullName: 'Lê Văn D',
      avatar: '',
    },
    reviewee: {
      _id: 'STORE001',
      fullName: 'Cửa hàng Bánh Mì B',
      avatar: '',
    },
    rating: 4,
    feedback:
      'Bánh mì ngon, nhưng túi mù chỉ có 2 ổ thay vì 3 như mô tả. Vẫn ổn tổng thể.',
    createdAt: new Date('2026-03-29T10:30:00'),
  },
  {
    _id: 'REV-003',
    transactionId: {
      _id: 'TRX-P2P-003',
      type: 'REQUEST',
      post: { title: 'Tặng mớ rau cải nhà trồng' },
    },
    reviewer: {
      _id: 'USER789',
      fullName: 'Trần Thị E',
      avatar: '',
    },
    reviewee: {
      _id: 'USER456',
      fullName: 'Nguyễn Văn A',
      avatar: '',
    },
    rating: 3,
    feedback:
      'Rau hơi héo, không tươi như hình đăng. Nhưng cảm ơn vì đã cho miễn phí.',
    createdAt: new Date('2026-03-28T14:00:00'),
  },
  {
    _id: 'REV-004',
    transactionId: {
      _id: 'TRX-B2C-005',
      type: 'ORDER',
      post: { title: 'Hộp su kem thanh lý' },
    },
    reviewer: {
      _id: 'USER999',
      fullName: 'Hoàng Văn F',
      avatar: '',
    },
    reviewee: {
      _id: 'STORE002',
      fullName: 'Tiệm bánh C',
      avatar: '',
    },
    rating: 1,
    feedback:
      'Su kem bị hỏng, có mùi chua. Rất thất vọng, yêu cầu admin xem xét cửa hàng này.',
    createdAt: new Date('2026-03-27T20:15:00'),
  },
  {
    _id: 'REV-005',
    transactionId: {
      _id: 'TRX-P2P-008',
      type: 'REQUEST',
      post: { title: 'Tặng 10 chai nước suối' },
    },
    reviewer: {
      _id: 'USER456',
      fullName: 'Nguyễn Văn A',
      avatar: '',
    },
    reviewee: {
      _id: 'USER123',
      fullName: 'Lê Văn D',
      avatar: '',
    },
    rating: 5,
    feedback: 'Bạn đến đúng giờ, thái độ rất lịch sự. 10 điểm!',
    createdAt: new Date('2026-03-26T09:00:00'),
  },
  {
    _id: 'REV-006',
    transactionId: {
      _id: 'TRX-B2C-010',
      type: 'ORDER',
      post: { title: 'Túi mù trái cây mix' },
    },
    reviewer: {
      _id: 'USER321',
      fullName: 'Phạm Minh C',
      avatar: '',
    },
    reviewee: {
      _id: 'STORE003',
      fullName: 'Trái Cây Sạch Sài Gòn',
      avatar: '',
    },
    rating: 2,
    feedback:
      'Trái cây bị dập nhiều quá, không đáng giá tiền. Hơi buồn vì kỳ vọng cao hơn.',
    createdAt: new Date('2026-03-25T17:45:00'),
  },
  {
    _id: 'REV-007',
    transactionId: {
      _id: 'TRX-P2P-012',
      type: 'REQUEST',
      post: { title: 'Cho bớt gạo ST25 5kg' },
    },
    reviewer: {
      _id: 'USER654',
      fullName: 'Võ Thị G',
      avatar: '',
    },
    reviewee: {
      _id: 'USER456',
      fullName: 'Nguyễn Văn A',
      avatar: '',
    },
    rating: 4,
    feedback: 'Gạo ngon, đóng gói cẩn thận. Cảm ơn nhiều ạ!',
    createdAt: new Date('2026-03-24T11:30:00'),
  },
];
