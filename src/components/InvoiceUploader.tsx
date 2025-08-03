'use client';

import { useState } from 'react';
import { useProcessInvoiceItems } from '@/hooks/useProcessInvoiceItems';
import Tesseract from 'tesseract.js';
import { parseInvoiceText } from '@/lib/parseInvoiceText';
import { usePathname } from 'next/navigation';
import { InvoiceEditTable } from './InvoiceEditTable';
import { extractTextWithOpenAI } from '@/lib/extractTextWithOpenAI';
import { loadStrategies } from '@/lib/invoiceParser/InvoiceParser';

export interface ParsedItem {
    name: string;
    code?: string;
    quantity: number;
    unit?: string;
    price?: number;
    draft?: boolean;
}

export default function InvoiceUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('');
    const [items, setItems] = useState<ParsedItem[]>([]);
    const [strategyUsed, setStrategyUsed] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [log, setLog] = useState<string[]>([]);
    const [success, setSuccess] = useState(false);
    const [ocrMethod, setOcrMethod] = useState<
        'ocrspace' | 'tesseract' | 'openai'
    >('ocrspace');

    const pathname = usePathname();
    const currentLocale = pathname.split('/')[1] ?? 'ua';

    const getOcrLanguage = (locale: string) => {
        switch (locale) {
            case 'ua':
                return 'ukr';
            case 'ru':
                return 'rus';
            case 'en':
                return 'eng';
            default:
                return 'ukr';
        }
    };

    const processItems = useProcessInvoiceItems();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFile(file);
        setProcessing(true);
        setSuccess(false);
        setLog([]);
        setStrategyUsed(null);

        try {
            let rawText = '';

            if (ocrMethod === 'ocrspace') {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('language', getOcrLanguage(currentLocale));

                const res = await fetch('/api/parse-invoice', {
                    method: 'POST',
                    body: formData,
                });

                const result = await res.json();

                if (!res.ok || !result.text) {
                    alert('Ошибка при распознавании через OCR.Space');
                    setProcessing(false);
                    return;
                }

                rawText = result.text;
            } else if (ocrMethod === 'openai') {
                rawText = await extractTextWithOpenAI(file);
            } else {
                const { data } = await Tesseract.recognize(
                    file,
                    'ukr+rus+eng',
                    {
                        logger: (m) => console.log(m),
                    }
                );
                rawText = data.text;
            }

            setText(rawText);

            const result = await parseInvoiceText(rawText); // ✅ await здесь
            setItems(result.items);
            setStrategyUsed(result.strategy);

            console.log('Распознанный текст:', rawText);
            console.log('Использованная стратегия:', result.strategy);
            console.log('Распознанные позиции:', result.items);
        } catch (err) {
            console.error('Ошибка распознавания:', err);
            alert('Не удалось обработать файл.');
        } finally {
            setProcessing(false);
        }
    };

    const handleConfirm = async () => {
        try {
            const logs: string[] = [];
            await processItems(items);
            setLog(logs);
            setSuccess(true);
            setItems([]);
        } catch (error) {
            console.error('Ошибка при обновлении товаров:', error);
            alert('❌ Ошибка при обновлении товаров');
        }
    };

    const handleCancel = () => {
        setItems([]);
        setFile(null);
        setText('');
        setLog([]);
        setSuccess(false);
        setStrategyUsed(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="ocrMethod"
                        value="ocrspace"
                        checked={ocrMethod === 'ocrspace'}
                        onChange={() => setOcrMethod('ocrspace')}
                    />
                    OCR.Space
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="ocrMethod"
                        value="tesseract"
                        checked={ocrMethod === 'tesseract'}
                        onChange={() => setOcrMethod('tesseract')}
                    />
                    Tesseract.js
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="ocrMethod"
                        value="openai"
                        checked={ocrMethod === 'openai'}
                        onChange={() => setOcrMethod('openai')}
                    />
                    OpenAI Vision
                </label>

                <button
                    onClick={async () => {
                        await loadStrategies();
                        alert('🔁 Стратегии перезагружены');
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                    🔄 Перезагрузить стратегии
                </button>
            </div>

            <input type="file" accept="image/*" onChange={handleFileChange} />

            {!processing && items.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-lg font-bold">Распознанные товары:</h2>

                    {strategyUsed && (
                        <p className="text-sm text-gray-500">
                            📄 Применена стратегия:{' '}
                            <strong>{strategyUsed}</strong>
                        </p>
                    )}

                    <InvoiceEditTable items={items} onChange={setItems} />

                    <div className="flex gap-2">
                        <button
                            onClick={handleConfirm}
                            className="px-4 py-2 bg-green-500 text-white rounded"
                        >
                            ✅ Подтвердить и обновить
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-500 text-white rounded"
                        >
                            ❌ Отменить
                        </button>
                    </div>
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-100 border border-green-300 rounded">
                    <p className="font-semibold text-green-700">
                        ✅ Обновление завершено
                    </p>
                    <ul className="list-disc pl-5 text-sm mt-2">
                        {log.map((line, i) => (
                            <li key={i}>{line}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
