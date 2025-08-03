'use client';

import { ExtendedProduct } from '@/types';
interface Props {
    product: ExtendedProduct;
    editData: Partial<ExtendedProduct>;
}

export const PriceWithMarkupCell = ({ product, editData }: Props) => {
    const price = Number(editData.price ?? product.price ?? 0);
    const markup = Number(
        editData.markup_percent ?? product.markup_percent ?? 0
    );
    const oneWithMarkup = price * (1 + markup / 100);
    const formatted = oneWithMarkup.toFixed(2);

    return <>{formatted}</>;
};
