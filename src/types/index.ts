import { Key, ReactNode } from 'react';

export type Locale = 'en' | 'uk' | 'ru';
export type CustomFieldType = 'string' | 'number' | 'boolean' | 'date';

export interface ExtendedProduct {
    initial_quantity: null;
    id: string;
    product_id?: string;
    name: string;
    code?: string;
    unit?: string;
    price: number;
    quantity: number;
    markup_percent: number;
    category_id: string | null;
    category?: string;
    created_at: string;
    updated_at: string;
    sort_order?: number;
    deliveries?: number;
    returns?: number;
    total_loaded?: number;
    total_return?: number;
    price_with_markup?: number;
    cost?: number;
    costWithMarkup?: number;
    stock?: number;
    salesSum?: number;
    sold?: number;
    load?: number;
    return_qty?: number;
    background_color?: string; // Новое поле для цвета фона
}

export interface Product {
    id: string;
    name: string;
    code: string | null;
    unit: string;
    price: number;
    quantity: number;
    markup_percent: number;
    category_id: string | null;
    created_at: string;
    updated_at: string;
    sort_order: number;
    initial_quantity: number | null;
    background_color: string; // Новое поле для цвета фона
}

export type EditableField =
    | 'name'
    | 'code'
    | 'unit'
    | 'price'
    | 'quantity'
    | 'markup_percent'
    | 'deliveries'
    | 'returns'
    | 'load'
    | 'return_qty'
    | 'initial_quantity';

// Типы для операций с продуктами
export type InsertProduct = Omit<Product, 'id'>;
export type UpdateProduct = Partial<Product>;

// Тип для работы с кастомными полями
export interface CustomFieldConfig {
    name: string;
    type: CustomFieldType;
    defaultValue?: unknown;
}

export interface Unit {
    id: string;
    code: string;
}

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
export interface LoadTransaction {
    id: string;
    sale_page_id: string;
    product_id: string;
    /** разовая загрузка */
    load: number;
    price: number;
    price_with_markup: number;
    /** разовый возврат */
    return_qty: number;
    markup: number | null;
    created_at: string;
}

export interface ReturnBuffer {
    id: string;
    sale_page_id: string;
    product_id: string;
    quantity: number;
    inserted_at: string;
}

export type DailySalesRow = {
    id: string;
    name: string;
    code: string;
    price: number;
    price_with_markup: number;
    load: number;
    return_qty: number;
    markup_percent: number;
    stock: number;
    salesSum: number;
};

export interface ParsedItem {
    name: string;
    code?: string;
    quantity: number;
    unit?: string;
    price?: number;
    draft?: boolean; // ← обязательно включено
}

export interface RowForTable extends ExtendedProduct {
    total_loaded: number;
    total_return: number;
    stock: number;
    salesSum: number;
    price_with_markup: number;
}
