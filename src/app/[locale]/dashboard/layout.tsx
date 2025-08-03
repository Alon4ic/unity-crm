'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
    Menu,
} from 'lucide-react'; // Иконки

interface DashboardLayoutProps {
    children: ReactNode;
}


export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <div className="flex flex-col flex-1 min-h-screen">
                <main className="flex-1 p-3 laptop:p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
