import type { ExtendedProduct } from './row';

/** три режима отображения таблицы */
export type Mode = 'dashboard' | 'sales';

/** какую сущность получит строка в каждом режиме */
export type ProductOf<M extends Mode> = ExtendedProduct;

/** полезная нагрузка для колбэка onUpdate в разных режимах */
export type UpdatePayloadOf<M extends Mode> = M extends 'sales'
    ? { id: string; markup: number; load: number; return_qty: number }
    : never;
