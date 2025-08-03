import { ParsedItem } from '@/types';
import { InvoiceParseStrategy } from './strategies/InvoiceParseStrategy';

let strategies: InvoiceParseStrategy[] = [];

export async function loadStrategies() {
    const modules = await Promise.all([
        import('./strategies/SausageFactoryStrategy'),
        import('./strategies/YogurtFactoryStrategy'),
        import('./strategies/KostopilMZStrategy'),
        import('./strategies/TernopilMolozavodStrategy'),
        import('./strategies/GodunkoStrategy'),
        import('./strategies/NashMolochnikStrategy'),
        import('./strategies/MolokozavodStrategy'),
        import('./strategies/InvoiceFormat1Strategy'),
        import('./strategies/InvoiceFormat2Strategy'),
        import('./strategies/InvoiceFormat3Strategy'),
        import('./strategies/InvoiceFormat4Strategy'),
        import('./strategies/InvoiceFormat5Strategy'),
        // import('./strategies/FallbackStrategy'),
    ]);

    strategies = modules.map((mod) => {
        const StrategyClass = Object.values(mod)[0] as {
            new (): InvoiceParseStrategy;
        };
        return new StrategyClass();
    });

    console.log(
        '🔁 Стратегии загружены:',
        strategies.map((s) => s.constructor.name)
    );
}

export class InvoiceParser {
    static async parse(
        text: string
    ): Promise<{ items: ParsedItem[]; strategy: string }> {
        if (strategies.length === 0) {
            await loadStrategies();
        }

        for (const strategy of strategies) {
            try {
                if (strategy.canParse(text)) {
                    const items = strategy.parse(text);
                    if (items.length > 0) {
                        console.log(
                            `✅ Использована стратегия: ${strategy.constructor.name}`
                        );
                        return {
                            items,
                            strategy: strategy.constructor.name,
                        };
                    }
                }
            } catch (e) {
                console.warn(
                    `⚠️ Ошибка в стратегии ${strategy.constructor.name}:`,
                    e
                );
            }
        }

        throw new Error('❌ Не удалось определить формат накладной');
    }
}
