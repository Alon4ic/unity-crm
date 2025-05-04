'use client';

import { useState, useEffect } from 'react';
import debounce from 'lodash.debounce';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchResults = debounce(async (q: string) => {
        if (!q) {
            setResults([]);
            return;
        }

        setLoading(true);
        const res = await fetch(`/api/search-products?q=${q}`);
        const data = await res.json();
        setResults(data);
        setLoading(false);
    }, 300);

    useEffect(() => {
        fetchResults(query);
        return () => fetchResults.cancel();
    }, [query]);

    return (
        <div className="relative w-full max-w-md">
            <input
                type="text"
                placeholder="Поиск по названию или коду"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded shadow-sm"
            />

            {loading && (
                <div className="absolute top-full left-0 w-full bg-white shadow p-2 text-sm text-gray-500">
                    Поиск...
                </div>
            )}

            {!loading && results.length > 0 && (
                <ul className="absolute top-full left-0 w-full bg-white shadow z-10 border mt-1 rounded">
                    {results.map((item) => (
                        <li
                            key={item.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => alert(`Вы выбрали: ${item.name}`)}
                        >
                            {item.name} {item.code && `(${item.code})`}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
