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
import { ExtendedProduct } from '@/types';
import { LoadTransaction, Product, Sale, Unit } from '@/types';
import { Category } from '@/lib/dexie/productsDB';
import { columnSets, columnTitles } from '@/types/tableColumns';
import { useCategoryDrop } from '@/hooks/table/useCategoryManagement';
import { useProductsByCategory } from '@/hooks/table/useProductsByCategory';
import { useRowCalculations } from '@/hooks/table/useRowCalculations';
import { useKeyboardSelection } from '@/hooks/table/useKeyboardSelection';
import { useKeyboardSelectionReset } from '@/hooks/table/useKeyboardSelectionReset';
import { useMouseRowSelection } from '@/hooks/table/useMouseRowSelection';
import { useRowColors } from '@/hooks/table/useRowColors';
import useEditDataMap from '@/hooks/table/useEditDataMap';
import useSaveProduct from '@/hooks/table/useSaveProduct';
import useRenameCategory from '@/hooks/table/useRenameCategory';
import useDeleteCategory from '@/hooks/table/useDeleteCategory';
import RenameCategoryModal from './RenameCategoryModal';
import useCategorySorting from '@/hooks/table/useCategorySorting';
import TableHeader from './TableHeader';
import AddCategoryForm from './form/AddCategoryForm';
import toast from 'react-hot-toast';

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
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [creatingProduct, setCreatingProduct] = useState<{
        categoryId: string | null;
        tempId: string;
    } | null>(null);
    const [editDataMap, setEditDataMap] = useState<
        Record<string, Partial<ExtendedProduct>>
    >({});
    const [anchorIndex, setAnchorIndex] = useState<number | null>(null);
    const [cursorIndex, setCursorIndex] = useState<number | null>(null);
    const tableRef = useRef<HTMLDivElement>(null);

    const {
        categories = [],
        addCategory,
        updateCategory,
        deleteCategory,
    } = useCategories();

    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
        new Set()
    );
    const productMap = useMemo(() => {
        const map: Record<string, ExtendedProduct> = {};
        products.forEach((p) => {
            map[p.id] = p;
        });
        return map;
    }, [products]);
    const resetSelection = useKeyboardSelectionReset(
        setSelectedIds,
        setAnchorIndex,
        setCursorIndex
    );

    const rows = useRowCalculations(products, transactions, salePageId);

    const { rowColors, handleColorChange } = useRowColors(products);

    const [totals, totalSalesSum] = useMemo(() => {
        const total = rows.reduce((s, r) => s + (r.costWithMarkup ?? 0), 0);
        const totalWithoutMarkup = rows.reduce((s, r) => s + (r.cost ?? 0), 0);
        const profit = total - totalWithoutMarkup;
        const salesSum = rows.reduce((sum, row) => sum + row.salesSum, 0);

        return [{ total, totalWithoutMarkup, profit }, salesSum];
    }, [rows]);

    const handleStartEdit = (p: ExtendedProduct) => {
        setEditingId(p.id);
        setEditDataMap((prev) => {
            const newEntry = {
                name: p.name,
                code: p.code,
                unit: p.unit,
                price: p.price,
                markup_percent: p.markup_percent,
                quantity: p.quantity,
                load: p.load,
                return_qty: p.return_qty,
                background_color: p.background_color,
            };

            if (JSON.stringify(prev[p.id]) === JSON.stringify(newEntry))
                return prev;

            return {
                ...prev,
                [p.id]: newEntry,
            };
        });
    };

    const handleChange = useEditDataMap(setEditDataMap);

    const handleSave = useSaveProduct({
        editingId,
        creatingProduct,
        mode,
        productMap,
        onUpdate,
        onEdit: async (product) => {
            await onEdit(product);
        },
        fetchProducts,
        setEditingId,
        setCreatingProduct,
        setEditDataMap,
    });

    const handleCancel = () => {
        setEditingId(null);
        setCreatingProduct(null);
    };

    const handleAddCategory = useCallback(
        async (categoryName: string) => {
            try {
                await addCategory(categoryName, '#dbd8e3');
                toast.success('Категория добавлена');
            } catch {
                toast.error('Не удалось добавить категорию');
            }
        },
        [addCategory]
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
        resetSelection,
    });

    const {
        renamingCategoryId,
        setRenamingCategoryId,
        newCategoryName,
        setNewCategoryName,
        newColor,
        setNewColor,
        handleRenameSubmit,
        handleRenameCategory,
    } = useRenameCategory({
        categories,
        updateCategory,
    });

    const handleDeleteCategory = useDeleteCategory({
        deleteCategory: deleteCategory, // Простая передача без второго параметра
        fetchProducts,
    });
    const handleCreateProduct = (categoryId: string | null) => {
        const tempId = `temp-${crypto.randomUUID()}`;
        setCreatingProduct({ categoryId, tempId });
        setEditingId(tempId);
    };
    const handleClickSelect = useMouseRowSelection({
        rows,
        selectedIds,
        setSelectedIds,
        anchorIndex,
        setAnchorIndex,
    });
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

    const productsByCategory = useProductsByCategory(
        products,
        categories,
        creatingProduct
    );

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
    useCategorySorting({
        products,
        onBatchUpdate,
        onEdit,
    });

    useEffect(() => {
        localStorage.setItem('selectedProductIds', JSON.stringify(selectedIds));
    }, [selectedIds]);

    useEffect(() => {
        const saved = localStorage.getItem('selectedProductIds');
        if (saved) setSelectedIds(JSON.parse(saved));
    }, []);

    useKeyboardSelection({
        rows,
        selectedIds,
        setSelectedIds,
        anchorIndex,
        setAnchorIndex,
        cursorIndex,
        setCursorIndex,
    });

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                tableRef.current &&
                !tableRef.current.contains(e.target as Node)
            ) {
                resetSelection();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    useEffect(() => {
        const renderStart = performance.now();
        return () => {
            const renderEnd = performance.now();
            console.log(
                `📊 ProductTable отрендерен за ${renderEnd - renderStart} мс`
            );
        };
    }, []);

    return (
        <div ref={tableRef} className="overflow-auto border rounded-md">
            <table className="min-w-full text-sm text-left border-collapse">
                <TableHeader mode={mode} />

                <tbody>
                    <AddCategoryForm
                        onSubmit={handleAddCategory}
                        colSpan={columns.length}
                    />
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
                <RenameCategoryModal
                    isOpen={!!renamingCategoryId}
                    onClose={() => setRenamingCategoryId(null)}
                    newCategoryName={newCategoryName}
                    setNewCategoryName={setNewCategoryName}
                    newColor={newColor}
                    setNewColor={setNewColor}
                    onSubmit={handleRenameSubmit}
                />
            )}
        </div>
    );
}
