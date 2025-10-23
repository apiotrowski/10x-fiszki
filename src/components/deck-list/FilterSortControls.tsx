interface FilterSortControlsProps {
  sort: string;
  order: "asc" | "desc";
  onSortChange: (sort: string, order: "asc" | "desc") => void;
}

const SORT_OPTIONS = [
  { value: "created_at", label: "Data utworzenia" },
  { value: "updated_at", label: "Data aktualizacji" },
  { value: "title", label: "Nazwa talii" },
] as const;

export function FilterSortControls({ sort, order, onSortChange }: FilterSortControlsProps) {
  const handleSortFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value, order);
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(sort, e.target.value as "asc" | "desc");
  };

  return (
    <div className="flex gap-2 items-center">
      <div className="flex items-center gap-2">
        <label htmlFor="sort-field" className="text-sm text-muted-foreground whitespace-nowrap">
          Sortuj po:
        </label>
        <select
          id="sort-field"
          value={sort}
          onChange={handleSortFieldChange}
          className="h-9 px-3 py-2 text-sm border rounded-md bg-background shadow-xs focus:outline-none focus:border-ring focus:ring-ring/50 focus:ring-[3px] transition-all"
          aria-label="Select sort field"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <select
        id="sort-order"
        value={order}
        onChange={handleOrderChange}
        className="h-9 px-3 py-2 text-sm border rounded-md bg-background shadow-xs focus:outline-none focus:border-ring focus:ring-ring/50 focus:ring-[3px] transition-all"
        aria-label="Select sort order"
      >
        <option value="desc">Malejąco</option>
        <option value="asc">Rosnąco</option>
      </select>
    </div>
  );
}
