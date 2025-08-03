import { InvoiceParseStrategy } from './InvoiceParseStrategy';
import { ParsedItem } from '@/types';

export class TernopilMolokoStrategyV2 implements InvoiceParseStrategy {
    canParse(text: string): boolean {
        return (
            text.includes('ТЕРНОПІЛЬСЬКИЙ МОЛОКОЗАВОД') &&
            text.includes('Код товару') &&
            text.includes('Ціна з ПДВ')
        );
    }

    parse(text: string): ParsedItem[] {
        const lines = text
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => /^\d+\s+\d+\s+/.test(line)); // начинаются с № и кода

        const items: ParsedItem[] = [];

        for (const line of lines) {
            const parts = line
                .split(/\s{2,}/) // разбиваем по двум и более пробелам
                .map((p) => p.trim());

            if (parts.length < 7) continue;

            const [_, code, ...rest] = parts;
            const nameParts = [];

            // собираем название пока не встретим "Од. вимір"
            let i = 0;
            for (; i < rest.length; i++) {
                if (['шт', 'ШТ', 'kg', 'кг', 'л', 'L'].includes(rest[i])) break;
                nameParts.push(rest[i]);
            }

            const name = nameParts.join(' ');
            const unit = rest[i] || '';
            const quantity = parseFloat((rest[i + 1] || '').replace(',', '.'));
            const price = parseFloat((rest[i + 2] || '').replace(',', '.'));
            // const total = parseFloat((rest[i + 3] || '').replace(',', '.'));

            items.push({
                code,
                name,
                quantity,
                price,
                unit,
            });
        }

        return items;
    }
}
