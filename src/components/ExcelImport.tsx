'use client';

import { ProductField, fieldMapping } from '@/constans/importFieldMapping';
import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import Spinner from '@/components/ui/Spinner';

interface ExcelImportProps {
    onImport: () => void;
}

export default function ExcelImport({ onImport }: ExcelImportProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();

        reader.onload = async (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const sheetName = wb.SheetNames[0];
            const sheet = wb.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json<string[]>(sheet, {
                header: 1,
            });

            const headers = data[0]?.map((h) =>
                h?.toString().trim().toLowerCase()
            );
            if (!headers) {
                console.error('Заголовки не найдены');
                setLoading(false);
                return;
            }

            const headerIndexes: Partial<Record<ProductField, number>> = {};
            headers.forEach((header, index) => {
                const mapped = fieldMapping[header];
                if (mapped) headerIndexes[mapped] = index;
            });

            const products = data.slice(1).map((row, rowIndex) => {
                const name = row[headerIndexes.name ?? -1]?.toString().trim();
                if (!name) {
                    console.warn(
                        `Пропущена строка ${rowIndex + 2} — отсутствует название`
                    );
                    return null;
                }

                return {
                    name,
                    code:
                        row[headerIndexes.code ?? -1]?.toString().trim() ||
                        undefined,
                    unit:
                        row[headerIndexes.unit ?? -1]?.toString().trim() || '',
                    price: parseFloat(
                        row[headerIndexes.price ?? -1]
                            ?.toString()
                            .replace(',', '.') || '0'
                    ),
                    quantity: parseFloat(
                        row[headerIndexes.quantity ?? -1]
                            ?.toString()
                            .replace(',', '.') || '0'
                    ),
                };
            });

            const validProducts = products.filter(Boolean) as {
                name: string;
                code?: string;
                unit: string;
                price: number;
                quantity: number;
            }[];

            for (const product of validProducts) {
                try {
                    const res = await fetch('/api/import-products', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(product),
                    });
                    const result = await res.json();
                    if (!result.success) {
                        console.error(
                            `Ошибка при импорте товара "${product.name}":`,
                            result.error
                        );
                    }
                } catch (error) {
                    console.error(
                        `Ошибка при импорте товара "${product.name}":`,
                        error
                    );
                }
            }

            setLoading(false);
            onImport();
        };

        reader.readAsBinaryString(file);
    };

    return (
        <div className="space-y-2">
            <input
                type="file"
                accept=".xlsx, .xls"
                ref={inputRef}
                onChange={handleFile}
                className="mb-2"
            />
            {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Spinner />
                    Импорт данных...
                </div>
            )}
        </div>
    );
}
