// 'use client';

// import { useEffect, useState } from 'react';
// import { saveProduct } from '@/lib/saveProduct';
// import { supabase } from '@/lib/supabase/client';
// import { toast } from 'react-hot-toast';

// interface Product {
//     id: string;
//     code: string | null;
//     name: string;
//     unit: string;
//     price: number;
//     quantity: number;
//     created_at: string;
// }

// interface ProductInput {
//     code?: string;
//     name: string;
//     unit: string;
//     price: number;
//     quantity: number;
// }

// export default function DashboardPage() {
//     const [products, setProducts] = useState<Product[]>([]);
//     const [newProduct, setNewProduct] = useState({
//         code: '',
//         name: '',
//         unit: 'шт',
//         price: '',
//         quantity: '',
//     });
//     const [loading, setLoading] = useState(false);
//     const [fetching, setFetching] = useState(true);

//     useEffect(() => {
//         fetchProducts();
//     }, []);

//     // Получение списка товаров
//     const fetchProducts = async () => {
//         try {
//             setFetching(true);
//             const { data, error } = await supabase
//                 .from('products')
//                 .select('*')
//                 .order('created_at', { ascending: false });

//             console.log('Supabase response:', { data, error }); // Добавьте это

//             if (error) throw error;

//             console.log('Parsed data:', data); // Проверка структуры данных
//             setProducts(data || []);
//         } catch (error) {
//             console.error('Ошибка загрузки:', error);
//             toast.error('❌ Не удалось загрузить товары');
//         } finally {
//             setFetching(false);
//         }
//     };

//     // Обработчик изменений в форме
//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setNewProduct({
//             ...newProduct,
//             [e.target.name]: e.target.value,
//         });
//     };

//     // Добавление нового товара
//     const handleAddProduct = async () => {
//         if (!newProduct.name.trim()) {
//             toast.error('Введите название товара');
//             return;
//         }

//         try {
//             setLoading(true);

//             const productData: ProductInput = {
//                 code: newProduct.code.trim() || undefined,
//                 name: newProduct.name.trim(),
//                 unit: newProduct.unit || 'шт',
//                 price: Number(newProduct.price) || 0,
//                 quantity: Number(newProduct.quantity) || 0,
//             };

//             const result = await saveProduct(productData);

//             if (!result.success) throw new Error(result.error);

//             // Добавляем проверку и явное приведение типа
//             if (result.data) {
//                 setProducts((prev) => [
//                     result.data as unknown as Product, // Явное приведение типа
//                     ...prev,
//                 ]);
//             }

//             setNewProduct({
//                 code: '',
//                 name: '',
//                 unit: 'шт',
//                 price: '',
//                 quantity: '',
//             });

//             toast.success('✅ Товар успешно добавлен!');
//         } catch (error) {
//             console.error('Ошибка добавления:', error);
//             toast.error('❌ Ошибка при добавлении товара');
//         } finally {
//             setLoading(false);
//         }
//     };
//     return (
//         <div className="p-8 max-w-7xl mx-auto">
//             <h1 className="text-2xl font-bold mb-6">Управление товарами</h1>

//             {/* Индикатор загрузки */}
//             {fetching && (
//                 <div className="text-center p-4 text-gray-500">Загрузка...</div>
//             )}

//             {/* Список товаров */}
//             {!fetching && (
//                 <>
//                     <div className="overflow-x-auto mb-8">
//                         <table className="w-full border-collapse">
//                             <thead className="bg-gray-100">
//                                 <tr>
//                                     <th className="p-3 text-left">#</th>
//                                     <th className="p-3 text-left">Код</th>
//                                     <th className="p-3 text-left">Название</th>
//                                     <th className="p-3 text-left">Ед. изм.</th>
//                                     <th className="p-3 text-right">Цена</th>
//                                     <th className="p-3 text-right">Кол-во</th>
//                                     <th className="p-3 text-right">Сумма</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {products.map((product, index) => (
//                                     <tr
//                                         key={product.id}
//                                         className="hover:bg-gray-50"
//                                     >
//                                         <td className="p-3 border-t">
//                                             {index + 1}
//                                         </td>
//                                         <td className="p-3 border-t">
//                                             {product.code ?? '-'}
//                                         </td>
//                                         <td className="p-3 border-t font-medium">
//                                             {product.name}
//                                         </td>
//                                         <td className="p-3 border-t">
//                                             {product.unit}
//                                         </td>
//                                         <td className="p-3 border-t text-right">
//                                             {product.price.toFixed(2)}
//                                         </td>
//                                         <td className="p-3 border-t text-right">
//                                             {product.quantity}
//                                         </td>
//                                         <td className="p-3 border-t text-right font-medium">
//                                             {(
//                                                 product.price * product.quantity
//                                             ).toFixed(2)}
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>

//                         {products.length === 0 && (
//                             <div className="text-center p-6 text-gray-500">
//                                 Нет товаров в базе данных
//                             </div>
//                         )}
//                     </div>

//                     {/* Форма добавления */}
//                     <div className="bg-white p-6 rounded-lg shadow-sm border">
//                         <h2 className="text-lg font-semibold mb-4">
//                             Добавить новый товар
//                         </h2>
//                         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
//                             <input
//                                 name="code"
//                                 placeholder="Код товара"
//                                 value={newProduct.code}
//                                 onChange={handleChange}
//                                 className="input-field"
//                             />
//                             <input
//                                 name="name"
//                                 placeholder="Название*"
//                                 value={newProduct.name}
//                                 onChange={handleChange}
//                                 className="input-field md:col-span-2"
//                                 required
//                             />
//                             <input
//                                 name="unit"
//                                 placeholder="Единица измерения"
//                                 value={newProduct.unit}
//                                 onChange={handleChange}
//                                 className="input-field"
//                             />
//                             <input
//                                 type="number"
//                                 name="price"
//                                 placeholder="Цена"
//                                 value={newProduct.price}
//                                 onChange={handleChange}
//                                 className="input-field"
//                             />
//                             <input
//                                 type="number"
//                                 name="quantity"
//                                 placeholder="Количество"
//                                 value={newProduct.quantity}
//                                 onChange={handleChange}
//                                 className="input-field"
//                             />
//                         </div>

//                         <button
//                             onClick={handleAddProduct}
//                             disabled={loading}
//                             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
//                         >
//                             {loading ? 'Добавление...' : 'Добавить товар'}
//                         </button>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }

// // Стили для инпутов (добавить в CSS)
// // .input-field {
// //   @apply border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500;
// // }

'use client';

import { useState } from 'react';

export default function ExcelImport({ onImport }: { onImport: () => void }) {
    const [loading, setLoading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/import-products', {
            method: 'POST',
            body: formData, // ВАЖНО: отправляем как multipart/form-data
        });

        if (response.ok) {
            onImport(); // 🔁 Перезапрашиваем данные
        } else {
            const errorText = await response.text();
            console.error('Ошибка импорта:', errorText);
        }

        setLoading(false);
    };

    return (
        <div>
            <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                disabled={loading}
            />
            {loading && <p>Загрузка...</p>}
        </div>
    );
}

// 'use client';

// import { useState } from 'react';
// import { toast } from 'react-hot-toast';

// interface ImportResult {
//     total: number;
//     imported: number;
//     errors: Array<{ row: number; message: string }>;
// }

// export default function ExcelImport({ onImport }: { onImport: () => void }) {
//     const [loading, setLoading] = useState(false);
//     const [errors, setErrors] = useState<
//         Array<{ row: number; message: string }>
//     >([]);

//     const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (!file) return;

//         setLoading(true);
//         setErrors([]);

//         try {
//             const formData = new FormData();
//             formData.append('file', file);

//             const response = await fetch('/api/import-products', {
//                 method: 'POST',
//                 body: formData,
//             });

//             const result: ImportResult = await response.json();

//             if (!response.ok) throw new Error('Ошибка импорта');

//             // Показываем результаты
//             if (result.imported > 0) {
//                 toast.success(
//                     `Успешно импортировано: ${result.imported}/${result.total}`
//                 );
//                 onImport();
//             }

//             if (result.errors.length > 0) {
//                 setErrors(result.errors);
//                 toast.error(
//                     `Ошибки в строках: ${result.errors.map((e) => e.row).join(', ')}`
//                 );
//             }
//         } catch (error) {
//             console.error('Ошибка:', error);
//             toast.error('Произошла ошибка при импорте файла');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="space-y-4">
//             <div className="flex items-center gap-4">
//                 <input
//                     type="file"
//                     accept=".xlsx"
//                     onChange={handleFileChange}
//                     disabled={loading}
//                     className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                 />
//                 {loading && <div className="animate-spin">⏳</div>}
//             </div>

//             {errors.length > 0 && (
//                 <div className="bg-red-50 p-4 rounded-md">
//                     <h3 className="text-red-700 font-medium mb-2">
//                         Ошибки при импорте ({errors.length}):
//                     </h3>
//                     <ul className="space-y-2">
//                         {errors.map((error, idx) => (
//                             <li key={idx} className="text-sm text-red-600">
//                                 Строка {error.row}: {error.message}
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             )}
//         </div>
//     );
// }


// import { NextRequest, NextResponse } from 'next/server';
// import * as xlsx from 'xlsx';
// import { prisma } from '@/lib/prisma';

// interface ProductCreate {
//     name: string;
//     code?: string | null;
//     unit: string;
//     price: number;
//     quantity: number;
// }

// const FIELD_MAP: Record<string, keyof ProductCreate> = {
//     // Название товара
//     название: 'name',
//     назва: 'name',
//     name: 'name',

//     // Артикул
//     артикул: 'code',
//     код: 'code',
//     code: 'code',

//     // Единица измерения
//     'ед.изм': 'unit',
//     'од.вим': 'unit',
//     unit: 'unit',

//     // Количество
//     'кол-во': 'quantity',
//     кількість: 'quantity',
//     quantity: 'quantity',
//     масса: 'quantity',
//     маса: 'quantity',

//     // Цена
//     цена: 'price',
//     ціна: 'price',
//     price: 'price',
// };

// export async function POST(req: NextRequest) {
//     const formData = await req.formData();
//     const file = formData.get('file') as File;

//     if (!file) {
//         return NextResponse.json(
//             { error: 'Файл не загружен' },
//             { status: 400 }
//         );
//     }

//     try {
//         const arrayBuffer = await file.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);

//         const workbook = xlsx.read(buffer, { type: 'buffer' });
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
//         const rawRows = xlsx.utils.sheet_to_json<Record<string, any>>(sheet);

//         const products: ProductCreate[] = [];

//         rawRows.forEach((row, index) => {
//             const product: Partial<ProductCreate> = {};

//             for (const [key, value] of Object.entries(row)) {
//                 const normalizedKey = key.toLowerCase().trim();
//                 const mappedKey = FIELD_MAP[normalizedKey];

//                 if (mappedKey) {
//                     product[mappedKey] =
//                         typeof value === 'string' ? value.trim() : value;
//                 }
//             }

//             // Приведение типов и значения по умолчанию
//             const finalProduct: ProductCreate = {
//                 name: String(product.name || '').trim(),
//                 code: product.code ? String(product.code).trim() : null,
//                 unit: String(product.unit || 'шт').trim(),
//                 price: Number(product.price) || 0,
//                 quantity: Number(product.quantity) || 0,
//             };

//             // Валидация
//             const isValid =
//                 finalProduct.name &&
//                 finalProduct.unit &&
//                 !isNaN(finalProduct.price) &&
//                 !isNaN(finalProduct.quantity);

//             if (isValid) {
//                 products.push(finalProduct);
//             } else {
//                 console.warn(
//                     `Пропущен из-за некорректных данных [${index}]:`,
//                     finalProduct
//                 );
//             }
//         });

//         if (products.length === 0) {
//             return NextResponse.json(
//                 { error: 'Нет корректных товаров для импорта' },
//                 { status: 400 }
//             );
//         }

//         // Импорт в базу данных
//         await prisma.$transaction(
//             products.map((product) => prisma.product.create({ data: product }))
//         );

//         return NextResponse.json({ success: true, count: products.length });
//     } catch (error) {
//         console.error('Ошибка при импорте товаров:', error);
//         return NextResponse.json(
//             { error: 'Ошибка при импорте' },
//             { status: 500 }
//         );
//     }
// }

// import { NextRequest, NextResponse } from 'next/server';
// import * as xlsx from 'xlsx';
// import { prisma } from '@/lib/prisma';
// import { supabase } from '@/lib/supabase/client';

// interface ProductCreate {
//     name: string;
//     code?: string | null;
//     unit: string;
//     price: number;
//     quantity: number;
// }

// const FIELD_MAP: Record<string, keyof ProductCreate> = {
//     название: 'name',
//     назва: 'name',
//     name: 'name',
//     артикул: 'code',
//     код: 'code',
//     code: 'code',
//     'ед.изм': 'unit',
//     'од.вим': 'unit',
//     unit: 'unit',
//     'кол-во': 'quantity',
//     кількість: 'quantity',
//     quantity: 'quantity',
//     масса: 'quantity',
//     маса: 'quantity',
//     цена: 'price',
//     ціна: 'price',
//     price: 'price',
// } as const; // Добавляем const assertion

// export async function POST(req: NextRequest) {
//     const formData = await req.formData();
//     const file = formData.get('file') as File;

//     if (!file) {
//         return NextResponse.json(
//             { error: 'Файл не загружен' },
//             { status: 400 }
//         );
//     }

//     try {
//         const arrayBuffer = await file.arrayBuffer();
//         const workbook = xlsx.read(new Uint8Array(arrayBuffer), {
//             type: 'array',
//         });
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const rawRows = xlsx.utils.sheet_to_json<Record<string, any>>(sheet);

//         const results = {
//             total: rawRows.length,
//             imported: 0,
//             errors: [] as Array<{ row: number; message: string }>,
//         };

//         for (const [index, row] of rawRows.entries()) {
//             try {
//                 const product = parseProduct(row, index + 1);
//                 const validation = validateProduct(product);

//                 if (!validation.isValid) {
//                     throw new Error(validation.message);
//                 }

//                 // Прумирование данных
//                 const prismaProduct = await prisma.product.create({
//                     data: {
//                         name: product.name,
//                         code: product.code,
//                         unit: product.unit,
//                         price: product.price,
//                         quantity: product.quantity,
//                     },
//                 });

//                 // Вставка в Supabase
//                 const { error } = await supabase.from('products').insert({
//                     name: product.name,
//                     code: product.code,
//                     unit: product.unit,
//                     price: product.price,
//                     quantity: product.quantity,
//                     created_at: new Date().toISOString(),
//                 });

//                 if (error) throw new Error(`Supabase: ${error.message}`);
//                 results.imported++;
//             } catch (error) {
//                 results.errors.push({
//                     row: index + 1,
//                     message:
//                         error instanceof Error
//                             ? error.message
//                             : 'Неизвестная ошибка',
//                 });
//             }
//         }

//         return NextResponse.json(results);
//     } catch (error) {
//         console.error('Фатальная ошибка:', error);
//         return NextResponse.json(
//             { error: 'Внутренняя ошибка сервера' },
//             { status: 500 }
//         );
//     }
// }

// // Явное приведение типов в парсере
// function parseProduct(row: any, rowNumber: number): ProductCreate {
//     const product: Partial<ProductCreate> = {};

//     for (const [key, value] of Object.entries(row)) {
//         const normalizedKey = key.toLowerCase().trim();
//         const mappedKey = FIELD_MAP[normalizedKey] as
//             | keyof ProductCreate
//             | undefined;

//         if (mappedKey) {
//             const rawValue = typeof value === 'string' ? value.trim() : value;

//             // Типизированная обработка значений
//             switch (mappedKey) {
//                 case 'price':
//                 case 'quantity':
//                     product[mappedKey] = Number(rawValue) || 0;
//                     break;
//                 case 'code':
//                     product[mappedKey] = rawValue ? String(rawValue) : null;
//                     break;
//                 default:
//                     product[mappedKey] = String(rawValue);
//             }
//         }
//     }

//     return {
//         name: product.name || '',
//         code: product.code ?? null,
//         unit: product.unit || 'шт',
//         price: product.price || 0,
//         quantity: product.quantity || 0,
//     };
// }

// // Строгая валидация
// function validateProduct(product: ProductCreate): {
//     isValid: boolean;
//     message?: string;
// } {
//     const errors: string[] = [];

//     if (!product.name.trim()) errors.push('Отсутствует название');
//     if (product.name.length > 100) errors.push('Название > 100 символов');
//     if (!['шт', 'кг', 'л'].includes(product.unit.toLowerCase()))
//         errors.push('Недопустимая единица измерения');
//     if (isNaN(product.price)) errors.push('Некорректная цена');
//     if (product.price <= 0) errors.push('Цена должна быть > 0');
//     if (isNaN(product.quantity)) errors.push('Некорректное количество');
//     if (product.quantity < 0)
//         errors.push('Количество не может быть отрицательным');

//     return {
//         isValid: errors.length === 0,
//         message: errors.join(', ') || undefined,
//     };
// }

    // if (onImport) onImport();
        