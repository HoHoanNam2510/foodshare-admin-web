'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Search, Filter, X } from 'lucide-react';

/* ── Filter definition types ─────────────────────────────── */

export interface SelectFilter {
  type: 'select';
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export interface TabFilter {
  type: 'tabs';
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; icon?: ReactNode }[];
}

export type ToolbarFilter = SelectFilter | TabFilter;

/* ── Props ───────────────────────────────────────────────── */

interface ToolbarProps {
  /** Current search value (controlled) or omit for internal debounced mode */
  searchQuery?: string;
  /** Direct onChange for controlled mode */
  onSearchChange?: (value: string) => void;
  /** Debounced callback (used when searchQuery is not provided) */
  onSearch?: (value: string) => void;
  placeholder?: string;
  /** Debounce delay in ms — only applies to onSearch mode (default 400) */
  delay?: number;
  /** Array of filters rendered beside the search input */
  filters?: ToolbarFilter[];
  className?: string;
}

/* ── Component ───────────────────────────────────────────── */

export default function Toolbar({
  searchQuery,
  onSearchChange,
  onSearch,
  placeholder = 'Tìm kiếm...',
  delay = 400,
  filters,
  className = '',
}: ToolbarProps) {
  const isControlled = searchQuery !== undefined;
  const [internal, setInternal] = useState('');
  const value = isControlled ? searchQuery : internal;

  // Debounced callback for uncontrolled mode
  useEffect(() => {
    if (isControlled || !onSearch) return;
    const timer = setTimeout(() => onSearch(internal.trim()), delay);
    return () => clearTimeout(timer);
  }, [internal, delay, onSearch, isControlled]);

  const handleChange = (v: string) => {
    if (isControlled) {
      onSearchChange?.(v);
    } else {
      setInternal(v);
    }
  };

  const handleClear = () => {
    if (isControlled) {
      onSearchChange?.('');
    } else {
      setInternal('');
      onSearch?.('');
    }
  };

  const hasFilters = filters && filters.length > 0;

  const searchInput = (
    <div className={`flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50 ${hasFilters ? 'w-full sm:w-80' : 'w-full'} focus-within:ring-2 focus-within:ring-primary/50 focus-within:-translate-y-0.5 transition-all`}>
      <Search size={16} className="text-gray-400 shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-transparent text-sm outline-none w-full font-body text-gray-900 placeholder:text-gray-400"
      />
      {value && (
        <button
          onClick={handleClear}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );

  return (
    <div
      className={`flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-lowest p-4 rounded-md shadow-sm border border-outline-variant/30 ${className}`}
    >
      {searchInput}

      {hasFilters && <div className="flex items-center gap-3 w-full sm:w-auto">
        {filters.map((filter, i) => {
          if (filter.type === 'select') {
            return (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-outline-variant/50"
              >
                <Filter size={16} className="text-gray-400" />
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="bg-transparent text-sm outline-none font-body text-gray-700 cursor-pointer"
                >
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          // Tab-style filter
          return (
            <div
              key={i}
              className="flex items-center gap-1 bg-surface rounded-lg border border-outline-variant/50 p-1"
            >
              {filter.options.map((tab) => {
                const isActive = filter.value === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => filter.onChange(tab.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-500 hover:bg-primary/5 hover:text-primary'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>}
    </div>
  );
}
