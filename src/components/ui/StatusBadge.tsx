const presets: Record<string, { bg: string; text: string; border: string }> = {
  // Positive
  ACTIVE:    { bg: 'bg-primary-T95',  text: 'text-primary',     border: 'border-primary/20' },
  AVAILABLE: { bg: 'bg-primary-T95',  text: 'text-primary',     border: 'border-primary/20' },
  COMPLETED: { bg: 'bg-primary-T95',  text: 'text-primary',     border: 'border-primary/20' },
  RESOLVED:  { bg: 'bg-primary-T95',  text: 'text-primary',     border: 'border-primary/20' },
  VERIFIED:  { bg: 'bg-primary-T95',  text: 'text-primary',     border: 'border-primary/20' },
  ACCEPTED:  { bg: 'bg-primary-T95',  text: 'text-primary',     border: 'border-primary/20' },
  ESCROWED:  { bg: 'bg-primary-T90',  text: 'text-primary-T30', border: 'border-primary/20' },

  // Warning
  PENDING:        { bg: 'bg-secondary-T95', text: 'text-secondary',     border: 'border-secondary/20' },
  PENDING_REVIEW: { bg: 'bg-secondary-T95', text: 'text-secondary',     border: 'border-secondary/20' },
  PENDING_KYC:    { bg: 'bg-secondary-T95', text: 'text-secondary',     border: 'border-secondary/20' },

  // Negative
  BANNED:   { bg: 'bg-red-50',  text: 'text-error',   border: 'border-error/20' },
  HIDDEN:   { bg: 'bg-red-50',  text: 'text-error',   border: 'border-error/20' },
  REJECTED: { bg: 'bg-red-50',  text: 'text-error',   border: 'border-error/20' },
  DISPUTED: { bg: 'bg-red-50',  text: 'text-error',   border: 'border-error/20' },
  REFUNDED: { bg: 'bg-red-50',  text: 'text-error',   border: 'border-error/20' },

  // Neutral
  DISMISSED:   { bg: 'bg-neutral-T95', text: 'text-neutral-T40', border: 'border-neutral-T80' },
  CANCELLED:   { bg: 'bg-neutral-T95', text: 'text-neutral-T40', border: 'border-neutral-T80' },
  NONE:        { bg: 'bg-neutral-T95', text: 'text-neutral-T40', border: 'border-neutral-T80' },
  OUT_OF_STOCK:{ bg: 'bg-neutral-T95', text: 'text-neutral-T40', border: 'border-neutral-T80' },

  // Roles
  USER:  { bg: 'bg-neutral-T95',      text: 'text-neutral-T40', border: 'border-neutral-T80' },
  STORE: { bg: 'bg-secondary-T95',    text: 'text-secondary',   border: 'border-secondary/20' },
  ADMIN: { bg: 'bg-tertiary-T95',     text: 'text-tertiary',    border: 'border-tertiary/20' },

  // Audit types
  POST:        { bg: 'bg-primary-T95',    text: 'text-primary',   border: 'border-primary/20' },
  TRANSACTION: { bg: 'bg-secondary-T95',  text: 'text-secondary', border: 'border-secondary/20' },
  REPORT:      { bg: 'bg-red-50',         text: 'text-error',     border: 'border-error/20' },
};

const fallback = { bg: 'bg-neutral-T95', text: 'text-neutral-T40', border: 'border-neutral-T80' };

interface StatusBadgeProps {
  status: string;
  /** Override displayed text */
  label?: string;
  className?: string;
}

export default function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  const style = presets[status] || fallback;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      {label || status}
    </span>
  );
}
