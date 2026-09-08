"use client";

import { useMemo, useState } from "react";

type BkTypeaheadInputProps = {
  label: string;
  value: string;
  placeholder?: string;
  suggestions: string[];
  onChange: (value: string) => void;
};

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

export function BkTypeaheadInput({
  label,
  value,
  placeholder,
  suggestions,
  onChange,
}: BkTypeaheadInputProps) {
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const filtered = useMemo(() => {
    if (!suggestionsOpen) return [];
    const query = normalizeQuery(value);
    if (!query) return [];
    return suggestions
      .filter((item) => {
        const normalizedItem = normalizeQuery(item);
        return normalizedItem !== query && normalizedItem.includes(query);
      })
      .slice(0, 8);
  }, [suggestions, suggestionsOpen, value]);

  return (
    <label className="bk-typeahead">
      {label}
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          onChange(event.target.value);
          setSuggestionsOpen(true);
        }}
        onBlur={() => setSuggestionsOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setSuggestionsOpen(false);
        }}
        autoComplete="off"
      />
      {filtered.length > 0 ? (
        <ul className="bk-typeahead-list" role="listbox" aria-label={`${label}建議`}>
          {filtered.map((item) => (
            <li key={item}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(item);
                  setSuggestionsOpen(false);
                }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </label>
  );
}
