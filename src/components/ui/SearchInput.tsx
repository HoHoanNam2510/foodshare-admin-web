'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  /** Called with debounced value */
  onSearch: (value: string) => void;
  placeholder?: string;
  /** Debounce delay in ms (default 400) */
  delay?: number;
  className?: string;
}

export default function SearchInput({
  onSearch,
  placeholder = 'Tìm kiếm...',
  delay = 400,
  className = '',
}: SearchInputProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => onSearch(value.trim()), delay);
    return () => clearTimeout(timer);
  }, [value, delay, onSearch]);

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2.5 bg-surface-lowest rounded-xl border border-outline-variant/40 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/40 focus-within:-translate-y-0.5 transition-all ${className}`}
    >
      <Search size={16} className="text-neutral-T60 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent text-sm outline-none w-full font-body text-neutral-T20 placeholder:text-neutral-T60"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="text-neutral-T60 hover:text-neutral-T30 transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
