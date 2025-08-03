import { useCallback, useState, useRef } from 'react';

export default function useProductSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedProductId, setHighlightedProductId] = useState<string>();

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Прокрутка и временное выделение товара
    const scrollToProduct = useCallback((productId: string) => {
        const element = document.getElementById(`product-${productId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('bg-yellow-100');

            // Удалим подсветку через 2 секунды
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                element.classList.remove('bg-yellow-100');
            }, 2000);
        }
    }, []);

    // Сброс запроса
    const resetSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    // Выбор товара
    const handleSelectProduct = useCallback(
        (productId: string) => {
            setHighlightedProductId(productId);
            scrollToProduct(productId);

            // Сброс выделения через 3 секунды
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setHighlightedProductId(undefined);
            }, 3000);

            resetSearch();
        },
        [scrollToProduct, resetSearch]
    );

    return {
        searchQuery,
        setSearchQuery,
        highlightedProductId,
        handleSelectProduct,
        scrollToProduct,
        resetSearch,
    };
}
