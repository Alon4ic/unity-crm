import { useEffect } from 'react';
import { useEditDataStore } from '@/store/zustand/editDataStore';

interface PriceCellProps {
    productId: string;
    isEditing: boolean;
    initialValue: string;
}

export const PriceCell = ({
    productId,
    isEditing,
    initialValue,
}: PriceCellProps) => {
    const price = useEditDataStore(
        (state) => state.editData[productId]?.price ?? ''
    );
    const setField = useEditDataStore((state) => state.setField);

    // При первом рендере: если в store ещё нет значения — записываем его
    useEffect(() => {
        if (price === '' && initialValue !== '') {
            setField(productId, 'price', initialValue.toString());
        }
    }, [price, initialValue, productId, setField]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setField(productId, 'price', e.target.value);
    };

    if (!isEditing) {
        const priceNumber =
            typeof price === 'number' ? price : parseFloat(price);
        const formatted = !isNaN(priceNumber) ? priceNumber.toFixed(2) : '';
        return <>{formatted}</>;
    }

    return (
        <input
            type="text"
            value={price.toString()}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
        />
    );
};
