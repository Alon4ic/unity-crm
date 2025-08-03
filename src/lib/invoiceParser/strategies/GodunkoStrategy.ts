import { InvoiceParseStrategy } from './InvoiceParseStrategy';
import { ParsedItem } from '@/types';

export class GodunkoStrategy implements InvoiceParseStrategy {
    canParse(text: string): boolean {
        const norm = text.toLowerCase().replace(/\s+/g, ' ');
        return (
            norm.includes('видаткова накладна') &&
            norm.includes('хліб') &&
            norm.includes('кількість') &&
            norm.includes('ціна з пдв')
        );
    }

    parse(text: string): ParsedItem[] {
        const lines = text
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);

        const items: ParsedItem[] = [];
        let currentLines: string[] = [];

        for (const line of lines) {
            if (/^\d+\s+/.test(line)) {
                if (currentLines.length > 0) {
                    this.processRow(currentLines, items);
                }
                currentLines = [line];
            } else if (currentLines.length > 0) {
                currentLines.push(line);
            }
        }

        if (currentLines.length > 0) {
            this.processRow(currentLines, items);
        }

        return items;
    }

    private processRow(lines: string[], items: ParsedItem[]) {
        const fullText = lines.join(' ');

        // Удаляем номер товара (в начале строки)
        const withoutIndex = fullText.replace(/^\d+\s+/, '');

        // Пытаемся извлечь цену и сумму — числа с запятой или точкой
        const priceMatches: string[] = withoutIndex.match(/\d+[.,]\d+/g) ?? [];
        const price =
            priceMatches.length >= 1
                ? parseFloat(priceMatches[0].replace(',', '.'))
                : 0;

        // Пытаемся извлечь количество — целое число, перед ценой
        const quantityMatch = withoutIndex.match(/(\d+)\s+(?:\d+[.,]\d+)/);
        const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 0;

        // Название — после удаления номера, количества, цен
        const name = withoutIndex
            .replace(/\d+\s+\d+[.,]\d+/, '') // количество + цена
            .replace(/\d+[.,]\d+/g, '') // все цены
            .replace(/\d+/g, '') // всё ещё случайные числа
            .replace(/\s+/g, ' ')
            .trim();

        if (name) {
            items.push({
                name,
                quantity,
                price,
                unit: 'шт',
                // можно добавить draft, если нужно:
                draft: quantity === 0 || price === 0,
            });
        }
    }
}
