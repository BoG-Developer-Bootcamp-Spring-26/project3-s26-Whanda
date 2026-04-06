import { useState } from "react";
import Image from "next/image";

type SearchBarProps = {
  onSearch: (query: string) => void;
};

const SEARCH_ICON = "/images/searchLogo.png";

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="flex items-center w-[520px] h-[44px] rounded-[14px] border border-[#8f8f8f] bg-[#efefef] px-4">
      <Image
        src={SEARCH_ICON}
        alt="Search"
        width={20}
        height={20}
      />

      <input
        type="text"
        placeholder="Search"
        value={query}
        onChange={handleChange}
        className="ml-3 w-full bg-transparent text-[16px] text-[#555555] outline-none placeholder:text-[#777777]"
      />
    </div>
  );
}