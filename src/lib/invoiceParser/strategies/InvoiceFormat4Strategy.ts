// lib/invoice/strategies/InvoiceFormat4Strategy.ts
import { ParsedItem } from '@/types';
import { InvoiceParseStrategy } from './InvoiceParseStrategy';

export class InvoiceFormat4Strategy implements InvoiceParseStrategy {
    canParse(text: string): boolean {
        // Эвристика: встречается слово "Хліб" и есть строки с ценой и количеством
        return (
            /Хліб/i.test(text) && /\d+\s+\d+[.,]?\d*\s+\d+[.,]?\d*/.test(text)
        );
    }

    parse(text: string): ParsedItem[] {
        const lines = text
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);
        const results: ParsedItem[] = [];

        // Строки, где встречаются: название, количество, цена, сумма
        const regex =
            /^(?<name>.+?)\s+(?<quantity>\d+)\s+(?<price>\d+[.,]?\d*)\s+(?<total>\d+[.,]?\d*)$/;

        for (const line of lines) {
            const match = line.match(regex);
            if (match?.groups) {
                const { name, quantity, price } = match.groups;
                results.push({
                    name: name.replace(/\s+/g, ' ').trim(),
                    quantity: parseFloat(quantity),
                    price: parseFloat(price.replace(',', '.')),
                    unit: 'шт', // по накладной
                });
            }
        }

        return results;
    }
}
