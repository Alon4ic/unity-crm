'use client';

import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SpinnerProps {
    show?: boolean;
    className?: string;
    size?: number;
}

export default function Spinner({
    show = true,
    className,
    size = 24,
}: SpinnerProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                >
                    <Loader2
                        className={cn(
                            'animate-spin text-blue-600 dark:text-blue-400',
                            className
                        )}
                        size={size}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
