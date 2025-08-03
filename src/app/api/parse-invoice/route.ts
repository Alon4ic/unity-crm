// src/app/api/parse-invoice/route.ts
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export const config = {
    api: {
        bodyParser: false, // мы читаем formData вручную
    },
};

export async function POST(req: Request) {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const language = form.get('language')?.toString() ?? 'ukr';
    const method = form.get('method')?.toString() ?? 'ocrspace';

    if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    // прочитаем raw-контент
    const arrayBuffer = await file.arrayBuffer();

    // === 1) OCR.Space ===
    if (method === 'ocrspace') {
        const blob = new Blob([arrayBuffer], { type: file.type });
        const ocrForm = new FormData();
        ocrForm.append('file', blob, file.name);
        ocrForm.append('language', language);
        ocrForm.append('isTable', 'true');
        ocrForm.append('OCREngine', '2');
        ocrForm.append('apikey', process.env.OCR_SPACE_API_KEY!);

        try {
            const response = await fetch('https://api.ocr.space/parse/image', {
                method: 'POST',
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                },
                body: ocrForm,
            });

            const result = await response.json();
            console.log('📄 OCR.Space Result:', result);

            if (!response.ok || result.IsErroredOnProcessing) {
                const errorMsg =
                    result.ErrorMessage?.join(', ') ||
                    'Неизвестная ошибка OCR.Space';
                return NextResponse.json({ error: errorMsg }, { status: 500 });
            }

            const text = result.ParsedResults?.[0]?.ParsedText;
            if (!text) {
                return NextResponse.json(
                    { error: 'Не удалось извлечь текст из OCR.Space' },
                    { status: 500 }
                );
            }
            return NextResponse.json({ text });
        } catch (e) {
            console.error('Ошибка OCR.Space:', e);
            return NextResponse.json(
                { error: 'Ошибка вызова OCR.Space' },
                { status: 500 }
            );
        }
    }
    if (method === 'openai') {
        // OpenAI SDK только на сервере!
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const imageDataUrl = `data:${file.type};base64,${base64}`;

        const resp = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'Ты OCR-модуль…' },
                { role: 'user', content: imageDataUrl },
            ],
            temperature: 0,
        });

        const text = resp.choices?.[0]?.message?.content ?? '';
        return NextResponse.json({ text });
    }
    return NextResponse.json({ error: 'Unknown OCR method' }, { status: 400 });
}
