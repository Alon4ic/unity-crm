'use client';

import { useState } from 'react';
import { useProductStore } from '@/store/productStore';

export default function ImportProducts() {
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const { triggerRefresh } = useProductStore();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setFile(selectedFile || null);
    };

    const handleImport = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setProgress(10);

        try {
            const response = await fetch('/api/import-products', {
                method: 'POST',
                body: formData,
            });

            setProgress(80);

            if (response.ok) {
                setProgress(100);
                setMessage('✅ Товары успешно импортированы!');
                triggerRefresh(); // 👉 Обновляем товары после успешного импорта
            } else {
                const data = await response.json();
                console.error('Ошибка импорта:', data?.error);
                setProgress(0);
                setMessage('❌ Ошибка при импорте товаров');
            }
        } catch (error) {
            console.error('Ошибка запроса:', error);
            setProgress(0);
            setMessage('❌ Ошибка сети');
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    return (
        <div className="p-6 border rounded shadow-md max-w-3xl mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-6 text-center">
                Импорт товаров
            </h2>

            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="w-full mb-4 p-2 border rounded"
            />

            <button
                onClick={handleImport}
                disabled={!file || uploading}
                className="btn-primary w-full mb-4 disabled:opacity-50"
            >
                {uploading ? 'Импортируем...' : 'Импортировать'}
            </button>

            {uploading && (
                <div className="w-full bg-gray-300 rounded h-4 overflow-hidden">
                    <div
                        className="bg-blue-600 h-4 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {message && (
                <p
                    className={`text-center mt-4 text-sm ${
                        message.includes('✅')
                            ? 'text-green-600'
                            : 'text-red-600'
                    }`}
                >
                    {message}
                </p>
            )}
        </div>
    );
}
