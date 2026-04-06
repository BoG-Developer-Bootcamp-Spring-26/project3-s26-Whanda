import {useState} from "react";

type SearchBarProps = {
    onSearch: (query: string) => void;
}

export default function SearchBar({onSearch}: SearchBarProps) {
    const [query, setQuery] = useState("");
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        onSearch(value);

    };

    return (
        <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={handleChange}
            className="w-full rounded-[12px] border border-gray-300 bg-white px-4 py-2 text-[15px] text-[#3e3e3e] outline-none focus:border-[#2f317e]"
        />
    );

}
