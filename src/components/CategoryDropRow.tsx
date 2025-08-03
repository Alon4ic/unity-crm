'use client';

import { useDrop } from 'react-dnd';
import { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import type { ReactNode } from 'react';
import { ExtendedProduct } from '@/types';

interface CategoryDropRowProps {
    category: string | null;
    categoryId: string | null;
    label?: string;
    onDrop: (productId: string, categoryId: string | null) => void;
    children?: ReactNode;
    color?: string;
    onCreateProduct: (categoryId: string | null) => void;
    onSortCategory: (
        categoryId: string | null,
        method: 'alphabetical' | 'byDate'
    ) => void;
    onCategoryDrop?: (productId: string, categoryId: string | null) => void;
    onBatchUpdate?: (products: ExtendedProduct[]) => void;
    products: ExtendedProduct[];
}

export default function CategoryDropRow({
    category,
    categoryId,
    label,
    onDrop,
    children,
    color = '#dbd8e3',
    onCreateProduct,
    onSortCategory,
    onCategoryDrop,
    products,
}: CategoryDropRowProps) {
    const ref = useRef<HTMLTableRowElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    const [{ isOver }, drop] = useDrop({
        accept: 'PRODUCT',
        drop: (item: { id: string }) => {
            if (onCategoryDrop) {
                onCategoryDrop(item.id, categoryId);
            } else {
                onDrop(item.id, categoryId);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    useEffect(() => {
        if (ref.current) {
            drop(ref.current);
        }
    }, [drop]);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setShowContextMenu(true);
    };

    const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
            setShowContextMenu(false);
        }
    };

    useEffect(() => {
        if (showContextMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showContextMenu]);

    return (
        <>
            <tr
                ref={ref}
                className={`transition-colors ${
                    isOver ? 'bg-blue-100 dark:bg-blue-900' : ''
                }`}
                style={{
                    backgroundColor: color,
                    borderLeft: `4px solid ${color}`,
                }}
                onContextMenu={handleContextMenu}
            >
                <td
                    colSpan={11}
                    className="text-center py-1 font-semibold text-gray-700 uppercase tracking-wide"
                >
                    <div className="flex items-center justify-between px-2">
                        <span>{label ?? category ?? 'Без категории'}</span>
                        <div className="flex items-center gap-2">
                            {children}
                        </div>
                    </div>
                </td>
            </tr>

            {showContextMenu &&
                typeof window !== 'undefined' &&
                ReactDOM.createPortal(
                    <div
                        ref={menuRef}
                        className="absolute bg-white dark:bg-gray-800 border rounded shadow-lg z-50"
                        style={{
                            top: menuPosition.y,
                            left: menuPosition.x,
                        }}
                    >
                        <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                            <li
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                onClick={() => {
                                    onCreateProduct(categoryId);
                                    setShowContextMenu(false);
                                }}
                            >
                                Создать новый товар
                            </li>
                            <li
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                onClick={() => {
                                    onSortCategory(categoryId, 'alphabetical');
                                    setShowContextMenu(false);
                                }}
                            >
                                Сортировать по алфавиту
                            </li>
                            <li
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                onClick={() => {
                                    onSortCategory(categoryId, 'byDate');
                                    setShowContextMenu(false);
                                }}
                            >
                                Сортировать по дате
                            </li>
                        </ul>
                    </div>,
                    document.body
                )}
        </>
    );
}
