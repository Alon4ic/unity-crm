import { InvoiceParseStrategy } from './InvoiceParseStrategy';
import { ParsedItem } from '@/types';

export class NashMolochnikStrategy implements InvoiceParseStrategy {
    canParse(text: string): boolean {
        const norm = text.toLowerCase().replace(/\s+/g, ' ');
        return (
            norm.includes('видаткова накладна') &&
            norm.includes('найменування, характеристика, артикул') &&
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
        let inTable = false;
        let currentItemLines: string[] = [];

        for (const line of lines) {
            if (
                line.includes('Найменування') &&
                line.toLowerCase().includes('ціна з пдв')
            ) {
                inTable = true;
                continue;
            }

            if (
                line.includes('Разом без ПДВ') ||
                line.includes('Всього найменувань') ||
                line.toLowerCase().includes('разом з пдв')
            ) {
                if (currentItemLines.length > 0) {
                    this.tryParseItem(currentItemLines, items);
                }
                break;
            }

            if (!inTable) continue;

            // Начало новой позиции
            if (/^\d+\s+/.test(line)) {
                if (currentItemLines.length > 0) {
                    this.tryParseItem(currentItemLines, items);
                }
                currentItemLines = [line];
            } else if (
                currentItemLines.length > 0 &&
                currentItemLines.length < 5
            ) {
                currentItemLines.push(line);
            }
        }

        return items;
    }

    private tryParseItem(lines: string[], items: ParsedItem[]) {
        const text = lines.join(' ').replace(/\s+/g, ' ').trim();

        const codeMatch = text.match(/\b\d{13}\b/);
        const quantityMatch = text.match(
            /(\d+(?:[.,]\d+)?)\s*(шт\.?|кг\.?|wt)/i
        );
        const priceMatch = text.match(/(\d{1,3}(?:[.,]\d{2}))(?![\d])/g);

        const quantity = quantityMatch?.[1]?.replace(',', '.');
        const unit = quantityMatch?.[2]?.toLowerCase() ?? 'шт';

        const prices = priceMatch?.map((p) => p.replace(',', '.')) ?? [];
        const price =
            prices.length >= 2 ? prices[prices.length - 2] : prices[0];

        const cleaned = text
            .replace(/^\d+\s+/, '') // номер
            .replace(/\b\d{13}\b/, '') // код
            .replace(/(\d+(?:[.,]\d+)?)\s*(шт\.?|кг\.?|wt)/i, '') // количество
            .replace(/\d+[.,]\d+/, '') // цена
            .replace(/\d+[.,]\d+/, '') // сумма
            .trim();

        const name = cleaned.replace(/\s+/g, ' ').trim();

        const isDraft =
            !codeMatch ||
            !price ||
            !quantity ||
            name.length < 4 ||
            name.length > 150;

        items.push({
            code: codeMatch?.[0],
            name: name || text,
            quantity: quantity ? parseFloat(quantity) : 1,
            price: price ? parseFloat(price) : 0,
            unit,
            draft: isDraft,
        });

        if (isDraft) {
            console.warn('⚠️ Добавлена черновая позиция:', lines);
        }
    }
}
