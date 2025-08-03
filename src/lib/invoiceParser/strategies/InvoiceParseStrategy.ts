import { ParsedItem } from '@/types';

export interface InvoiceParseStrategy {
    canParse(text: string): boolean;
    parse(text: string): ParsedItem[];
}
