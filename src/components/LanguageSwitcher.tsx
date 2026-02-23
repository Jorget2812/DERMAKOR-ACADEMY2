'use client'

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const languages = [
        { code: 'fr', name: 'Français' },
        { code: 'it', name: 'Italiano' },
        { code: 'de', name: 'Deutsch' },
    ];

    const handleLocaleChange = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-[11px] font-bold uppercase tracking-widest text-primary/70 hover:text-accent group">
                    <Globe size={14} className="group-hover:rotate-12 transition-transform" />
                    <span className="hidden sm:inline">{locale}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 bg-white/95 backdrop-blur">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLocaleChange(lang.code)}
                        className={`cursor-pointer text-[12px] uppercase tracking-wider font-medium ${locale === lang.code ? 'text-accent' : ''}`}
                    >
                        {lang.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
