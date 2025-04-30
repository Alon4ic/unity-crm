export type Locale = 'en' | 'uk' | 'ru';

export type Product = {
    id: number;
    name_code: string;
    unit_id: number;
    price: number;
    quantity: number;
    required_quantity: number;
    acceptable_quantity: number;
    critical_quantity: number;
    supplier_id: number;
};


// Тип для создания продукта (без id)
export type InsertProduct = Omit<Product, 'id'>;