'use client';

import React, { memo } from 'react';

interface ContextMenuColorPickerProps {
    position: { x: number; y: number };
    onSelect: (color: string) => void;
}

const COLORS = ['#fef08a', '#a5f3fc', '#86efac', '#fca5a5', '#ddd6fe'];

const ContextMenuColorPicker = memo(
    ({ position, onSelect }: ContextMenuColorPickerProps) => {
        return (
            <div
                className="fixed z-50 bg-white border rounded shadow p-2"
                style={{ top: position.y, left: position.x }}
            >
                <p className="text-sm font-semibold mb-1">Цвет строки:</p>
                <div className="flex gap-2">
                    {COLORS.map((color) => (
                        <div
                            key={color}
                            onClick={() => onSelect(color)}
                            className="w-6 h-6 rounded-full border cursor-pointer"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>
        );
    }
);

ContextMenuColorPicker.displayName = 'ContextMenuColorPicker';

export default ContextMenuColorPicker;
