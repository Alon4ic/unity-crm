'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { db, Product } from '@/lib/dexie/productsDB';
import { supabase } from '@/lib/supabase/client';
import ProductForm from '@/components/form/ProductForm';
import DexieViewer from '@/components/DexieViewer';
import { useTranslations } from 'next-intl';
import SearchBar from '@/components/SearchBar';
import ProductTable from '@/components/ProductTable';
import DexieCategoriesViewer from '@/components/DexieCategoriesViewer';
import { ExtendedProduct } from '@/types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import InvoiceUploader from '@/components/InvoiceUploader';
import useProductSearch from '@/hooks/useProductSearch';
import useSaveProduct from '@/hooks/dashboard/useSaveProduct';
import { toProduct } from '@/utils/productUtils';
import useBatchUpdateProducts from '@/hooks/dashboard/useBatchUpdateProducts';
import { useProducts } from '@/hooks/useProducts';
import { extendProduct } from '@/utils/extendProduct';
import { useApplyMarkup } from '@/hooks/dashboard/useApplyMarkup';
import { MarkupSelector } from '@/components/MarkupSelector';
import { useAddProduct } from '@/hooks/dashboard/useAddProduct';

export default function DashboardPage() {
    const t = useTranslations('dashboard');
    const loadStart = performance.now();
    const [markupPercent, setMarkupPercent] = useState('');
    const [selectedProductId, setSelectedProductId] = useState<string>();
    const [units, setUnits] = useState<{ id: string; code: string }[]>([]);
    const { saveProduct } = useSaveProduct();
    const { batchUpdateProducts } = useBatchUpdateProducts();
    const { products, setProducts, fetchProducts } = useProducts();
    const { addProduct, loading: isAdding } = useAddProduct({
        products,
        setProducts,
    });

    const { applyMarkup, isApplying } = useApplyMarkup({
        products,
        setProducts,
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDeleteProduct = async (id: string) => {
        const confirmed = window.confirm(
            'Вы уверены, что хотите удалить этот товар?'
        );
        if (!confirmed) return;

        try {
            setProducts((prev) => prev.filter((p) => p.id !== id));
            await db.products.delete(id);
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('✅ Товар удалён');
        } catch (err: any) {
            console.error('Ошибка при удалении товара:', err);
            toast.error(`❌ ${err.message || 'Неизвестная ошибка'}`);
        }
    };

    const handleSaveEditedProduct = async (updated: ExtendedProduct) => {
        try {
            // Исправлено: передаем параметр updated вместо несуществующей переменной product
            const savedProduct = await saveProduct(updated);

            // Исправлено: используем updated.id для поиска
            setProducts((prev) =>
                prev.map((p) => (p.id === updated.id ? savedProduct : p))
            );
            toast.success('✅ Товар обновлён');
        } catch (err: any) {
            console.error('Ошибка сохранения товара:', err);
            toast.error(
                `❌ Ошибка сохранения товара: ${err.message || 'Неизвестная ошибка'}`
            );
        }
    };
    const tableRef = useRef<HTMLDivElement>(null);

    // Функция для прокрутки к товару
    const {
        searchQuery,
        setSearchQuery,
        highlightedProductId,
        handleSelectProduct,
    } = useProductSearch();

    const handleApplyMarkup = async () => {
        await applyMarkup(markupPercent, selectedProductId);
        setSelectedProductId('');
        setMarkupPercent('');
    };

    const handleBatchUpdate = async (products: ExtendedProduct[]) => {
        try {
            setProducts((prev) =>
                prev.map((prevProduct) => {
                    const updated = products.find(
                        (p) => p.id === prevProduct.id
                    );
                    return updated ? updated : prevProduct;
                })
            );

            await batchUpdateProducts(products);
        } catch (err) {
            // Ошибка уже обработана в хуке
        }
    };
    useEffect(() => {
        const fetch = async () => {
            const fetchStart = performance.now();
            await fetchProducts();
            const fetchEnd = performance.now();
            console.log(`📦 fetchProducts занял ${fetchEnd - fetchStart} мс`);
        };
        fetch();
    }, []);

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="p-8">
                <h1 className="text-2xl  font-bold mb-6">{t('title')}</h1>
                <h2 className="text-lg font-bold mb-4">{t('title_two')}</h2>
                <ProductForm onAdd={addProduct} loading={isAdding} />

                <div className="mb-4">
                    <SearchBar
                        onSelect={handleSelectProduct}
                        query={searchQuery} // Передаем значение запроса
                        onQueryChange={setSearchQuery}
                    />
                </div>

                <MarkupSelector
                    products={products}
                    selectedProductId={selectedProductId}
                    markupPercent={markupPercent}
                    isApplying={isApplying}
                    onProductChange={setSelectedProductId}
                    onMarkupChange={setMarkupPercent}
                    onApply={handleApplyMarkup}
                />

                <ProductTable
                    mode="dashboard"
                    products={products}
                    units={units}
                    onEdit={handleSaveEditedProduct}
                    onDelete={handleDeleteProduct}
                    fetchProducts={fetchProducts}
                    highlightedId={highlightedProductId}
                    editable
                    transactions={[]}
                    salePageId={''}
                    onBatchUpdate={handleBatchUpdate}
                />

                <DexieCategoriesViewer />
                <DexieViewer />
            </div>
            <div>
                <InvoiceUploader />
            </div>
        </DndProvider>
    );
}
