import { useEffect, useState, useCallback } from 'react';
import { ExtendedProduct } from '@/types';
import { LoadTransaction } from '@/lib/dexie/productsDB';

interface UseProductRowLogicProps {
    product: ExtendedProduct;
    isEditing: boolean;
    editData?: Partial<ExtendedProduct>;
    onEdit: (product: ExtendedProduct) => void;
    backgroundСolor?: string;
    setRowColor?: (productId: string, color: string) => void;
    salePageId?: string;
    transactions?: LoadTransaction[];
}

export function useProductRowLogic({
    product,
    isEditing,
    editData = {},
    onEdit,
    backgroundСolor,
    setRowColor,
}: UseProductRowLogicProps) {
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        visible: boolean;
    } | null>(null);

    const price = product.price ?? 0;
    const markupPct = product.markup_percent ?? 0;
    const quantity = product.quantity ?? 0;
    const deliveries = product.deliveries ?? 0;
    const returns = product.returns ?? 0;

    const priceWithMarkup = price * (1 + markupPct / 100);
    const cost = price * quantity;
    const costWithMarkup = priceWithMarkup * quantity;
    const stock = Math.max(0, deliveries - returns);
    const salesSum = parseFloat((priceWithMarkup * stock).toFixed(2));

    const editedProduct = {
        ...product,
        ...editData,
    };

    const roundToTwo = (value: number) =>
        Math.round((value + Number.EPSILON) * 100) / 100;

    const numInput = (val: any) => {
        if (val === '') return 0;
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onEdit(editedProduct);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({
            x: e.pageX,
            y: e.pageY,
            visible: true,
        });
    };

    const handleColorSelect = (color: string) => {
        if (setRowColor) {
            setRowColor(product.id, color);
        }
        setContextMenu(null);
    };

    useEffect(() => {
        const hideMenu = () => setContextMenu(null);
        window.addEventListener('click', hideMenu);
        return () => window.removeEventListener('click', hideMenu);
    }, []);

    const applyDeliveries = useCallback(
        () => onEdit({ ...product, quantity: product.deliveries ?? 0 }),
        [product, onEdit]
    );

    const applyReturns = useCallback(
        () => onEdit({ ...product, quantity: product.returns ?? 0 }),
        [product, onEdit]
    );

    return {
        editedProduct,
        contextMenu,
        handleContextMenu,
        handleColorSelect,
        roundToTwo,
        numInput,
        onKeyDown,
        applyDeliveries,
        applyReturns,
        price,
        markupPct,
        cost,
        costWithMarkup,
        stock,
        salesSum,
    };
}
