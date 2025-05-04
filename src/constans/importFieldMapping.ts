// src/lib/importFieldMapping.ts

export type ProductField = 'name' | 'code' | 'unit' | 'price' | 'quantity';

export const fieldMapping: Record<string, ProductField> = {
    // Название
    название: 'name',
    name: 'name',
    наименование: 'name',
    назва: 'name',

    // Код
    код: 'code',
    артикул: 'code',
    індекс: 'code',
    index: 'code',

    // Единица измерения
    единица: 'unit',
    одиниця: 'unit',
    unit: 'unit',

    // Цена
    цена: 'price',
    'цена за кг': 'price',
    'цена за 1 кг': 'price',
    ціна: 'price',
    'ціна за кг': 'price',
    'ціна за 1 кг': 'price',

    // Количество
    количество: 'quantity',
    кількість: 'quantity',
    quantity: 'quantity',
};
