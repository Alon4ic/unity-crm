// @/hooks/table/useEditDataMap.ts
import { Dispatch, SetStateAction, useCallback } from 'react';
import { ExtendedProduct } from '@/types';

type EditDataMap = Record<string, Partial<ExtendedProduct>>;
type SetEditDataMap = Dispatch<SetStateAction<EditDataMap>>;

const useEditDataMap = (setEditDataMap: SetEditDataMap) => {
    const handleChange = useCallback(
        (
            productId: string,
            field: keyof ExtendedProduct | 'deliveries' | 'returns',
            value: any
        ) => {
            setEditDataMap((prev) => {
                const prevData = prev[productId] ?? {};
                return {
                    ...prev,
                    [productId]: {
                        ...prevData,
                        [field]: value,
                    },
                };
            });
        },
        [setEditDataMap]
    );

    return handleChange;
};

export default useEditDataMap;
