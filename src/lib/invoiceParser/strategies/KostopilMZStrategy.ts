import { InvoiceParseStrategy } from './InvoiceParseStrategy';
import { ParsedItem } from '@/types';

export class KostopilMZStrategy implements InvoiceParseStrategy {
    canParse(text: string): boolean {
        const norm = text.toLowerCase();
        return (
            norm.includes('видаткова накладна') &&
            norm.includes('костопіль мз') &&
            norm.includes('товар') &&
            norm.includes('ціна') &&
            norm.includes('знижка')
        );
    }

    parse(text: string): ParsedItem[] {
        const lines = text
            .split('\n')
            .map((line) => line.replace(/\t/g, ' ').replace(/\s+/g, ' ').trim())
            .filter(
                (line) =>
                    /шт|пачка|л|кг|гр/.test(line) && /\d+[.,]\d{2}/.test(line)
            );

        const items: ParsedItem[] = [];

        for (const line of lines) {
            // Универсальный шаблон: [опционально номер] + Название + Кол-во + Цена + Суммы...
            const regex =
                /^(?:(\d+)\s+)?(.+?)\s+(\d+)\s+(шт|пачка|л|кг|гр)\s+(\d+[.,]\d{2})\s+((?:\d[\d\s]*)[.,]\d{2})/i;

            const match = line.match(regex);
            if (!match) continue;

            const [, , nameRaw, qtyRaw, unitRaw, priceRaw] = match;

            const name = nameRaw.trim();
            const quantity = parseFloat(qtyRaw.replace(',', '.'));
            const price = parseFloat(priceRaw.replace(',', '.'));
            const unit = unitRaw.toLowerCase();

            items.push({
                code: '-', // так как кода товара нет
                name,
                quantity: isNaN(quantity) ? 0 : quantity,
                price: isNaN(price) ? 0 : price,
                unit,
            });
        }

        return items;
    }
}
