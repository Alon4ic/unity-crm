// hooks/useImportProducts.ts
import { useState } from 'react';
import * as xlsx from 'xlsx';
import { toast } from 'react-hot-toast';

export interface ProductInput {
    name: string;
    code?: string | null;
    unit: string;
    price: number;
    quantity: number;
}

const FIELD_ALIASES = {
    name: ['name', 'название', 'назва'],
    code: ['code', 'артикул', 'штрихкод'],
    unit: ['unit', 'ед.изм', 'од.вим'],
    price: ['price', 'цена', 'ціна'],
    quantity: ['quantity', 'кол-во', 'кількість', 'к-сть'],
};

const findField = (row: Record<string, any>, aliases: string[]) => {
    for (const alias of aliases) {
        const key = Object.keys(row).find(
            (k) => k.toLowerCase().trim() === alias.toLowerCase()
        );
        if (key) return row[key];
    }
    return undefined;
};

export const useImportProducts = () => {
    const [loading, setLoading] = useState(false);
    const [importedCount, setImportedCount] = useState(0);
    const [errors, setErrors] = useState<string[]>([]);

    const importFromFile = async (file: File) => {
        setLoading(true);
        setImportedCount(0);
        setErrors([]);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = xlsx.read(arrayBuffer, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const raw = xlsx.utils.sheet_to_json<Record<string, any>>(sheet);

            const validProducts: ProductInput[] = [];
            const skippedRows: string[] = [];

            raw.forEach((row, i) => {
                const product: ProductInput = {
                    name: String(
                        findField(row, FIELD_ALIASES.name) || ''
                    ).trim(),
                    code:
                        String(
                            findField(row, FIELD_ALIASES.code) || ''
                        ).trim() || null,
                    unit: String(
                        findField(row, FIELD_ALIASES.unit) || 'шт'
                    ).trim(),
                    price: Number(findField(row, FIELD_ALIASES.price)) || 0,
                    quantity:
                        Number(findField(row, FIELD_ALIASES.quantity)) || 0,
                };

                const isValid =
                    product.name && product.price >= 0 && product.quantity >= 0;

                if (isValid) {
                    validProducts.push(product);
                } else {
                    skippedRows.push(
                        `Строка ${i + 2}: ${JSON.stringify(product)}`
                    );
                }
            });

            if (validProducts.length === 0) {
                toast.error('Не удалось найти корректные товары для импорта');
                return;
            }

            const res = await fetch('/api/import-products', {
                method: 'POST',
                body: JSON.stringify(validProducts),
                headers: { 'Content-Type': 'application/json' },
            });

            const result = await res.json();

            if (res.ok) {
                toast.success(`Импортировано ${result.count} товаров`);
                setImportedCount(result.count);
                setErrors(skippedRows);
            } else {
                toast.error('Ошибка при импорте товаров');
                console.error(result.error);
            }
        } catch (error) {
            toast.error('Ошибка при чтении файла');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return {
        importFromFile,
        loading,
        importedCount,
        errors,
    };
};
