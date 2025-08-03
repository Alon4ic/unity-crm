'use client';

import {
    useState,
    useEffect,
    useMemo,
    Fragment,
    useCallback,
    useRef,
} from 'react';
import ProductTableRow from './ProductTableRow';
import ProductTableFooter from './ProductTableFooter';
import SalesTableFooter from './SalesTableFooter';
import CategoryDropRow from './CategoryDropRow';
import { useCategories } from '@/hooks/useCategories';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

import {
    getTotalLoadForProductOnPage,
    getTotalReturnForProductOnPage,
} from '@/utils/loadHelpers';
import { ExtendedProduct } from '@/types';
import { LoadTransaction, Product, Sale, Unit } from '@/types';
import { Category } from '@/lib/dexie/productsDB';
import { columnSets, columnTitles } from '@/types/tableColumns';
import { useDrag } from 'react-dnd';
import { useCategoryDrop } from '@/hooks/table/useCategoryManagement';

interface ProductTableProps {
    products: ExtendedProduct[];
    sales?: Sale[];
    transactions: LoadTransaction[];
    salePageId: string;
    onEdit: (product: ExtendedProduct) => void;
    onDelete: (id: string) => void;
    fetchProducts: () => Promise<void>;
    highlightedId?: string;
    units: Unit[];
    editable?: boolean;
    mode: 'dashboard' | 'sales';
    categories?: Category[];
    onUpdateCategory?: (
        productId: string,
        newCategoryId: string | null
    ) => void;
    onUpdate?: (p: {
        id: string;
        product_id: string;
        markup: number;
        load: number;
        return_qty: number;
        created_at: string;
    }) => void;
    onBatchUpdate?: (products: ExtendedProduct[]) => void;
}

export default function ProductTable({
    products,
    sales,
    transactions,
    salePageId,
    onEdit,
    onDelete,
    fetchProducts,
    highlightedId,
    units,
    mode,
    onUpdate,
    onBatchUpdate,
}: ProductTableProps) {
    const columns = columnSets[mode];
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [renamingCategoryId, setRenamingCategoryId] = useState<string | null>(
        null
    );
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [renamingCategoryName, setRenamingCategoryName] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newColor, setNewColor] = useState('#dbd8e3');
    const [newCategory, setNewCategory] = useState('');
    const [creatingProduct, setCreatingProduct] = useState<{
        categoryId: string | null;
        tempId: string;
    } | null>(null);
    const [editDataMap, setEditDataMap] = useState<
        Record<string, Partial<ExtendedProduct>>
    >({});
    const [anchorIndex, setAnchorIndex] = useState<number | null>(null);

    const colorOptions = [
        '#fef08a',
        '#a5f3fc',
        '#86efac',
        '#fca5a5',
        '#ddd6fe',
    ];

    const {
        categories = [],
        addCategory,
        updateCategory,
        deleteCategory,
    } = useCategories();
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
        new Set()
    );
    const saleMap = useMemo(
        () => new Map(sales?.map((s) => [s.product_id, s]) ?? []),
        [sales]
    );
    const productMap = useMemo(() => {
        const map: Record<string, ExtendedProduct> = {};
        products.forEach((p) => {
            map[p.id] = p;
        });
        return map;
    }, [products]);

    const rows = useMemo(() => {
        return products.map((p) => {
            const totalLoaded = getTotalLoadForProductOnPage(
                transactions,
                salePageId,
                p.id
            );
            const totalReturn = getTotalReturnForProductOnPage(
                transactions,
                salePageId,
                p.id
            );

            const price = p.price ?? 0;
            const markupPct = p.markup_percent ?? 0;
            const soldQuantity = Math.max(0, totalLoaded - totalReturn);
            const price_with_markup = price * (1 + markupPct / 100);
            const quantity = p.quantity ?? 0;

            return {
                ...p,
                total_loaded: totalLoaded,
                total_return: totalReturn,
                price_with_markup: price_with_markup,
                cost: price * quantity,
                costWithMarkup: price_with_markup * quantity,
                stock: soldQuantity,
                salesSum: parseFloat(
                    (price_with_markup * soldQuantity).toFixed(2)
                ),
                sold: soldQuantity,
                deliveries: p.deliveries ?? 0,
                returns: p.returns ?? 0,
            };
        });
    }, [products, transactions, salePageId]);

    const [rowColors, setRowColors] = useState<Record<string, string>>({});

    const handleColorChange = (productId: string, color: string) => {
        setRowColors((prev) => ({ ...prev, [productId]: color }));
    };

    const [totals, totalSalesSum] = useMemo(() => {
        const total = rows.reduce((s, r) => s + (r.costWithMarkup ?? 0), 0);
        const totalWithoutMarkup = rows.reduce((s, r) => s + (r.cost ?? 0), 0);
        const profit = total - totalWithoutMarkup;
        const salesSum = rows.reduce((sum, row) => sum + row.salesSum, 0);

        return [{ total, totalWithoutMarkup, profit }, salesSum];
    }, [rows]);

    const handleStartEdit = useCallback((p: ExtendedProduct) => {
        setEditingId(p.id);
        setEditDataMap((prev) => ({
            ...prev,
            [p.id]: {
                name: p.name,
                code: p.code,
                unit: p.unit,
                price: p.price,
                markup_percent: p.markup_percent,
                quantity: p.quantity,
                load: p.load,
                return_qty: p.return_qty,
                background_color: p.background_color, // Добавлено поле background_color
            },
        }));
    }, []);

    const handleChange = useCallback(
        (
            productId: string,
            field: keyof ExtendedProduct | 'deliveries' | 'returns',
            value: any
        ) => {
            setEditDataMap((prev) => {
                const prevData = prev[productId] ?? {};
                const newData: Partial<ExtendedProduct> = {
                    ...prevData,
                    [field]: value,
                };

                return {
                    ...prev,
                    [productId]: newData,
                };
            });
        },
        [setEditDataMap]
    );

    const handleSave = useCallback(
        async (payload: ExtendedProduct) => {
            if (!editingId && !creatingProduct) return;

            const finalPayload = {
                ...payload,
                id: editingId || creatingProduct?.tempId,
                category_id:
                    payload.category_id || creatingProduct?.categoryId || null,
                deliveries:
                    mode === 'dashboard' ? Number(payload.deliveries ?? 0) : 0,
                returns:
                    mode === 'dashboard' ? Number(payload.returns ?? 0) : 0,
                load: mode === 'sales' ? Number(payload.load ?? 0) : 0,
                return_qty:
                    mode === 'sales' ? Number(payload.return_qty ?? 0) : 0,
                background_color: payload.background_color || undefined, // Добавлено поле background_color
            } as ExtendedProduct;

            if (mode === 'sales') {
                const load = Number(payload.load ?? 0);
                const return_qty = Number(payload.return_qty ?? 0);
                const productId = (editingId ??
                    creatingProduct?.tempId) as string;
                const currentQuantity = Number(
                    productMap[productId]?.quantity ?? 0
                );

                // Всегда сохраняем цвет фона, даже если нет загрузки/возврата
                const shouldSaveColor =
                    payload.background_color &&
                    payload.background_color !==
                        productMap[productId]?.background_color;

                if (load > 0 || return_qty > 0 || shouldSaveColor) {
                    if (load > currentQuantity) {
                        toast.error(
                            'Нельзя сохранить: загрузка больше остатка'
                        );
                        return;
                    }

                    if (load > 0 || return_qty > 0) {
                        onUpdate?.({
                            product_id: finalPayload.id,
                            markup: finalPayload.markup_percent ?? 0,
                            load,
                            return_qty,
                            id: '',
                            created_at: '',
                        });

                        const newQuantity = currentQuantity - load + return_qty;
                        if (newQuantity < 0) {
                            toast.error('Остаток не может быть отрицательным');
                            return;
                        }
                    }

                    await onEdit({
                        ...finalPayload,
                        quantity:
                            load > 0 || return_qty > 0
                                ? currentQuantity - load + return_qty
                                : finalPayload.quantity,
                        load: 0,
                        return_qty: 0,
                    });
                }
            } else {
                await onEdit({
                    ...finalPayload,
                    quantity: Number(finalPayload.quantity ?? 0),
                    deliveries: 0,
                    returns: 0,
                });
            }

            setEditingId(null);
            setCreatingProduct(null);
            setEditDataMap((prev) => {
                const newMap = { ...prev };
                delete newMap[finalPayload.id];
                return newMap;
            });

            await fetchProducts();
        },
        [
            editingId,
            mode,
            productMap,
            onUpdate,
            onEdit,
            creatingProduct,
            fetchProducts,
        ]
    );

    const handleCancel = useCallback(() => {
        setEditingId(null);
        setCreatingProduct(null);
    }, []);

    const handleAddCategory = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!newCategory.trim()) return;

            try {
                await addCategory(newCategory.trim(), '#dbd8e3');
                setNewCategory('');
                toast.success('Категория добавлена');
            } catch {
                toast.error('Не удалось добавить категорию');
            }
        },
        [newCategory, addCategory]
    );
    const asyncOnEdit = async (p: ExtendedProduct) => {
        return onEdit(p);
    };

    const asyncOnBatchUpdate = async (ps: ExtendedProduct[]) => {
        return onBatchUpdate?.(ps);
    };
    const { handleCategoryDrop } = useCategoryDrop({
        products,
        selectedIds,
        setSelectedIds,
        categories,
        onEdit: asyncOnEdit,
        onBatchUpdate: asyncOnBatchUpdate,
        fetchProducts,
    });

    const handleRenameCategory = useCallback(
        (id: string, currentName: string, currentColor: string) => {
            setRenamingCategoryId(id);
            setRenamingCategoryName(currentName);
            setNewCategoryName(currentName);
            setNewColor(currentColor);
        },
        []
    );

    const handleRenameSubmit = () => {
        if (!renamingCategoryId) return;

        const originalCategory = categories.find(
            (c) => c.id === renamingCategoryId
        );
        if (!originalCategory) return;

        const updates: Partial<{ name: string; color: string }> = {};

        if (newCategoryName !== originalCategory.name) {
            updates.name = newCategoryName;
        }
        if (newColor !== originalCategory.color) {
            updates.color = newColor;
        }

        if (Object.keys(updates).length === 0) {
            setRenamingCategoryId(null);
            return;
        }

        updateCategory(renamingCategoryId, updates)
            .then(() => {
                toast.success('Изменения сохранены');
                setRenamingCategoryId(null);
                setNewCategoryName('');
                setNewColor('#dbd8e3');
            })
            .catch(() => {
                toast.error('Ошибка при обновлении');
                setNewCategoryName(originalCategory.name);
            });
    };

    const handleDeleteCategory = useCallback(
        async (id: string) => {
            if (!confirm('Удалить категорию? Товары останутся без категории.'))
                return;

            try {
                await deleteCategory(id, fetchProducts);
                toast.success('Категория удалена');
            } catch (err: any) {
                console.error('Ошибка при удалении:', err);
                toast.error(`Ошибка: ${err.message || 'Неизвестная ошибка'}`);
            }
        },
        [deleteCategory, fetchProducts]
    );
    const handleCreateProduct = useCallback((categoryId: string | null) => {
        const tempId = `temp-${crypto.randomUUID()}`;
        setCreatingProduct({ categoryId, tempId });
        setEditingId(tempId);
    }, []);
    const handleClickSelect = (
        id: string,
        e: React.MouseEvent<HTMLTableRowElement>
    ) => {
        const index = rows.findIndex((r) => r.id === id);
        if (index === -1) return;

        // Если нажат Shift и есть anchorIndex (предыдущая якорная строка)
        if (e.shiftKey && anchorIndex !== null) {
            e.preventDefault();
            const start = Math.min(anchorIndex, index);
            const end = Math.max(anchorIndex, index);
            const newSelection = rows.slice(start, end + 1).map((r) => r.id);
            setSelectedIds(
                Array.from(new Set([...selectedIds, ...newSelection]))
            );
            // Не меняем anchorIndex, потому что он остается прежним (первый выделенный)
        }
        // Если нажат Ctrl (или Cmd на Mac)
        else if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Добавляем или удаляем текущий id из выделения
            setSelectedIds((prev) =>
                prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
            );
            // Устанавливаем текущий индекс как новый якорь
            setAnchorIndex(index);
        }
        // Одиночный клик - новое выделение
        else {
            setSelectedIds([id]);
            setAnchorIndex(index);
        }
    };

    useEffect(() => {
        const handleCreateProduct = (e: CustomEvent) => {
            const { categoryId } = e.detail;
            const tempId = `temp-${crypto.randomUUID()}`;
            setCreatingProduct({ categoryId, tempId });
            setEditingId(tempId);
        };

        window.addEventListener(
            'createProductInCategory',
            handleCreateProduct as EventListener
        );
        return () =>
            window.removeEventListener(
                'createProductInCategory',
                handleCreateProduct as EventListener
            );
    }, []);

    const productsByCategory = useMemo(() => {
        const grouped = new Map<string | null, ExtendedProduct[]>();

        categories.forEach((cat) => {
            grouped.set(cat.id, []);
        });
        grouped.set(null, []);

        products.forEach((row) => {
            const categoryId = row.category_id || null;
            if (grouped.has(categoryId)) {
                grouped.get(categoryId)!.push(row);
            }
        });

        // Добавляем новую строку для создания продукта
        if (creatingProduct) {
            const categoryId = creatingProduct.categoryId || null;
            if (grouped.has(categoryId)) {
                grouped.get(categoryId)!.push({
                    id: creatingProduct.tempId,
                    name: '',
                    code: '',
                    unit: '',
                    price: 0,
                    quantity: 0,
                    markup_percent: 0,
                    category_id: categoryId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    product_id: creatingProduct.tempId,
                    deliveries: 0,
                    returns: 0,
                    total_loaded: 0,
                    total_return: 0,
                    price_with_markup: 0,
                    cost: 0,
                    costWithMarkup: 0,
                    stock: 0,
                    salesSum: 0,
                    sold: 0,
                    load: 0,
                    return_qty: 0,
                    sort_order: 0,
                });
            }
        }

        // Сортировка внутри категорий
        grouped.forEach((products) => {
            products.sort((a, b) => {
                const orderDiff = (a.sort_order || 0) - (b.sort_order || 0);
                return orderDiff !== 0
                    ? orderDiff
                    : a.name.localeCompare(b.name);
            });
        });

        return grouped;
    }, [categories, products, creatingProduct]);

    const toggleCollapseCategory = (categoryId: string) => {
        setCollapsedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(categoryId)) next.delete(categoryId);
            else next.add(categoryId);
            return next;
        });
    };
    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };
    useEffect(() => {
        const handleSortCategory = async (e: Event) => {
            const customEvent = e as CustomEvent;
            const { categoryId, method } = customEvent.detail;

            const categoryProducts = products
                .filter((p) => p.category_id === categoryId)
                .slice();

            if (method === 'alphabetical') {
                categoryProducts.sort((a, b) => a.name.localeCompare(b.name));
            } else if (method === 'byDate') {
                categoryProducts.sort((a, b) =>
                    (a.created_at || '').localeCompare(b.created_at || '')
                );
            }

            const updated = categoryProducts.map((p, i) => ({
                ...p,
                sort_order: i * 10,
            }));

            if (onBatchUpdate) await onBatchUpdate(updated);
            else for (const p of updated) await onEdit(p);
        };

        const listener = handleSortCategory as EventListener;
        window.addEventListener('sortCategory', listener);
        return () => window.removeEventListener('sortCategory', listener);
    }, [products, onBatchUpdate, onEdit]);
    useEffect(() => {
        localStorage.setItem('selectedProductIds', JSON.stringify(selectedIds));
    }, [selectedIds]);

    useEffect(() => {
        const saved = localStorage.getItem('selectedProductIds');
        if (saved) setSelectedIds(JSON.parse(saved));
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT') return;

            // 1. Сначала проверяем Escape - он работает всегда
            if (e.key === 'Escape') {
                setSelectedIds([]);
                setAnchorIndex(null);
                return;
            }

            // 2. Проверяем наличие anchorIndex для стрелок
            if (anchorIndex === null) return;

            let targetIndex = anchorIndex;
            let newSelection = [...selectedIds];

            // 3. Проверяем стрелки
            if (e.key === 'ArrowDown') {
                targetIndex = Math.min(anchorIndex + 1, rows.length - 1);
            } else if (e.key === 'ArrowUp') {
                targetIndex = Math.max(anchorIndex - 1, 0);
            } else {
                // Выходим для других клавиш
                return;
            }

            // Выделение диапазона при Shift
            if (e.shiftKey) {
                const start = Math.min(anchorIndex, targetIndex);
                const end = Math.max(anchorIndex, targetIndex);
                const rangeIds = rows.slice(start, end + 1).map((r) => r.id);

                // Добавляем новые ID к текущему выделению
                newSelection = Array.from(
                    new Set([...selectedIds, ...rangeIds])
                );
                setSelectedIds(newSelection);
            }
            // Одиночное перемещение без Shift
            else {
                newSelection = [rows[targetIndex].id];
                setSelectedIds(newSelection);
                setAnchorIndex(targetIndex);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [anchorIndex, rows, selectedIds]); // Добавлена зависимость от selectedIds
    return (
        <div className="overflow-auto border rounded-md">
            <table className="min-w-full text-sm text-left border-collapse">
                <thead className="bg-bg-header">
                    <tr>
                        {columns.map((key) => (
                            <th key={key} className="border p-2">
                                {columnTitles[key]}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td
                            colSpan={columns.length}
                            className="border p-2 bg-gray-900"
                        >
                            <form onSubmit={handleAddCategory}>
                                <input
                                    type="text"
                                    placeholder="Укажите категорию"
                                    className="p-1 border rounded w-full"
                                    value={newCategory}
                                    onChange={(e) =>
                                        setNewCategory(e.target.value)
                                    }
                                />
                            </form>
                        </td>
                    </tr>
                </tbody>

                <tbody>
                    {Array.from(productsByCategory.entries()).map(
                        ([categoryId, categoryProducts]) => {
                            const category = categoryId
                                ? categories.find((c) => c.id === categoryId)
                                : null;

                            return (
                                <Fragment key={categoryId || 'uncategorized'}>
                                    <CategoryDropRow
                                        category={category?.name || ''}
                                        categoryId={categoryId}
                                        label={
                                            category?.name || 'Без категории'
                                        }
                                        color={category?.color || '#dbd8e3'}
                                        onCreateProduct={handleCreateProduct}
                                        onSortCategory={(catId, method) =>
                                            window.dispatchEvent(
                                                new CustomEvent(
                                                    'sortCategory',
                                                    {
                                                        detail: {
                                                            categoryId: catId,
                                                            method,
                                                        },
                                                    }
                                                )
                                            )
                                        }
                                        onCategoryDrop={handleCategoryDrop}
                                        products={products}
                                        onDrop={handleCategoryDrop}
                                    >
                                        {category && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleRenameCategory(
                                                            category.id,
                                                            category.name,
                                                            category.color ||
                                                                '#dbd8e3'
                                                        )
                                                    }
                                                >
                                                    ✎
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteCategory(
                                                            category.id
                                                        )
                                                    }
                                                >
                                                    🗑
                                                </button>
                                                <button
                                                    className="text-sm underline"
                                                    onClick={() =>
                                                        toggleCollapseCategory(
                                                            category.id
                                                        )
                                                    }
                                                >
                                                    {collapsedCategories.has(
                                                        category.id
                                                    )
                                                        ? 'Развернуть'
                                                        : 'Свернуть'}
                                                </button>
                                            </div>
                                        )}
                                    </CategoryDropRow>

                                    {!collapsedCategories.has(
                                        categoryId || ''
                                    ) &&
                                        categoryProducts.map((row) => (
                                            <ProductTableRow
                                                key={row.id}
                                                product={row}
                                                columns={columns}
                                                mode={mode}
                                                isEditing={editingId === row.id}
                                                isHighlighted={
                                                    highlightedId === row.id
                                                }
                                                isSelected={
                                                    selectedId === row.id
                                                }
                                                editData={
                                                    editDataMap[row.id] ?? {}
                                                }
                                                units={units}
                                                onStartEdit={handleStartEdit}
                                                onChange={handleChange}
                                                onSave={handleSave}
                                                onCancel={handleCancel}
                                                onDelete={onDelete}
                                                onSelect={() =>
                                                    toggleSelection(row.id)
                                                }
                                                selectedIds={selectedIds}
                                                background_color={
                                                    rowColors[row.id]
                                                } // ✅ Исправлено здесь
                                                onColorChange={
                                                    handleColorChange
                                                }
                                                rowId={`product-${row.id}`}
                                                onClickSelect={
                                                    handleClickSelect
                                                }
                                            />
                                        ))}
                                </Fragment>
                            );
                        }
                    )}
                </tbody>

                {mode === 'dashboard' ? (
                    <ProductTableFooter {...totals} />
                ) : (
                    <SalesTableFooter salesSum={totalSalesSum} />
                )}
            </table>

            {renamingCategoryId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-full max-w-md">
                        <h2 className="text-lg font-bold mb-2">
                            Редактирование категории
                        </h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Название:
                            </label>
                            <input
                                className="w-full p-2 border rounded"
                                value={newCategoryName}
                                onChange={(e) =>
                                    setNewCategoryName(e.target.value)
                                }
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">
                                Цвет:
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {colorOptions.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setNewColor(color)}
                                        className={`w-8 h-8 rounded-full border-2 ${
                                            color === newColor
                                                ? 'border-blue-500'
                                                : 'border-transparent'
                                        }`}
                                        style={{ background_color: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 bg-gray-400 rounded"
                                onClick={() => setRenamingCategoryId(null)}
                            >
                                Отмена
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                onClick={handleRenameSubmit}
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
