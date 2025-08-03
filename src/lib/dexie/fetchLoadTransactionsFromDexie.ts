import { db } from '@/lib/dexie/productsDB';
import { LoadTransaction } from '@/lib/dexie/productsDB';

export const fetchLoadTransactionsFromDexie = async (): Promise<LoadTransaction[]> =>
  db.load_transactions.toArray();