'use client';
import { useState } from 'react';
import ExcelJS from 'exceljs';
import { addProduct } from '@/services/products';

// Определяем интерфейс для структуры строки из Excel
interface ProductRow {
    name_code: string;
    unit_id: number;
    price: number;
    quantity: number;
    acceptable_quantity: number;
    critical_quantity: number;
    required_quantity: number;
}

const ExcelImport = () => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setError('Файл не выбран');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Чтение файла с помощью FileReader
            const buffer = await file.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);

            // Получаем первый лист
            const worksheet = workbook.worksheets[0];
            if (!worksheet) {
                throw new Error('Лист не найден в файле Excel');
            }

            // Преобразуем строки в массив объектов
            const jsonData: ProductRow[] = [];
            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber === 1) return; // Пропускаем заголовок (если есть)

                const rowData: ProductRow = {
                    name_code: String(row.getCell(1).value || ''),
                    unit_id: Number(row.getCell(2).value || 0),
                    price: Number(row.getCell(3).value || 0),
                    quantity: Number(row.getCell(4).value || 0),
                    acceptable_quantity: Number(row.getCell(5).value || 0),
                    critical_quantity: Number(row.getCell(6).value || 0),
                    required_quantity: Number(row.getCell(7).value || 0),
                };

                jsonData.push(rowData);
            });

            // Отправляем данные в addProduct
            for (const row of jsonData) {
                try {
                    await addProduct(row);
                } catch (err) {
                    console.error(
                        `Ошибка при добавлении продукта ${row.name_code}:`,
                        err
                    );
                    setError(`Ошибка при добавлении продукта ${row.name_code}`);
                }
            }

            if (!error) {
                alert('Продукты успешно импортированы');
            }
        } catch (err) {
            console.error('Ошибка при обработке файла:', err);
            setError('Не удалось обработать файл Excel');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                disabled={isLoading}
            />
            {isLoading && <p>Загрузка...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default ExcelImport;
