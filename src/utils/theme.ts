import { cookies } from 'next/headers';

export async function getThemeFromCookies(): Promise<'light' | 'dark'> {
    const theme = (await cookies()).get('theme')?.value;
    if (theme === 'dark' || theme === 'light') return theme;
    return 'light'; // тема по умолчанию
}
