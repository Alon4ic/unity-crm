import { InvoiceParseStrategy } from './InvoiceParseStrategy';
import { ParsedItem } from '@/types';

export class YogurtFactoryStrategy implements InvoiceParseStrategy {
    private barcodeToNameMap: Record<string, string> = {
        '4820270911013':
            'Йогурт 2,5% жиру з наповнювачем з фруктовим пюре зі смаком «Вишня-Черешня» 0,75кг. пляшка',
        '4820270911020':
            'Йогурт 2,5% жиру з наповнювачем з фруктовим пюре «Манго» 0,75кг. пляшка',
        '4820270911037':
            'Йогурт 2,5% жиру з наповнювачем з фруктовим пюре зі смаком «Полуниця-Банан» 0,75кг. пляшка',
        '4820004239925':
            'Йогурт безлактозний солодкий «Десертний» з фруктовим наповнювачем "Манго-Чіа" 2,8% 0,14кг. ПЕТ стакан',
        '4820004239918':
            'Йогурт безлактозний солодкий «Десертний» з фруктовим наповнювачем "Чорна смородина" 2,8% 0,14кг. ПЕТ стакан',
        '4820004239833':
            'Йогурт солодкий "Десертний" з фруктовим наповнювачем "Абрикос" 2,8% 0,14кг. ПЕТ стакан',
        '4820004239819':
            'Йогурт солодкий "Десертний" з фруктовим наповнювачем "Вишня" 2,8% 0,14кг. ПЕТ стакан',
        '4820004239826':
            'Йогурт солодкий "Десертний" з фруктовим наповнювачем "Полуниця" 2,8% 0,14кг. ПЕТ стакан',
        '4820270910764':
            'Кефір "Домашній" 2,5% 0,85кг. термостатний ПЕТ пляшка',
        '4820270910740': 'Кефір 2,5% 0,85кг ПЕТ пляшка',
        '4820270910146': 'Ряжанка 4% 0,4кг. плівка',
        '4820270910788': 'Ряжанка 4% 850гр ПЕТ пляшка ВП',
        '4820004237358':
            "Сирок глазурований шоколадною глазур'ю 26% Ваніліну 0.036кг.",
        '4820004233527':
            "Сирок глазурований шоколадною глазур'ю 26% Вишня 0.036кг.",
        '4820004236344':
            "Сирок глазурований шоколадною глазур'ю Молоко згущене 0.036кг.",
        '4820004237365':
            "Сирок глазурований шоколадною глазур'ю 26% з Какао 0.036кг.",
        '4820004233565':
            "Сирок глазурований шоколадною глазур'ю 26% Карамель 0.036кг.",
        '4820004238553':
            "Сирок глазурований шоколадною глазур'ю 26% Кокос 0.036кг.",
        '4820004238713':
            "Сирок глазурований шоколадною глазур'ю 26% Манго 0.036кг.",
        '4820004238706':
            "Сирок глазурований шоколадною глазур'ю 26% Ожина 0.036кг.",
        '4820004233534':
            "Сирок глазурований шоколадною глазур'ю 26% Пересик 0.036кг.",
        '4820004233541':
            "Сирок глазурований шоколадною глазур'ю 26% Полуниця 0.036кг.",
    };

    canParse(text: string): boolean {
        return Object.keys(this.barcodeToNameMap).some((barcode) =>
            text.includes(barcode)
        );
    }

    parse(text: string): ParsedItem[] {
        const lines = text
            .split('\n')
            .map((line) => line.replace(/\t/g, ' ').replace(/\s+/g, ' ').trim())
            .filter((line) => line.length > 0);

        const items: ParsedItem[] = [];
        const barcodes = Object.keys(this.barcodeToNameMap);

        for (const barcode of barcodes) {
            if (!text.includes(barcode)) continue;

            const name = this.barcodeToNameMap[barcode];
            let unit: string | undefined;
            let quantity: number | undefined;
            let price: number | undefined;

            for (let i = 0; i < lines.length; i++) {
                if (!lines[i].includes(barcode)) continue;

                const parts = lines[i]
                    .split(' ')
                    .filter((part) => part.trim() !== '');

                const barcodeIndex = parts.findIndex((part) =>
                    part.includes(barcode)
                );
                if (barcodeIndex === -1) continue;

                // Извлекаем единицу измерения (следующее поле после штрихкода)
                if (parts.length > barcodeIndex + 1) {
                    unit = parts[barcodeIndex + 1];
                }

                // Поиск количества и цены
                for (let j = barcodeIndex + 1; j < parts.length; j++) {
                    const cleanPart = parts[j]
                        .replace(/\s/g, '')
                        .replace(',', '.');

                    // Парсим количество
                    if (!quantity && /^\d+$/.test(cleanPart)) {
                        quantity = parseInt(cleanPart, 10);
                    }

                    // Парсим цену (формат XX.XX)
                    if (!price && /^\d+\.\d{2}$/.test(cleanPart)) {
                        price = parseFloat(cleanPart);
                    }

                    // Обработка формата "22,02" как цены (для количества=1)
                    if (!quantity && /^\d+,\d{2}$/.test(parts[j])) {
                        quantity = 1;
                        price = parseFloat(parts[j].replace(',', '.'));
                    }
                }

                // Поиск в следующей строке если данные не найдены
                if ((!quantity || !price) && i + 1 < lines.length) {
                    const nextParts = lines[i + 1]
                        .split(' ')
                        .filter((part) => part.trim() !== '');

                    for (const part of nextParts) {
                        const cleanPart = part
                            .replace(/\s/g, '')
                            .replace(',', '.');

                        if (!quantity && /^\d+$/.test(cleanPart)) {
                            quantity = parseInt(cleanPart, 10);
                        }

                        if (!price && /^\d+\.\d{2}$/.test(cleanPart)) {
                            price = parseFloat(cleanPart);
                        }
                    }
                }

                if (name && barcode && unit && quantity && price) {
                    items.push({ name, code: barcode, quantity, price, unit });
                    break;
                }
            }
        }

        return items;
    }
}
