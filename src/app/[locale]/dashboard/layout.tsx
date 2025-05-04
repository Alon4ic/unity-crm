'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Menu,
    X,
    ShoppingCart,
    Truck,
    BarChart2,
    Settings,
} from 'lucide-react'; // Иконки

interface DashboardLayoutProps {
    children: ReactNode;
}

const menuItems = [
    { label: 'Импорт XLSX', path: '/dashboard/products', icon: ShoppingCart },
    { label: 'Поставки', path: '/dashboard/supplies', icon: Truck },
    { label: 'Продажи', path: '/dashboard/sales', icon: BarChart2 },
    { label: 'Настройки', path: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Боковая панель */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 transform lg:static lg:translate-x-0 transition-transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} w-64 bg-gray-100 dark:bg-gray-900 shadow-lg p-6 space-y-6`}
            >
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-primary">
                        UnityCRM
                    </h1>
                    <button
                        className="lg:hidden text-gray-700 dark:text-gray-300"
                        onClick={() => setMenuOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex flex-col space-y-2 mt-8">
                    {menuItems.map(({ label, path, icon: Icon }) => (
                        <Link
                            key={path}
                            href={path}
                            className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                                pathname.includes(path)
                                    ? 'bg-primary text-white'
                                    : 'hover:bg-primary/10 dark:hover:bg-primary/20'
                            }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Верхняя панель только на мобильных */}
            <div className="flex flex-col flex-1 min-h-screen">
                <header className="lg:hidden p-4 bg-gray-100 dark:bg-gray-900 flex justify-between items-center shadow">
                    <h2 className="text-lg font-bold text-primary">UnityCRM</h2>
                    <button
                        className="text-gray-700 dark:text-gray-300"
                        onClick={() => setMenuOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                </header>

                {/* Контент */}
                <main className="flex-1 p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
