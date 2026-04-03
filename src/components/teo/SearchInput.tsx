"use client";

import { Search } from "lucide-react";
import { useState, useCallback } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "What do you want to listen to?" }: SearchInputProps) {
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div
      className={`relative flex items-center gap-3 bg-white/10 rounded-full px-4 py-3 transition-colors ${
        focused ? "bg-white/20" : ""
      }`}
    >
      <Search className={`w-5 h-5 flex-shrink-0 ${focused ? "text-white" : "text-[#B3B3B3]"}`} />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-white text-sm placeholder-[#B3B3B3] outline-none"
      />
    </div>
  );
}
