import * as React from "react";
import { Input } from "./input";

interface AutocompleteOption {
  label: string;
  value: string;
  [key: string]: any;
}

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (option: AutocompleteOption) => void;
  options: AutocompleteOption[];
  loading?: boolean;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export function Autocomplete({
  value,
  onChange,
  onSelect,
  options,
  loading,
  placeholder,
  label,
  disabled,
}: AutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-full">
      {label && <label className="block mb-1 text-sm font-medium">{label}</label>}
      <Input
        ref={inputRef}
        value={value}
        onChange={e => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {open && (options.length > 0 || loading) && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-56 overflow-auto">
          {loading && (
            <li className="px-4 py-2 text-gray-500">Loading...</li>
          )}
          {!loading && options.map(option => (
            <li
              key={option.value}
              className="px-4 py-2 cursor-pointer hover:bg-primary/10"
              onMouseDown={() => {
                onSelect(option);
                setOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
