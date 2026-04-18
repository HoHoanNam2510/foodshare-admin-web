'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────

export interface Column<T> {
  key: string;
  header: string;
  /** Render custom cell content. Falls back to row[key] */
  render?: (row: T, index: number) => React.ReactNode;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Enable sorting on this column */
  sortable?: boolean;
  /** Max width class e.g. "max-w-[200px]" */
  maxWidth?: string;
  /** Whether cell text should truncate */
  truncate?: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type SortOrder = 'asc' | 'desc' | null;

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  /** Unique key extractor */
  rowKey: (row: T, index: number) => string;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  pagination?: PaginationMeta | null;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  /** Called when user clicks a sortable column header */
  onSort?: (key: string, order: SortOrder) => void;
  /** Currently active sort key */
  sortKey?: string | null;
  /** Currently active sort order */
  sortOrder?: SortOrder;
  /** Optional click handler for rows */
  onRowClick?: (row: T) => void;
  /** Extra class for the wrapper */
  className?: string;
  /** Class for table element */
  tableClassName?: string;
  /** Class for thead element */
  headerClassName?: string;
  /** Class for tbody element */
  bodyClassName?: string;
  /** Class applied to each data row */
  rowClassName?: string | ((row: T, index: number) => string);
  /** Class applied to each cell */
  cellClassName?: string | ((col: Column<T>, row: T, index: number) => string);
}

// ─── Component ───────────────────────────────────────────────

export default function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  error = null,
  emptyMessage = 'Chưa có dữ liệu',
  pagination = null,
  currentPage = 1,
  onPageChange,
  onSort,
  sortKey = null,
  sortOrder = null,
  onRowClick,
  className = '',
  tableClassName = '',
  headerClassName = '',
  bodyClassName = '',
  rowClassName = '',
  cellClassName = '',
}: DataTableProps<T>) {
  const colCount = columns.length;

  const handleSort = (col: Column<T>) => {
    if (!col.sortable || !onSort) return;
    const newOrder: SortOrder =
      sortKey === col.key
        ? sortOrder === 'asc'
          ? 'desc'
          : sortOrder === 'desc'
            ? null
            : 'asc'
        : 'asc';
    onSort(col.key, newOrder);
  };

  const alignClass = (align?: string) => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  // Pagination helpers
  const pages =
    pagination && pagination.totalPages > 1
      ? Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
          .filter(
            (p) =>
              p === 1 ||
              p === pagination.totalPages ||
              Math.abs(p - currentPage) <= 1
          )
          .reduce<(number | '...')[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
            acc.push(p);
            return acc;
          }, [])
      : [];

  return (
    <div
      className={`bg-surface-lowest rounded-lg shadow-soft border border-outline-variant/30 overflow-hidden ${className}`}
    >
      <div className={`overflow-x-auto ${tableClassName}`}>
        <table className="w-full text-left font-body">
          {/* ── THEAD ── */}
          <thead
            className={`bg-linear-to-r from-primary/5 to-primary-container/5 border-b border-outline-variant/30 ${headerClassName}`}
          >
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-4 font-label text-[11px] uppercase tracking-wider text-neutral-T40 font-semibold ${alignClass(col.align)} ${
                    col.sortable
                      ? 'cursor-pointer select-none hover:text-primary transition-colors'
                      : ''
                  }`}
                  onClick={() => handleSort(col)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && (
                      <span className="text-neutral-T60">
                        {sortKey === col.key && sortOrder === 'asc' ? (
                          <ArrowUp size={12} className="text-primary" />
                        ) : sortKey === col.key && sortOrder === 'desc' ? (
                          <ArrowDown size={12} className="text-primary" />
                        ) : (
                          <ArrowUpDown size={12} />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* ── TBODY ── */}
          <tbody
            className={`divide-y divide-outline-variant/15 text-sm ${bodyClassName}`}
          >
            {loading ? (
              <tr>
                <td colSpan={colCount} className="px-5 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-neutral-T60">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Loader2
                        size={20}
                        className="animate-spin text-primary"
                      />
                    </div>
                    <span className="text-sm font-body">
                      Đang tải dữ liệu...
                    </span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={colCount}
                  className="px-5 py-14 text-center text-error text-sm font-body"
                >
                  {error}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={colCount}
                  className="px-5 py-14 text-center text-neutral-T60 text-sm font-body"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const resolvedRowClass =
                  typeof rowClassName === 'function'
                    ? rowClassName(row, idx)
                    : rowClassName;

                return (
                  <tr
                    key={rowKey(row, idx)}
                    className={`transition-colors hover:bg-primary/3 ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${resolvedRowClass}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => {
                      const resolvedCellClass =
                        typeof cellClassName === 'function'
                          ? cellClassName(col, row, idx)
                          : cellClassName;

                      return (
                        <td
                          key={col.key}
                          className={`px-5 py-4 ${alignClass(col.align)} ${col.maxWidth || ''} ${col.truncate ? 'truncate' : ''} ${resolvedCellClass}`}
                        >
                          {col.render
                            ? col.render(row, idx)
                            : String(
                                (row as Record<string, unknown>)[col.key] ?? '—'
                              )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── PAGINATION ── */}
      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-outline-variant/20 bg-surface/30">
          <p className="text-xs font-body text-neutral-T60">
            Hiển thị{' '}
            <span className="font-semibold text-neutral-T30">
              {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            trong tổng số{' '}
            <span className="font-semibold text-neutral-T30">
              {pagination.total.toLocaleString('vi-VN')}
            </span>
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-neutral-T50 hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            {pages.map((p, idx) =>
              p === '...' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-neutral-T60 text-sm"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                    currentPage === p
                      ? 'bg-linear-to-br from-primary to-primary-container text-white shadow-glow/30'
                      : 'text-neutral-T50 hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() =>
                onPageChange(Math.min(pagination.totalPages, currentPage + 1))
              }
              disabled={currentPage === pagination.totalPages}
              className="p-1.5 rounded-lg text-neutral-T50 hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
