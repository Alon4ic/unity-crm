import { Product } from "@/lib/dexie/productsDB";

export const ALLOWED: (keyof Product)[] = [
  'id',
  'name',
  'code',
  'unit',
  'price',
  'quantity',
  'markup_percent',
  'category_id',
  'created_at',
  'updated_at'
];