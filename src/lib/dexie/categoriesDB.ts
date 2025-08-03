import Dexie, { Table } from 'dexie';

export interface Category {
  id: string;
  name: string;
  created_at: string;
  color?: string;
}

class CategoriesDB extends Dexie {
  categories!: Table<Category, string>;

  constructor() {
    super('CategoriesDatabase');
    this.version(3).stores({
  categories: 'id, name, created_at, color',
}).upgrade((trans) => {
  return trans.table('categories').toCollection().modify((cat) => {
    if (!cat.color) cat.color = '#dbd8e3'; // цвет по умолчанию
  });
});
  }
}

export const categoriesDB = new CategoriesDB();
