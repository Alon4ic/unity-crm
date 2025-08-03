import { useDrag } from 'react-dnd';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/dexie/productsDB';
import { useRef } from 'react';
import { Unit } from '@/types';
import { ColumnKey } from '@/types/tableColumns';

interface Props {
  product: Product;
  columns: ColumnKey[];
  isEditing: boolean;
  isHighlighted?: boolean;
  isSelected?: boolean;
  editData: Partial<Product>;
  units: Unit[];
  onStartEdit: (product: Product) => void;
  onChange: (field: keyof Product, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  isDataChanged: boolean;
}

export default function ProductTableRow({
  product,
  isEditing,
  isHighlighted,
  isSelected,
  editData,
  units,
  onStartEdit,
  onChange,
  onSave,
  onCancel,
  onDelete,
  onSelect,
}: Props) {
  const rowRef = useRef<HTMLTableRowElement>(null);

  const [, drag] = useDrag(() => ({
    type: 'PRODUCT',
    item: { id: product.id },
  }));
  drag(rowRef);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('Нажата Enter, сохранение:', editData);
      onSave();
    }
  };

  // Функция для обработки ввода чисел
  const handleNumberInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Product
  ) => {
    const value = e.target.value;
    // Разрешаем пустое значение или корректные числа (например, 12, 12.34)
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      // Сохраняем пустое значение как '' для отображения, иначе преобразуем в число
      onChange(field, value === '' ? '' : parseFloat(value));
    }
  };
  const stock           = (product.load ?? 0) - (product.return_qty ?? 0);
  const salesSum        = ((product.price||0)*(product.load??0)*(1+(product.markup_percent||0)/100)) -
                          ((product.price||0)*(product.return_qty??0));
  const sold            = stock;

  return (
    <tr
      ref={rowRef}
      onClick={() => onSelect(product.id)}
      className={cn(
        'border cursor-pointer',
        isSelected && 'bg-blue-100 dark:bg-blue-900',
        isHighlighted && 'ring-2 ring-yellow-500'
      )}
    >
      <td className="border p-1">
        {isEditing ? (
          <input
            className="w-full"
            value={editData.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            onKeyDown={handleKeyDown}
          />
        ) : (
          product.name
        )}
      </td>
      <td className="border p-1">
        {isEditing ? (
          <input
            className="w-full"
            value={editData.code || ''}
            onChange={(e) => onChange('code', e.target.value)}
            onKeyDown={handleKeyDown}
          />
        ) : (
          product.code
        )}
      </td>
      <td className="border p-1">
        {isEditing ? (
          <input
            className="w-full"
            value={editData.unit || ''}
            onChange={(e) => onChange('unit', e.target.value)}
            onKeyDown={handleKeyDown}
          />
        ) : (
          product.unit || '-'
        )}
      </td>
      <td className="border p-1">
        {isEditing ? (
          <input
            className="w-full"
            type="number"
            value={editData.price ?? ''} // Показываем пустое поле, если ''
            onChange={(e) => handleNumberInputChange(e, 'price')}
            onKeyDown={handleKeyDown}
            step="0.01" // Для десятичных чисел
          />
        ) : (
          product.price?.toFixed(2) || '-'
        )}
      </td>
      <td className="border p-1">
        {isEditing ? (
          <input
            className="w-full"
            type="number"
            value={editData.quantity ?? ''} // Показываем пустое поле, если ''
            onChange={(e) => handleNumberInputChange(e, 'quantity')}
            onKeyDown={handleKeyDown}
            step="1" // Только целые числа
          />
        ) : (
          product.quantity || '-'
        )}
      </td>
      <td className="border p-1">
        {((product.price || 0) * (product.quantity || 0)).toFixed(2)}
      </td>
      <td className="border p-1">
        {isEditing ? (
          <input
            className="w-full"
            type="number"
            value={editData.markup_percent ?? ''} // Показываем пустое поле, если ''
            onChange={(e) => handleNumberInputChange(e, 'markup_percent')}
            onKeyDown={handleKeyDown}
            step="0.01" // Для десятичных чисел
          />
        ) : (
          `${product.markup_percent ?? 0}%`
        )}
      </td>
      <td className="border p-1">
        {(((product.price || 0) +
          ((product.price || 0) * (product.markup_percent || 0)) / 100) *
          (product.quantity || 0)).toFixed(2)}
      </td>
      <td className="border p-1 space-x-1">
        {isEditing ? (
          <>
            <button onClick={onSave} className="text-green-600">
              ✔
            </button>
            <button onClick={onCancel} className="text-gray-600">
              ✖
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onStartEdit(product)} className="text-blue-600">
              ✎
            </button>
            <button onClick={() => onDelete(product.id)} className="text-red-600">
              🗑
            </button>
          </>
        )}
      </td>
    </tr>
  );
}