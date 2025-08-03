import { useEffect, useRef } from 'react';
import { useNameStore } from '@/store/zustand/nameStore';

interface NameCellProps {
    productId: string;
    isEditing: boolean;
    initialValue: string;
    // onSave: () => void; // ← вызывается при Enter
}

export function NameCell({
    productId,
    isEditing,
    initialValue,
    // onSave,
}: NameCellProps) {
    const name = useNameStore(
        (state) => state.names[productId] ?? initialValue
    );
    const setName = useNameStore((state) => state.setName);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    if (!isEditing) return <>{name}</>;

    return (
        <input
            ref={inputRef}
            type="text"
            className="w-full p-1 border rounded"
            value={name}
            onChange={(e) => setName(productId, e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    // onSave();
                }
            }}
        />
    );
}
