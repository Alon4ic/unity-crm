import { cn } from '@/lib/utils';
import React from 'react';

interface Props {
    className?: string;
}

export const Container: React.FC<React.PropsWithChildren<Props>> = ({
    className,
    children,
}) => {
    return (
        <div className={cn('laptop:mx-auto mx-5 max-w-[1280px]', className)}>
            {children}
        </div>
    );
};
