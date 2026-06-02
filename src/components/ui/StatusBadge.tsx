const presets: Record<string, { bg: string; text: string; border: string }> = {
  // Positive
  ACTIVE: {
    bg: 'bg-primary-T95 dark:bg-primary-T20',
    text: 'text-primary dark:text-primary-T80',
    border: 'border-primary/20 dark:border-primary-T40/30',
  },
  AVAILABLE: {
    bg: 'bg-primary-T95 dark:bg-primary-T20',
    text: 'text-primary dark:text-primary-T80',
    border: 'border-primary/20 dark:border-primary-T40/30',
  },
  COMPLETED: {
    bg: 'bg-primary-T95 dark:bg-primary-T20',
    text: 'text-primary dark:text-primary-T80',
    border: 'border-primary/20 dark:border-primary-T40/30',
  },
  RESOLVED: {
    bg: 'bg-primary-T95 dark:bg-primary-T20',
    text: 'text-primary dark:text-primary-T80',
    border: 'border-primary/20 dark:border-primary-T40/30',
  },
  VERIFIED: {
    bg: 'bg-primary-T95 dark:bg-primary-T20',
    text: 'text-primary dark:text-primary-T80',
    border: 'border-primary/20 dark:border-primary-T40/30',
  },
  ACCEPTED: {
    bg: 'bg-primary-T95 dark:bg-primary-T20',
    text: 'text-primary dark:text-primary-T80',
    border: 'border-primary/20 dark:border-primary-T40/30',
  },
  ESCROWED: {
    bg: 'bg-primary-T90 dark:bg-primary-T20',
    text: 'text-primary-T30 dark:text-primary-T80',
    border: 'border-primary/20 dark:border-primary-T40/30',
  },

  // Warning
  PENDING: {
    bg: 'bg-secondary-T95 dark:bg-secondary-T20',
    text: 'text-secondary dark:text-secondary-T80',
    border: 'border-secondary/20 dark:border-secondary-T40/30',
  },
  PENDING_REVIEW: {
    bg: 'bg-secondary-T95 dark:bg-secondary-T20',
    text: 'text-secondary dark:text-secondary-T80',
    border: 'border-secondary/20 dark:border-secondary-T40/30',
  },
  PENDING_KYC: {
    bg: 'bg-secondary-T95 dark:bg-secondary-T20',
    text: 'text-secondary dark:text-secondary-T80',
    border: 'border-secondary/20 dark:border-secondary-T40/30',
  },

  // In-progress
  PROCESSING: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800/50',
  },
  CLOSED: {
    bg: 'bg-primary-T95 dark:bg-primary-T20',
    text: 'text-primary dark:text-primary-T80',
    border: 'border-primary/20 dark:border-primary-T40/30',
  },

  // Negative
  BANNED: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-error dark:text-red-400',
    border: 'border-error/20 dark:border-red-800/50',
  },
  HIDDEN: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-error dark:text-red-400',
    border: 'border-error/20 dark:border-red-800/50',
  },
  REJECTED: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-error dark:text-red-400',
    border: 'border-error/20 dark:border-red-800/50',
  },
  DISPUTED: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-error dark:text-red-400',
    border: 'border-error/20 dark:border-red-800/50',
  },
  REFUNDED: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-error dark:text-red-400',
    border: 'border-error/20 dark:border-red-800/50',
  },

  // Neutral
  DISMISSED: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-error dark:text-red-400',
    border: 'border-error/20 dark:border-red-800/30',
  },
  CANCELLED: {
    bg: 'bg-neutral-T95 dark:bg-gray-800',
    text: 'text-neutral-T40 dark:text-gray-400',
    border: 'border-neutral-T80 dark:border-gray-700',
  },
  NONE: {
    bg: 'bg-neutral-T95 dark:bg-gray-800',
    text: 'text-neutral-T40 dark:text-gray-400',
    border: 'border-neutral-T80 dark:border-gray-700',
  },
  OUT_OF_STOCK: {
    bg: 'bg-neutral-T95 dark:bg-gray-800',
    text: 'text-neutral-T40 dark:text-gray-400',
    border: 'border-neutral-T80 dark:border-gray-700',
  },

  // Roles
  USER: {
    bg: 'bg-neutral-T95 dark:bg-gray-800',
    text: 'text-neutral-T40 dark:text-gray-400',
    border: 'border-neutral-T80 dark:border-gray-700',
  },
  STORE: {
    bg: 'bg-secondary-T95 dark:bg-secondary-T20',
    text: 'text-secondary dark:text-secondary-T80',
    border: 'border-secondary/20 dark:border-secondary-T40/30',
  },
  ADMIN: {
    bg: 'bg-tertiary-T95 dark:bg-tertiary-T20',
    text: 'text-tertiary dark:text-tertiary-T80',
    border: 'border-tertiary/20 dark:border-tertiary-T40/30',
  },

  // Audit types
  POST: {
    bg: 'bg-primary-T95 dark:bg-primary-T20',
    text: 'text-primary dark:text-primary-T80',
    border: 'border-primary/20 dark:border-primary-T40/30',
  },
  TRANSACTION: {
    bg: 'bg-secondary-T95 dark:bg-secondary-T20',
    text: 'text-secondary dark:text-secondary-T80',
    border: 'border-secondary/20 dark:border-secondary-T40/30',
  },
  REPORT: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-error dark:text-red-400',
    border: 'border-error/20 dark:border-red-800/50',
  },
};

const fallback = {
  bg: 'bg-neutral-T95 dark:bg-gray-800',
  text: 'text-neutral-T40 dark:text-gray-400',
  border: 'border-neutral-T80 dark:border-gray-700',
};

interface StatusBadgeProps {
  status: string;
  /** Override displayed text */
  label?: string;
  className?: string;
}

export default function StatusBadge({
  status,
  label,
  className = '',
}: StatusBadgeProps) {
  const style = presets[status] || fallback;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      {label || status}
    </span>
  );
}
