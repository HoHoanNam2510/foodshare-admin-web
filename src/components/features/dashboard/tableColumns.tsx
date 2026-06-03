import StatusBadge from '@/components/ui/StatusBadge';
import UserAvatar from '@/components/ui/UserAvatar';
import type { Column } from '@/components/ui/DataTable';
import type { TabId } from '@/lib/dashboardApi';

// ─── Row types ───────────────────────────────────────────────

interface UserRef {
  fullName: string;
  avatar?: string;
}

interface PostRef {
  title: string;
}

export interface UserRow {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: string;
  status: string;
  kycStatus: string;
  createdAt: string;
}

export interface PostRow {
  _id: string;
  title: string;
  type: string;
  status: string;
  remainingQuantity: number;
  totalQuantity: number;
  createdAt: string;
  ownerId?: UserRef;
}

export interface TransactionRow {
  _id: string;
  type: string;
  status: string;
  totalAmount?: number;
  createdAt: string;
  postId?: PostRef;
  postSnapshot?: { title: string };
  requesterId?: UserRef;
  ownerId?: UserRef;
}

export interface ReportRow {
  _id: string;
  targetType: string;
  reason: string;
  status: string;
  actionTaken: string;
  createdAt: string;
  reporterId?: UserRef;
}

export interface AuditRow {
  _id: string;
  _type: string;
  fullName?: string;
  avatar?: string;
  title?: string;
  targetType?: string;
  type?: string;
  status?: string;
  updatedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()} ${hour}:${min}`;
}

const userColumns: Column<UserRow>[] = [
  {
    key: 'fullName',
    header: 'Họ tên',
    render: (row) => (
      <div className="flex items-center gap-3">
        <UserAvatar
          fullName={row.fullName || '?'}
          avatar={row.avatar}
          size="md"
        />
        <span className="font-semibold text-neutral-T10 dark:text-gray-100">
          {row.fullName}
        </span>
      </div>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    render: (row) => (
      <span className="text-neutral-T50 dark:text-gray-400">{row.email}</span>
    ),
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
      <span className="text-neutral-T50 dark:text-gray-400">
        {formatDate(row.createdAt)}
      </span>
    ),
  },
];

const postColumns: Column<PostRow>[] = [
  {
    key: 'title',
    header: 'Tiêu đề',
    maxWidth: 'max-w-[220px]',
    truncate: true,
    render: (row) => (
      <span className="font-semibold text-neutral-T10 dark:text-gray-100">
        {row.title}
      </span>
    ),
  },
  {
    key: 'owner',
    header: 'Người đăng',
    render: (row) =>
      row.ownerId ? (
        <div className="flex items-center gap-2">
          <UserAvatar
            fullName={row.ownerId.fullName}
            avatar={row.ownerId.avatar}
            size="sm"
          />
          <span className="text-neutral-T50 dark:text-gray-400">
            {row.ownerId.fullName}
          </span>
        </div>
      ) : (
        <span className="text-neutral-T60 dark:text-gray-500">—</span>
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
      <span className="font-semibold text-neutral-T30 dark:text-gray-300">
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
      <span className="text-neutral-T50 dark:text-gray-400">
        {formatDate(row.createdAt)}
      </span>
    ),
  },
];

const transactionColumns: Column<TransactionRow>[] = [
  {
    key: 'post',
    header: 'Bài đăng',
    maxWidth: 'max-w-[180px]',
    truncate: true,
    render: (row) => {
      const title = row.postId?.title || row.postSnapshot?.title;
      return title ? (
        <span className="font-semibold text-neutral-T10 dark:text-gray-100">
          {title}
        </span>
      ) : (
        <span className="text-neutral-T60 dark:text-gray-500 italic text-xs">
          [Đã xóa]
        </span>
      );
    },
  },
  {
    key: 'requester',
    header: 'Người yêu cầu',
    render: (row) =>
      row.requesterId ? (
        <div className="flex items-center gap-2">
          <UserAvatar
            fullName={row.requesterId.fullName}
            avatar={row.requesterId.avatar}
            size="sm"
          />
          <span className="text-neutral-T50 dark:text-gray-400">
            {row.requesterId.fullName}
          </span>
        </div>
      ) : (
        <span className="text-neutral-T60 dark:text-gray-500">—</span>
      ),
  },
  {
    key: 'owner',
    header: 'Chủ bài',
    render: (row) =>
      row.ownerId ? (
        <div className="flex items-center gap-2">
          <UserAvatar
            fullName={row.ownerId.fullName}
            avatar={row.ownerId.avatar}
            size="sm"
          />
          <span className="text-neutral-T50 dark:text-gray-400">
            {row.ownerId.fullName}
          </span>
        </div>
      ) : (
        <span className="text-neutral-T60 dark:text-gray-500">—</span>
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
      <span className="font-semibold text-neutral-T30 dark:text-gray-300">
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
      <span className="text-neutral-T50 dark:text-gray-400">
        {formatDate(row.createdAt)}
      </span>
    ),
  },
];

const reportColumns: Column<ReportRow>[] = [
  {
    key: 'reporter',
    header: 'Người báo cáo',
    render: (row) =>
      row.reporterId ? (
        <div className="flex items-center gap-2">
          <UserAvatar
            fullName={row.reporterId.fullName}
            avatar={row.reporterId.avatar}
            size="sm"
          />
          <span className="font-semibold text-neutral-T10 dark:text-gray-100">
            {row.reporterId.fullName}
          </span>
        </div>
      ) : (
        <span className="text-neutral-T60 dark:text-gray-500">—</span>
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
      <span className="text-neutral-T50 dark:text-gray-400 text-xs">
        {row.reason}
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
      <span className="text-neutral-T50 dark:text-gray-400">
        {formatDate(row.createdAt)}
      </span>
    ),
  },
];

const auditColumns: Column<AuditRow>[] = [
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
          <span className="font-semibold text-neutral-T10 dark:text-gray-100">
            {row.fullName}
          </span>
        </div>
      ) : (
        <span className="font-semibold text-neutral-T10 dark:text-gray-100">
          {row.title ||
            row.targetType ||
            (row.type || row.status
              ? `${row.type ?? ''} — ${row.status ?? ''}`
              : '—')}
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
        <span className="text-neutral-T60 dark:text-gray-500">—</span>
      ),
  },
  {
    key: 'updatedAt',
    header: 'Cập nhật lúc',
    align: 'right',
    sortable: true,
    render: (row) => (
      <span className="text-neutral-T50 dark:text-gray-400">
        {formatDateTime(row.updatedAt)}
      </span>
    ),
  },
];

// ─── CSV column definitions ──────────────────────────────────

export interface CsvColumn {
  header: string;
  getValue: (row: unknown) => string;
}

const userCsvColumns: CsvColumn[] = [
  { header: 'Họ tên', getValue: (row) => (row as UserRow).fullName || '' },
  { header: 'Email', getValue: (row) => (row as UserRow).email || '' },
  { header: 'Vai trò', getValue: (row) => (row as UserRow).role || '' },
  { header: 'Trạng thái', getValue: (row) => (row as UserRow).status || '' },
  { header: 'KYC', getValue: (row) => (row as UserRow).kycStatus || '' },
  {
    header: 'Ngày tạo',
    getValue: (row) => formatDate((row as UserRow).createdAt),
  },
];

const postCsvColumns: CsvColumn[] = [
  { header: 'Tiêu đề', getValue: (row) => (row as PostRow).title || '' },
  {
    header: 'Người đăng',
    getValue: (row) => (row as PostRow).ownerId?.fullName || '',
  },
  {
    header: 'Loại bài',
    getValue: (row) =>
      (row as PostRow).type === 'P2P_FREE' ? 'P2P Miễn phí' : 'B2C Mystery Bag',
  },
  { header: 'Trạng thái', getValue: (row) => (row as PostRow).status || '' },
  {
    header: 'Còn lại',
    getValue: (row) => String((row as PostRow).remainingQuantity ?? ''),
  },
  {
    header: 'Tổng số',
    getValue: (row) => String((row as PostRow).totalQuantity ?? ''),
  },
  {
    header: 'Ngày tạo',
    getValue: (row) => formatDate((row as PostRow).createdAt),
  },
];

const transactionCsvColumns: CsvColumn[] = [
  {
    header: 'Bài đăng',
    getValue: (row) => {
      const r = row as TransactionRow;
      return r.postId?.title || r.postSnapshot?.title || '[Đã xóa]';
    },
  },
  {
    header: 'Người yêu cầu',
    getValue: (row) => (row as TransactionRow).requesterId?.fullName || '',
  },
  {
    header: 'Chủ bài',
    getValue: (row) => (row as TransactionRow).ownerId?.fullName || '',
  },
  {
    header: 'Loại GD',
    getValue: (row) =>
      (row as TransactionRow).type === 'REQUEST' ? 'Xin (P2P)' : 'Mua (B2C)',
  },
  {
    header: 'Trạng thái',
    getValue: (row) => (row as TransactionRow).status || '',
  },
  {
    header: 'Số tiền (VNĐ)',
    getValue: (row) => {
      const r = row as TransactionRow;
      return r.totalAmount ? String(r.totalAmount) : '0';
    },
  },
  {
    header: 'Ngày tạo',
    getValue: (row) => formatDate((row as TransactionRow).createdAt),
  },
];

const reportCsvColumns: CsvColumn[] = [
  {
    header: 'Người báo cáo',
    getValue: (row) => (row as ReportRow).reporterId?.fullName || '',
  },
  {
    header: 'Loại mục tiêu',
    getValue: (row) => (row as ReportRow).targetType || '',
  },
  { header: 'Lý do', getValue: (row) => (row as ReportRow).reason || '' },
  { header: 'Trạng thái', getValue: (row) => (row as ReportRow).status || '' },
  {
    header: 'Hành động',
    getValue: (row) => (row as ReportRow).actionTaken || '',
  },
  {
    header: 'Ngày tạo',
    getValue: (row) => formatDate((row as ReportRow).createdAt),
  },
];

const auditCsvColumns: CsvColumn[] = [
  { header: 'Loại', getValue: (row) => (row as AuditRow)._type || '' },
  {
    header: 'Thông tin',
    getValue: (row) => {
      const r = row as AuditRow;
      return (
        r.fullName ??
        r.title ??
        r.targetType ??
        (r.type || r.status ? `${r.type ?? ''} - ${r.status ?? ''}` : '')
      );
    },
  },
  { header: 'Trạng thái', getValue: (row) => (row as AuditRow).status || '—' },
  {
    header: 'Cập nhật lúc',
    getValue: (row) => formatDateTime((row as AuditRow).updatedAt),
  },
];

export function getCsvColumnsForTab(tab: TabId): CsvColumn[] {
  const map: Record<TabId, CsvColumn[]> = {
    users: userCsvColumns,
    posts: postCsvColumns,
    transactions: transactionCsvColumns,
    reports: reportCsvColumns,
    audits: auditCsvColumns,
  };
  return map[tab];
}

export function getColumnsForTab(tab: TabId): Column<unknown>[] {
  const map: Record<TabId, Column<unknown>[]> = {
    users: userColumns as Column<unknown>[],
    posts: postColumns as Column<unknown>[],
    transactions: transactionColumns as Column<unknown>[],
    reports: reportColumns as Column<unknown>[],
    audits: auditColumns as Column<unknown>[],
  };
  return map[tab];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getRowKey(_tab: TabId) {
  return (row: unknown, index: number) => {
    const r = row as Record<string, unknown>;
    return r._id ? `${String(r._id)}-${index}` : `row-${index}`;
  };
}
