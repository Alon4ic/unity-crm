import { cn } from '@/lib/utils';

interface SkeletonTableRowProps {
    columns: number;
    columnWidths?: string[]; // Опционально для задания ширины колонок
}

export default function SkeletonTableRow({
    columns,
    columnWidths,
}: SkeletonTableRowProps) {
    return (
        <tr className="border">
            {Array.from({ length: columns }).map((_, index) => (
                <td key={index} className="border p-1">
                    <div
                        className="h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
                        style={{ width: columnWidths?.[index] || '100%' }}
                    ></div>
                </td>
            ))}
        </tr>
    );
}
