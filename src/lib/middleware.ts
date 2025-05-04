import { CustomFieldType } from "@/types";

// src/lib/middleware.ts
export const validateFieldType = (
    type: CustomFieldType,
    value: unknown
): boolean => {
    switch (type) {
        case 'number':
            return typeof value === 'number';
        case 'boolean':
            return typeof value === 'boolean';
        case 'date':
            return value instanceof Date;
        default:
            return typeof value === 'string';
    }
};
