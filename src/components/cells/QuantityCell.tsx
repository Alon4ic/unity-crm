'use client';

import { useEffect } from 'react';
import { useQuantityStore } from '@/store/zustand/quantityStore';
import { cn } from '@/lib/utils'; // если у тебя есть утилита classNames
import { roundToTwo } from '@/lib/match';


interface QuantityCellProps {
    productId: string;
    isEditing: boolean;
    initialValue: string;
    widthClasses?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const QuantityCell = ({
    productId,
    isEditing,
    initialValue,
    widthClasses = '',
    onKeyDown,
}: QuantityCellProps) => {
    const quantity = useQuantityStore(
        (state) => state.quantities[productId] ?? ''
    );
    const setQuantity = useQuantityStore((state) => state.setQuantity);

    useEffect(() => {
        if (quantity === '' && initialValue !== '') {
            setQuantity(productId, initialValue);
        }
    }, [quantity, initialValue, productId, setQuantity]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuantity(productId, e.target.value);
    };

    const parsedQuantity = parseFloat(quantity);
    const quantityValue = isNaN(parsedQuantity) ? 0 : parsedQuantity;
    const isLow = quantityValue < 5;

    return isEditing ? (
        <div className={`${widthClasses} overflow-hidden`}>
            <input
                className={cn('w-full', isLow && 'text-red-600 font-bold')}
                type="number"
                step="1"
                value={quantity}
                onChange={handleChange}
                onKeyDown={onKeyDown}
            />
        </div>
    ) : (
        <div className={`${widthClasses} overflow-hidden`}>
            <span className={cn(isLow && 'text-red-600 font-bold')}>
                {roundToTwo(quantityValue)}
            </span>
        </div>
    );
};
