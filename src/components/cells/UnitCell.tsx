import { useEffect, useRef } from 'react';
import { useUnitStore } from '@/store/zustand/unitStore';

interface UnitCellProps {
    productId: string;
    isEditing: boolean;
    initialValue: string;
}

export const UnitCell = ({
    productId,
    isEditing,
    initialValue,
}: UnitCellProps) => {
    const unit = useUnitStore((state) => state.units[productId] ?? '');
    const setUnit = useUnitStore((state) => state.setUnit);

    const initializedRef = useRef(false);

    useEffect(() => {
        if (
            !initializedRef.current &&
            unit === '' &&
            initialValue !== '' &&
            initialValue !== '-'
        ) {
            setUnit(productId, initialValue);
            initializedRef.current = true;
        }
    }, [unit, initialValue, productId, setUnit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUnit(productId, e.target.value);
    };

    if (!isEditing) {
        return <>{unit}</>;
    }

    return (
        <input
            type="text"
            value={unit}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
        />
    );
};
