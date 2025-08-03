// @/components/table/TableCellRenderer.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { ExtendedProduct } from '@/types';
import { ColumnKey } from '@/types/tableColumns';

interface TableCellRendererProps {
    columnKey: ColumnKey;
    isEditing: boolean;
    editData: Partial<ExtendedProduct>;
    product: ExtendedProduct;
    onChange: (field: keyof ExtendedProduct, value: any) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    numInput: (
        e: React.ChangeEvent<HTMLInputElement>,
        f: keyof ExtendedProduct,
        productId: string
    ) => void;
    roundToTwo: (value: unknown) => string;
    applyDeliveries?: () => void;
    applyReturns?: () => void;
    onSave?: () => void;
    onCancel?: () => void;
    onStartEdit?: () => void;
    onDelete?: () => void;
    price: number;
    markupPct: number;
    oneWithMarkup: number;
    cost: number;
    costWithMarkup: number;
    deliveries: number;
    returns: number;
    loadInput: number;
    returnInput: number;
    totalLoaded: number;
    totalReturn: number;
    stock: number;
    salesSum: string;
    quantityValue: number;
    widthClasses?: string;
}

const TableCellRenderer: React.FC<TableCellRendererProps> = ({
    columnKey,
    isEditing,
    editData,
    product,
    onChange,
    onKeyDown,
    numInput,
    roundToTwo,
    applyDeliveries,
    applyReturns,
    onSave,
    onCancel,
    onStartEdit,
    onDelete,
    price,
    markupPct,
    oneWithMarkup,
    cost,
    costWithMarkup,
    deliveries,
    returns,
    loadInput,
    returnInput,
    totalLoaded,
    totalReturn,
    stock,
    salesSum,
    quantityValue,
    widthClasses,
}) => {
    switch (columnKey) {
        case 'name':
            return isEditing ? (
                <input
                    className="w-full"
                    value={editData.name ?? ''}
                    onChange={(e) => onChange('name', e.target.value)}
                    onKeyDown={onKeyDown}
                    autoFocus
                />
            ) : (
                product.name || '—'
            );

        case 'code':
            return isEditing ? (
                <div className={`${widthClasses} overflow-hidden`}>
                    <input
                        className="w-full"
                        value={editData.code ?? ''}
                        onChange={(e) => onChange('code', e.target.value)}
                        onKeyDown={onKeyDown}
                    />
                </div>
            ) : (
                <div className={`${widthClasses} overflow-hidden`}>
                    {product.code || '—'}
                </div>
            );

        case 'unit':
            return isEditing ? (
                <div className={`${widthClasses} overflow-hidden`}>
                    <input
                        className="w-full"
                        value={editData.unit ?? ''}
                        onChange={(e) => onChange('unit', e.target.value)}
                        onKeyDown={onKeyDown}
                    />
                </div>
            ) : (
                <div className={`${widthClasses} overflow-hidden`}>
                    {product.unit ?? '—'}
                </div>
            );

        case 'price':
            return isEditing ? (
                <div className={`${widthClasses} overflow-hidden`}>
                    <input
                        className="w-full"
                        type="number"
                        step="0.01"
                        value={editData.price ?? ''}
                        onChange={(e) => numInput(e, 'price', product.id)}
                        onKeyDown={onKeyDown}
                    />
                </div>
            ) : (
                <div className={`${widthClasses} overflow-hidden`}>
                    {price.toFixed(2)}
                </div>
            );

        case 'price_with_markup':
            <div className={`${widthClasses} overflow-hidden`}>
                return (product.price_with_markup ?? 0).toFixed(2);
            </div>;

        case 'quantity':
            return isEditing ? (
                <div className={`${widthClasses} overflow-hidden`}>
                    <input
                        className={cn(
                            'w-full',
                            quantityValue < 5 && 'text-red-600 font-bold'
                        )}
                        type="number"
                        step="1"
                        value={editData.quantity ?? ''} // Используем строковое значение
                        onChange={(e) => onChange('quantity', e.target.value)}
                        onKeyDown={onKeyDown}
                    />
                </div>
            ) : (
                <div className={`${widthClasses} overflow-hidden`}>
                    <span
                        className={cn(
                            quantityValue < 5 && 'text-red-600 font-bold'
                        )}
                    >
                        {roundToTwo(quantityValue)}
                    </span>
                </div>
            );

        case 'deliveries':
            return isEditing ? (
                <div className={`${widthClasses} overflow-hidden`}>
                    <input
                        className="w-full"
                        type="number"
                        step="1"
                        min="0"
                        value={editData.deliveries ?? ''}
                        onChange={(e) => onChange('deliveries', e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && applyDeliveries) {
                                e.preventDefault();
                                applyDeliveries();
                            }
                        }}
                    />
                </div>
            ) : (
                roundToTwo(deliveries)
            );

        case 'returns':
            return isEditing ? (
                <input
                    className="w-full"
                    type="number"
                    step="1"
                    min="0"
                    value={editData.returns ?? ''}
                    onChange={(e) => onChange('returns', e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && applyReturns) {
                            e.preventDefault();
                            applyReturns();
                        }
                    }}
                />
            ) : (
                <div className={`${widthClasses} overflow-hidden`}>
                    {roundToTwo(returns)}
                </div>
            );

        case 'cost':
            return (
                <div className={`${widthClasses} overflow-hidden`}>
                    {roundToTwo(cost)}
                </div>
            );

        case 'markup':
            return isEditing ? (
                <div className={`${widthClasses} overflow-hidden`}>
                    <input
                        className="w-full"
                        type="number"
                        step="0.01"
                        value={editData.markup_percent ?? ''}
                        onChange={(e) =>
                            numInput(e, 'markup_percent', product.id)
                        }
                        onKeyDown={onKeyDown}
                    />
                </div>
            ) : (
                <div className={`${widthClasses} overflow-hidden`}>
                    {`${roundToTwo(oneWithMarkup)} (${markupPct} %)`}
                </div>
            );

        case 'costWithMarkup':
            return roundToTwo(costWithMarkup);

        case 'load':
            return isEditing ? (
                <div className={`${widthClasses} overflow-hidden`}>
                    <input
                        className="w-full"
                        type="number"
                        step="1"
                        value={editData.load ?? ''}
                        onChange={(e) => numInput(e, 'load', product.id)}
                        onKeyDown={onKeyDown}
                    />
                </div>
            ) : (
                <div className={`${widthClasses} overflow-hidden`}>
                    {roundToTwo(loadInput)}
                </div>
            );

        case 'return_qty':
            return isEditing ? (
                <input
                    className="w-full"
                    type="number"
                    step="1"
                    min="0"
                    value={editData.return_qty ?? ''}
                    onChange={(e) => numInput(e, 'return_qty', product.id)}
                    onKeyDown={onKeyDown}
                />
            ) : (
                roundToTwo(returnInput)
            );

        case 'total_loaded':
            return roundToTwo(totalLoaded);

        case 'total_return':
            return roundToTwo(totalReturn);

        case 'stock':
            return roundToTwo(stock);

        case 'salesSum':
            return `(${roundToTwo(stock)}) ${salesSum}`;

        case 'actions':
            return isEditing ? (
                <>
                    <button className="text-green-600" onClick={onSave}>
                        ✔
                    </button>
                    <button className="text-gray-600" onClick={onCancel}>
                        ✖
                    </button>
                </>
            ) : (
                <>
                    <button className="text-blue-600" onClick={onStartEdit}>
                        ✎
                    </button>
                    <button className="text-red-600" onClick={onDelete}>
                        🗑
                    </button>
                </>
            );

        default:
            return '—';
    }
};

export default React.memo(TableCellRenderer);
