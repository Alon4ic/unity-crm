import { InvoiceParseStrategy } from './InvoiceParseStrategy';
import { ParsedItem } from '@/types';

export class SausageFactoryStrategy implements InvoiceParseStrategy {
    canParse(text: string): boolean {
        return (
            text.includes('Ковбасний цех') || text.includes('Грудинка Домашня')
        );
    }

    parse(text: string): ParsedItem[] {
        const lines = text
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => /НФ-\d{8}/.test(line));

        const items: ParsedItem[] = [];

        for (const line of lines) {
            const parts = line
                .split('\t')
                .map((p) => p.trim())
                .filter(Boolean);
            const codeIdx = parts.findIndex((p) => /НФ-\d{8}/.test(p));
            if (codeIdx === -1) continue;

            const code = parts[codeIdx];
            const name = parts[codeIdx + 1];
            const numericParts = parts
                .slice(codeIdx + 2)
                .filter((p) => /\d/.test(p));

            let quantity = 0;
            let price = 0;
            let total = 0;
            let unit = '';

            // Берем последние 3 числовых значения
            const last3 = numericParts.slice(-3);

            // Из них определяем price и total
            const numericClean = (val: string) =>
                parseFloat(val.replace(/\s/g, '').replace(',', '.'));

            // Вариант 1: [кол-во, цена, сумма]
            if (last3.length === 3) {
                quantity = numericClean(last3[0]);
                price = numericClean(last3[1]);
                total = numericClean(last3[2]);
            }
            // Вариант 2: [цена, сумма] — если quantity раньше
            else if (last3.length === 2 && numericParts.length >= 3) {
                quantity = numericClean(numericParts[0]);
                price = numericClean(numericParts[1]);
                total = numericClean(numericParts[2]);
            }

            // Определим unit — между quantity и price может быть строка с буквами
            const maybeUnit = parts.find((p) =>
                /^[a-zA-Zа-яА-ЯіІґҐ]{1,5}$/.test(p)
            );
            unit = maybeUnit || 'кг';

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
