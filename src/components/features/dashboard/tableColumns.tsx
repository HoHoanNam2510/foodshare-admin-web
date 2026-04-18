import StatusBadge from '@/components/ui/StatusBadge';
import UserAvatar from '@/components/ui/UserAvatar';
import type { Column } from '@/components/ui/DataTable';
import type { TabId } from '@/lib/dashboardApi';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const userColumns: Column<any>[] = [
  {
    key: 'fullName',
    header: 'Họ tên',
    render: (row) => (
      <div className="flex items-center gap-3">
        <UserAvatar fullName={row.fullName || '?'} avatar={row.avatar} size="md" />
        <span className="font-semibold text-neutral-T10">{row.fullName}</span>
      </div>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    render: (row) => <span className="text-neutral-T50">{row.email}</span>,
  },
  {
    key: 'role',
    header: 'Vai trò',
    align: 'center',
    render: (row) => <StatusBadge status={row.role} />,
  },
  {
    key: 'status',
    header: 'Trạng thái',
    align: 'center',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'kycStatus',
    header: 'KYC',
    align: 'center',
    render: (row) => <StatusBadge status={row.kycStatus} />,
  },
  {
    key: 'createdAt',
    header: 'Ngày tạo',
    align: 'right',
    sortable: true,
    render: (row) => (
      <span className="text-neutral-T50">{formatDate(row.createdAt)}</span>
    ),
  },
];

const postColumns: Column<any>[] = [
  {
    key: 'title',
    header: 'Tiêu đề',
    maxWidth: 'max-w-[220px]',
    truncate: true,
    render: (row) => (
      <span className="font-semibold text-neutral-T10">{row.title}</span>
    ),
  },
  {
    key: 'owner',
    header: 'Người đăng',
    render: (row) =>
      row.ownerId ? (
        <div className="flex items-center gap-2">
          <UserAvatar fullName={row.ownerId.fullName} avatar={row.ownerId.avatar} size="sm" />
          <span className="text-neutral-T50">{row.ownerId.fullName}</span>
        </div>
      ) : (
        <span className="text-neutral-T60">—</span>
      ),
  },
  {
    key: 'type',
    header: 'Loại',
    align: 'center',
    render: (row) => (
      <span
        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
          row.type === 'P2P_FREE'
            ? 'bg-primary-T95 text-primary border-primary/20'
            : 'bg-secondary-T95 text-secondary border-secondary/20'
        }`}
      >
        {row.type === 'P2P_FREE' ? 'P2P' : 'B2C'}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Trạng thái',
    align: 'center',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'quantity',
    header: 'Số lượng',
    align: 'center',
    render: (row) => (
      <span className="font-semibold text-neutral-T30">
        {row.remainingQuantity}/{row.totalQuantity}
      </span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Ngày tạo',
    align: 'right',
    sortable: true,
    render: (row) => (
      <span className="text-neutral-T50">{formatDate(row.createdAt)}</span>
    ),
  },
];

const transactionColumns: Column<any>[] = [
  {
    key: 'post',
    header: 'Bài đăng',
    maxWidth: 'max-w-[180px]',
    truncate: true,
    render: (row) => (
      <span className="font-semibold text-neutral-T10">
        {row.postId?.title || '—'}
      </span>
    ),
  },
  {
    key: 'requester',
    header: 'Người yêu cầu',
    render: (row) =>
      row.requesterId ? (
        <div className="flex items-center gap-2">
          <UserAvatar fullName={row.requesterId.fullName} avatar={row.requesterId.avatar} size="sm" />
          <span className="text-neutral-T50">{row.requesterId.fullName}</span>
        </div>
      ) : (
        <span className="text-neutral-T60">—</span>
      ),
  },
  {
    key: 'owner',
    header: 'Chủ bài',
    render: (row) =>
      row.ownerId ? (
        <div className="flex items-center gap-2">
          <UserAvatar fullName={row.ownerId.fullName} avatar={row.ownerId.avatar} size="sm" />
          <span className="text-neutral-T50">{row.ownerId.fullName}</span>
        </div>
      ) : (
        <span className="text-neutral-T60">—</span>
      ),
  },
  {
    key: 'type',
    header: 'Loại',
    align: 'center',
    render: (row) => (
      <span
        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
          row.type === 'REQUEST'
            ? 'bg-primary-T95 text-primary border-primary/20'
            : 'bg-secondary-T95 text-secondary border-secondary/20'
        }`}
      >
        {row.type === 'REQUEST' ? 'Xin' : 'Mua'}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Trạng thái',
    align: 'center',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'amount',
    header: 'Số tiền',
    align: 'right',
    render: (row) => (
      <span className="font-semibold text-neutral-T30">
        {row.totalAmount
          ? `${row.totalAmount.toLocaleString('vi-VN')}đ`
          : 'Miễn phí'}
      </span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Ngày tạo',
    align: 'right',
    sortable: true,
    render: (row) => (
      <span className="text-neutral-T50">{formatDate(row.createdAt)}</span>
    ),
  },
];

const reportColumns: Column<any>[] = [
  {
    key: 'reporter',
    header: 'Người báo cáo',
    render: (row) =>
      row.reporterId ? (
        <div className="flex items-center gap-2">
          <UserAvatar fullName={row.reporterId.fullName} avatar={row.reporterId.avatar} size="sm" />
          <span className="font-semibold text-neutral-T10">{row.reporterId.fullName}</span>
        </div>
      ) : (
        <span className="text-neutral-T60">—</span>
      ),
  },
  {
    key: 'targetType',
    header: 'Loại mục tiêu',
    align: 'center',
    render: (row) => <StatusBadge status={row.targetType} />,
  },
  {
    key: 'reason',
    header: 'Lý do',
    render: (row) => (
      <span className="text-neutral-T50 text-xs">{row.reason}</span>
    ),
  },
  {
    key: 'status',
    header: 'Trạng thái',
    align: 'center',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'actionTaken',
    header: 'Hành động',
    align: 'center',
    render: (row) => <StatusBadge status={row.actionTaken} />,
  },
  {
    key: 'createdAt',
    header: 'Ngày tạo',
    align: 'right',
    sortable: true,
    render: (row) => (
      <span className="text-neutral-T50">{formatDate(row.createdAt)}</span>
    ),
  },
];

const auditColumns: Column<any>[] = [
  {
    key: '_type',
    header: 'Loại',
    align: 'center',
    render: (row) => <StatusBadge status={row._type} />,
  },
  {
    key: 'info',
    header: 'Thông tin',
    render: (row) =>
      row.fullName ? (
        <div className="flex items-center gap-2">
          <UserAvatar fullName={row.fullName} avatar={row.avatar} size="sm" />
          <span className="font-semibold text-neutral-T10">{row.fullName}</span>
        </div>
      ) : (
        <span className="font-semibold text-neutral-T10">
          {row.title || row.targetType || `${row.type} — ${row.status}`}
        </span>
      ),
  },
  {
    key: 'status',
    header: 'Trạng thái',
    align: 'center',
    render: (row) =>
      row.status ? (
        <StatusBadge status={row.status} />
      ) : (
        <span className="text-neutral-T60">—</span>
      ),
  },
  {
    key: 'updatedAt',
    header: 'Cập nhật lúc',
    align: 'right',
    sortable: true,
    render: (row) => (
      <span className="text-neutral-T50">{formatDateTime(row.updatedAt)}</span>
    ),
  },
];

export function getColumnsForTab(tab: TabId): Column<any>[] {
  const map: Record<TabId, Column<any>[]> = {
    users: userColumns,
    posts: postColumns,
    transactions: transactionColumns,
    reports: reportColumns,
    audits: auditColumns,
  };
  return map[tab];
}

export function getRowKey(_tab: TabId) {
  return (row: any, index: number) =>
    row._id ? `${row._id}-${index}` : `row-${index}`;
}
