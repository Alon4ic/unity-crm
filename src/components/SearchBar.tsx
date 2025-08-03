'use client';

import { useEffect, useState, useRef } from 'react'; // Добавим useRef
import { Product, db } from '@/lib/dexie/productsDB';
import { useTranslations } from 'next-intl';

interface SearchBarProps {
    onSelect: (productId: string) => void;
    query: string;
    onQueryChange: (query: string) => void;
}

export default function SearchBar({
    onSelect,
    query,
    onQueryChange,
}: SearchBarProps) {
    const t = useTranslations('search');
    const [products, setProducts] = useState<Product[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const dropdownRef = useRef<HTMLUListElement>(null); // Реф для выпадающего списка
    const inputRef = useRef<HTMLInputElement>(null); // Реф для поля ввода

    useEffect(() => {
        db.products.toArray().then(setProducts);
    }, []);

    const filteredProducts = products.filter((product) =>
        `${product.name} ${product.code || ''}`
            .toLowerCase()
            .includes(query.toLowerCase())
    );

    const handleSelect = (product: Product) => {
        setShowDropdown(false);
        onSelect(product.id);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (filteredProducts.length > 0) {
                const matched = filteredProducts[highlightedIndex];
                handleSelect(matched);
            } else {
                const firstMatch = products.find((p) =>
                    p.name.toLowerCase().includes(query.toLowerCase())
                );
                if (firstMatch) handleSelect(firstMatch);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                Math.min(prev + 1, filteredProducts.length - 1)
            );

            // Прокрутка списка
            if (dropdownRef.current) {
                const items = dropdownRef.current.children;
                if (items.length > highlightedIndex + 1) {
                    items[highlightedIndex + 1].scrollIntoView({
                        block: 'nearest',
                        behavior: 'smooth',
                    });
                }
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((prev) => Math.max(prev - 1, 0));

            // Прокрутка списка
            if (dropdownRef.current) {
                const items = dropdownRef.current.children;
                if (highlightedIndex - 1 >= 0) {
                    items[highlightedIndex - 1].scrollIntoView({
                        block: 'nearest',
                        behavior: 'smooth',
                    });
                }
            }
        }
    };

    // Обработчик клика вне компонента
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(e.target as Node) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full max-w-md">
            <input
                ref={inputRef}
                type="text"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                placeholder={t('text')}
                value={query}
                onChange={(e) => {
                    onQueryChange(e.target.value);
                    setShowDropdown(true);
                    setHighlightedIndex(0);
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleKeyDown}
            />

            {showDropdown && filteredProducts.length > 0 && (
                <ul
                    ref={dropdownRef}
                    className="absolute z-10 w-full border border-gray-300 bg-white rounded-md shadow max-h-60 overflow-auto"
                >
                    {filteredProducts.map((product, idx) => (
                        <li
                            key={product.id}
                            className={`px-4 py-2 cursor-pointer ${
                                idx === highlightedIndex
                                    ? 'bg-gray-200'
                                    : 'hover:bg-gray-100'
                            }`}
                            onClick={() => handleSelect(product)}
                            onMouseDown={(e) => e.preventDefault()} // Предотвращаем blur
                        >
                            {product.name} ({product.code})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
