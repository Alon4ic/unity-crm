import Dexie, { Table } from 'dexie';

/* ---------- Cправочники ---------- */
export interface Category {
    id: string;
    name: string;
    created_at: string;
    colors?: string;
}

export interface Unit {
    id: string;
    code: string;
}

/* ---------- Товары ---------- */
export interface Product {
    id: string;
    name: string;
    code: string | null;
    unit: string;
    price: number;
    quantity: number;
    markup_percent: number | null;
    category_id: string | null;
    initial_quantity: number | null;
    created_at: string | null;
    updated_at: string | null;
    sort_order?: number | null;
    background_color?: string | null;
}
export interface ExtendedProduct extends Product {
    markup: any;
    load?: number;
    return_qty?: number;
    product_id?: string;
    total_loaded?: number; // Σ загрузок
    total_return?: number;
    price_with_markup: number;
    deliveries?: number; // Явно указываем как number
    returns?: number;
    background_color?: string | null;
    sort_order?: number | null;
}

/* ---------- Продажи (агрегированные totals) ---------- */
export interface Sale {
    id: string;
    product_id: string;
    sale_page_id: string;
    updated_at: string;
    load: number;
    return_qty: number;
    created_at: string;
    created_date: string;
}

export interface SalePage {
    id: string;
    name: string;
    created_at: string;
    is_archived: boolean;
}

/* ---------- Транзакции загрузок / возвратов ---------- */
export interface LoadTransaction {
    id: string;
    sale_page_id: string;
    product_id: string;
    /** разовая загрузка */
    load: number;
    /** разовый возврат */
    return_qty: number;
    markup: number | null;
    price: number; // ← НОВОЕ
    price_with_markup: number; // ← НОВОЕ
    created_at: string;
}
/* ---------- Временные сессии менеджеров ---------- */
export interface ManagerSession {
    id: string;
    sale_page_id: string;
    started_at: string;
    ended_at?: string | null;
    duration_days?: number | null;
    total_sales_sum?: number | null;
    total_loaded?: number;
    total_return?: number;
}
/* ---------- Опциональный возврат товаров ---------- */
export interface ReturnBuffer {
    id: string;
    sale_page_id: string;
    product_id: string;
    quantity: number;
    inserted_at: string;
}
/* ---------- Статистика ---------- */

export interface ProductEvent {
    id: string; // UUID
    product_id: string;
    type: 'delivery' | 'return';
    quantity: number;
    created_at: string; // ISO-строка
}

/* ---------- Dexie DB ---------- */
export class AppDB extends Dexie {
    /* Таблицы */
    products!: Table<Product, string>;
    sales!: Table<Sale, string>;
    sale_pages!: Table<SalePage, string>;
    categories!: Table<Category, string>;
    units!: Table<Unit, string>;
    load_transactions!: Table<LoadTransaction, string>;
    manager_sessions!: Table<ManagerSession, string>;
    return_buffer!: Table<ReturnBuffer, string>;
    product_events!: Table<ProductEvent, string>;

    constructor() {
        super('localDB');

        this.version(11).stores({
            categories: 'id, name, created_at, colors',
            products:
                'id, name, code, category_id, created_at, updated_at, sort_order',
            sales: 'id, [sale_page_id+product_id+created_date]',
            sale_pages: 'id, name, created_at, is_archived',
            load_transactions: 'id, sale_page_id, product_id, created_at',
            manager_sessions:
                'id, sale_page_id, started_at, ended_at, duration_days, total_sales_sum, total_loaded, total_return',
            units: 'id, code',
            // 🔧 Здесь ключ: [sale_page_id + product_id]
            return_buffer: 'id, sale_page_id, product_id, inserted_at',
            product_events: 'id, product_id, type, created_at',
        });
    }
}

export const db = new AppDB();
