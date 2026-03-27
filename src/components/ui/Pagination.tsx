import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-surface-lowest border-t border-outline-variant/30 sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between font-body text-sm text-gray-500">
        <p>
          Hiển thị trang{' '}
          <span className="font-bold text-gray-900">{currentPage}</span> trên
          tổng số <span className="font-bold text-gray-900">{totalPages}</span>{' '}
          trang
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center p-2 rounded-lg border border-outline-variant/50 bg-surface-lowest text-gray-500 hover:bg-surface-container hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span className="sr-only">Previous</span>
          <ChevronLeft size={16} />
        </button>

        {/* Simplified page numbers for demo */}
        <span className="px-4 py-1.5 rounded-lg bg-primary/10 text-primary font-bold text-sm">
          {currentPage}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center p-2 rounded-lg border border-outline-variant/50 bg-surface-lowest text-gray-500 hover:bg-surface-container hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span className="sr-only">Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
