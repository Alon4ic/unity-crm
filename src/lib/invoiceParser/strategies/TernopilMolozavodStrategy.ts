import { InvoiceParseStrategy } from './InvoiceParseStrategy';
import { ParsedItem } from '@/types';

export class TernopilMolokozavodStrategy implements InvoiceParseStrategy {
    canParse(text: string): boolean {
        const norm = text.toLowerCase();
        return (
            norm.includes('тернопільський молокозавод') &&
            norm.includes('накладна') &&
            /код.*товар[уа]/i.test(norm)
        );
    }

    parse(text: string): ParsedItem[] {
        const lines = text
            .split('\n')
            .map((line) => line.replace(/\t/g, ' ').replace(/\s+/g, ' ').trim())
            .filter(Boolean);

        const items: ParsedItem[] = [];

        for (const line of lines) {
            // Шаблон: код + название + ед + кол-во + цена + сумма
            const regex =
                /^(\d{1,4})\s+(.+?)\s+(шт|л|кг|г|уп|пл|пакет|пачка)?\s+(\d+(?:[.,]\d+)?)\s+(\d+(?:[.,]\d+)?)\s+([\d\s]+(?:[.,]\d+)?)/i;

            const match = line.match(regex);
            if (!match) continue;

            const [, code, nameRaw, unitRaw, qtyRaw, priceRaw] = match;

            const name = nameRaw.trim();
            const quantity = parseFloat(qtyRaw.replace(',', '.'));
            const price = parseFloat(priceRaw.replace(',', '.'));
            const unit = (unitRaw || 'шт').toLowerCase();

            items.push({
                code,
                name,
                quantity: isNaN(quantity) ? 0 : quantity,
                price: isNaN(price) ? 0 : price,
                unit,
            });
        }

        return items;
    }
}
