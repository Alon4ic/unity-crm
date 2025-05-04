import { CustomFieldType, Product } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/products';

type ApiAction =
    | 'get-products'
    | 'create-product'
    | 'update-product'
    | 'delete-product'
    | 'add-field'
    | 'update-field'
    | 'delete-field'
    | 'update-value'
    | 'create-field';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export const productsAPI = {
    async getProducts(): Promise<ApiResponse<Product[]>> {
        return this._fetch('GET', 'get-products');
    },

    async createProduct(
        product: Omit<Product, 'id'>
    ): Promise<ApiResponse<Product>> {
        return this._fetch('POST', 'create-product', product);
    },

    async updateProduct(product: Product): Promise<ApiResponse<Product>> {
        return this._fetch('PUT', 'update-product', product);
    },

    async deleteProduct(productId: number): Promise<ApiResponse> {
        return this._fetch('DELETE', 'delete-product', { productId });
    },

    async updateField(
        productId: number,
        fieldName: string,
        value: string | number | boolean
    ): Promise<ApiResponse> {
        return this._fetch('PATCH', 'update-field', {
            productId,
            fieldName,
            value,
        });
    },

    async createField(field: {
        name: string;
        type: CustomFieldType;
    }): Promise<ApiResponse> {
        return this._fetch('POST', 'create-field', field);
    },

    async deleteField(fieldName: string): Promise<ApiResponse> {
        return this._fetch('DELETE', 'delete-field', { fieldName });
    },

    async _fetch<T = any>(
        method: string,
        action: ApiAction,
        body?: object
    ): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(API_URL, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action, ...body }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
};
