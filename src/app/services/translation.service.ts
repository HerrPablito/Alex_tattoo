import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GoogleSheetsService } from './google-sheets.service';

export type Lang = 'sv' | 'en';

@Injectable({ providedIn: 'root' })
export class TranslationService {
    private platformId = inject(PLATFORM_ID);
    private sheetsService = inject(GoogleSheetsService);

    private translations = signal<Record<string, Record<string, string>>>({});
    lang = signal<Lang>('sv');

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            const saved = localStorage.getItem('lang') as Lang;
            if (saved === 'sv' || saved === 'en') this.lang.set(saved);
        }

        this.sheetsService.getTranslations().subscribe(data => {
            this.translations.set(data);
        });
    }

    setLang(lang: Lang): void {
        this.lang.set(lang);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('lang', lang);
        }
    }

    t(key: string): string {
        const all = this.translations();
        const current = this.lang();
        return all[key]?.[current] ?? all[key]?.['sv'] ?? key;
    }
}
