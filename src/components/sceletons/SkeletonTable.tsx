import SkeletonTableRow from './SkeletonTableRow';

interface SkeletonTableProps {
    columns: number;
    rows?: number;
    columnWidths?: string[];
}

export default function SkeletonTable({
    columns,
    rows = 5,
    columnWidths,
}: SkeletonTableProps) {
    return (
        <div className="overflow-auto border rounded-md">
            <table className="min-w-full text-sm text-left border-collapse">
                <tbody>
                    {Array.from({ length: rows }).map((_, index) => (
                        <SkeletonTableRow
                            key={index}
                            columns={columns}
                            columnWidths={columnWidths}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
