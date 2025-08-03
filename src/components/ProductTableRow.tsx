'use client';

import { useDrag } from 'react-dnd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ExtendedProduct } from '@/types';
import type { ColumnKey } from '@/types/tableColumns';
import { Unit } from '@/types';
import toast from 'react-hot-toast';
import ReactDOM from 'react-dom';
import { logProductEvent } from '@/lib/products/logProductEvent';
import TableCellRenderer from './TableCellRenderer';
import { memo } from 'react';

// Типы остаются без изменений
type Mode = 'dashboard' | 'sales';
interface DragItem {
    id: string;
    type: string;
    selectedIds: string[];
}

interface Props {
    product: ExtendedProduct;
    columns: ColumnKey[];
    mode: Mode;
    isEditing: boolean;
    isHighlighted?: boolean;
    isSelected?: boolean;
    editData: Partial<ExtendedProduct>;
    units: Unit[];
    onStartEdit: (p: ExtendedProduct) => void;
    onChange: (
        productId: string,
        field: keyof ExtendedProduct,
        value: any
    ) => void;
    onSave: (payload: ExtendedProduct) => void;
    onCancel: () => void;
    onDelete: (id: string) => void;
    onColorChange: (productId: string, color: string) => void;
    background_color?: string;
    selectedIds: string[];
    rowId: string;
    onSelect: (id: string, e: React.MouseEvent<HTMLInputElement>) => void;
    onClickSelect: (
        id: string,
        e: React.MouseEvent<HTMLTableRowElement>
    ) => void;
}

// Мемоизация компонента для предотвращения лишних ре-рендеров
function ProductTableRow(props: Props) {
    const {
        product,
        columns,
        mode,
        isEditing,
        isHighlighted,
        isSelected,
        editData,
        units,
        onStartEdit,
        onChange,
        onSave,
        onCancel,
        onDelete,
        onSelect,
        selectedIds,
        background_color,
        onColorChange,
        rowId,
        onClickSelect,
    } = props;

    const rowRef = useRef<HTMLTableRowElement>(null);

    // Мемоизация конфигурации useDrag для предотвращения пересоздания объекта
    const dragSpec = useCallback(
        () => ({
            type: 'PRODUCT',
            item: {
                id: product.id,
                selectedIds: selectedIds.includes(product.id)
                    ? selectedIds
                    : [product.id],
            },
        }),
        [product.id, selectedIds]
    );

    const [, drag] = useDrag(dragSpec);
    drag(rowRef);

    // Мемоизация вычислений для оптимизации производительности
        const price = Number(editData.price ?? product.price ?? 0);
        const quantity = Number(editData.quantity ?? product.quantity ?? 0);
        const markupPct = Number(
            editData.markup_percent ?? product.markup_percent ?? 0
        );
        const totalLoaded =
            Number(product.total_loaded ?? 0) + Number(editData.load ?? 0);
        const totalReturn =
            Number(product.total_return ?? 0) +
            Number(editData.return_qty ?? 0);
        const loadInput = Number(editData.load ?? 0);
        const returnInput = Number(editData.return_qty ?? 0);
        const oneWithMarkup = price * (1 + markupPct / 100);
        const cost = price * quantity;
        const costWithMarkup =
            mode === 'dashboard' ? oneWithMarkup * quantity : oneWithMarkup;
        const deliveries = product.deliveries ?? 0;
        const returns = product.returns ?? 0;
        const stock = totalLoaded - totalReturn;
        const salesSum = (oneWithMarkup * stock).toFixed(2);

      
    // Объединяем данные продукта и редактируемые данные
    const editedProduct: ExtendedProduct = useMemo(
        () => ({
            ...product,
            ...editData,
        }),
        [product, editData]
    );

    // Обработчик клавиши Enter
    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onSave(editedProduct);
            }
        },
        [onSave, editedProduct]
    );

    // Обработчик числовых полей ввода
    const numInput = useCallback(
        (
            e: React.ChangeEvent<HTMLInputElement>,
            f: keyof ExtendedProduct,
            productId: string
        ) => {
            let v = e.target.value.replace(',', '.');
            const isAllowedField = [
                'quantity',
                'price',
                'markup_percent',
                'return_qty',
            ].includes(f);
            const regex = isAllowedField
                ? /^[0-9]*\.?[0-9]*$/
                : /^-?[0-9]*\.?[0-9]*$/;

            if (v === '' || regex.test(v)) {
                onChange(product.id, f, v === '' ? '' : Number(v));
            }
        },
        [onChange, product.id]
    );

    // Форматирование чисел
    const roundToTwo = useCallback((value: unknown): string => {
        const num = Number(value);
        if (isNaN(num)) {
            console.error('Invalid number value:', value);
            return '—';
        }
        return Number.isInteger(num) ? num.toString() : num.toFixed(2);
    }, []);

    // Обработка поставок
    const applyDeliveries = async () => {
        const d = Number(editData.deliveries ?? 0);
        if (d >= 0) {
            const newQuantity = Number(product.quantity ?? 0) + d;
            await logProductEvent({
                productId: product.id,
                type: 'delivery',
                quantity: d,
            });
            onSave({ ...editedProduct, quantity: newQuantity, deliveries: 0 });
        } else {
            toast.error('Поставка не может быть отрицательной');
        }
    };

    // Обработка возвратов
    const applyReturns = async () => {
        const r = Number(editData.returns ?? 0);
        if (r >= 0) {
            const newQuantity = Math.max(0, Number(product.quantity ?? 0) - r);
            await logProductEvent({
                productId: product.id,
                type: 'return',
                quantity: r,
            });
            onSave({ ...editedProduct, quantity: newQuantity, returns: 0 });
        } else {
            toast.error('Возврат не может быть отрицательным');
        }
    };

    // Состояние контекстного меню
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
    } | null>(null);

    // Обработчик контекстного меню
    const handleContextMenu = (e: React.MouseEvent) => {
        if (mode !== 'dashboard') return;
        e.preventDefault();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
    };

    // Выбор цвета
    const handleColorSelect = (color: string) => {
        onColorChange(product.id, color);
        setContextMenu(null);
    };
    // Закрытие контекстного меню по клику вне его
    useEffect(() => {
        const close = () => setContextMenu(null);
        window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, []);

    // Мемоизация контекстного меню для оптимизации рендера
    const ContextMenu = () => {
        if (!contextMenu?.visible || typeof window === 'undefined') return null;

        return ReactDOM.createPortal(
            <div
                className="absolute z-50 bg-white border rounded shadow p-2"
                style={{ top: contextMenu.y, left: contextMenu.x }}
            >
                <p className="text-sm font-semibold mb-1">Цвет строки:</p>
                <div className="flex gap-2">
                    {[
                        '#fef08a',
                        '#a5f3fc',
                        '#86efac',
                        '#fca5a5',
                        '#ddd6fe',
                    ].map((color) => (
                        <div
                            key={color}
                            onClick={() => handleColorSelect(color)}
                            className="w-6 h-6 rounded-full border cursor-pointer"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>,
            document.body
        );
    };

    return (
        <>
            <tr
                ref={rowRef}
                id={rowId}
                onContextMenu={handleContextMenu}
                style={{ backgroundColor: background_color ?? undefined }}
                className={cn(
                    'border',
                    selectedIds.includes(product.id) &&
                        'bg-blue-100 dark:bg-blue-900',
                    isSelected && 'bg-blue-100 dark:bg-blue-900',
                    isHighlighted && 'ring-2 ring-yellow-500',
                    isEditing && 'bg-green-50 dark:bg-green-900'
                )}
                draggable
                onDragStart={(e) => {
                    e.dataTransfer.setData('productId', product.id);
                }}
                onClick={(e) => onClickSelect(product.id, e)}
            >
                {columns.map((col) => (
                    <td key={col} className="border p-1">
                        <TableCellRenderer
                            columnKey={col}
                            isEditing={isEditing}
                            editData={editData}
                            product={product}
                            onChange={(field, value) =>
                                onChange(product.id, field, value)
                            }
                            onKeyDown={onKeyDown}
                            numInput={numInput}
                            roundToTwo={roundToTwo}
                            applyDeliveries={applyDeliveries}
                            applyReturns={applyReturns}
                            onSave={() => onSave(editedProduct)}
                            onCancel={onCancel}
                            onStartEdit={() => onStartEdit(product)}
                            onDelete={() => onDelete(product.id)}
                            price={price}
                            markupPct={markupPct}
                            oneWithMarkup={oneWithMarkup}
                            cost={cost}
                            costWithMarkup={costWithMarkup}
                            deliveries={deliveries}
                            returns={returns}
                            loadInput={loadInput}
                            returnInput={returnInput}
                            totalLoaded={totalLoaded}
                            totalReturn={totalReturn}
                            stock={stock}
                            salesSum={salesSum}
                            quantityValue={quantity}
                        />
                    </td>
                ))}
            </tr>
            <ContextMenu />
        </>
    );
}

// Экспорт мемоированного компонента
export default memo(ProductTableRow);
