'use client';

import { CustomFieldType } from '@/types';

type Props = {
    value: CustomFieldType;
    onChange: (type: CustomFieldType) => void;
    className?: string;
};

export const FieldTypeSelect = ({ value, onChange, className }: Props) => {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as CustomFieldType)}
            className={`p-2 border rounded bg-white ${className}`}
        >
            <option value="string">Текст</option>
            <option value="number">Число</option>
            <option value="boolean">Логическое</option>
            <option value="date">Дата</option>
        </select>
    );
};
