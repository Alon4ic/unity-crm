import { InvoiceParseStrategy } from './InvoiceParseStrategy';
import { ParsedItem } from '@/types';

export class MolokozavodStrategy implements InvoiceParseStrategy {
    canParse(text: string): boolean {
        const normalized = text.toLowerCase().replace(/\s+/g, ' ');
        return (
            normalized.includes('тернопільський молокозавод') &&
            normalized.includes('рівне-молоко') &&
            normalized.includes('код єдрпоу: 35414758') &&
            normalized.includes('йогурт') &&
            normalized.includes('молоко') &&
            normalized.includes('кефір')
        );
    }

    parse(text: string): ParsedItem[] {
        const lines = text
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => /^\d+\s+\d+/.test(line)); // строки начинающиеся с позиции и кода

        const result: ParsedItem[] = [];

        for (const line of lines) {
            const match = line.match(
                /^(\d+)\s+(?<code>\d{2,13})\s+(?<name>.+?)\s+ШТ\s+(?<quantity>\d+)\s+(?<price>\d+[.,]?\d*)\s+(?<total>\d+[.,]?\d*)$/
            );

            if (match?.groups) {
                const { code, name, quantity, price } = match.groups;
                result.push({
                    name: name.trim(),
                    code,
                    quantity: parseFloat(quantity),
                    price: parseFloat(price.replace(',', '.')),
                    unit: 'шт',
                });
            }
        }

        return result;
    }
}
