import { InvoiceParseStrategy } from './InvoiceParseStrategy';
import { ParsedItem } from '@/types';

export class InvoiceFormat1Strategy implements InvoiceParseStrategy {
    canParse(text: string): boolean {
        const hasEdrpou = text.includes('Код ЄДРПОУ');
        const hasInvoiceNumber = text.includes('Накладна №');

        // 💡 Отсекаем накладные, где много "Йогурт" или "Кефір" — вероятно, молочные форматы
        const isLikelyMilkInvoice = /Йогурт|Кефір|Молоко|Молокія/i.test(text);

        return hasEdrpou && hasInvoiceNumber && !isLikelyMilkInvoice;
    }

    parse(text: string): ParsedItem[] {
        const lines = text
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);
        const items: ParsedItem[] = [];

        const regex =
            /(?<code>\d{12,13})\s+(?<name>.+?)\s+(?<quantity>\d+)\s+(грн)?\s+(?<price>\d+[.,]?\d*)\s+(?<total>\d+[.,]?\d*)/i;

        for (const line of lines) {
            const match = regex.exec(line);
            if (match?.groups) {
                const { name, code, quantity, price } = match.groups;
                items.push({
                    name: name.trim(),
                    code,
                    quantity: parseFloat(quantity),
                    price: parseFloat(price.replace(',', '.')),
                });
            }
        }

        return items;
    }
}
