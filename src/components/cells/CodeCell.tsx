import { useEffect } from 'react';
import { useEditDataStore } from '@/store/zustand/editDataStore';

interface CodeCellProps {
    productId: string;
    isEditing: boolean;
    initialValue: string | undefined;
}

export const CodeCell = ({
    productId,
    isEditing,
    initialValue,
}: CodeCellProps) => {
    const code = useEditDataStore(
        (state) => state.editData[productId]?.code ?? ''
    );
    const setField = useEditDataStore((state) => state.setField);

    useEffect(() => {
        if (code === '' && initialValue !== '') {
            setField(productId, 'code', initialValue);
        }
    }, [code, initialValue, productId, setField]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setField(productId, 'code', e.target.value);
    };

    if (!isEditing) {
        return <>{code}</>;
    }

    return (
        <input
            type="text"
            value={code}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
        />
    );
};
