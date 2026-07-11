'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const update = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative flex-1">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-neutral-500"
        strokeWidth={2}
      />
      {/* text-base (16px) prevents iOS Safari from zooming in on focus */}
      <input
        type="text"
        value={query}
        onChange={(e) => update(e.target.value)}
        placeholder="Search notes..."
        className="h-12 w-full rounded-full border border-neutral-800 bg-neutral-900/90 pl-11 pr-11 text-base text-white placeholder:text-neutral-500 shadow-lg backdrop-blur focus:border-neutral-500 focus:outline-none transition-colors"
      />
      {query && (
        <button
          onClick={() => update('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-neutral-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
