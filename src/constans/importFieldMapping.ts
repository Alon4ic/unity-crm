export type ProductField =
    | 'name'
    | 'code'
    | 'unit'
    | 'price'
    | 'quantity'
    | 'markup_percent' // ← добавлено
    | 'category_id'; // ← добавлено

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

    // Наценка
    наценка: 'markup_percent', // ← добавлено
    'наценка %': 'markup_percent',
    'процент наценки': 'markup_percent',
    markup_percent: 'markup_percent',

    // Категория
    категория: 'category_id', // ← добавлено
    категорія: 'category_id',
    category: 'category_id',
    category_id: 'category_id',
};
