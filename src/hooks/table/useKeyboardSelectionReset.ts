export function useKeyboardSelectionReset(
    setSelectedIds: (ids: string[]) => void,
    setAnchorIndex: (i: number | null) => void,
    setCursorIndex: (i: number | null) => void
) {
    return () => {
        setSelectedIds([]);
        setAnchorIndex(null);
        setCursorIndex(null);
    };
}
