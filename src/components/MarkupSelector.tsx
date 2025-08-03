'use client';

import React from 'react';
import { ExtendedProduct } from '@/types';

interface MarkupSelectorProps {
    products: ExtendedProduct[];
    selectedProductId?: string;
    markupPercent: string;
    isApplying: boolean;
    onProductChange: (id: string) => void;
    onMarkupChange: (value: string) => void;
    onApply: () => void;
}

export const MarkupSelector: React.FC<MarkupSelectorProps> = ({
    products,
    selectedProductId,
    markupPercent,
    isApplying,
    onProductChange,
    onMarkupChange,
    onApply,
}) => {
    return (
        <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center w-full">
            <select
                className="border rounded p-2 flex-1 w-[300px]"
                value={selectedProductId || ''}
                onChange={(e) => onProductChange(e.target.value)}
            >
                <option className="w-full wrap" value="">
                    Выберите товар
                </option>
                {products.map((product) => (
                    <option key={product.id} value={product.id}>
                        {product.name} — {product.price}₴
                    </option>
                ))}
            </select>

            <input
                type="number"
                value={markupPercent}
                onChange={(e) => onMarkupChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') onApply();
                }}
                placeholder="Наценка %"
                className="border rounded px-2 py-1 w-auto"
            />

            <button
                onClick={onApply}
                disabled={isApplying}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                Применить
            </button>
        </div>
    );
};
