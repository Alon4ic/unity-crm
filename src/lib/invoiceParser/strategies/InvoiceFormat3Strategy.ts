// lib/invoice/strategies/InvoiceFormat3Strategy.ts
import { ParsedItem } from '@/types';
import { InvoiceParseStrategy } from './InvoiceParseStrategy';

export class InvoiceFormat3Strategy implements InvoiceParseStrategy {
    canParse(text: string): boolean {
        // Простейшая эвристика — наличие строк с тремя числами в конце
        const lines = text.split('\n');
        const regex = /^\D+\s+\d+\s+\d+[.,]?\d*\s+\d+[.,]?\d*$/;
        return lines.some((line) => regex.test(line.trim()));
    }

    parse(text: string): ParsedItem[] {
        const lines = text
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);
        const results: ParsedItem[] = [];

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
                    unit: 'шт',
                });
            }
        }

        return results;
    }
}
