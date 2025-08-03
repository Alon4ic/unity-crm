import { useEffect } from 'react';
import { ExtendedProduct } from '@/types';

interface UseKeyboardSelectionProps {
    rows: ExtendedProduct[];
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
    anchorIndex: number | null;
    setAnchorIndex: (index: number | null) => void;
    cursorIndex: number | null;
    setCursorIndex: (index: number | null) => void;
}

export function useKeyboardSelection({
    rows,
    selectedIds,
    setSelectedIds,
    anchorIndex,
    setAnchorIndex,
    cursorIndex,
    setCursorIndex,
}: UseKeyboardSelectionProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT') return;
            if (!rows.length) return;

            if (e.key === 'Escape') {
                setSelectedIds([]);
                setAnchorIndex(null);
                setCursorIndex(null);
                return;
            }

            const direction =
                e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;

            if (direction === 0) return;

            // Определяем текущую позицию
            let currentIndex = cursorIndex;
            if (currentIndex === null) {
                // Если курсор не установлен, используем последнюю выделенную строку
                if (selectedIds.length > 0) {
                    const lastSelectedId = selectedIds[selectedIds.length - 1];
                    currentIndex = rows.findIndex(
                        (r) => r.id === lastSelectedId
                    );
                } else {
                    currentIndex = 0;
                }
            }

            // Вычисляем новую позицию
            let nextIndex = currentIndex + direction;
            nextIndex = Math.max(0, Math.min(rows.length - 1, nextIndex));

            // Всегда обновляем позицию курсора
            setCursorIndex(nextIndex);

            if (e.shiftKey) {
                // Определяем якорь: если есть anchorIndex - используем его, иначе текущую позицию
                const anchor =
                    anchorIndex !== null ? anchorIndex : currentIndex;

                // Выделяем диапазон от якоря до новой позиции
                const start = Math.min(anchor, nextIndex);
                const end = Math.max(anchor, nextIndex);
                const rangeIds = rows.slice(start, end + 1).map((r) => r.id);

                setSelectedIds(rangeIds);

                // Фиксируем якорь при первом расширении выделения
                if (anchorIndex === null) {
                    setAnchorIndex(anchor);
                }
            } else {
                // Обычное перемещение: выделяем только новую строку
                setSelectedIds([rows[nextIndex].id]);
                setAnchorIndex(nextIndex);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        rows,
        selectedIds,
        setSelectedIds,
        anchorIndex,
        setAnchorIndex,
        cursorIndex,
        setCursorIndex,
    ]);
}
