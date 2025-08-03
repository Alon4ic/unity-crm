import { InvoiceParseStrategy } from './InvoiceParseStrategy';
import { ParsedItem } from '@/types';

export class FallbackStrategy implements InvoiceParseStrategy {
    canParse(): boolean {
        return true; // всегда срабатывает
    }

    parse(text: string): ParsedItem[] {
        const lines = text
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
        const result: ParsedItem[] = [];

        for (const line of lines) {
            const match =
                /(?<name>.+?)\s+(?<quantity>\d+)\s+(?<price>\d+[.,]?\d*)/.exec(
                    line
                );
            if (match?.groups) {
                const { name, quantity, price } = match.groups;
                result.push({
                    name: name.trim(),
                    quantity: parseFloat(quantity),
                    price: parseFloat(price.replace(',', '.')),
                    unit: 'шт',
                });
            }
        }

        return result;
    }
}
