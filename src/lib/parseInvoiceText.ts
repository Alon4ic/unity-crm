import { ParsedItem } from '@/types';
import { InvoiceParser } from './invoiceParser/InvoiceParser';

export async function parseInvoiceText(
    text: string
): Promise<{ items: ParsedItem[]; strategy: string }> {
    return await InvoiceParser.parse(text);
}
