// lib/invoiceParser/strategies/InvoiceFormat5Strategy.ts
import { ParsedItem } from '@/types';
import { InvoiceParseStrategy } from './InvoiceParseStrategy';

export class InvoiceFormat5Strategy implements InvoiceParseStrategy {
    canParse(text: string): boolean {
        return text.includes('Код товару') && /Йогурт|Кефір|Молоко/i.test(text);
    }

    parse(text: string): ParsedItem[] {
        const lines = text
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);

        const items: ParsedItem[] = [];

        const regex =
            /^\d+\s+(?<code>\d{12,13})\s+(?<name>.+?)\s+(?<unit>ШТ)?\s+(?<quantity>\d+)\s+(?<price>\d+[.,]\d{2})\s+(?<total>\d+[.,]\d{2})$/;

        for (const line of lines) {
            const match = line.match(regex);
            if (match?.groups) {
                const { code, name, quantity, price, unit } = match.groups;
                items.push({
                    code,
                    name: name.trim(),
                    quantity: parseFloat(quantity),
                    price: parseFloat(price.replace(',', '.')),
                    unit: unit || 'шт',
                });
            }
        }

        return items;
    }
}
