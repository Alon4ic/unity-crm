// src/lib/extractTextWithOpenAI.ts
export async function extractTextWithOpenAI(file: File): Promise<string> {
    const form = new FormData();
    form.append('file', file);
    form.append('method', 'openai'); // передаём флаг на сервер
    // (можете добавить language и другие поля)

    const res = await fetch('/api/parse-invoice', {
        method: 'POST',
        body: form,
    });

    if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        throw new Error(error || 'Ошибка OCR OpenAI');
    }
    const { text } = await res.json();
    return text;
}
