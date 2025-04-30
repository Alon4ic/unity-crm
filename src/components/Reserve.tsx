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
