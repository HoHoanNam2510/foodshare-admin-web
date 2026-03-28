// src/constants/mockPosts.ts

export const MOCK_POSTS = [
  {
    _id: 'POST001',
    ownerId: 'USER123',
    ownerName: 'Nguyễn Văn A',
    type: 'P2P_FREE',
    category: 'Thực phẩm chế biến',
    title: 'Tặng 5 hộp cơm gà còn dư sau sự kiện',
    description:
      'Cơm gà xối mỡ đặt dư sau sự kiện công ty. Vẫn còn nóng hổi và đảm bảo vệ sinh.',
    images: ['/placeholder-food.jpg'],
    totalQuantity: 5,
    remainingQuantity: 5,
    price: 0,
    expiryDate: new Date('2026-03-29T12:00:00'),
    pickupTime: {
      start: new Date('2026-03-28T18:00:00'),
      end: new Date('2026-03-28T22:00:00'),
    },
    location: { coordinates: [106.660172, 10.762622] },
    status: 'AVAILABLE',
    createdAt: new Date('2026-03-28T17:00:00'),
  },
  {
    _id: 'POST002',
    ownerId: 'STORE001',
    ownerName: 'Cửa hàng Bánh Mì B',
    type: 'B2C_MYSTERY_BAG',
    category: 'Bánh ngọt',
    title: 'Túi mù bánh mì cuối ngày',
    description:
      'Túi mù bao gồm 3-4 loại bánh ngọt và bánh mì mặn nướng trong ngày. Giá gốc 150k.',
    images: ['/placeholder-bakery.jpg'],
    totalQuantity: 10,
    remainingQuantity: 2,
    price: 49000,
    expiryDate: new Date('2026-03-28T23:59:59'),
    pickupTime: {
      start: new Date('2026-03-28T20:00:00'),
      end: new Date('2026-03-28T23:00:00'),
    },
    location: { coordinates: [106.670172, 10.772622] },
    status: 'PENDING_REVIEW',
    createdAt: new Date('2026-03-28T16:30:00'),
  },
];
