// src/components/ErrorAlert.tsx
'use client';

export const ErrorAlert = ({ error }: { error?: string }) => {
    if (!error) return null;

    return (
        <div className="p-4 mb-4 text-red-800 bg-red-50 rounded-lg">
            {error}
        </div>
    );
};
