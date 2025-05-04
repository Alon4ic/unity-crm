// src/lib/dexieDB.ts
import Dexie, { Table } from 'dexie';

export interface Product {
    id: string;
    name: string;
    code?: string;
    unit: string;
    price: number;
    quantity: number;
    extra_fields?: Record<string, any>;
    created_at: string;
}

export class MyDexie extends Dexie {
    products!: Table<Product, string>;

    constructor() {
        super('MyLocalDB');
        this.version(1).stores({
            products: 'id, name, code', // id — primary key, остальные — индексы
        });
    }
}

export const db = new MyDexie();
