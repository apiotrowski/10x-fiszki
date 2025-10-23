import { useState, useEffect } from "react";

interface SearchBarProps {
  value: string;
  onSearch: (newSearch: string) => void;
}

export function SearchBar({ value, onSearch }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce search to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(localValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, onSearch]);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="w-full">
      <label htmlFor="search-decks" className="sr-only">
        Search decks
      </label>
      <input
        id="search-decks"
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Wyszukaj talię po nazwie..."
        className="w-full h-9 px-4 py-2 text-sm border rounded-md bg-background shadow-xs focus:outline-none focus:border-ring focus:ring-ring/50 focus:ring-[3px] transition-all"
        aria-label="Wyszukaj talię po nazwie"
      />
    </div>
  );
}
