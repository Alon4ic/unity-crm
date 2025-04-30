import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
    output: 'standalone',
    distDir: 'out',
    images: {
        unoptimized: true,
    },
    trailingSlash: true, // Рекомендуется для статических экспортов
};

export default withNextIntl(nextConfig);
