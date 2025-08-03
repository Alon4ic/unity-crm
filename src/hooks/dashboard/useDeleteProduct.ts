
import toast from 'react-hot-toast';

export function useDeleteProduct(
    setProducts: (updater: (prev: any[]) => any[]) => void
) {
    const deleteProduct = async (id: string) => {
        const confirmed = window.confirm(
            'Вы уверены, что хотите удалить этот товар?'
        );
        if (!confirmed) return;

        try {
            setProducts((prev) => prev.filter((p) => p.id !== id));
            await productsRepo.deleteById(id);
            toast.success('✅ Товар удалён');
        } catch (err: any) {
            console.error('[useDeleteProduct] Ошибка удаления товара:', err);
            toast.error(`❌ ${err.message || 'Неизвестная ошибка'}`);
        }
    };

    return { deleteProduct };
}
