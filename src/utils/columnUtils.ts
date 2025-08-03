export const getResponsiveWidthClasses = (
    key: string,
    sizes: Record<string, any>
): string => {
    const config = sizes[key];
    if (!config) return 'overflow-hidden whitespace-nowrap';

    return `
        ${config.laptop || ''} 
        ${config.middle || ''} 
        ${config.md || ''} 
        ${config.sm || ''} 
        ${config.sl || ''} 
        ${config.phone || ''} 
        overflow-hidden 
        whitespace-nowrap 
        text-ellipsis
    `;
};
