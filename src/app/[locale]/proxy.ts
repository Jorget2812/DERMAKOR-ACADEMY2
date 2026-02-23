import { redirect } from 'next/navigation';
import { locales } from '@/navigation';

/**
 * Ensures the locale is valid or redirects to default.
 */
export function validateLocale(locale: string) {
    if (!locales.includes(locale as any)) {
        redirect('/fr');
    }
}
