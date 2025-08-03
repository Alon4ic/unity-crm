import type { Mode } from './mode'; // ← добавили

export type ColumnKey =
    | 'name'
    | 'code'
    | 'unit'
    | 'price'
    | 'quantity'
    | 'deliveries'
    | 'returns'
    | 'cost'
    | 'markup'
    | 'costWithMarkup'
    | 'actions'
    | 'price_with_markup'
    | 'load'
    | 'return_qty'
    | 'total_loaded'
    | 'total_return'
    | 'stock'
    | 'salesSum';

export const columnSets: Record<Mode, ColumnKey[]> = {
    dashboard: [
        'name',
        'code',
        'unit',
        'price',
        'quantity',
        'deliveries',
        'returns',
        'cost',
        'markup',
        'costWithMarkup',
        'actions',
    ],
    sales: [
        'name',
        'code',
        'unit',
        'price',
        'quantity',
        'price_with_markup',
        'load',
        'total_loaded',
        'return_qty',
        'total_return',
        'salesSum',
        'actions',
    ],
};

export const columnTitles: Record<ColumnKey, string> = {
    name: 'Название',
    code: 'Код',
    unit: 'Единица',
    price: 'Цена',
    quantity: 'Количество',
    deliveries: 'Поставки',
    returns: 'Возвраты',
    cost: 'Стоимость',
    markup: 'Наценка (%)',
    price_with_markup: 'Стоимость с наценкой',
    costWithMarkup: 'Стоимость (%)',
    actions: 'Действия',
    load: 'Загрузка',
    total_loaded: 'Всего выдано',
    return_qty: 'Возврат',
    total_return: 'Всего возвращено',
    stock: 'Остаток',
    salesSum: 'Сумма продаж',
};

/* если в других файлах ещё нужен Mode, ре‑экспортируем: */
export type { Mode } from './mode';

export const columnSizes: Record<
    string,
    {
        laptop: string;
        middle?: string;
        md?: string;
        sm?: string;
        sl?: string;
        phone?: string;
    }
> = {
    name: {
        laptop: 'laptop:w-[270px]',
        middle: 'middle:w-[230px]',
        md: 'md:w-[200px]',
        sm: 'sm:w-[180px]',
        sl: 'sl:w-[160px]',
        phone: 'phone:w-[120px]',
    },
    code: {
        laptop: 'w-[100px]',
        middle: 'middle:w-[90px]',
        md: 'md:w-[50px]',
        sm: 'sm:w-[40px]',
        sl: 'sl:w-[30px]',
    },
    unit: {
        laptop: 'laptop:w-[80px]',
        middle: 'middle:w-[60px]',
        md: 'md:w-[40px]',
        sm: 'sm:w-[30px]',
        sl: 'sl:w-[20px]',
    },
    price: {
        laptop: 'laptop:w-[100px]',
        middle: 'middle:w-[80px]',
        md: 'md:w-[60px]',
        sm: 'sm:w-[40px]',
        sl: 'sl:w-[30px]',
    },
    quantity: {
        laptop: 'laptop:w-[100px]',
        middle: 'middle:w-[80px]',
        md: 'md:w-[60px]',
        sm: 'sm:w-[40px]',
        sl: 'sl:w-[30px]',
    },
    deliveries: {
        laptop: 'laptop:w-[100px]',
        middle: 'middle:w-[80px]',
        md: 'md:w-[60px]',
        sm: 'sm:w-[40px]',
        sl: 'sl:w-[30px]',
    },
    returns: {
        laptop: 'laptop:w-[100px]',
        middle: 'middle:w-[80px]',
        md: 'md:w-[60px]',
        sm: 'sm:w-[40px]',
        sl: 'sl:w-[30px]',
    },
    cost: {
        laptop: 'laptop:w-[100px]',
        middle: 'middle:w-[80px]',
        md: 'md:w-[60px]',
        sm: 'sm:w-[40px]',
        sl: 'sl:w-[30px]',
    },
    markup: {
        laptop: 'laptop:w-[120px]',
        middle: 'middle:w-[100px]',
        md: 'md:w-[80px]',
        sm: 'sm:w-[60px]',
        sl: 'sl:w-[50px]',
    },
    price_with_markup: {
        laptop: 'laptop:w-[100px]',
        middle: 'middle:w-[80px]',
        md: 'md:w-[60px]',
        sm: 'sm:w-[50px]',
        sl: 'sl:w-[40px]',
    },
    costWithMarkup: {
        laptop: 'laptop:min-w-[80px]',
        middle: 'middle:w-[80px]',
        md: 'md:w-[60px]',
        sm: 'sm:w-[40px]',
        sl: 'sl:w-[30px]',
    },
    actions: {
        laptop: 'laptop:w-[60px]',
        middle: 'middle:w-[60px]',
        md: 'md:w-[60px]',
        sm: 'sm:w-[60px]',
        sl: 'sl:w-[50px]',
    },
    load: {
        laptop: 'laptop:w-[100px]',
        middle: 'middle:w-[80px]',
        md: 'md:w-[60px]',
        sm: 'sm:w-[40px]',
        sl: 'sl:w-[30px]',
    },
    total_loaded: {
        laptop: 'laptop:w-[100px]',
        middle: 'middle:w-[80px]',
        md: 'md:w-[60px]',
        sm: 'sm:w-[40px]',
        sl: 'sl:w-[30px]',
    },
    return_qty: {
        laptop: 'laptop:w-[100px]',
        middle: 'middle:w-[100px]',
        md: 'md:w-[80px]',
        sm: 'sm:w-[60px]',
        sl: 'sl:w-[50px]',
    },
    total_return: {
        laptop: 'laptop:w-[100px]',
        middle: 'middle:w-[80px]',
        md: 'md:w-[60px]',
        sm: 'sm:w-[40px]',
        sl: 'sl:w-[30px]',
    },
    stock: {
        laptop: 'laptop:w-[120px]',
        middle: 'middle:w-[100px]',
        md: 'md:w-[80px]',
        sm: 'sm:w-[60px]',
        sl: 'sl:w-[50px]',
    },
    salesSum: {
        laptop: 'laptop:w-[120px]',
        middle: 'middle:w-[100px]',
        md: 'md:w-[80px]',
        sm: 'sm:w-[60px]',
        sl: 'sl:w-[50px]',
    },
};
