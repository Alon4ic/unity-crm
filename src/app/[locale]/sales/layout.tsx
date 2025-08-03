'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react'; // Иконки

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background text-foreground">
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
                <main className="flex-1 p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
