import { InvoiceParseStrategy } from './InvoiceParseStrategy';
import { ParsedItem } from '@/types';

export class InvoiceFormat2Strategy implements InvoiceParseStrategy {
    canParse(text: string): boolean {
        return (
            text.includes('Видаткова накладна') && text.includes('кількість')
        );
    }

    parse(text: string): ParsedItem[] {
        const lines = text
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);
        const items: ParsedItem[] = [];

        const regex =
            /^\d+\s+(?<name>.+?)\s+ШТ\s+(?<quantity>\d+)\s+(?<price>\d+[.,]?\d*)\s+(?<total>\d+[.,]?\d*)$/i;

        for (const line of lines) {
            const match = regex.exec(line);
            if (match?.groups) {
                const { name, quantity, price } = match.groups;
                items.push({
                    name: name.trim(),
                    quantity: parseFloat(quantity),
                    price: parseFloat(price.replace(',', '.')),
                });
            }
        }

        return items;
    }
}
