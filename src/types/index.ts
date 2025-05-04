export type Locale = 'en' | 'uk' | 'ru';
export type CustomFieldType = 'string' | 'number' | 'boolean' | 'date';

export type Product = {
    id: number; // если Supabase использует UUID
    code?: string;
    name: string;
    unit: string;
    price: number;
    quantity: number;
    extra_fields?: Record<string, string | number >;
    created_at?: string;
};


// Типы для операций с продуктами
export type InsertProduct = Omit<Product, 'id'>;
export type UpdateProduct = Partial<Product>;

// Тип для работы с кастомными полями
export interface CustomFieldConfig {
    name: string;
    type: CustomFieldType;
    defaultValue?: unknown;
}
