// DateFilter.tsx
'use client';

interface DateFilterProps {
    value: string | null;
    onChange: (date: string) => void;
    label?: string;
    className?: string;
}

export default function DateFilter({
    value,
    onChange,
    label = 'Дата (день)',
    className = '',
}: DateFilterProps) {
    return (
        <div className={`flex items-end gap-4 ${className}`}>
            <div>
                <label className="block text-sm mb-1 font-medium">
                    {label}
                </label>
                <input
                    type="date"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="border rounded px-2 py-1"
                />
            </div>
        </div>
    );
}
