import { LoadTransaction } from "@/types";

export function getTotalLoadForProductOnPage(
  transactions: LoadTransaction[],
  salePageId: string,
  productId: string
): number {
  return (transactions ?? [])
    .filter(tx => tx.sale_page_id === salePageId && tx.product_id === productId)
    .reduce((sum, tx) => sum + (tx.load || 0), 0);
}

export function getTotalReturnForProductOnPage(
  transactions: LoadTransaction[],
  salePageId: string,
  productId: string
): number {
  return (transactions ?? [])
    .filter(tx => tx.sale_page_id === salePageId && tx.product_id === productId)
    .reduce((sum, tx) => sum + (tx.return_qty || 0), 0);
}
