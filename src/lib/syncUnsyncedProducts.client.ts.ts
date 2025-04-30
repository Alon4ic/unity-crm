// src/lib/syncUnsyncedProducts.client.ts

export async function syncUnsyncedProducts() {
    try {
        const response = await fetch('/api/sync-products', {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Не удалось синхронизировать продукты');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Ошибка синхронизации продуктов:', error);
        throw error;
    }
}
