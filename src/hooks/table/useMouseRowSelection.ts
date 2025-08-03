import { Dispatch, SetStateAction, useCallback } from 'react';
import { ExtendedProduct } from '@/types';

interface UseMouseRowSelectionProps {
    rows: ExtendedProduct[];
    selectedIds: string[];
    setSelectedIds: Dispatch<SetStateAction<string[]>>;
    anchorIndex: number | null;
    setAnchorIndex: (index: number) => void;
}

export function useMouseRowSelection({
    rows,
    selectedIds,
    setSelectedIds,
    anchorIndex,
    setAnchorIndex,
}: UseMouseRowSelectionProps) {
    return useCallback(
        (id: string, e: React.MouseEvent<HTMLTableRowElement>) => {
            const index = rows.findIndex((r) => r.id === id);
            if (index === -1) return;

            if (e.shiftKey && anchorIndex !== null) {
                e.preventDefault();
                const start = Math.min(anchorIndex, index);
                const end = Math.max(anchorIndex, index);
                const newSelection = rows
                    .slice(start, end + 1)
                    .map((r) => r.id);
                setSelectedIds(
                    Array.from(new Set([...selectedIds, ...newSelection]))
                );
            } else if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                setSelectedIds((prev) =>
                    prev.includes(id)
                        ? prev.filter((pid) => pid !== id)
                        : [...prev, id]
                );
                setAnchorIndex(index); // ставим якорь на последнюю кликнутую строку
            } else {
                setSelectedIds([id]);
                setAnchorIndex(index);
            }
        },
        [rows, selectedIds, setSelectedIds, anchorIndex, setAnchorIndex]
    );
}
